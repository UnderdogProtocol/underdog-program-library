use anchor_lang::prelude::*;

use shared_utils::{initialize, write_data, Initialize, Inscription, WriteData};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InscribeImageV0Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub value: Vec<u8>,
}

#[derive(Accounts)]
#[instruction(args: InscribeImageV0Args)]
pub struct InscribeImageV0<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  #[account(
    seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump=org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub inscription_account: Signer<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub inscription_metadata_account: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub inscription_shard_account: UncheckedAccount<'info>,

  pub inscription_program: Program<'info, Inscription>,
  pub system_program: Program<'info, System>,
}

impl<'info> InscribeImageV0<'info> {
  fn initalize_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Initialize<'info>> {
    let cpi_accounts = Initialize {
      metadata_account: self.inscription_metadata_account.to_account_info(),
      inscription_account: self.inscription_account.to_account_info(),
      inscription_shard_account: self.inscription_shard_account.to_account_info(),
      payer: self.authority.to_account_info(),
      authority: self.org_account.to_account_info(),
      system_program: self.system_program.to_account_info(),
    };
    CpiContext::new(self.inscription_program.to_account_info(), cpi_accounts)
  }

  fn write_data_ctx(&self) -> CpiContext<'_, '_, '_, 'info, WriteData<'info>> {
    let cpi_accounts = WriteData {
      metadata_account: self.inscription_metadata_account.to_account_info(),
      inscription_account: self.inscription_account.to_account_info(),
      payer: self.authority.to_account_info(),
      authority: self.org_account.to_account_info(),
      system_program: self.system_program.to_account_info(),
    };
    CpiContext::new(self.inscription_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<InscribeImageV0>, args: InscribeImageV0Args) -> Result<()> {
  let org_seeds: &[&[&[u8]]] = &[&[
    ORG_PREFIX.as_ref(),
    args.super_admin_address.as_ref(),
    args.org_id.as_ref(),
    &[ctx.accounts.org_account.bump],
  ]];

  let inscription_account = ctx.accounts.inscription_account.to_account_info();
  if inscription_account.data_is_empty() {
    initialize(ctx.accounts.initalize_ctx().with_signer(&[&org_seeds[0]]))?;
  }

  write_data(
    ctx.accounts.write_data_ctx().with_signer(&[&org_seeds[0]]),
    args.value,
  )?;

  Ok(())
}
