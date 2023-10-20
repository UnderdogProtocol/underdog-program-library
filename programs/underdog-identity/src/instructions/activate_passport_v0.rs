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
  pub domain_authority: Signer<'info>,

  #[account(
    constraint = domain.authority == domain_authority.key(),
    seeds = [args.namespace.as_ref()],
    bump=domain.bump
  )]
  pub domain: Box<Account<'info, Domain>>,

  #[account(mut)]
  pub passport_authority: Signer<'info>,

  #[account(
    init,
    payer = passport_authority,
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

  passport.address = ctx.accounts.passport_authority.to_account_info().key();
  passport.bump = *ctx.bumps.get("passport").unwrap();

  Ok(())
}
