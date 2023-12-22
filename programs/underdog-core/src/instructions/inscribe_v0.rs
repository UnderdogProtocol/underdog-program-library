use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use shared_utils::{initialize_from_mint, InitializeFromMint, Inscription};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InscribeV0Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub nft_id: u64,
}

#[derive(Accounts)]
#[instruction(args: InscribeV0Args)]
pub struct InscribeV0<'info> {
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

  #[account(
    seeds = [PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id.to_le_bytes().as_ref()],
    bump=project_account.bump
  )]
  pub project_account: Box<Account<'info, Project>>,

  #[account()]
  pub mint: Box<Account<'info, Mint>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub mint_inscription_account: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub inscription_shard_account: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub inscription_metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account()]
  pub metadata: UncheckedAccount<'info>,

  pub inscription_program: Program<'info, Inscription>,
  pub system_program: Program<'info, System>,
}

impl<'info> InscribeV0<'info> {
  fn initialize_from_mint_ctx(&self) -> CpiContext<'_, '_, '_, 'info, InitializeFromMint<'info>> {
    let cpi_accounts = InitializeFromMint {
      mint_inscription_account: self.mint_inscription_account.to_account_info(),
      metadata_account: self.inscription_metadata.to_account_info(),
      mint_account: self.mint.to_account_info(),
      token_metadata_account: self.metadata.to_account_info(),
      inscription_shard_account: self.inscription_shard_account.to_account_info(),
      payer: self.authority.to_account_info(),
      authority: self.project_account.to_account_info(),
      system_program: self.system_program.to_account_info(),
    };
    CpiContext::new(self.inscription_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<InscribeV0>, args: InscribeV0Args) -> Result<()> {
  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  initialize_from_mint(
    ctx
      .accounts
      .initialize_from_mint_ctx()
      .with_signer(&[&project_seeds[0]]),
  )?;

  Ok(())
}
