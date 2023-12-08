use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token};
use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;

use shared_utils::{verify_collection, VerifyCollection};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct VerifyLegacyNftCollectionV1Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub nft_id_str: String,
  pub project_type: String,
  pub project_prefix: String,
  pub project_mint_prefix: String,
  pub nft_mint_prefix: String,
  pub project_mint_bump: u8,
  pub nft_mint_bump: u8,
}

#[derive(Accounts)]
#[instruction(args: VerifyLegacyNftCollectionV1Args)]
pub struct VerifyLegacyNftCollectionV1<'info> {
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
    mut,
    seeds = [args.project_prefix.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=legacy_project.bump
  )]
  pub legacy_project: Box<Account<'info, ProjAccount>>,

  /// CHECK: Handled by cpi
  #[account(
    seeds = [args.project_mint_prefix.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=args.project_mint_bump,
)]
  pub legacy_project_mint: UncheckedAccount<'info>,

  /// CHECK: Handled by cpi
  #[account(
    mut,
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), legacy_project_mint.key().as_ref()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub legacy_project_metadata: UncheckedAccount<'info>,

  /// CHECK: Handled By cpi account
  #[account(
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), legacy_project_mint.key().as_ref(), "edition".as_bytes()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub legacy_project_master_edition: UncheckedAccount<'info>,

  #[account(
    seeds = [args.nft_mint_prefix.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump=args.nft_mint_bump,
  )]
  pub legacy_nft_mint: Box<Account<'info, Mint>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub legacy_nft_metadata: UncheckedAccount<'info>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> VerifyLegacyNftCollectionV1<'info> {
  fn verify_collection_ctx(&self) -> CpiContext<'_, '_, '_, 'info, VerifyCollection<'info>> {
    let cpi_accounts = VerifyCollection {
      payer: self.authority.to_account_info().clone(),
      metadata: self.legacy_nft_metadata.to_account_info().clone(),
      collection_authority: self.legacy_project.to_account_info(),
      collection_mint: self.legacy_project_mint.to_account_info(),
      collection_metadata: self.legacy_project_metadata.to_account_info(),
      collection_master_edition: self.legacy_project_master_edition.to_account_info(),
    };
    CpiContext::new(
      self.token_metadata_program.to_account_info().clone(),
      cpi_accounts,
    )
  }
}

pub fn handler(
  ctx: Context<VerifyLegacyNftCollectionV1>,
  args: VerifyLegacyNftCollectionV1Args,
) -> Result<()> {
  let project_signer_seeds = [
    args.project_prefix.as_ref(),
    ctx.accounts.legacy_project.org.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.legacy_project.bump],
  ];

  verify_collection(
    ctx
      .accounts
      .verify_collection_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
    None,
  )?;

  Ok(())
}
