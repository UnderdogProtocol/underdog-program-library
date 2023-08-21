use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeLinkV0Args {
  identifier: String,
}

use crate::state::*;

#[derive(Accounts)]
#[instruction(args: InitializeLinkV0Args)]
pub struct InitializeLinkV0<'info> {
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
  pub linker: Signer<'info>,

  #[account(
    init,
    payer = linker,
    space = LINK_SIZE,
    seeds = [UNDERDOG_LINK_PREFIX.as_ref(), args.identifier.as_ref()],
    bump,
  )]
  pub link: Box<Account<'info, Link>>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler<'info>(ctx: Context<InitializeLinkV0>, _args: InitializeLinkV0Args) -> Result<()> {
  let link = &mut ctx.accounts.link;

  link.address = ctx.accounts.linker.to_account_info().key();
  link.bump = *ctx.bumps.get("link").unwrap();

  Ok(())
}
