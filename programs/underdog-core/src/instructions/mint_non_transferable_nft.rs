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
pub struct MintNonTransferableNftArgs {
  pub super_admin_address: Pubkey,
  pub claimer_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub nft_id_str: String,
  pub project_mint_bump: u8,
  pub name: String,
  pub symbol: String,
  pub uri: String,
}

#[derive(Accounts)]
#[instruction(args: MintNonTransferableNftArgs)]
pub struct MintNonTransferableNft<'info> {
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
    mut,
    seeds = [NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=non_transferable_project.bump
  )]
  pub non_transferable_project: Box<Account<'info, LegacyProject>>,

  #[account(
    mut,
    seeds = [NON_TRANSFERABLE_PROJECT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=args.project_mint_bump,
  )]
  pub non_transferable_project_mint: Box<Account<'info, Mint>>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub non_transferable_project_metadata: AccountInfo<'info>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub non_transferable_project_master_edition: AccountInfo<'info>,

  #[account(
    init,
    payer = authority,
    seeds = [NON_TRANSFERABLE_NFT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump,
    mint::decimals = 0,
    mint::authority = non_transferable_project,
    mint::freeze_authority = non_transferable_project
  )]
  pub non_transferable_nft_mint: Box<Account<'info, Mint>>,

  #[account(
    init,
    payer = authority,
    seeds = [NON_TRANSFERABLE_NFT_ESCROW.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump,
    token::mint = non_transferable_nft_mint,
    token::authority = non_transferable_project,
  )]
  pub non_transferable_nft_escrow: Box<Account<'info, TokenAccount>>,

  #[account(
    init,
    payer = authority,
    space = 8 + 32 + 1,
    seeds = [NON_TRANSFERABLE_NFT_CLAIM.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump
  )]
  pub non_transferable_nft_claim: Box<Account<'info, ClaimAccount>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_master_edition: UncheckedAccount<'info>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintNonTransferableNft<'info> {
  fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_accounts = MintTo {
      mint: self.non_transferable_nft_mint.to_account_info(),
      to: self.non_transferable_nft_escrow.to_account_info(),
      authority: self.non_transferable_project.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }

  fn create_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMetadataAccountsV3<'info>> {
    let cpi_accounts = CreateMetadataAccountsV3 {
      metadata: self.non_transferable_nft_metadata.to_account_info(),
      mint: self.non_transferable_nft_mint.to_account_info(),
      mint_authority: self.non_transferable_project.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.non_transferable_project.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn create_master_edition_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, CreateMasterEditionV3<'info>> {
    let cpi_accounts = CreateMasterEditionV3 {
      metadata: self.non_transferable_nft_metadata.to_account_info(),
      edition: self.non_transferable_nft_master_edition.to_account_info(),
      mint: self.non_transferable_nft_mint.to_account_info(),
      mint_authority: self.non_transferable_project.to_account_info(),
      payer: self.authority.to_account_info(),
      update_authority: self.non_transferable_project.to_account_info(),
      system_program: self.system_program.to_account_info(),
      rent: self.rent.to_account_info(),
      token_program: self.token_program.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<MintNonTransferableNft>,
  args: MintNonTransferableNftArgs,
) -> Result<()> {
  let project_signer_seeds = [
    NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),
    ctx.accounts.non_transferable_project.org_address.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.non_transferable_project.bump],
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
      key: ctx.accounts.non_transferable_project_mint.key(),
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

  let non_transferable_nft_claim = &mut ctx.accounts.non_transferable_nft_claim;

  non_transferable_nft_claim.claimer = args.claimer_address;
  non_transferable_nft_claim.bump = *ctx.bumps.get("non_transferable_nft_claim").unwrap();

  Ok(())
}
