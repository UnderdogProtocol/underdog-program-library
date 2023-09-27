use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("upUcvW7nF6ymrAFKborbq3vrbdpuokAvJheqHX5Qxtd");

#[program]
pub mod underdog_identity {
  use super::*;

  pub fn initialize_admin(ctx: Context<InitializeAdmin>) -> Result<()> {
    initialize_admin::handler(ctx)
  }

  pub fn update_admin(ctx: Context<UpdateAdmin>, args: UpdateAdminArgs) -> Result<()> {
    update_admin::handler(ctx, args)
  }

  pub fn initialize_link_v0<'info>(
    ctx: Context<InitializeLinkV0>,
    args: InitializeLinkV0Args,
  ) -> Result<()> {
    initialize_link_v0::handler(ctx, args)
  }

  pub fn transfer_asset_v0<'info>(
    ctx: Context<'_, '_, '_, 'info, TransferAssetV0<'info>>,
    args: TransferAssetV0Args,
  ) -> Result<()> {
    transfer_asset_v0::handler(ctx, args)
  }

  pub fn burn_asset_v0<'info>(
    ctx: Context<'_, '_, '_, 'info, BurnAssetV0<'info>>,
    args: BurnAssetV0Args,
  ) -> Result<()> {
    burn_asset_v0::handler(ctx, args)
  }
}
