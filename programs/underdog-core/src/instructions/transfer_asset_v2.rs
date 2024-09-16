use anchor_lang::prelude::*;
use mpl_bubblegum::instructions::TransferCpiBuilder;
use spl_account_compression::{program::SplAccountCompression, Noop};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TransferAssetV2Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub root: [u8; 32],
  pub data_hash: [u8; 32],
  pub creator_hash: [u8; 32],
  pub leaf_index: u32,
}

use crate::{state::*, util::Bubblegum};

#[derive(Accounts)]
#[instruction(args: TransferAssetV2Args)]
pub struct TransferAssetV2<'info> {
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
    seeds = [ORG_PREFIX.as_ref(), args.super_admin_address.as_ref(), args.org_id.as_ref()],
    bump= org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    mut,
    seeds = [PROJECT_PREFIX.as_ref(), org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
    bump=project_account.bump
  )]
  pub project_account: Box<Account<'info, Project>>,

  /// CHECK: Used in cpi
  pub leaf_owner: AccountInfo<'info>,

  /// CHECK: Used in cpi
  pub new_leaf_owner: AccountInfo<'info>,

  /// CHECK: Used in cpi
  #[account(
    mut,
    seeds = [merkle_tree.key().as_ref()],
    bump,
    seeds::program = bubblegum_program.key(),
  )]
  pub tree_authority: AccountInfo<'info>,

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

pub fn handler<'info>(
  ctx: Context<'_, '_, '_, 'info, TransferAssetV2<'info>>,
  args: TransferAssetV2Args,
) -> Result<()> {
  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  let remaining_accounts: Vec<(&AccountInfo<'info>, bool, bool)> = ctx
    .remaining_accounts
    .iter()
    .map(|account| (account, account.is_writable, account.is_signer)) // Do not dereference here
    .collect();

  TransferCpiBuilder::new(&ctx.accounts.bubblegum_program)
    .tree_config(&ctx.accounts.tree_authority)
    .leaf_owner(&ctx.accounts.leaf_owner, false)
    .leaf_delegate(&ctx.accounts.project_account.to_account_info(), true)
    .new_leaf_owner(&ctx.accounts.new_leaf_owner)
    .merkle_tree(&ctx.accounts.merkle_tree)
    .log_wrapper(&ctx.accounts.log_wrapper)
    .system_program(&ctx.accounts.system_program)
    .compression_program(&ctx.accounts.compression_program)
    .root(args.root)
    .data_hash(args.data_hash)
    .creator_hash(args.creator_hash)
    .nonce(u64::from(args.leaf_index))
    .index(args.leaf_index)
    .add_remaining_accounts(&remaining_accounts[..])
    .invoke_signed(&[project_seeds[0]])?;

  Ok(())
}
