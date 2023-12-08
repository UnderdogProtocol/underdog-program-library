use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;
use mpl_token_metadata::state::DataV2;
use shared_utils::{
  create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
  CreateMetadataAccountsV3,
};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct InitializeLegacyProjectV1Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub project_type: String,
  pub project_prefix: String,
  pub project_mint_prefix: String,
  pub project_vault_prefix: String,
  pub name: String,
  pub symbol: String,
  pub uri: String,
}

#[derive(Accounts)]
#[instruction(args: InitializeLegacyProjectV1Args)]
pub struct InitializeLegacyProjectV1<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  #[account(
    mut,
    seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump=org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    init,
    payer = authority,
    space = LEGACY_PROJECT_SIZE,
    seeds = [args.project_prefix.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump
  )]
  pub legacy_project: Box<Account<'info, ProjAccount>>,

  #[account(
    init,
    payer = authority,
    seeds = [args.project_mint_prefix.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump,
    mint::decimals = 0,
    mint::authority = legacy_project,
    mint::freeze_authority = legacy_project
  )]
  pub legacy_project_mint: Box<Account<'info, Mint>>,

  #[account(
    init,
    payer = authority,
    seeds = [args.project_vault_prefix.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump,
    token::mint = legacy_project_mint,
    token::authority = legacy_project,
  )]
  pub legacy_project_vault: Box<Account<'info, TokenAccount>>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub legacy_project_metadata: AccountInfo<'info>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub legacy_project_master_edition: AccountInfo<'info>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitializeLegacyProjectV1<'info> {
  fn create_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
    let cpi_accounts = CreateMetadataAccountsV3 {
      metadata: self.legacy_project_metadata.to_account_info(),
      mint: self.legacy_project_mint.to_account_info(),
      mint_authority: self.legacy_project.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.legacy_project.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn create_master_edition_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
    let cpi_accounts = CreateMasterEditionV3 {
      metadata: self.legacy_project_metadata.to_account_info(),
      edition: self.legacy_project_master_edition.to_account_info(),
      mint: self.legacy_project_mint.to_account_info(),
      mint_authority: self.legacy_project.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.legacy_project.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
      token_program: self.token_program.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_accounts = MintTo {
      mint: self.legacy_project_mint.to_account_info(),
      to: self.legacy_project_vault.to_account_info(),
      authority: self.legacy_project.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<InitializeLegacyProjectV1>,
  args: InitializeLegacyProjectV1Args,
) -> Result<()> {
  let org_account = &mut ctx.accounts.org_account;
  let legacy_project = &mut ctx.accounts.legacy_project;

  legacy_project.superadmin = args.super_admin_address;
  legacy_project.org = org_account.key();
  legacy_project.projcount = args.project_id_str.parse::<u64>().unwrap();
  legacy_project.bump = *ctx.bumps.get("legacy_project").unwrap();

  let bump = legacy_project.bump;
  let signer_seeds = [
    args.project_prefix.as_ref(),
    ctx.accounts.legacy_project.org.as_ref(),
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
    None,
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
