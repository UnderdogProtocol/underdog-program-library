use anchor_lang::prelude::*;

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct UpdateAdminArgs {
  pub new_admin: Pubkey,
}

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = admin.address == authority.key(),
    seeds = [ADMIN_PREFIX.as_ref()],
    bump=admin.bump
  )]
  pub admin: Box<Account<'info, Admin>>,

  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateAdmin>, args: UpdateAdminArgs) -> Result<()> {
  let admin = &mut ctx.accounts.admin;

  admin.address = args.new_admin;

  Ok(())
}
