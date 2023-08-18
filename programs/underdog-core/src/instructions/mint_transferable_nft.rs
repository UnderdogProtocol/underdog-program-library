use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};
use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;

use mpl_token_metadata::state::{Collection, DataV2};
use shared_utils::{
  create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
  CreateMetadataAccountsV3,
};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct MintTransferableNftArgs {
  pub super_admin_address: Pubkey,
  pub member_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub nft_id_str: String,
  pub project_mint_bump: u8,
  pub name: String,
  pub symbol: String,
  pub uri: String,
}

#[derive(Accounts)]
#[instruction(args: MintTransferableNftArgs)]
pub struct MintTransferableNft<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = org_control_account.org_control == authority.key(),
    seeds = [ORG_CONTROL_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump=org_control_account.bump
  )]
  pub org_control_account: Box<Account<'info, OrgControlAccount>>,

  #[account(
    seeds = [ORG_PREFIX.as_ref(),args.super_admin_address.as_ref(),args.org_id.as_ref()],
    bump=org_account.bump
  )]
  pub org_account: Box<Account<'info, OrgAccount>>,

  #[account(
    constraint = member_account.active == true,
    seeds = [ORG_MEMBER_PREFIX.as_ref(),org_account.key().as_ref(),args.super_admin_address.as_ref()],
    bump=member_account.bump
  )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

  #[account(
    seeds = [TRANSFERABLE_PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=transferable_project.bump
  )]
  pub transferable_project: Box<Account<'info, LegacyProject>>,

  /// CHECK: Handled by cpi
  #[account(
    seeds = [TRANSFERABLE_PROJECT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=args.project_mint_bump,
)]
  pub transferable_project_mint: UncheckedAccount<'info>,

  /// CHECK: Handled by cpi
  #[account(
    mut,
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), transferable_project_mint.key().as_ref()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub transferable_project_metadata: UncheckedAccount<'info>,

  /// CHECK: Handled By cpi account
  #[account(
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), transferable_project_mint.key().as_ref(), "edition".as_bytes()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub transferable_project_master_edition: UncheckedAccount<'info>,

  #[account(
    init,
    payer = authority,
    seeds = [TRANSFERABLE_NFT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump,
    mint::decimals = 0,
    mint::authority = transferable_project,
    mint::freeze_authority = transferable_project
)]
  pub transferable_nft_mint: Box<Account<'info, Mint>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub transferable_nft_metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub transferable_nft_master_edition: UncheckedAccount<'info>,

  /// CHECK: needed for token account init
  pub receiver: UncheckedAccount<'info>,

  #[account(init, payer = authority, associated_token::mint = transferable_nft_mint, associated_token::authority = receiver)]
  pub receiver_token_account: Box<Account<'info, TokenAccount>>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintTransferableNft<'info> {
  fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_accounts = MintTo {
      mint: self.transferable_nft_mint.to_account_info(),
      to: self.receiver_token_account.to_account_info(),
      authority: self.transferable_project.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }

  fn create_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
    let cpi_accounts = CreateMetadataAccountsV3 {
      metadata: self.transferable_nft_metadata.to_account_info(),
      mint: self.transferable_nft_mint.to_account_info(),
      mint_authority: self.transferable_project.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.transferable_project.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn create_master_edition_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
    let cpi_accounts = CreateMasterEditionV3 {
      metadata: self.transferable_nft_metadata.to_account_info(),
      edition: self.transferable_nft_master_edition.to_account_info(),
      mint: self.transferable_nft_mint.to_account_info(),
      mint_authority: self.transferable_project.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.transferable_project.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
      token_program: self.token_program.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(ctx: Context<MintTransferableNft>, args: MintTransferableNftArgs) -> Result<()> {
  let project_signer_seeds = [
    TRANSFERABLE_PROJECT_PREFIX.as_ref(),
    ctx.accounts.transferable_project.org_address.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.transferable_project.bump],
  ];

  token::mint_to(
    ctx
      .accounts
      .mint_to_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
    1,
  )?;

  let data = DataV2 {
    name: args.name,
    symbol: args.symbol,
    uri: args.uri,
    seller_fee_basis_points: 0,
    creators: None,
    collection: Some(Collection {
      verified: false,
      key: ctx.accounts.transferable_project_mint.key(),
    }),
    uses: None,
  };

  create_metadata_accounts_v3(
    ctx
      .accounts
      .create_metadata_accounts_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
    data,
    true,
    true,
    None,
  )?;

  create_master_edition_v3(
    ctx
      .accounts
      .create_master_edition_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
    Some(0),
  )?;

  Ok(())
}
