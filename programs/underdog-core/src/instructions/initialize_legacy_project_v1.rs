use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::{
  associated_token::AssociatedToken,
  metadata::Metadata,
  token::{self, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::{
  instructions::{CreateMasterEditionV3CpiBuilder, CreateMetadataAccountV3CpiBuilder},
  types::DataV2,
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
    seeds = [ORG_PREFIX.as_ref(), args.super_admin_address.as_ref(), args.org_id.as_ref()],
    bump=org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    init,
    payer = authority,
    space = LEGACY_PROJECT_SIZE,
    seeds = [args.project_prefix.as_ref(), org_account.key().as_ref(), args.project_id_str.as_ref()],
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
    associated_token::mint = legacy_project_mint,
    associated_token::authority = legacy_project
  )]
  pub legacy_project_vault: Box<Account<'info, TokenAccount>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub legacy_project_metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub legacy_project_master_edition: UncheckedAccount<'info>,

  pub token_metadata_program: Program<'info, Metadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> InitializeLegacyProjectV1<'info> {
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
  let legacy_project = &mut ctx.accounts.legacy_project;

  legacy_project.superadmin = args.super_admin_address;
  legacy_project.org = ctx.accounts.org_account.key();
  legacy_project.projcount = args.project_id_str.parse::<u64>().unwrap();

  let legacy_project_bump = ctx.bumps.legacy_project;
  legacy_project.bump = legacy_project_bump;

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

  CreateMetadataAccountV3CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .metadata(&ctx.accounts.legacy_project_metadata.to_account_info())
    .mint(&ctx.accounts.legacy_project_mint.to_account_info())
    .mint_authority(&ctx.accounts.legacy_project.to_account_info())
    .payer(&ctx.accounts.authority)
    .update_authority(&ctx.accounts.legacy_project.to_account_info(), true)
    .system_program(&ctx.accounts.system_program)
    .data(data)
    .is_mutable(true)
    .invoke_signed(&[&signer_seeds[..]])?;

  CreateMasterEditionV3CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .metadata(&ctx.accounts.legacy_project_metadata.to_account_info())
    .edition(&ctx.accounts.legacy_project_master_edition.to_account_info())
    .mint(&ctx.accounts.legacy_project_mint.to_account_info())
    .mint_authority(&ctx.accounts.legacy_project.to_account_info())
    .payer(&ctx.accounts.authority)
    .update_authority(&ctx.accounts.legacy_project.to_account_info())
    .system_program(&ctx.accounts.system_program)
    .token_program(&ctx.accounts.token_program)
    .max_supply(0)
    .invoke_signed(&[&signer_seeds[..]])?;

  Ok(())
}
