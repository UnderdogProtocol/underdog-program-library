use anchor_lang::prelude::*;

pub use mpl_token_metadata::ID;

#[derive(Default, AnchorSerialize, AnchorDeserialize, Clone)]

pub struct UpdateMetadataArgs {
  /// The name of the asset
  pub name: String,
  /// The symbol for the asset
  pub symbol: String,
  /// URI pointing to JSON representing the asset
  pub uri: String,
  /// Royalty basis points that goes to creators in secondary sales (0-10000)
  pub seller_fee_basis_points: u16,
}
