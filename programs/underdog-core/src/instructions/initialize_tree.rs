use crate::util::Bubblegum;
use anchor_lang::prelude::*;
use mpl_bubblegum::instructions::CreateTreeConfigCpiBuilder;
use spl_account_compression::{program::SplAccountCompression, Noop};

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
}

pub fn handler(ctx: Context<InitializeTree>, args: InitializeTreeArgs) -> Result<()> {
  CreateTreeConfigCpiBuilder::new(&ctx.accounts.bubblegum_program.to_account_info())
    .max_depth(args.max_depth)
    .max_buffer_size(args.max_buffer_size)
    .tree_config(&ctx.accounts.tree_authority.to_account_info())
    .merkle_tree(&ctx.accounts.merkle_tree.to_account_info())
    .payer(&ctx.accounts.authority.to_account_info())
    .tree_creator(&ctx.accounts.authority.to_account_info())
    .log_wrapper(&ctx.accounts.log_wrapper.to_account_info())
    .compression_program(&ctx.accounts.compression_program.to_account_info())
    .system_program(&ctx.accounts.system_program.to_account_info())
    .public(false)
    .invoke()?;

  Ok(())
}
