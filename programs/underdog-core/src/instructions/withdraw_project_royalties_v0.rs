use anchor_lang::prelude::*;

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct WithdrawProjectRoyaltiesV0Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
}

#[derive(Accounts)]
#[instruction(args: WithdrawProjectRoyaltiesV0Args)]
pub struct WithdrawProjectRoyaltiesV0<'info> {
  #[account()]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  #[account(
    seeds = [ORG_PREFIX.as_ref(), args.super_admin_address.as_ref(), args.org_id.as_ref()],
    bump=org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    mut,
    seeds = [PROJECT_PREFIX.as_ref(), org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
    bump = project_account.bump
  )]
  pub project_account: Box<Account<'info, Project>>,

  /// CHECK: Transfer destination
  #[account(mut)]
  pub destination: AccountInfo<'info>,

  pub system_program: Program<'info, System>,
}

pub fn handler(
  ctx: Context<WithdrawProjectRoyaltiesV0>,
  _args: WithdrawProjectRoyaltiesV0Args,
) -> Result<()> {
  let amount_to_withdraw = ctx.accounts.project_account.to_account_info().lamports()
    - Rent::get()?.minimum_balance(PROJECT_SIZE);

  **ctx
    .accounts
    .project_account
    .to_account_info()
    .try_borrow_mut_lamports()? -= amount_to_withdraw;

  **ctx
    .accounts
    .destination
    .to_account_info()
    .try_borrow_mut_lamports()? += amount_to_withdraw;

  Ok(())
}
