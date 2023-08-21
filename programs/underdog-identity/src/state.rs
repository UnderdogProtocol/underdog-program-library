use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Admin {
  pub bump: u8,
  pub address: Pubkey,
}

pub const ADMIN_PREFIX: &str = "underdog_identity_admin";

pub const ADMIN_SIZE: usize = 8 +
  1 + // bump
  32; // key;

#[account]
#[derive(Default)]
pub struct Link {
  pub bump: u8,
  pub address: Pubkey,
}

pub const UNDERDOG_LINK_PREFIX: &str = "underdog";

pub const LINK_SIZE: usize = 8 +
1 + // bump
32; // key;
