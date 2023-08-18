use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::solana_program::program::invoke_signed;
use mpl_bubblegum::program::Bubblegum;
use mpl_bubblegum::state::TreeConfig;
use spl_account_compression::{program::SplAccountCompression, Noop};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TransferAssetV1Args {
  pub super_admin_address: Pubkey,
  pub member_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub root: [u8; 32],
  pub data_hash: [u8; 32],
  pub creator_hash: [u8; 32],
  pub leaf_index: u32,
}

use crate::state::*;

#[derive(Accounts)]
#[instruction(args: TransferAssetV1Args)]
pub struct TransferAssetV1<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
        mut,
        seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
        bump=org_account.bump
    )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
        mut,
        constraint = member_account.active == true,
        seeds = [ORG_MEMBER_PREFIX.as_ref(),org_account.key().as_ref(),args.member_address.as_ref()],
        bump=member_account.bump
    )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

  #[account(
        mut,
        seeds = [PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id.to_le_bytes().as_ref()],
        bump=project_account.bump
    )]
  pub project_account: Box<Account<'info, Project>>,

  /// CHECK: Used in cpi
  pub leaf_owner: AccountInfo<'info>,

  /// CHECK: Used in cpi
  pub new_leaf_owner: AccountInfo<'info>,

  #[account(
        mut,
        seeds = [merkle_tree.key().as_ref()],
        bump,
        seeds::program = bubblegum_program.key(),
    )]
  pub tree_authority: Box<Account<'info, TreeConfig>>,

  /// CHECK: Checked by cpi
  #[account(mut)]
  pub merkle_tree: AccountInfo<'info>,

  /// CHECK: Used in cpi
  #[account(
        seeds = ["collection_cpi".as_bytes()],
        bump,
        seeds::program = bubblegum_program.key(),
      )]
  pub bubblegum_signer: UncheckedAccount<'info>,

  pub bubblegum_program: Program<'info, Bubblegum>,
  pub log_wrapper: Program<'info, Noop>,
  pub compression_program: Program<'info, SplAccountCompression>,
  pub system_program: Program<'info, System>,
}

// impl<'info> TransferAssetV1<'info> {
//     fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
//         let cpi_accounts = Transfer {
//             tree_authority: self.tree_authority.to_account_info(),
//             leaf_owner: self.leaf_owner.to_account_info(),
//             leaf_delegate: self.project_account.to_account_info(),
//             new_leaf_owner: self.new_leaf_owner.to_account_info(),
//             merkle_tree: self.merkle_tree.to_account_info(),
//             log_wrapper: self.log_wrapper.to_account_info(),
//             system_program: self.system_program.to_account_info(),
//             compression_program: self.compression_program.to_account_info(),
//         };
//         CpiContext::new(self.bubblegum_program.to_account_info(), cpi_accounts)
//     }
// }

pub fn handler<'info>(
  ctx: Context<'_, '_, '_, 'info, TransferAssetV1<'info>>,
  args: TransferAssetV1Args,
) -> Result<()> {
  let remaining_accounts_len = ctx.remaining_accounts.len();
  let mut accounts = Vec::with_capacity(
    8 // space for the 8 AccountMetas that are always included  (below)
        + remaining_accounts_len,
  );
  accounts.extend(vec![
    AccountMeta::new_readonly(ctx.accounts.tree_authority.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_owner.key(), false),
    AccountMeta::new_readonly(ctx.accounts.project_account.key(), true),
    AccountMeta::new_readonly(ctx.accounts.new_leaf_owner.key(), false),
    AccountMeta::new(ctx.accounts.merkle_tree.key(), false),
    AccountMeta::new_readonly(ctx.accounts.log_wrapper.key(), false),
    AccountMeta::new_readonly(ctx.accounts.compression_program.key(), false),
    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
  ]);

  let transfer_discriminator: [u8; 8] = [163, 52, 200, 231, 140, 3, 69, 186];

  let mut data = Vec::with_capacity(
    8 // The length of transfer_discriminator,
        + args.root.len()
        + args.data_hash.len()
        + args.creator_hash.len()
        + 8 // The length of the nonce
        + 8, // The length of the index
  );
  data.extend(transfer_discriminator);
  data.extend(args.root);
  data.extend(args.data_hash);
  data.extend(args.creator_hash);
  data.extend(u64::from(args.leaf_index).to_le_bytes());
  data.extend(args.leaf_index.to_le_bytes());

  let mut account_infos = Vec::with_capacity(
    8 // space for the 8 AccountInfos that are always included (below)
        + remaining_accounts_len,
  );
  account_infos.extend(vec![
    ctx.accounts.tree_authority.to_account_info(),
    ctx.accounts.leaf_owner.to_account_info(),
    ctx.accounts.project_account.to_account_info(),
    ctx.accounts.new_leaf_owner.to_account_info(),
    ctx.accounts.merkle_tree.to_account_info(),
    ctx.accounts.log_wrapper.to_account_info(),
    ctx.accounts.compression_program.to_account_info(),
    ctx.accounts.system_program.to_account_info(),
  ]);

  // Add "accounts" (hashes) that make up the merkle proof from the remaining accounts.
  for acc in ctx.remaining_accounts.iter() {
    accounts.push(AccountMeta::new_readonly(acc.key(), false));
    account_infos.push(acc.to_account_info());
    msg!(&acc.key().to_string());
  }

  let instruction = Instruction {
    program_id: ctx.accounts.bubblegum_program.key(),
    accounts,
    data,
  };

  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  invoke_signed(&instruction, &account_infos[..], project_seeds)?;

  Ok(())
}
