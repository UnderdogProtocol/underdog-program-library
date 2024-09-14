use anchor_lang::solana_program::pubkey::Pubkey;
use std::ops::Deref;

use mpl_bubblegum::accounts::TreeConfig;
pub use mpl_bubblegum::ID;

#[derive(Clone)]
pub struct Bubblegum;

impl anchor_lang::Id for Bubblegum {
  fn id() -> Pubkey {
    ID
  }
}

#[derive(Clone, Debug, PartialEq)]
pub struct TreeConfigAccount(TreeConfig);

impl anchor_lang::AccountDeserialize for TreeConfigAccount {
  fn try_deserialize(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
    let tc = Self::try_deserialize_unchecked(buf)?;
    Ok(tc)
  }

  fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
    let tc = TreeConfig::from_bytes(buf)?;
    Ok(Self(tc))
  }
}

impl anchor_lang::AccountSerialize for TreeConfigAccount {}

impl anchor_lang::Owner for TreeConfigAccount {
  fn owner() -> Pubkey {
    ID
  }
}

impl Deref for TreeConfigAccount {
  type Target = TreeConfig;
  fn deref(&self) -> &Self::Target {
    &self.0
  }
}
