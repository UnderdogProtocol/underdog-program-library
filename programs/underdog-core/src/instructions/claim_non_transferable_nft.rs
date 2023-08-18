use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Approve, Mint, Token, TokenAccount, Transfer};
use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;
use shared_utils::{freeze_delegated_account, FreezeDelegatedAccount};

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct ClaimNonTransferableNftArgs {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub nft_id_str: String,
  pub nft_mint_bump: u8,
  pub nft_escrow_bump: u8,
}

#[derive(Accounts)]
#[instruction(args: ClaimNonTransferableNftArgs)]
pub struct ClaimNonTransferableNft<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(mut)]
  pub claimer: Signer<'info>,

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
    seeds = [NON_TRANSFERABLE_NFT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump=args.nft_mint_bump,
  )]
  pub non_transferable_nft_mint: Box<Account<'info, Mint>>,

  #[account(
    mut,
    seeds = [NON_TRANSFERABLE_NFT_ESCROW.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump=args.nft_escrow_bump,
  )]
  pub non_transferable_nft_escrow: Box<Account<'info, TokenAccount>>,

  #[account(
    mut,
    constraint = non_transferable_nft_claim.claimer == claimer.key(),
    seeds = [NON_TRANSFERABLE_NFT_CLAIM.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump = non_transferable_nft_claim.bump
  )]
  pub non_transferable_nft_claim: Box<Account<'info, ClaimAccount>>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub non_transferable_nft_metadata: AccountInfo<'info>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub non_transferable_nft_master_edition: AccountInfo<'info>,

  #[account(init_if_needed, payer=authority, associated_token::mint = non_transferable_nft_mint, associated_token::authority = claimer)]
  pub claimer_token_account: Box<Account<'info, TokenAccount>>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> ClaimNonTransferableNft<'info> {
  fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
    let cpi_accounts = Transfer {
      from: self.non_transferable_nft_escrow.to_account_info().clone(),
      to: self.claimer_token_account.to_account_info().clone(),
      authority: self.non_transferable_project.to_account_info().clone(),
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

  fn freeze_delegated_account_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, FreezeDelegatedAccount<'info>> {
    let cpi_accounts = FreezeDelegatedAccount {
      metadata: self.non_transferable_nft_metadata.to_account_info().clone(),
      delegate: self.non_transferable_project.to_account_info().clone(),
      token_account: self.claimer_token_account.to_account_info().clone(),
      edition: self
        .non_transferable_nft_master_edition
        .to_account_info()
        .clone(),
      mint: self.non_transferable_nft_mint.to_account_info().clone(),
      token_program: self.token_program.to_account_info().clone(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<ClaimNonTransferableNft>,
  args: ClaimNonTransferableNftArgs,
) -> Result<()> {
  let project_signer_seeds = [
    NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),
    ctx.accounts.non_transferable_project.org_address.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.non_transferable_project.bump],
  ];

  anchor_spl::token::transfer(
    ctx
      .accounts
      .transfer_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
    1,
  )?;
  anchor_spl::token::approve(
    ctx
      .accounts
      .approve_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
    1,
  )?;

  freeze_delegated_account(
    ctx
      .accounts
      .freeze_delegated_account_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
  )?;

  Ok(())
}