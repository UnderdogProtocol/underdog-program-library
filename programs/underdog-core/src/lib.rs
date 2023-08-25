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

  pub fn initialize_project(
    ctx: Context<InitializeProject>,
    args: InitializeProjectArgs,
  ) -> Result<()> {
    initialize_project::handler(ctx, args)
  }

  pub fn update_project_v0(ctx: Context<UpdateProjectV0>, args: UpdateProjectV0Args) -> Result<()> {
    update_project_v0::handler(ctx, args)
  }

  pub fn mint_nft_v2(ctx: Context<MintNftV2>, args: MintNftV2Args) -> Result<()> {
    mint_nft_v2::handler(ctx, args)
  }

  pub fn mint_sft_v2(ctx: Context<MintSftV2>, args: MintSftV2Args) -> Result<()> {
    mint_sft_v2::handler(ctx, args)
  }

  pub fn transfer_asset_v1<'info>(
    ctx: Context<'_, '_, '_, 'info, TransferAssetV1<'info>>,
    args: TransferAssetV1Args,
  ) -> Result<()> {
    transfer_asset_v1::handler(ctx, args)
  }

  pub fn initialize_legacy_project(
    ctx: Context<InitializeLegacyProject>,
    args: InitializeLegacyProjectArgs,
  ) -> Result<()> {
    initialize_legacy_project::handler(ctx, args)
  }

  pub fn initialize_compressed_project(
    ctx: Context<InitializeCompressedProject>,
    args: InitializeCompressedProjectArgs,
  ) -> Result<()> {
    initialize_compressed_project::handler(ctx, args)
  }

  pub fn mint_compressed_nft(
    ctx: Context<MintCompressedNft>,
    args: MintCompressedNftArgs,
  ) -> Result<()> {
    mint_compressed_nft::handler(ctx, args)
  }

  pub fn mint_transferable_nft(
    ctx: Context<MintTransferableNft>,
    args: MintTransferableNftArgs,
  ) -> Result<()> {
    mint_transferable_nft::handler(ctx, args)
  }

  pub fn verify_legacy_nft_collection(
    ctx: Context<VerifyLegacyNftCollection>,
    args: VerifyLegacyNftCollectionArgs,
  ) -> Result<()> {
    verify_legacy_nft_collection::handler(ctx, args)
  }

  pub fn mint_non_transferable_nft(
    ctx: Context<MintNonTransferableNft>,
    args: MintNonTransferableNftArgs,
  ) -> Result<()> {
    mint_non_transferable_nft::handler(ctx, args)
  }

  pub fn claim_non_transferable_nft(
    ctx: Context<ClaimNonTransferableNft>,
    args: ClaimNonTransferableNftArgs,
  ) -> Result<()> {
    claim_non_transferable_nft::handler(ctx, args)
  }

  pub fn revoke_non_transferable_nft(
    ctx: Context<RevokeNonTransferableNft>,
    args: RevokeNonTransferableNftArgs,
  ) -> Result<()> {
    revoke_non_transferable_nft::handler(ctx, args)
  }

  pub fn burn_non_transferable_nft(
    ctx: Context<BurnNonTransferableNft>,
    args: BurnNonTransferableNftArgs,
  ) -> Result<()> {
    burn_non_transferable_nft::handler(ctx, args)
  }
}
