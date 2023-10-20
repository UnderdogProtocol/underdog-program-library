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
pub struct Domain {
  pub authority: Pubkey,
  pub expiration: u64,
  pub bump: u8,
}

pub const DOMAIN_SIZE: usize = 8 +
  1 + // bump
  8 + // expiration
  32; // address

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
