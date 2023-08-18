use crate::state::*;
use anchor_lang::prelude::*;
use mpl_bubblegum::{
  cpi::{accounts::CreateTree, create_tree},
  program::Bubblegum,
};
use spl_account_compression::{program::SplAccountCompression, Noop};

use crate::state::InitialOwner;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeTreeArgs {
  pub max_depth: u32,
  pub max_buffer_size: u32,
}

#[derive(Accounts)]
#[instruction(args: InitializeTreeArgs)]
pub struct InitializeTree<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  /// CHECK: Checked by cpi
  #[account(
        mut,
        seeds = [merkle_tree.key().as_ref()],
        bump,
        seeds::program = bubblegum_program.key()
    )]
  pub tree_authority: AccountInfo<'info>,

  #[account(mut)]
  pub merkle_tree: Signer<'info>,

  pub log_wrapper: Program<'info, Noop>,
  pub system_program: Program<'info, System>,
  pub bubblegum_program: Program<'info, Bubblegum>,
  pub compression_program: Program<'info, SplAccountCompression>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitializeTree<'info> {
  fn create_tree_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CreateTree<'info>> {
    CpiContext::new(
      self.bubblegum_program.to_account_info(),
      CreateTree {
        tree_authority: self.tree_authority.to_account_info(),
        merkle_tree: self.merkle_tree.to_account_info(),
        payer: self.authority.to_account_info(),
        tree_creator: self.authority.to_account_info(),
        log_wrapper: self.log_wrapper.to_account_info(),
        compression_program: self.compression_program.to_account_info(),
        system_program: self.system_program.to_account_info(),
      },
    )
  }
}

pub fn handler(ctx: Context<InitializeTree>, args: InitializeTreeArgs) -> Result<()> {
  create_tree(
    ctx.accounts.create_tree_ctx(),
    args.max_depth,
    args.max_buffer_size,
    None,
  )?;

  Ok(())
}
