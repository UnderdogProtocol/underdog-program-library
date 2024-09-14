use anchor_lang::prelude::*;

use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::mpl_token_metadata::instructions::BurnNftCpiBuilder;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct BurnNonTransferableNftV1Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub nft_id_str: String,
  pub nft_mint_bump: u8,
}

#[derive(Accounts)]
#[instruction(args: BurnNonTransferableNftV1Args)]
pub struct BurnNonTransferableNftV1<'info> {
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
    seeds = [NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref()],
    bump=non_transferable_project.bump
  )]
  pub non_transferable_project: Box<Account<'info, ProjAccount>>,

  /// CHECK: Used in CPI So no Harm
  #[account()]
  pub non_transferable_project_mint: UncheckedAccount<'info>,

  /// CHECK: Used in CPI So no Harm
  #[account(
    mut,
    seeds = ["metadata".as_bytes(), token_metadata_program.key().as_ref(), non_transferable_project_mint.key().as_ref()],
    seeds::program = token_metadata_program.key(),
    bump,
  )]
  pub non_transferable_project_metadata: AccountInfo<'info>,

  #[account(
    mut,
    seeds = [NON_TRANSFERABLE_NFT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump=args.nft_mint_bump,
)]
  pub non_transferable_nft_mint: Box<Account<'info, Mint>>,

  #[account(mut)]
  pub non_transferable_nft_token_account: Box<Account<'info, TokenAccount>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_metadata: UncheckedAccount<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_master_edition: UncheckedAccount<'info>,

  pub token_metadata_program: Program<'info, Metadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
  ctx: Context<BurnNonTransferableNftV1>,
  args: BurnNonTransferableNftV1Args,
) -> Result<()> {
  let project_signer_seeds = [
    NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),
    ctx.accounts.non_transferable_project.org.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.non_transferable_project.bump],
  ];

  BurnNftCpiBuilder::new(&ctx.accounts.token_metadata_program)
    .owner(&ctx.accounts.non_transferable_project.to_account_info())
    .mint(&ctx.accounts.non_transferable_nft_mint.to_account_info())
    .metadata(&ctx.accounts.non_transferable_nft_metadata.to_account_info())
    .master_edition_account(
      &ctx
        .accounts
        .non_transferable_nft_master_edition
        .to_account_info(),
    )
    .token_account(
      &ctx
        .accounts
        .non_transferable_nft_token_account
        .to_account_info(),
    )
    .collection_metadata(Some(
      &ctx
        .accounts
        .non_transferable_project_metadata
        .to_account_info(),
    ))
    .spl_token_program(&ctx.accounts.token_program)
    .invoke_signed(&[&project_signer_seeds[..]])?;

  Ok(())
}
