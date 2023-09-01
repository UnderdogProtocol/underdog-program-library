use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;
use mpl_token_metadata::state::{CollectionDetails, DataV2};
use shared_utils::{
  create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
  CreateMetadataAccountsV3,
};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeProjectV0Args {
  pub super_admin_address: Pubkey,
  pub member_address: Pubkey,
  pub org_id: String,
  pub project_id: u64,
  pub name: String,
  pub symbol: String,
  pub uri: String,
  pub seller_fee_basis_points: u16,
}

#[derive(Accounts)]
#[instruction(args: InitializeProjectV0Args)]
pub struct InitializeProjectV0<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
        mut,
        constraint = org_control_account.org_control == authority.key(),
        seeds = [ORG_CONTROL_PREFIX.as_ref(), args.super_admin_address.as_ref(), args.org_id.as_ref()],
        bump=org_control_account.bump
    )]
  pub org_control_account: Box<Account<'info, OrgControlAccount>>,

  #[account(
        mut,
        seeds = [ORG_PREFIX.as_ref(), args.super_admin_address.as_ref(), args.org_id.as_ref()],
        bump=org_account.bump
    )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
        mut,
        constraint = member_account.active == true,
        seeds = [ORG_MEMBER_PREFIX.as_ref(), org_account.key().as_ref(), args.member_address.as_ref()],
        bump=member_account.bump
    )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

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
        seeds = [PROJECT_VAULT_PREFIX.as_ref(),org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
        bump,
        token::mint = project_mint,
        token::authority = project_account,
    )]
  pub project_vault: Box<Account<'info, TokenAccount>>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub project_metadata: AccountInfo<'info>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub project_master_edition: AccountInfo<'info>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitializeProjectV0<'info> {
  fn create_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
    let cpi_accounts = CreateMetadataAccountsV3 {
      metadata: self.project_metadata.to_account_info(),
      mint: self.project_mint.to_account_info(),
      mint_authority: self.project_account.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.project_account.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn create_master_edition_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
    let cpi_accounts = CreateMasterEditionV3 {
      metadata: self.project_metadata.to_account_info(),
      edition: self.project_master_edition.to_account_info(),
      mint: self.project_mint.to_account_info(),
      mint_authority: self.project_account.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.project_account.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
      token_program: self.token_program.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_accounts = MintTo {
      mint: self.project_mint.to_account_info(),
      to: self.project_vault.to_account_info(),
      authority: self.project_account.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<InitializeProjectV0>, args: InitializeProjectV0Args) -> Result<()> {
  let org_account = &ctx.accounts.org_account;

  ctx.accounts.project_account.super_admin_address = args.super_admin_address;
  ctx.accounts.project_account.org_address = org_account.key();
  ctx.accounts.project_account.project_id = args.project_id;
  ctx.accounts.project_account.bump = *ctx.bumps.get("project_account").unwrap();

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

  create_metadata_accounts_v3(
    ctx
      .accounts
      .create_metadata_accounts_ctx()
      .with_signer(&[&signer_seeds[..]]),
    data,
    true,
    true,
    Some(CollectionDetails::V1 { size: 0 }),
  )?;

  create_master_edition_v3(
    ctx
      .accounts
      .create_master_edition_ctx()
      .with_signer(&[&signer_seeds[..]]),
    Some(0),
  )?;

  Ok(())
}
