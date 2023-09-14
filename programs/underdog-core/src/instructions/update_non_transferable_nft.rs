use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use mpl_bubblegum::state::metaplex_anchor::MplTokenMetadata;
use mpl_token_metadata::state::{Collection, Creator, DataV2};
use shared_utils::{
  sign_metadata, update_metadata_accounts_v2, SignMetadata, UpdateMetadataAccountsV2,
};

use crate::{state::*, token_metadata::Metadata};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct UpdateNonTransferableNftArgs {
  pub super_admin_address: Pubkey,
  pub org_id: String,
  pub project_id_str: String,
  pub nft_id_str: String,
  pub project_mint_bump: u8,
  pub nft_mint_bump: u8,
  pub name: String,
  pub symbol: String,
}

#[derive(Accounts)]
#[instruction(args: UpdateNonTransferableNftArgs)]
pub struct UpdateNonTransferableNft<'info> {
  #[account()]
  pub authority: Signer<'info>,

  #[account(
    mut,
    constraint = owner_account.owner == authority.key(),
    seeds = [b"ownership".as_ref()],
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

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub non_transferable_project_metadata: AccountInfo<'info>,

  /// CHECK: Used in CPI So no Harm
  #[account(mut)]
  pub non_transferable_project_master_edition: AccountInfo<'info>,

  #[account(
    seeds = [NON_TRANSFERABLE_NFT_MINT_PREFIX.as_ref(),org_account.key().as_ref(),args.project_id_str.as_ref(),args.nft_id_str.as_ref()],
    bump = args.nft_mint_bump,
  )]
  pub non_transferable_nft_mint: Box<Account<'info, Mint>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_metadata: Box<Account<'info, Metadata>>,

  /// CHECK: Used in CPI
  #[account(mut)]
  pub non_transferable_nft_master_edition: UncheckedAccount<'info>,

  pub token_metadata_program: Program<'info, MplTokenMetadata>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

impl<'info> UpdateNonTransferableNft<'info> {
  fn update_metadata_accounts_ctx(
    &self,
  ) -> CpiContext<'_, '_, '_, 'info, UpdateMetadataAccountsV2<'info>> {
    let cpi_accounts = UpdateMetadataAccountsV2 {
      metadata: self.non_transferable_nft_metadata.to_account_info(),
      update_authority: self.non_transferable_project.to_account_info(),
    };
    CpiContext::new(self.token_metadata_program.to_account_info(), cpi_accounts)
  }

  fn sign_metadata_ctx(
    &self,
    creator: AccountInfo<'info>,
  ) -> CpiContext<'_, '_, '_, 'info, SignMetadata<'info>> {
    let cpi_accounts = SignMetadata {
      metadata: self.non_transferable_nft_metadata.to_account_info().clone(),
      creator,
    };
    CpiContext::new(
      self.token_metadata_program.to_account_info().clone(),
      cpi_accounts,
    )
  }
}

pub fn handler(
  ctx: Context<UpdateNonTransferableNft>,
  args: UpdateNonTransferableNftArgs,
) -> Result<()> {
  let project_id = args.project_id_str;
  let project_seeds: &[&[&[u8]]] = &[&[
    NON_TRANSFERABLE_PROJECT_PREFIX.as_ref(),
    ctx.accounts.non_transferable_project.org.as_ref(),
    project_id.as_ref(),
    &[ctx.accounts.non_transferable_project.bump],
  ]];

  let org_signer_seeds = &[&[
    ORG_PREFIX.as_ref(),
    args.super_admin_address.as_ref(),
    args.org_id.as_ref(),
    &[ctx.accounts.org_account.bump],
  ]];

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
      address: ctx.accounts.org_account.to_account_info().key(),
      verified: false,
      share: 0,
    },
    Creator {
      address: args.super_admin_address,
      verified: false,
      share: 100,
    },
  ];

  update_metadata_accounts_v2(
    ctx
      .accounts
      .update_metadata_accounts_ctx()
      .with_signer(&[project_seeds[0]]),
    Some(ctx.accounts.non_transferable_project.key()),
    Some(DataV2 {
      name: args.name,
      symbol: args.symbol,
      uri: ctx.accounts.non_transferable_nft_metadata.data.uri.clone(),
      seller_fee_basis_points: 0,
      collection: Some(Collection {
        verified: true,
        key: ctx.accounts.non_transferable_project_mint.key(),
      }),
      creators: Some(creators),
      uses: None,
    }),
    Some(true),
    Some(true),
  )?;

  sign_metadata(
    ctx
      .accounts
      .sign_metadata_ctx(ctx.accounts.org_account.to_account_info().clone())
      .with_signer(&[org_signer_seeds[0]]),
  )?;

  Ok(())
}
