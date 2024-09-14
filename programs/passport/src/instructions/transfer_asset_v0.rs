use anchor_lang::prelude::*;
use mpl_bubblegum::instructions::TransferCpiBuilder;
use spl_account_compression::{program::SplAccountCompression, Noop};

use crate::{
  state::*,
  util::{Bubblegum, TreeConfigAccount},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TransferAssetV0Args {
  pub root: [u8; 32],
  pub data_hash: [u8; 32],
  pub creator_hash: [u8; 32],
  pub leaf_index: u32,
  pub namespace: String,
  pub identifier: String,
}

#[derive(Accounts)]
#[instruction(args: TransferAssetV0Args)]
pub struct TransferAssetV0<'info> {
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
  pub receiver_address: AccountInfo<'info>,

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
  ctx: Context<'_, '_, '_, 'info, TransferAssetV0<'info>>,
  args: TransferAssetV0Args,
) -> Result<()> {
  let signer_seeds: &[&[&[u8]]] = &[&[
    args.namespace.as_ref(),
    args.identifier.as_ref(),
    &[ctx.accounts.link.bump],
  ]];

  TransferCpiBuilder::new(&ctx.accounts.bubblegum_program)
    .tree_config(&ctx.accounts.tree_authority.to_account_info())
    .leaf_owner(&ctx.accounts.link.to_account_info(), false)
    .leaf_delegate(&ctx.accounts.link.to_account_info(), true)
    .new_leaf_owner(&ctx.accounts.receiver_address)
    .merkle_tree(&ctx.accounts.merkle_tree)
    .log_wrapper(&ctx.accounts.log_wrapper)
    .system_program(&ctx.accounts.system_program)
    .compression_program(&ctx.accounts.compression_program)
    .root(args.root)
    .data_hash(args.data_hash)
    .creator_hash(args.creator_hash)
    .index(args.leaf_index)
    .nonce(u64::from(args.leaf_index))
    .invoke_signed(&[signer_seeds[0]])?;

  Ok(())
}
