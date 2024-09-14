use anchor_lang::prelude::*;

use anchor_spl::{
  metadata::{Metadata, MetadataAccount},
  token::Mint,
};
use mpl_token_metadata::{instructions::UpdateMetadataAccountV2CpiBuilder, types::DataV2};

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
  pub collection_metadata: Box<Account<'info, MetadataAccount>>,

  pub token_metadata_program: Program<'info, Metadata>,
  pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateProjectV2>, args: UpdateProjectV2Args) -> Result<()> {
  let project_id = args.project_id.to_le_bytes();

  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  UpdateMetadataAccountV2CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .metadata(&ctx.accounts.collection_metadata.to_account_info())
    .update_authority(&ctx.accounts.project_account.to_account_info())
    .data(DataV2 {
      name: args.metadata.name,
      symbol: args.metadata.symbol,
      uri: args.metadata.uri,
      seller_fee_basis_points: args.metadata.seller_fee_basis_points,
      collection: None,
      creators: None,
      uses: None,
    })
    .invoke_signed(&[&project_seeds[0]])?;

  Ok(())
}
