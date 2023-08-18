use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token};
use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;

use shared_utils::{verify_sized_collection_item, VerifySizedCollectionItem};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct VerifyLegacyNftCollectionArgs {
  pub super_admin_address: Pubkey,
  pub member_address: Pubkey,
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
#[instruction(args: VerifyLegacyNftCollectionArgs)]
pub struct VerifyLegacyNftCollection<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = org_control_account.org_control == authority.key(),
    seeds = [ORG_CONTROL_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump=org_control_account.bump
  )]
  pub org_control_account: Box<Account<'info, OrgControlAccount>>,

  #[account(
    seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump=org_account.bump
)]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    constraint = member_account.active == true,
    seeds = [ORG_MEMBER_PREFIX.as_ref(),org_account.key().as_ref(),args.super_admin_address.as_ref()],
    bump=member_account.bump
  )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

  #[account(
    mut,
    seeds = [args.project_prefix.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=legacy_project.bump
  )]
  pub legacy_project: Box<Account<'info, LegacyProject>>,

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

impl<'info> VerifyLegacyNftCollection<'info> {
  fn verify_sized_collection_item_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, VerifySizedCollectionItem<'info>> {
    let cpi_accounts = VerifySizedCollectionItem {
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
  ctx: Context<VerifyLegacyNftCollection>,
  args: VerifyLegacyNftCollectionArgs,
) -> Result<()> {
  let project_signer_seeds = [
    args.project_prefix.as_ref(),
    ctx.accounts.legacy_project.org_address.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.legacy_project.bump],
  ];

  verify_sized_collection_item(
    ctx
      .accounts
      .verify_sized_collection_item_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
    None,
  )?;

  Ok(())
}
