use anchor_lang::prelude::*;

use crate::state::*;

#[derive(Accounts)]
pub struct UpdateOwnerContext<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
        mut,
        constraint = owner_account.owner == authority.key(),
        seeds = [b"ownership".as_ref()],
        bump=owner_account.bump
    )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateOwnerContext>, _new_owner: Pubkey) -> Result<()> {
  let owner_account = &mut ctx.accounts.owner_account;

  owner_account.owner = _new_owner;

  msg!("Owner updated to {}", owner_account.owner);
  msg!("Bump is {}", owner_account.bump);

  Ok(())
}
