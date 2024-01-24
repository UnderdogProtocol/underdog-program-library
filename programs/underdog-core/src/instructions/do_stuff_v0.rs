use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;

use mpl_token_metadata::state::{Collection, Creator, DataV2};
use shared_utils::{
  create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
  CreateMetadataAccountsV3, SignMetadata,
};

use crate::state::*;
use crate::token_metadata::UpdateMetadataArgs;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct DoStuffV0Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub nft_id: u64,
  pub data: UpdateMetadataArgs,
}

#[derive(Accounts)]
#[instruction(args: DoStuffV0Args)]
pub struct DoStuffV0<'info> {
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

  #[account(mut)]
  pub collection_mint: Box<Account<'info, Mint>>,

  #[account(
    init,
    payer = authority,
    seeds = [project_account.key().as_ref(), args.nft_id.to_le_bytes().as_ref()],
    bump,
    mint::decimals = 0,
    mint::authority = project_account,
    mint::freeze_authority = project_account
  )]
  pub mint: Box<Account<'info, Mint>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub master_edition: UncheckedAccount<'info>,

  /// CHECK: needed for token account init
  pub receiver: UncheckedAccount<'info>,

  #[account(init, payer = authority, associated_token::mint = mint, associated_token::authority = receiver)]
  pub receiver_ata: Box<Account<'info, TokenAccount>>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> DoStuffV0<'info> {
  fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_accounts = MintTo {
      mint: self.mint.to_account_info(),
      to: self.receiver_ata.to_account_info(),
      authority: self.project_account.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }

  fn create_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
    let cpi_accounts = CreateMetadataAccountsV3 {
      metadata: self.metadata.to_account_info(),
      mint: self.mint.to_account_info(),
      mint_authority: self.project_account.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.project_account.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn sign_metadata_ctx(&self) -> CpiContext<'_, '_, '_, 'info, SignMetadata<'info>> {
    let cpi_accounts = SignMetadata {
      metadata: self.metadata.to_account_info(),
      creator: self.org_account.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn create_master_edition_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
    let cpi_accounts = CreateMasterEditionV3 {
      metadata: self.metadata.to_account_info(),
      edition: self.master_edition.to_account_info(),
      mint: self.mint.to_account_info(),
      mint_authority: self.project_account.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.project_account.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
      token_program: self.token_program.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<DoStuffV0>, args: DoStuffV0Args) -> Result<()> {
  let org_seeds: &[&[&[u8]]] = &[&[
    ORG_PREFIX.as_ref(),
    args.super_admin_address.as_ref(),
    args.org_id.as_ref(),
    &[ctx.accounts.org_account.bump],
  ]];

  let project_id = args.project_id.to_le_bytes();
  let project_seeds: &[&[&[u8]]] = &[&[
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.project_account.bump],
  ]];

  token::mint_to(
    ctx.accounts.mint_to_ctx().with_signer(&[project_seeds[0]]),
    1,
  )?;

  let creators = vec![
    Creator {
      address: ctx.accounts.project_account.to_account_info().key(),
      verified: true,
      share: 100,
    },
    Creator {
      address: ctx.accounts.org_account.to_account_info().key(),
      verified: false,
      share: 0,
    },
  ];

  let data = DataV2 {
    name: args.data.name,
    symbol: args.data.symbol,
    uri: args.data.uri,
    seller_fee_basis_points: args.data.seller_fee_basis_points,
    creators: Some(creators),
    collection: Some(Collection {
      verified: false,
      key: ctx.accounts.collection_mint.key(),
    }),
    uses: None,
  };

  let mut org = ctx.accounts.org_account.to_account_info();
  org.is_signer = true;

  create_metadata_accounts_v3(
    ctx
      .accounts
      .create_metadata_accounts_ctx()
      .with_signer(&[project_seeds[0]]),
    data,
    true,
    true,
    None,
  )?;

  // sign_metadata(
  //   ctx
  //     .accounts
  //     .sign_metadata_ctx()
  //     .with_signer(&[org_seeds[0]]),
  // )?;

  create_master_edition_v3(
    ctx
      .accounts
      .create_master_edition_ctx()
      .with_signer(&[project_seeds[0]]),
    Some(0),
  )?;

  Ok(())
}
