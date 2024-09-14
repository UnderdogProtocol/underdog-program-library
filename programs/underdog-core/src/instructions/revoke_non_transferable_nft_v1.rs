use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent::Rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::Metadata;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use mpl_token_metadata::instructions::ThawDelegatedAccountCpiBuilder;

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct RevokeNonTransferableNftV1Args {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub nft_id_str: String,
  pub nft_mint_bump: u8,
}

#[derive(Accounts)]
#[instruction(args: RevokeNonTransferableNftV1Args)]
pub struct RevokeNonTransferableNftV1<'info> {
  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    constraint = owner_account.owner == authority.key(),
    seeds = [OWNER_PREFIX.as_ref()],
    bump=owner_account.bump
  )]
  pub owner_account: Box<Account<'info, InitialOwner>>,

  /// CHECK: Need for token account
  #[account()]
  pub claimer: UncheckedAccount<'info>,

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
    init,
    payer = authority,
    associated_token::mint = non_transferable_nft_mint,
    associated_token::authority = non_transferable_project
  )]
  pub non_transferable_nft_token_account: Box<Account<'info, TokenAccount>>,

  #[account(mut)]
  pub claimer_token_account: Box<Account<'info, TokenAccount>>,

  pub token_metadata_program: Program<'info, Metadata>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> RevokeNonTransferableNftV1<'info> {
  fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
    let cpi_accounts = Transfer {
      from: self.claimer_token_account.to_account_info().clone(),
      to: self
        .non_transferable_nft_token_account
        .to_account_info()
        .clone(),
      authority: self.non_transferable_project.to_account_info().clone(),
    };
    CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
  }
}

pub fn handler(
  ctx: Context<RevokeNonTransferableNftV1>,
  args: RevokeNonTransferableNftV1Args,
) -> Result<()> {
  let project_signer_seeds = [
    NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),
    ctx.accounts.non_transferable_project.org.as_ref(),
    args.project_id_str.as_ref(),
    &[ctx.accounts.non_transferable_project.bump],
  ];

  ThawDelegatedAccountCpiBuilder::new(&ctx.accounts.token_metadata_program)
    .mint(&ctx.accounts.non_transferable_nft_mint.to_account_info())
    .delegate(&ctx.accounts.non_transferable_project.to_account_info())
    .token_account(&ctx.accounts.claimer_token_account.to_account_info())
    .edition(&ctx.accounts.non_transferable_nft_master_edition)
    .token_program(&ctx.accounts.token_program)
    .invoke_signed(&[&project_signer_seeds[..]])?;

  anchor_spl::token::transfer(
    ctx
      .accounts
      .transfer_ctx()
      .with_signer(&[&project_signer_seeds[..]]),
    1,
  )?;

  Ok(())
}
