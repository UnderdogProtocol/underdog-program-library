use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use mpl_bubblegum::state::metaplex_adapter::{
  Collection, Creator, MetadataArgs, TokenProgramVersion,
};
use mpl_bubblegum::state::metaplex_anchor::TokenMetadata;
use mpl_bubblegum::state::{metaplex_adapter::TokenStandard, TreeConfig};
use mpl_bubblegum::{
  cpi::{accounts::MintToCollectionV1, mint_to_collection_v1},
  program::Bubblegum,
};
use spl_account_compression::{program::SplAccountCompression, Noop};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct MintSftV4Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub is_delegated: Option<bool>,
}

#[derive(Accounts)]
#[instruction(args: MintSftV4Args)]
pub struct MintSftV4<'info> {
  #[account(mut)]
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
    mut,
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
  pub collection_metadata: Box<Account<'info, TokenMetadata>>,

  /// CHECK: Handled By cpi account
  #[account(
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), collection_mint.key().as_ref(), "edition".as_bytes()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub collection_master_edition: UncheckedAccount<'info>,

  /// CHECK: Used in cpi
  pub recipient: AccountInfo<'info>,

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

  /// CHECK: Used in cpi
  #[account(
    seeds = ["collection_cpi".as_bytes()],
    bump,
    seeds::program = bubblegum_program.key(),
  )]
  pub bubblegum_signer: UncheckedAccount<'info>,

  /// CHECK: Verified by constraint
  #[account(address = mpl_token_metadata::ID)]
  pub token_metadata_program: AccountInfo<'info>,
  pub log_wrapper: Program<'info, Noop>,
  pub bubblegum_program: Program<'info, Bubblegum>,
  pub compression_program: Program<'info, SplAccountCompression>,
  pub system_program: Program<'info, System>,
}

impl<'info> MintSftV4<'info> {
  fn mint_to_collection_ctx(
    &self,
    is_delegated: Option<bool>,
  ) -> CpiContext<'_, '_, '_, 'info, MintToCollectionV1<'info>> {
    let cpi_accounts = MintToCollectionV1 {
      tree_authority: self.tree_authority.to_account_info(),
      leaf_owner: self.recipient.to_account_info(),
      leaf_delegate: if is_delegated == Some(true) {
        self.project_account.to_account_info()
      } else {
        self.recipient.to_account_info()
      },
      merkle_tree: self.merkle_tree.to_account_info(),
      payer: self.authority.to_account_info(),
      tree_delegate: self.authority.to_account_info(),
      collection_authority: self.project_account.to_account_info(),
      collection_authority_record_pda: self.bubblegum_program.to_account_info(),
      collection_mint: self.collection_mint.to_account_info(),
      collection_metadata: self.collection_metadata.to_account_info(),
      edition_account: self.collection_master_edition.to_account_info(),
      bubblegum_signer: self.bubblegum_signer.to_account_info(),
      token_metadata_program: self.token_metadata_program.to_account_info(),
      compression_program: self.compression_program.to_account_info(),
      system_program: self.system_program.to_account_info(),
      log_wrapper: self.log_wrapper.to_account_info(),
    };
    CpiContext::new(self.bubblegum_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<MintSftV4>, args: MintSftV4Args) -> Result<()> {
  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  let org_seeds: &[&[&[u8]]] = &[&[
    ORG_PREFIX.as_ref(),
    args.super_admin_address.as_ref(),
    args.org_id.as_ref(),
    &[ctx.accounts.org_account.bump],
  ]];

  let collection_metadata: &Box<Account<'_, TokenMetadata>> = &ctx.accounts.collection_metadata;

  let metadata = MetadataArgs {
    name: collection_metadata
      .data
      .name
      .trim_end_matches('\0')
      .to_owned(),
    symbol: collection_metadata
      .data
      .symbol
      .trim_end_matches('\0')
      .to_owned(),
    uri: collection_metadata
      .data
      .uri
      .trim_end_matches('\0')
      .to_owned(),
    collection: Some(Collection {
      key: ctx.accounts.collection_mint.key(),
      verified: false, // Verified in cpi
    }),
    primary_sale_happened: true,
    is_mutable: true,
    edition_nonce: Some(0),
    token_standard: Some(TokenStandard::NonFungible),
    uses: None,
    token_program_version: TokenProgramVersion::Original,
    creators: vec![
      Creator {
        address: ctx.accounts.project_account.key(),
        verified: true,
        share: 100,
      },
      Creator {
        address: ctx.accounts.org_account.key(),
        verified: true,
        share: 0,
      },
    ],
    seller_fee_basis_points: ctx
      .accounts
      .collection_metadata
      .data
      .seller_fee_basis_points,
  };

  let mut project = ctx.accounts.project_account.to_account_info();
  project.is_signer = true;

  let mut org = ctx.accounts.org_account.to_account_info();
  org.is_signer = true;

  mint_to_collection_v1(
    ctx
      .accounts
      .mint_to_collection_ctx(args.is_delegated)
      .with_remaining_accounts(vec![project, org])
      .with_signer(&[project_seeds[0], org_seeds[0]]),
    metadata,
  )?;

  let tree_authority: &Box<Account<'_, TreeConfig>> = &ctx.accounts.tree_authority;

  msg!("nftId: {}", tree_authority.num_minted);
  msg!("ownerAddress: {}", ctx.accounts.recipient.key());

  Ok(())
}
