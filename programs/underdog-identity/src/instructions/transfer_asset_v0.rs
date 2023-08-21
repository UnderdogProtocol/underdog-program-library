use anchor_lang::prelude::*;
use mpl_bubblegum::program::Bubblegum;
use mpl_bubblegum::state::TreeConfig;
use shared_utils::{transfer, Transfer};
use spl_account_compression::{program::SplAccountCompression, Noop};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TransferAssetV0Args {
  pub root: [u8; 32],
  pub data_hash: [u8; 32],
  pub creator_hash: [u8; 32],
  pub leaf_index: u32,
  pub identifier: String,
}

#[derive(Accounts)]
#[instruction(args: TransferAssetV0Args)]
pub struct TransferAssetV0<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = admin.address == authority.key(),
    seeds = [ADMIN_PREFIX.as_ref()],
    bump=admin.bump
  )]
  pub admin: Box<Account<'info, Admin>>,

  #[account(
    seeds = [UNDERDOG_LINK_PREFIX.as_ref(), args.identifier.as_ref()],
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

impl<'info> TransferAssetV0<'info> {
  fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
    let cpi_accounts = Transfer {
      tree_authority: self.tree_authority.to_account_info(),
      leaf_owner: self.link.to_account_info(),
      leaf_delegate: self.link.to_account_info(),
      new_leaf_owner: self.receiver_address.to_account_info(),
      merkle_tree: self.merkle_tree.to_account_info(),
      log_wrapper: self.log_wrapper.to_account_info(),
      system_program: self.system_program.to_account_info(),
      compression_program: self.compression_program.to_account_info(),
    };
    CpiContext::new(self.bubblegum_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler<'info>(
  ctx: Context<'_, '_, '_, 'info, TransferAssetV0<'info>>,
  args: TransferAssetV0Args,
) -> Result<()> {
  let signer_seeds: &[&[&[u8]]] = &[&[
    UNDERDOG_LINK_PREFIX.as_ref(),
    args.identifier.as_ref(),
    &[ctx.accounts.link.bump],
  ]];

  transfer(
    ctx
      .accounts
      .transfer_ctx()
      .with_signer(&[signer_seeds[0]])
      .with_remaining_accounts(ctx.remaining_accounts.to_vec()),
    args.root,
    args.data_hash,
    args.creator_hash,
    args.leaf_index,
  )?;

  Ok(())
}
