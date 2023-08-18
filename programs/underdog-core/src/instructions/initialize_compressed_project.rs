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
pub struct InitializeCompressedProjectArgs {
  pub super_admin_address: Pubkey,
  pub member_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub name: String,
  pub symbol: String,
  pub uri: String,
}

#[derive(Accounts)]
#[instruction(args: InitializeCompressedProjectArgs)]
pub struct InitializeCompressedProject<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
        mut,
        seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
        bump=org_account.bump
    )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
        mut,
        constraint = org_control_account.org_control == authority.key(),
        seeds = [ORG_CONTROL_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
        bump=org_control_account.bump
    )]
  pub org_control_account: Box<Account<'info, OrgControlAccount>>,

  #[account(
        mut,
        constraint = member_account.active == true,
        seeds = [ORG_MEMBER_PREFIX.as_ref(),org_account.key().as_ref(),args.member_address.as_ref()],
        bump=member_account.bump
    )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

  #[account(
        init,
        payer = authority,
        space = COMPRESSED_PROJECT_SIZE,
        seeds = [COMPRESSED_PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
        bump
    )]
  pub compressed_project: Box<Account<'info, CompressedProject>>,

  #[account(
        init,
        payer = authority,
        seeds = [COMPRESSED_PROJECT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
        bump,
        mint::decimals = 0,
        mint::authority = compressed_project,
        mint::freeze_authority = compressed_project
    )]
  pub compressed_project_mint: Box<Account<'info, Mint>>,

  #[account(
        init,
        payer = authority,
        seeds = [COMPRESSED_PROJECT_VAULT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
        bump,
        token::mint = compressed_project_mint,
        token::authority = compressed_project,
    )]
  pub compressed_project_vault: Box<Account<'info, TokenAccount>>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub compressed_project_metadata: AccountInfo<'info>,

  #[account(mut)]
  /// CHECK: Used in CPI So no Harm
  pub compressed_project_master_edition: AccountInfo<'info>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitializeCompressedProject<'info> {
  fn create_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
    let cpi_accounts = CreateMetadataAccountsV3 {
      metadata: self.compressed_project_metadata.to_account_info(),
      mint: self.compressed_project_mint.to_account_info(),
      mint_authority: self.compressed_project.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.compressed_project.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn create_master_edition_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
    let cpi_accounts = CreateMasterEditionV3 {
      metadata: self.compressed_project_metadata.to_account_info(),
      edition: self.compressed_project_master_edition.to_account_info(),
      mint: self.compressed_project_mint.to_account_info(),
      mint_authority: self.compressed_project.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.compressed_project.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
      token_program: self.token_program.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_accounts = MintTo {
      mint: self.compressed_project_mint.to_account_info(),
      to: self.compressed_project_vault.to_account_info(),
      authority: self.compressed_project.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<InitializeCompressedProject>,
  args: InitializeCompressedProjectArgs,
) -> Result<()> {
  let org_account = &mut ctx.accounts.org_account;
  let compressed_project = &mut ctx.accounts.compressed_project;

  compressed_project.super_admin_address = args.super_admin_address;
  compressed_project.org_address = org_account.key();
  compressed_project.project_id = args.project_id_str.parse::<u64>().unwrap();
  compressed_project.bump = *ctx.bumps.get("compressed_project").unwrap();

  let bump = compressed_project.bump;
  let signer_seeds = [
    COMPRESSED_PROJECT_PREFIX.as_ref(),
    ctx.accounts.compressed_project.org_address.as_ref(),
    args.project_id_str.as_ref(),
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
    seller_fee_basis_points: 0,
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
