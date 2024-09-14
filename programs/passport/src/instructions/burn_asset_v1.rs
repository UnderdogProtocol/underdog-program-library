use anchor_lang::prelude::*;
use mpl_bubblegum::instructions::BurnCpiBuilder;
use spl_account_compression::{program::SplAccountCompression, Noop};

use crate::{
  state::*,
  util::{Bubblegum, TreeConfigAccount},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct BurnAssetV1Args {
  pub root: [u8; 32],
  pub data_hash: [u8; 32],
  pub creator_hash: [u8; 32],
  pub leaf_index: u32,
  pub namespace: String,
  pub identifier: String,
}

#[derive(Accounts)]
#[instruction(args: BurnAssetV1Args)]
pub struct BurnAssetV1<'info> {
  #[account(
    mut,
    constraint = link.address == authority.key()
  )]
  pub authority: Signer<'info>,

  #[account(
    seeds = [args.namespace.as_ref(), args.identifier.as_ref()],
    bump = link.bump,
  )]
  pub link: Box<Account<'info, Link>>,

  /// CHECK: Used in cpi
  #[account()]
  pub delegate: AccountInfo<'info>,

  #[account(
    mut,
    seeds = [merkle_tree.key().as_ref()],
    bump,
    seeds::program = bubblegum_program.key(),
  )]
  pub tree_authority: Box<Account<'info, TreeConfigAccount>>,

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
  ctx: Context<'_, '_, '_, 'info, BurnAssetV1<'info>>,
  args: BurnAssetV1Args,
) -> Result<()> {
  let signer_seeds: &[&[&[u8]]] = &[&[
    args.namespace.as_ref(),
    args.identifier.as_ref(),
    &[ctx.accounts.link.bump],
  ]];

  let remaining_accounts: Vec<(&AccountInfo<'info>, bool, bool)> = ctx
    .remaining_accounts
    .iter()
    .map(|account| (account, account.is_writable, account.is_signer)) // Do not dereference here
    .collect();

  BurnCpiBuilder::new(&ctx.accounts.bubblegum_program)
    .tree_config(&ctx.accounts.tree_authority.to_account_info())
    .leaf_owner(&ctx.accounts.link.to_account_info(), true)
    .leaf_delegate(&ctx.accounts.delegate.to_account_info(), true)
    .merkle_tree(&ctx.accounts.merkle_tree)
    .log_wrapper(&ctx.accounts.log_wrapper)
    .system_program(&ctx.accounts.system_program)
    .compression_program(&ctx.accounts.compression_program)
    .root(args.root)
    .data_hash(args.data_hash)
    .creator_hash(args.creator_hash)
    .index(args.leaf_index)
    .nonce(u64::from(args.leaf_index))
    .add_remaining_accounts(&remaining_accounts[..])
    .invoke_signed(&[signer_seeds[0]])?;

  Ok(())
}
