use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeOrgV1Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
}

#[derive(Accounts)]
#[instruction(args: InitializeOrgV1Args)]
pub struct InitializeOrgV1Context<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  #[account(
    init,
    payer = authority,
    space = ORG_ACCOUNT_SIZE,
    seeds = [ORG_PREFIX.as_ref(), args.super_admin_address.as_ref(), args.org_id.as_ref()],
    bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InitializeOrgV1Context>, args: InitializeOrgV1Args) -> Result<()> {
  let org_account = &mut ctx.accounts.org_account;

  org_account.owner = args.super_admin_address;
  org_account.counter = args.org_id.parse::<u64>().unwrap();
  org_account.bump = ctx.bumps.org_account;

  Ok(())
}
