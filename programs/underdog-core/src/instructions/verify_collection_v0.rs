use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;

use shared_utils::{verify_sized_collection_item, VerifySizedCollectionItem};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct VerifyCollectionV0Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub nft_id: u64,
}

#[derive(Accounts)]
#[instruction(args: VerifyCollectionV0Args)]
pub struct VerifyCollectionV0<'info> {
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
  pub collection_mint: Box<Account<'info, Mint>>,

  /// CHECK: Handled by cpi
  #[account(
    mut,
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub collection_metadata: UncheckedAccount<'info>,

  /// CHECK: Handled By cpi account
  #[account(
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), "edition".as_bytes()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub collection_master_edition: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account()]
  pub mint: Box<Account<'info, Mint>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub metadata: UncheckedAccount<'info>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub system_program: Program<'info, System>,
}

impl<'info> VerifyCollectionV0<'info> {
  fn verify_sized_collection_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, VerifySizedCollectionItem<'info>> {
    let cpi_accounts = VerifySizedCollectionItem {
      payer: self.authority.to_account_info().clone(),
      metadata: self.metadata.to_account_info().clone(),
      collection_authority: self.project_account.to_account_info(),
      collection_mint: self.collection_mint.to_account_info(),
      collection_metadata: self.collection_metadata.to_account_info(),
      collection_master_edition: self.collection_master_edition.to_account_info(),
    };
    CpiContext::new(
      self.token_metadata_program.to_account_info().clone(),
      cpi_accounts,
    )
  }
}

pub fn handler(ctx: Context<VerifyCollectionV0>, args: VerifyCollectionV0Args) -> Result<()> {
  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  verify_sized_collection_item(
    ctx
      .accounts
      .verify_sized_collection_ctx()
      .with_signer(&[&project_seeds[0]]),
    None,
  )?;

  Ok(())
}
