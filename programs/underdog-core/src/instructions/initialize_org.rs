use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeOrgArgs {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub org_control_address: Pubkey,
}

#[derive(Accounts)]
#[instruction(args: InitializeOrgArgs)]
pub struct InitializeOrgContext<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  #[account(
    init,
    payer = authority,
    space = ORG_ACCOUNT_SIZE,
    seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    init,
    payer = authority,
    space = ORG_CONTROL_ACCOUNT_SIZE,
    seeds = [ORG_CONTROL_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump
  )]
  pub org_control_account: Box<Account<'info, OrgControlAccount>>,

  #[account(
    init,
    payer = authority,
    space = ORG_MEMBER_ACCOUNT_SIZE,
    seeds = [ORG_MEMBER_PREFIX.as_ref(),org_account.key().as_ref(),args.super_admin_address.as_ref()],
    bump
  )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InitializeOrgContext>, args: InitializeOrgArgs) -> Result<()> {
  let org_account = &mut ctx.accounts.org_account;
  let org_control_account = &mut ctx.accounts.org_control_account;
  let member_account = &mut ctx.accounts.member_account;

  org_account.owner = args.super_admin_address;
  org_account.counter = args.org_id.parse::<u64>().unwrap();
  org_account.bump = *ctx.bumps.get("org_account").unwrap();

  org_control_account.org_control = args.org_control_address;
  org_control_account.bump = *ctx.bumps.get("org_control_account").unwrap();

  member_account.member = args.super_admin_address;
  member_account.org = org_account.key();
  member_account.active = true;
  member_account.bump = *ctx.bumps.get("member_account").unwrap();

  Ok(())
}
