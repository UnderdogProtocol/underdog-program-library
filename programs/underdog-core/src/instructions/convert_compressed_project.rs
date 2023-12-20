use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::token::{
  close_account, transfer, CloseAccount, Mint, Token, TokenAccount, Transfer,
};
use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;
use mpl_token_metadata::state::DataV2;
use shared_utils::{update_metadata_accounts_v2, UpdateMetadataAccountsV2};

use crate::{state::*, token_metadata::UpdateMetadataArgs};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ConvertCompressedProjectArgs {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub project_id: u64,
  pub metadata: UpdateMetadataArgs,
}

#[derive(Accounts)]
#[instruction(args: ConvertCompressedProjectArgs)]
pub struct ConvertCompressedProject<'info> {
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
    mut,
    seeds = [COMPRESSED_PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump = compressed_project.bump,
    close = authority,
  )]
  pub compressed_project: Box<Account<'info, CompressedProject>>,

  #[account(
    init,
    payer = authority,
    space = PROJECT_SIZE,
    seeds = [PROJECT_PREFIX.as_ref(), org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
    bump
  )]
  pub project_account: Box<Account<'info, Project>>,

  #[account(
    seeds = [COMPRESSED_PROJECT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump,
  )]
  pub compressed_project_mint: Box<Account<'info, Mint>>,

  #[account(
    init,
    payer = authority,
    seeds = [PROJECT_VAULT_PREFIX.as_ref(),org_account.key().as_ref(), args.project_id.to_le_bytes().as_ref()],
    bump,
    token::mint = compressed_project_mint,
    token::authority = project_account,
  )]
  pub project_vault: Box<Account<'info, TokenAccount>>,

  #[account(
    mut,
    seeds = [COMPRESSED_PROJECT_VAULT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump,
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

impl<'info> ConvertCompressedProject<'info> {
  fn update_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, UpdateMetadataAccountsV2<'info>> {
    let cpi_accounts = UpdateMetadataAccountsV2 {
      metadata: self.compressed_project_metadata.to_account_info(),
      update_authority: self.compressed_project.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
    let cpi_accounts = Transfer {
      from: self.compressed_project_vault.to_account_info(),
      to: self.project_vault.to_account_info(),
      authority: self.compressed_project.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }

  fn close_account_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
    let cpi_accounts = CloseAccount {
      account: self.compressed_project_vault.to_account_info(),
      destination: self.authority.to_account_info(),
      authority: self.compressed_project.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<ConvertCompressedProject>,
  args: ConvertCompressedProjectArgs,
) -> Result<()> {
  let bump = ctx.accounts.compressed_project.bump;
  let signer_seeds = [
    COMPRESSED_PROJECT_PREFIX.as_ref(),
    ctx.accounts.compressed_project.org_address.as_ref(),
    args.project_id_str.as_ref(),
    &[bump],
  ];

  let org_account = &ctx.accounts.org_account;

  ctx.accounts.project_account.super_admin_address = args.super_admin_address;
  ctx.accounts.project_account.org_address = org_account.key();
  ctx.accounts.project_account.project_id = args.project_id;
  ctx.accounts.project_account.bump = *ctx.bumps.get("project_account").unwrap();

  transfer(
    ctx
      .accounts
      .transfer_ctx()
      .with_signer(&[&signer_seeds[..]]),
    1,
  )?;

  update_metadata_accounts_v2(
    ctx
      .accounts
      .update_metadata_accounts_ctx()
      .with_signer(&[&signer_seeds[..]]),
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

  close_account(
    ctx
      .accounts
      .close_account_ctx()
      .with_signer(&[&signer_seeds[..]]),
  )?;

  Ok(())
}
