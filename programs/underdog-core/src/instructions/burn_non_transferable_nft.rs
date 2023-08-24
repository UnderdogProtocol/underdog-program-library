use anchor_lang::prelude::*;

use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;
use shared_utils::{burn_nft, BurnNft};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct BurnNonTransferableNftArgs {
  pub super_admin_address: Pubkey,
  pub member_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub nft_id_str: String,
  pub nft_mint_bump: u8,
  pub nft_escrow_bump: u8,
}

#[derive(Accounts)]
#[instruction(args: BurnNonTransferableNftArgs)]
pub struct BurnNonTransferableNft<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
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
    constraint = member_account.active == true,
    seeds = [ORG_MEMBER_PREFIX.as_ref(),org_account.key().as_ref(),args.member_address.as_ref()],
    bump=member_account.bump
  )]
  pub member_account: Box<Account<'info, OrgMemberAccount>>,

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

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_metadata: AccountInfo<'info>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_master_edition: AccountInfo<'info>,

  #[account(
    mut,
    seeds = [NON_TRANSFERABLE_NFT_ESCROW.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump=args.nft_escrow_bump,
  )]
  pub non_transferable_nft_escrow: Box<Account<'info, TokenAccount>>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> BurnNonTransferableNft<'info> {
  fn burn_nft_ctx(&self) -> CpiContext<'_, '_, '_, 'info, BurnNft<'info>> {
    let cpi_accounts = BurnNft {
      metadata: self.non_transferable_nft_metadata.to_account_info(),
      edition: self.non_transferable_nft_master_edition.to_account_info(),
      mint: self.non_transferable_nft_mint.to_account_info(),
      owner: self.non_transferable_project.to_account_info(),
      token: self.non_transferable_nft_escrow.to_account_info(),
      spl_token: self.token_program.to_account_info().clone(),
      collection_metadata: self.non_transferable_project_metadata.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<BurnNonTransferableNft>,
  args: BurnNonTransferableNftArgs,
) -> Result<()> {
  let project_signer_seeds = [
    NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),
    ctx.accounts.non_transferable_project.org.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.non_transferable_project.bump],
  ];

  burn_nft(
    ctx
      .accounts
      .burn_nft_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
  )?;

  Ok(())
}
