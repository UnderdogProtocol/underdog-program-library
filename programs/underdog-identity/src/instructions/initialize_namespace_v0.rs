use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeNamespaceV0Args {
  namespace: String,
}

use crate::state::*;

#[derive(Accounts)]
#[instruction(args: InitializeNamespaceV0Args)]
pub struct InitializeNamespaceV0<'info> {
  #[account()]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = admin.address == authority.key(),
    seeds = [ADMIN_PREFIX.as_ref()],
    bump=admin.bump
  )]
  pub admin: Box<Account<'info, Admin>>,

  #[account(mut)]
  pub namespace_admin: Signer<'info>,

  #[account(
    init,
    payer = namespace_admin,
    space = NAMESPACE_SIZE,
    seeds = [args.namespace.as_ref()],
    bump,
  )]
  pub namespace_account: Box<Account<'info, Namespace>>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler<'info>(
  ctx: Context<InitializeNamespaceV0>,
  _args: InitializeNamespaceV0Args,
) -> Result<()> {
  let namespace_account = &mut ctx.accounts.namespace_account;

  namespace_account.address = ctx.accounts.namespace_admin.to_account_info().key();
  namespace_account.expiration = 0;
  namespace_account.bump = *ctx.bumps.get("namespace_account").unwrap();

  Ok(())
}
