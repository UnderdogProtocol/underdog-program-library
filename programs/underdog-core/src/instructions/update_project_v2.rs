use anchor_lang::prelude::*;

use anchor_spl::token::Mint;
use mpl_bubblegum::state::metaplex_anchor::{MplTokenMetadata, TokenMetadata};
use mpl_token_metadata::state::DataV2;
use shared_utils::{update_metadata_accounts_v2, UpdateMetadataAccountsV2};

use crate::{state::*, token_metadata::UpdateMetadataArgs};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct UpdateProjectV2Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub metadata: UpdateMetadataArgs,
}

#[derive(Accounts)]
#[instruction(args: UpdateProjectV2Args)]
pub struct UpdateProjectV2<'info> {
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
    seeds = [PROJECT_PREFIX.as_ref(), org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
    bump = project_account.bump
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
  pub collection_metadata: Box<Account<'info, TokenMetadata>>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub system_program: Program<'info, System>,
}

impl<'info> UpdateProjectV2<'info> {
  fn update_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, UpdateMetadataAccountsV2<'info>> {
    let cpi_accounts = UpdateMetadataAccountsV2 {
      metadata: self.collection_metadata.to_account_info(),
      update_authority: self.project_account.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<UpdateProjectV2>, args: UpdateProjectV2Args) -> Result<()> {
  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  update_metadata_accounts_v2(
    ctx
      .accounts
      .update_metadata_accounts_ctx()
      .with_signer(&[project_seeds[0]]),
    Some(ctx.accounts.project_account.key()),
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
