use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeDomainV0Args {
  namespace: String,
}

use crate::state::*;

#[derive(Accounts)]
#[instruction(args: InitializeDomainV0Args)]
pub struct InitializeDomainV0<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = admin.address == authority.key(),
    seeds = [ADMIN_PREFIX.as_ref()],
    bump=admin.bump
  )]
  pub admin: Box<Account<'info, Admin>>,

  /// CHECK: Should this be a signer?
  #[account(mut)]
  pub domain_authority: AccountInfo<'info>,

  #[account(
    init,
    payer = authority,
    space = DOMAIN_SIZE,
    seeds = [args.namespace.as_ref()],
    bump,
  )]
  pub domain: Box<Account<'info, Domain>>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler<'info>(
  ctx: Context<InitializeDomainV0>,
  _args: InitializeDomainV0Args,
) -> Result<()> {
  let domain = &mut ctx.accounts.domain;

  domain.authority = ctx.accounts.domain_authority.to_account_info().key();
  domain.expiration = 0;
  domain.bump = ctx.bumps.domain;

  Ok(())
}
