use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::{
  associated_token::AssociatedToken,
  metadata::Metadata,
  token::{self, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::{
  instructions::{CreateMasterEditionV3CpiBuilder, CreateMetadataAccountV3CpiBuilder},
  types::{CollectionDetails, DataV2},
};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeProjectV1Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub name: String,
  pub symbol: String,
  pub uri: String,
  pub seller_fee_basis_points: u16,
}

#[derive(Accounts)]
#[instruction(args: InitializeProjectV1Args)]
pub struct InitializeProjectV1<'info> {
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
    bump=org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    init,
    payer = authority,
    space = PROJECT_SIZE,
    seeds = [PROJECT_PREFIX.as_ref(), org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
    bump
  )]
  pub project_account: Box<Account<'info, Project>>,

  #[account(
    init,
    payer = authority,
    seeds = [PROJECT_MINT_PREFIX.as_ref(),org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
    bump,
    mint::decimals = 0,
    mint::authority = project_account,
    mint::freeze_authority = project_account
  )]
  pub project_mint: Box<Account<'info, Mint>>,

  #[account(
    init,
    payer = authority,
    associated_token::mint = project_mint,
    associated_token::authority = project_account
  )]
  pub project_vault: Box<Account<'info, TokenAccount>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub project_metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub project_master_edition: UncheckedAccount<'info>,

  associated_token_program: Program<'info, AssociatedToken>,
  pub token_metadata_program: Program<'info, Metadata>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitializeProjectV1<'info> {
  fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_accounts = MintTo {
      mint: self.project_mint.to_account_info(),
      to: self.project_vault.to_account_info(),
      authority: self.project_account.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<InitializeProjectV1>, args: InitializeProjectV1Args) -> Result<()> {
  let org_account = &ctx.accounts.org_account;

  ctx.accounts.project_account.super_admin_address = args.super_admin_address;
  ctx.accounts.project_account.org_address = org_account.key();
  ctx.accounts.project_account.project_id = args.project_id;
  ctx.accounts.project_account.bump = ctx.bumps.project_account;

  let project_id = args.project_id.to_le_bytes();

  let bump = ctx.accounts.project_account.bump;
  let signer_seeds = [
    PROJECT_PREFIX.as_ref(),
    ctx.accounts.project_account.org_address.as_ref(),
    project_id.as_ref(),
    &[bump],
  ];

  token::mint_to(
    ctx.accounts.mint_to_ctx().with_signer(&[&signer_seeds[..]]),
    1,
  )?;

  let data = DataV2 {
    name: args.name,
    symbol: args.symbol,
    uri: args.uri,
    seller_fee_basis_points: args.seller_fee_basis_points,
    creators: None,
    collection: None,
    uses: None,
  };

  let collection_details = CollectionDetails::V1 { size: 0 };

  CreateMetadataAccountV3CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .metadata(&ctx.accounts.project_metadata.to_account_info())
    .mint(&ctx.accounts.project_mint.to_account_info())
    .mint_authority(&ctx.accounts.project_account.to_account_info())
    .payer(&ctx.accounts.authority.to_account_info())
    .update_authority(&ctx.accounts.project_account.to_account_info(), true)
    .system_program(&ctx.accounts.system_program)
    .data(data)
    .is_mutable(true)
    .collection_details(collection_details)
    .invoke_signed(&[&signer_seeds[..]])?;

  CreateMasterEditionV3CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .metadata(&ctx.accounts.project_metadata.to_account_info())
    .edition(&ctx.accounts.project_master_edition.to_account_info())
    .mint(&ctx.accounts.project_mint.to_account_info())
    .mint_authority(&ctx.accounts.project_account.to_account_info())
    .payer(&ctx.accounts.authority.to_account_info())
    .update_authority(&ctx.accounts.project_account.to_account_info())
    .system_program(&ctx.accounts.system_program)
    .token_program(&ctx.accounts.token_program)
    .max_supply(0)
    .invoke_signed(&[&signer_seeds[..]])?;

  Ok(())
}
