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

  pub fn initialize_org(ctx: Context<InitializeOrgContext>, args: InitializeOrgArgs) -> Result<()> {
    initialize_org::handler(ctx, args)
  }

  pub fn initialize_org_v1(
    ctx: Context<InitializeOrgV1Context>,
    args: InitializeOrgV1Args,
  ) -> Result<()> {
    initialize_org_v1::handler(ctx, args)
  }

  pub fn add_org_member(ctx: Context<AddOrgMemberContext>, args: AddOrgMemberArgs) -> Result<()> {
    add_org_member::handler(ctx, args)
  }

  pub fn update_org_member(
    ctx: Context<UpdateOrgMemberContext>,
    args: UpdateOrgMemberArgs,
  ) -> Result<()> {
    update_org_member::handler(ctx, args)
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

  pub fn update_project_v1(ctx: Context<UpdateProjectV1>, args: UpdateProjectV1Args) -> Result<()> {
    update_project_v1::handler(ctx, args)
  }

  pub fn mint_nft_v2(ctx: Context<MintNftV2>, args: MintNftV2Args) -> Result<()> {
    mint_nft_v2::handler(ctx, args)
  }

  pub fn mint_nft_v3(ctx: Context<MintNftV3>, args: MintNftV3Args) -> Result<()> {
    mint_nft_v3::handler(ctx, args)
  }

  pub fn mint_sft_v3(ctx: Context<MintSftV3>, args: MintSftV3Args) -> Result<()> {
    mint_sft_v3::handler(ctx, args)
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

  pub fn initialize_compressed_project_v1(
    ctx: Context<InitializeCompressedProjectV1>,
    args: InitializeCompressedProjectV1Args,
  ) -> Result<()> {
    initialize_compressed_project_v1::handler(ctx, args)
  }

  pub fn mint_compressed_nft(
    ctx: Context<MintCompressedNft>,
    args: MintCompressedNftArgs,
  ) -> Result<()> {
    mint_compressed_nft::handler(ctx, args)
  }

  pub fn mint_compressed_nft_v1(
    ctx: Context<MintCompressedNftV1>,
    args: MintCompressedNftV1Args,
  ) -> Result<()> {
    mint_compressed_nft_v1::handler(ctx, args)
  }

  pub fn mint_transferable_nft(
    ctx: Context<MintTransferableNft>,
    args: MintTransferableNftArgs,
  ) -> Result<()> {
    mint_transferable_nft::handler(ctx, args)
  }

  pub fn mint_transferable_nft_v1(
    ctx: Context<MintTransferableNftV1>,
    args: MintTransferableNftV1Args,
  ) -> Result<()> {
    mint_transferable_nft_v1::handler(ctx, args)
  }

  pub fn verify_legacy_nft_collection(
    ctx: Context<VerifyLegacyNftCollection>,
    args: VerifyLegacyNftCollectionArgs,
  ) -> Result<()> {
    verify_legacy_nft_collection::handler(ctx, args)
  }

  pub fn verify_legacy_nft_collection_v1(
    ctx: Context<VerifyLegacyNftCollectionV1>,
    args: VerifyLegacyNftCollectionV1Args,
  ) -> Result<()> {
    verify_legacy_nft_collection_v1::handler(ctx, args)
  }

  pub fn mint_non_transferable_nft(
    ctx: Context<MintNonTransferableNft>,
    args: MintNonTransferableNftArgs,
  ) -> Result<()> {
    mint_non_transferable_nft::handler(ctx, args)
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

  pub fn update_non_transferable_nft(
    ctx: Context<UpdateNonTransferableNft>,
    args: UpdateNonTransferableNftArgs,
  ) -> Result<()> {
    update_non_transferable_nft::handler(ctx, args)
  }

  pub fn withdraw_project_royalties_v0(
    ctx: Context<WithdrawProjectRoyaltiesV0>,
    args: WithdrawProjectRoyaltiesV0Args,
  ) -> Result<()> {
    withdraw_project_royalties_v0::handler(ctx, args)
  }
}
