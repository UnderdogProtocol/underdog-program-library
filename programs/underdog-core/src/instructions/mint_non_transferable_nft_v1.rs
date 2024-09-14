use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::mpl_token_metadata::instructions::{
  FreezeDelegatedAccountCpiBuilder, SignMetadataCpiBuilder, VerifyCollectionCpiBuilder,
};
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{self, Approve, Mint, MintTo, Token, TokenAccount};
use mpl_token_metadata::instructions::{
  CreateMasterEditionV3CpiBuilder, CreateMetadataAccountV3CpiBuilder,
};
use mpl_token_metadata::types::{Collection, Creator, DataV2};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct MintNonTransferableNftV1Args {
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
#[instruction(args: MintNonTransferableNftV1Args)]
pub struct MintNonTransferableNftV1<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(mut)]
  pub claimer: Signer<'info>,

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
    seeds = [NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=non_transferable_project.bump
  )]
  pub non_transferable_project: Box<Account<'info, ProjAccount>>,

  #[account(
    mut,
    seeds = [NON_TRANSFERABLE_PROJECT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=args.project_mint_bump,
  )]
  pub non_transferable_project_mint: Box<Account<'info, Mint>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_project_metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_project_master_edition: UncheckedAccount<'info>,

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

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_master_edition: UncheckedAccount<'info>,

  #[account(
    init,
    payer=authority,
    associated_token::mint = non_transferable_nft_mint,
    associated_token::authority = claimer
  )]
  pub claimer_token_account: Box<Account<'info, TokenAccount>>,

  pub token_metadata_program: Program<'info, Metadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> MintNonTransferableNftV1<'info> {
  fn mint_to_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_accounts = MintTo {
      mint: self.non_transferable_nft_mint.to_account_info(),
      to: self.claimer_token_account.to_account_info(),
      authority: self.non_transferable_project.to_account_info(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }

  fn approve_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Approve<'info>> {
    let cpi_accounts = Approve {
      to: self.claimer_token_account.to_account_info().clone(),
      delegate: self.non_transferable_project.to_account_info().clone(),
      authority: self.claimer.to_account_info().clone(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<MintNonTransferableNftV1>,
  args: MintNonTransferableNftV1Args,
) -> Result<()> {
  let org_account = ctx.accounts.org_account.key();

  let project_signer_seeds = &[&[
    NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),
    org_account.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.non_transferable_project.bump],
  ]];

  let org_signer_seeds = &[&[
    ORG_PREFIX.as_ref(),
    args.super_admin_address.as_ref(),
    args.org_id.as_ref(),
    &[ctx.accounts.org_account.bump],
  ]];

  token::mint_to(
    ctx
      .accounts
      .mint_to_ctx()
      .with_signer(&[project_signer_seeds[0]]),
    1,
  )?;

  let creators = vec![
    Creator {
      address: ctx
        .accounts
        .non_transferable_project
        .to_account_info()
        .key(),
      verified: true,
      share: 0,
    },
    Creator {
      address: ctx.accounts.org_account.key(),
      verified: false,
      share: 0,
    },
    Creator {
      address: args.super_admin_address,
      verified: false,
      share: 100,
    },
  ];

  let data = DataV2 {
    name: args.name,
    symbol: args.symbol,
    uri: args.uri,
    seller_fee_basis_points: 0,
    creators: Some(creators),
    collection: Some(Collection {
      verified: false,
      key: ctx.accounts.non_transferable_project_mint.key(),
    }),
    uses: None,
  };

  CreateMetadataAccountV3CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .metadata(&ctx.accounts.non_transferable_nft_metadata)
    .mint(&ctx.accounts.non_transferable_nft_mint.to_account_info())
    .mint_authority(&ctx.accounts.non_transferable_project.to_account_info())
    .payer(&ctx.accounts.authority)
    .update_authority(
      &ctx.accounts.non_transferable_project.to_account_info(),
      true,
    )
    .system_program(&ctx.accounts.system_program)
    .data(data)
    .is_mutable(true)
    .invoke_signed(&[project_signer_seeds[0]])?;

  CreateMasterEditionV3CpiBuilder::new(&ctx.accounts.token_metadata_program)
    .metadata(&ctx.accounts.non_transferable_nft_metadata)
    .edition(&ctx.accounts.non_transferable_nft_master_edition)
    .mint(&ctx.accounts.non_transferable_nft_mint.to_account_info())
    .mint_authority(&ctx.accounts.non_transferable_project.to_account_info())
    .payer(&ctx.accounts.authority)
    .update_authority(&ctx.accounts.non_transferable_project.to_account_info())
    .token_program(&ctx.accounts.token_program)
    .system_program(&ctx.accounts.system_program)
    .max_supply(0)
    .invoke_signed(&[project_signer_seeds[0]])?;

  VerifyCollectionCpiBuilder::new(&ctx.accounts.token_metadata_program)
    .payer(&ctx.accounts.authority)
    .metadata(&ctx.accounts.non_transferable_nft_metadata)
    .collection_authority(&ctx.accounts.non_transferable_project.to_account_info())
    .collection_mint(&ctx.accounts.non_transferable_project_mint.to_account_info())
    .collection(
      &ctx
        .accounts
        .non_transferable_project_metadata
        .to_account_info(),
    )
    .collection_master_edition_account(&ctx.accounts.non_transferable_project_master_edition)
    .invoke_signed(&[project_signer_seeds[0]])?;

  SignMetadataCpiBuilder::new(&ctx.accounts.token_metadata_program)
    .creator(&ctx.accounts.org_account.to_account_info())
    .metadata(&ctx.accounts.non_transferable_nft_metadata)
    .invoke_signed(&[org_signer_seeds[0]])?;

  anchor_spl::token::approve(
    ctx
      .accounts
      .approve_ctx()
      .with_signer(&[project_signer_seeds[0]]),
    1,
  )?;

  FreezeDelegatedAccountCpiBuilder::new(&ctx.accounts.token_metadata_program)
    .delegate(&ctx.accounts.non_transferable_project.to_account_info())
    .token_account(&ctx.accounts.claimer_token_account.to_account_info())
    .edition(&ctx.accounts.non_transferable_nft_master_edition)
    .mint(&ctx.accounts.non_transferable_nft_mint.to_account_info())
    .token_program(&ctx.accounts.token_program)
    .invoke_signed(&[project_signer_seeds[0]])?;

  Ok(())
}
