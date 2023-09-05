use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_program, sysvar::rent::Rent};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct AddOrgMemberArgs {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub member_address: Pubkey,
}

#[derive(Accounts)]
#[instruction(args: AddOrgMemberArgs)]
pub struct AddOrgMemberContext<'info> {
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
    mut,
    seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump=org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    init,
    payer = authority,
    space = ORG_MEMBER_ACCOUNT_SIZE,
    seeds = [ORG_MEMBER_PREFIX.as_ref(),org_account.key().as_ref(),args.member_address.as_ref()],
    bump
  )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<AddOrgMemberContext>, args: AddOrgMemberArgs) -> Result<()> {
  let org_account = &mut ctx.accounts.org_account;
  let member_account = &mut ctx.accounts.member_account;

  member_account.member = args.member_address;
  member_account.org = org_account.key();
  member_account.active = true;
  member_account.bump = *ctx.bumps.get("member_account").unwrap();

  Ok(())
}
