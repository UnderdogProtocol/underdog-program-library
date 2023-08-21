use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct InitializeAdmin<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    init,
    payer = authority,
    space = ADMIN_SIZE,
    seeds = [ADMIN_PREFIX.as_ref()],
    bump
  )]
  pub admin: Box<Account<'info, Admin>>,

  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeAdmin>) -> Result<()> {
  let admin = &mut ctx.accounts.admin;

  admin.address = ctx.accounts.authority.to_account_info().key();
  admin.bump = *ctx.bumps.get("admin").unwrap();

  Ok(())
}
