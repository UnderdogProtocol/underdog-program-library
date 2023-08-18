use anchor_lang::prelude::*;
use anchor_lang::solana_program::{self, system_program, sysvar::rent::Rent};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct UpdateOrgMemberArgs {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub member_address: Pubkey,
  pub active: bool,
}

#[derive(Accounts)]
#[instruction(args: UpdateOrgMemberArgs)]
pub struct UpdateOrgMemberContext<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = owner_account.owner == authority.key(),
    seeds = [b"ownership".as_ref()], 
    bump=owner_account.bump
)]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  #[account(
        mut,
        seeds = [b"org".as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()], 
        bump=org_account.bump
    )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
        mut,
        seeds = [b"member".as_ref(),org_account.key().as_ref(),args.member_address.as_ref()], 
        bump=member_account.bump
    )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

  #[account(address = system_program::ID)]
  pub system_program: Program<'info, System>,

  #[account(address = solana_program::sysvar::rent::ID)]
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<UpdateOrgMemberContext>, args: UpdateOrgMemberArgs) -> Result<()> {
  let member_account = &mut ctx.accounts.member_account;
  member_account.active = args.active;

  Ok(())
}
