use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct InitialOwnerContext<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1,
        seeds = [OWNER_PREFIX.as_ref()],
        bump
    )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitialOwnerContext>) -> Result<()> {
  let owner_account = &mut ctx.accounts.owner_account;
  let authority_clone = ctx.accounts.authority.to_account_info().key();

  owner_account.owner = authority_clone;
  owner_account.bump = ctx.bumps.owner_account;

  msg!("Owner set to {}", owner_account.owner);
  msg!("Bump is set to {}", owner_account.bump);

  Ok(())
}
