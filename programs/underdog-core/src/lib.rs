use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod token_metadata;

use instructions::*;

declare_id!("updg8JyjrmFE2h3d71p71zRXDR8q4C6Up8dDoeq3LTM");

#[program]
pub mod underdog_core {
  use super::*;

  pub fn initialize_owner(ctx: Context<InitialOwnerContext>) -> Result<()> {
    initialize_owner::handler(ctx)
  }

  pub fn update_owner(ctx: Context<UpdateOwnerContext>, _new_owner: Pubkey) -> Result<()> {
    update_owner::handler(ctx, _new_owner)
  }

  pub fn initialize_org_v1(
    ctx: Context<InitializeOrgV1Context>,
    args: InitializeOrgV1Args,
  ) -> Result<()> {
    initialize_org_v1::handler(ctx, args)
  }

  pub fn initialize_tree(ctx: Context<InitializeTree>, args: InitializeTreeArgs) -> Result<()> {
    initialize_tree::handler(ctx, args)
  }

  pub fn initialize_project_v1(
    ctx: Context<InitializeProjectV1>,
    args: InitializeProjectV1Args,
  ) -> Result<()> {
    initialize_project_v1::handler(ctx, args)
  }

  pub fn update_project_v2(ctx: Context<UpdateProjectV2>, args: UpdateProjectV2Args) -> Result<()> {
    update_project_v2::handler(ctx, args)
  }

  pub fn mint_nft_v4(ctx: Context<MintNftV4>, args: MintNftV4Args) -> Result<()> {
    mint_nft_v4::handler(ctx, args)
  }

  pub fn mint_sft_v4(ctx: Context<MintSftV4>, args: MintSftV4Args) -> Result<()> {
    mint_sft_v4::handler(ctx, args)
  }

  pub fn transfer_asset_v2<'info>(
    ctx: Context<'_, '_, '_, 'info, TransferAssetV2<'info>>,
    args: TransferAssetV2Args,
  ) -> Result<()> {
    transfer_asset_v2::handler(ctx, args)
  }

  pub fn burn_asset_v1<'info>(
    ctx: Context<'_, '_, '_, 'info, BurnAssetV1<'info>>,
    args: BurnAssetV1Args,
  ) -> Result<()> {
    burn_asset_v1::handler(ctx, args)
  }

  pub fn initialize_legacy_project_v1(
    ctx: Context<InitializeLegacyProjectV1>,
    args: InitializeLegacyProjectV1Args,
  ) -> Result<()> {
    initialize_legacy_project_v1::handler(ctx, args)
  }

  pub fn mint_transferable_nft_v1(
    ctx: Context<MintTransferableNftV1>,
    args: MintTransferableNftV1Args,
  ) -> Result<()> {
    mint_transferable_nft_v1::handler(ctx, args)
  }

  pub fn verify_legacy_nft_collection_v1(
    ctx: Context<VerifyLegacyNftCollectionV1>,
    args: VerifyLegacyNftCollectionV1Args,
  ) -> Result<()> {
    verify_legacy_nft_collection_v1::handler(ctx, args)
  }

  pub fn mint_non_transferable_nft_v1(
    ctx: Context<MintNonTransferableNftV1>,
    args: MintNonTransferableNftV1Args,
  ) -> Result<()> {
    mint_non_transferable_nft_v1::handler(ctx, args)
  }

  pub fn claim_non_transferable_nft(
    ctx: Context<ClaimNonTransferableNft>,
    args: ClaimNonTransferableNftArgs,
  ) -> Result<()> {
    claim_non_transferable_nft::handler(ctx, args)
  }

  pub fn claim_non_transferable_nft_v1(
    ctx: Context<ClaimNonTransferableNftV1>,
    args: ClaimNonTransferableNftV1Args,
  ) -> Result<()> {
    claim_non_transferable_nft_v1::handler(ctx, args)
  }

  pub fn revoke_non_transferable_nft_v1(
    ctx: Context<RevokeNonTransferableNftV1>,
    args: RevokeNonTransferableNftV1Args,
  ) -> Result<()> {
    revoke_non_transferable_nft_v1::handler(ctx, args)
  }

  pub fn burn_non_transferable_nft_v1(
    ctx: Context<BurnNonTransferableNftV1>,
    args: BurnNonTransferableNftV1Args,
  ) -> Result<()> {
    burn_non_transferable_nft_v1::handler(ctx, args)
  }

  pub fn withdraw_project_royalties_v0(
    ctx: Context<WithdrawProjectRoyaltiesV0>,
    args: WithdrawProjectRoyaltiesV0Args,
  ) -> Result<()> {
    withdraw_project_royalties_v0::handler(ctx, args)
  }
}
