use anchor_lang::prelude::*;

use anchor_spl::token::Mint;
use mpl_bubblegum::state::metaplex_anchor::{MplTokenMetadata, TokenMetadata};
use mpl_token_metadata::state::DataV2;
use shared_utils::{update_metadata_accounts_v2, UpdateMetadataAccountsV2};

use crate::{state::*, token_metadata::UpdateMetadataArgs};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct UpdateLegacyProjectV0Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub project_type: String,
  pub project_prefix: String,
  pub project_mint_prefix: String,
  pub metadata: UpdateMetadataArgs,
}

#[derive(Accounts)]
#[instruction(args: UpdateLegacyProjectV0Args)]
pub struct UpdateLegacyProjectV0<'info> {
  #[account()]
  pub authority: Signer<'info>,

  #[account(
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
    seeds = [args.project_prefix.as_ref(), org_account.key().as_ref(), args.project_id_str.as_ref()],
    bump = legacy_project.bump
  )]
  pub legacy_project: Box<Account<'info, ProjAccount>>,

  #[account()]
  pub legacy_project_mint: Box<Account<'info, Mint>>,

  /// CHECK: Handled by cpi
  #[account(
    mut,
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), legacy_project_mint.key().as_ref()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub legacy_project_metadata: Box<Account<'info, TokenMetadata>>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub system_program: Program<'info, System>,
}

impl<'info> UpdateLegacyProjectV0<'info> {
  fn update_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, UpdateMetadataAccountsV2<'info>> {
    let cpi_accounts = UpdateMetadataAccountsV2 {
      metadata: self.legacy_project_metadata.to_account_info(),
      update_authority: self.legacy_project.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<UpdateLegacyProjectV0>, args: UpdateLegacyProjectV0Args) -> Result<()> {
  let project_seeds: &[&[&[u8]]] = &[&[
    args.project_prefix.as_ref(),
    ctx.accounts.legacy_project.org.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.legacy_project.bump],
  ]];

  update_metadata_accounts_v2(
    ctx
      .accounts
      .update_metadata_accounts_ctx()
      .with_signer(&[project_seeds[0]]),
    Some(ctx.accounts.legacy_project.key()),
    Some(DataV2 {
      name: args.metadata.name,
      symbol: args.metadata.symbol,
      uri: args.metadata.uri,
      seller_fee_basis_points: args.metadata.seller_fee_basis_points,
      collection: None,
      creators: None,
      uses: None,
    }),
    Some(true),
    Some(true),
  )?;

  Ok(())
}
