use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use mpl_bubblegum::program::Bubblegum;
use mpl_bubblegum::state::metaplex_adapter::{
  Collection, MetadataArgs, TokenProgramVersion, TokenStandard,
};
use mpl_bubblegum::state::metaplex_anchor::{MplTokenMetadata, TokenMetadata};
use mpl_bubblegum::state::TreeConfig;
use shared_utils::{update_metadata, UpdateArgs, UpdateMetadata};
use spl_account_compression::{program::SplAccountCompression, Noop};

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct CreatorInput {
  pub address: Pubkey,
  pub verified: bool,
  // In percentages, NOT basis points ;) Watch out!
  pub share: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone, Default)]
pub struct CurrentMetadata {
  pub name: String,
  pub symbol: String,
  pub uri: String,
  pub seller_fee_basis_points: u16,
  pub creators: Vec<CreatorInput>,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone, Default)]
pub struct UpdatedMetadata {
  pub name: Option<String>,
  pub symbol: Option<String>,
  pub uri: Option<String>,
  pub seller_fee_basis_points: Option<u16>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateAssetV0Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub root: [u8; 32],
  pub current_metadata: CurrentMetadata,
  pub updated_metadata: UpdatedMetadata,
  pub leaf_index: u32,
}

#[derive(Accounts)]
#[instruction(args: UpdateAssetV0Args)]
pub struct UpdateAssetV0<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  #[account(
    mut,
    seeds = [ORG_PREFIX.as_ref(), args.super_admin_address.as_ref(), args.org_id.as_ref()],
    bump= org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    mut,
    seeds = [PROJECT_PREFIX.as_ref(), org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
    bump=project_account.bump
  )]
  pub project_account: Box<Account<'info, Project>>,

  #[account()]
  pub collection_mint: Box<Account<'info, Mint>>,

  /// CHECK: Handled by cpi
  #[account(
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), collection_mint.key().as_ref()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub collection_metadata: Box<Account<'info, TokenMetadata>>,

  /// CHECK: Used in cpi
  pub leaf_owner: AccountInfo<'info>,

  /// CHECK: Used in cpi
  pub leaf_delegate: AccountInfo<'info>,

  #[account(
    mut,
    seeds = [merkle_tree.key().as_ref()],
    bump,
    seeds::program = bubblegum_program.key(),
  )]
  pub tree_authority: Box<Account<'info, TreeConfig>>,

  /// CHECK: Checked by cpi
  #[account(mut)]
  pub merkle_tree: AccountInfo<'info>,

  pub bubblegum_program: Program<'info, Bubblegum>,
  pub log_wrapper: Program<'info, Noop>,
  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub compression_program: Program<'info, SplAccountCompression>,
  pub system_program: Program<'info, System>,
}

impl<'info> UpdateAssetV0<'info> {
  fn update_metadata_ctx(&self) -> CpiContext<'_, '_, '_, 'info, UpdateMetadata<'info>> {
    let cpi_accounts = UpdateMetadata {
      authority: self.project_account.to_account_info(),
      tree_authority: self.tree_authority.to_account_info(),
      leaf_owner: self.leaf_owner.to_account_info(),
      leaf_delegate: self.leaf_delegate.to_account_info(),
      merkle_tree: self.merkle_tree.to_account_info(),
      collection_mint: self.collection_mint.to_account_info(),
      collection_metadata: self.collection_metadata.to_account_info(),
      collection_authority_record_pda: self.bubblegum_program.to_account_info(),
      payer: self.authority.to_account_info(),
      compression_program: self.compression_program.to_account_info(),
      token_metadata_program: self.token_metadata_program.to_account_info(),
      log_wrapper: self.log_wrapper.to_account_info(),
      system_program: self.system_program.to_account_info(),
    };
    CpiContext::new(self.bubblegum_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler<'info>(
  ctx: Context<'_, '_, '_, 'info, UpdateAssetV0<'info>>,
  args: UpdateAssetV0Args,
) -> Result<()> {
  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  let metadata = MetadataArgs {
    name: args.current_metadata.name,
    symbol: args.current_metadata.symbol,
    uri: args.current_metadata.uri,
    collection: Some(Collection {
      key: ctx.accounts.collection_mint.key(),
      verified: true,
    }),
    primary_sale_happened: true,
    is_mutable: true,
    edition_nonce: Some(0),
    token_standard: Some(TokenStandard::NonFungible),
    uses: None,
    token_program_version: TokenProgramVersion::Original,
    creators: args
      .current_metadata
      .creators
      .into_iter()
      .map(|creator| mpl_bubblegum::state::metaplex_adapter::Creator {
        address: creator.address,
        verified: creator.verified,
        share: creator.share,
      })
      .collect(),
    seller_fee_basis_points: args.current_metadata.seller_fee_basis_points,
  };

  let updated_metadata = UpdateArgs {
    name: args.updated_metadata.name,
    symbol: args.updated_metadata.symbol,
    uri: args.updated_metadata.uri,
    seller_fee_basis_points: args.updated_metadata.seller_fee_basis_points,
    creators: None,
    primary_sale_happened: None,
    is_mutable: None,
  };

  update_metadata(
    ctx
      .accounts
      .update_metadata_ctx()
      .with_remaining_accounts(ctx.remaining_accounts.to_vec())
      .with_signer(&[project_seeds[0]]),
    args.root,
    metadata,
    updated_metadata,
    u64::from(args.leaf_index),
    args.leaf_index,
  )?;

  Ok(())
}
