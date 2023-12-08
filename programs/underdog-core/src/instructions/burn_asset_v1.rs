use anchor_lang::prelude::*;
use mpl_bubblegum::program::Bubblegum;
use mpl_bubblegum::state::TreeConfig;
use shared_utils::{delegated_burn, Burn};
use spl_account_compression::{program::SplAccountCompression, Noop};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct BurnAssetV1Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub root: [u8; 32],
  pub data_hash: [u8; 32],
  pub creator_hash: [u8; 32],
  pub leaf_index: u32,
}

use crate::state::*;

#[derive(Accounts)]
#[instruction(args: BurnAssetV1Args)]
pub struct BurnAssetV1<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  #[account(
    mut,
    seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump=org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    mut,
    seeds = [PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id.to_le_bytes().as_ref()],
    bump=project_account.bump
  )]
  pub project_account: Box<Account<'info, Project>>,

  /// CHECK: Used in cpi
  pub leaf_owner: AccountInfo<'info>,

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

impl<'info> BurnAssetV1<'info> {
  fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
    let cpi_accounts = Burn {
      tree_authority: self.tree_authority.to_account_info(),
      leaf_owner: self.leaf_owner.to_account_info(),
      leaf_delegate: self.project_account.to_account_info(),
      merkle_tree: self.merkle_tree.to_account_info(),
      log_wrapper: self.log_wrapper.to_account_info(),
      system_program: self.system_program.to_account_info(),
      compression_program: self.compression_program.to_account_info(),
    };
    CpiContext::new(self.bubblegum_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler<'info>(
  ctx: Context<'_, '_, '_, 'info, BurnAssetV1<'info>>,
  args: BurnAssetV1Args,
) -> Result<()> {
  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  delegated_burn(
    ctx
      .accounts
      .burn_ctx()
      .with_remaining_accounts(ctx.remaining_accounts.to_vec())
      .with_signer(&[project_seeds[0]]),
    args.root,
    args.data_hash,
    args.creator_hash,
    args.leaf_index,
  )?;

  Ok(())
}
