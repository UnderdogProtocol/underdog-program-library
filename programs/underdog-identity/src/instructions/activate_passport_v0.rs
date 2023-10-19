use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ActivatePassportV0Args {
  namespace: String,
  identifier: String,
}

use crate::state::*;

#[derive(Accounts)]
#[instruction(args: ActivatePassportV0Args)]
pub struct ActivatePassportV0<'info> {
  #[account(mut)]
  pub namespace_admin: Signer<'info>,

  #[account(
    constraint = namespace_account.address == namespace_admin.key(),
    seeds = [args.namespace.as_ref()],
    bump=namespace_account.bump
  )]
  pub namespace_account: Box<Account<'info, Namespace>>,

  #[account(mut)]
  pub passport_admin: Signer<'info>,

  #[account(
    init,
    payer = passport_admin,
    space = LINK_SIZE,
    seeds = [args.namespace.as_ref(), args.identifier.as_ref()],
    bump,
  )]
  pub passport: Box<Account<'info, Link>>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler<'info>(
  ctx: Context<ActivatePassportV0>,
  _args: ActivatePassportV0Args,
) -> Result<()> {
  let passport = &mut ctx.accounts.passport;

  passport.address = ctx.accounts.passport_admin.to_account_info().key();
  passport.bump = *ctx.bumps.get("passport").unwrap();

  Ok(())
}
