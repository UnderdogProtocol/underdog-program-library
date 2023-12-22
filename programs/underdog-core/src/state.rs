use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct InitialOwner {
  pub owner: Pubkey,
  pub bump: u8,
}

pub const OWNER_PREFIX: &str = "ownership";

#[account]
#[derive(Default)]
pub struct InitOrgAccount {
  pub owner: Pubkey,
  pub maxorg: u64,
  pub bump: u8,
}

#[account]
#[derive(Default)]
pub struct OrgAccount {
  pub owner: Pubkey,
  pub counter: u64,
  pub maxproj_transferable: u64,
  pub maxproj_non_transferable: u64,
  pub bump: u8,
}

pub const ORG_ACCOUNT_SIZE: usize = 8 +
    32 + // owner = super_admin_address
    8 + // counter = org_id
    8 + // maxproj_transferable - deprecated
    8 + // maxproj_non_transferable - deprecated
    1; // bump;

pub const ORG_PREFIX: &str = "org";

#[account]
#[derive(Default)]
pub struct OrgControlAccount {
  pub org_control: Pubkey,
  pub bump: u8,
}

pub const ORG_CONTROL_ACCOUNT_SIZE: usize = 8 +
    32 + // org_control
    1; // bump

pub const ORG_CONTROL_PREFIX: &str = "org-control";

#[account]
#[derive(Default)]
pub struct OrgMemberAccount {
  pub member: Pubkey,
  pub org: Pubkey,
  pub active: bool,
  pub bump: u8,
}

pub const ORG_MEMBER_ACCOUNT_SIZE: usize = 8 +
    32 + // member
    32 + // org
    1 + // active
    1; // bump

pub const ORG_MEMBER_PREFIX: &str = "member";

#[account]
#[derive(Default)]
pub struct LegacyProject {
  pub super_admin_address: Pubkey,
  pub org_address: Pubkey,
  pub project_id: u64,
  pub bump: u8,
}

pub const LEGACY_PROJECT_SIZE: usize = 8 +
32 + // super_admin_address
32 + // org_address
8 + // project_id
1; // bump

pub const TRANSFERABLE_PROJECT_PREFIX: &str = "t-proj";
pub const TRANSFERABLE_PROJECT_MINT_PREFIX: &str = "t-project-mint";
pub const TRANSFERABLE_PROJECT_VAULT_PREFIX: &str = "t-project-mint-vault";
pub const TRANSFERABLE_NFT_MINT_PREFIX: &str = "t-nft-mint";

pub const NON_TRANSFERABLE_PROJECT_PREFIX: &str = "nt-proj";
pub const NON_TRANSFERABLE_PROJECT_MINT_PREFIX: &str = "nt-project-mint";
pub const NON_TRANSFERABLE_NFT_ESCROW: &str = "nt-nft-mint-esc";
pub const NON_TRANSFERABLE_NFT_CLAIM: &str = "nt-nft-data";
pub const NON_TRANSFERABLE_NFT_MINT_PREFIX: &str = "nt-nft-mint";

#[account]
#[derive(Default)]
pub struct NonTransferableProject {
  pub super_admin_address: Pubkey,
  pub org_address: Pubkey,
  pub project_id: u64,
  pub bump: u8,
}

pub const NON_TRANSFERABLE_PROJECT_SIZE: usize = 8 +
32 + // super_admin_address
32 + // org_address
8 + // project_id
1; // bump

#[account]
#[derive(Default)]
pub struct ProjAccount {
  pub superadmin: Pubkey,
  pub org: Pubkey,
  pub projcount: u64,
  pub bump: u8,
}

#[account]
#[derive(Default)]
pub struct Project {
  pub super_admin_address: Pubkey,
  pub org_address: Pubkey,
  pub project_id: u64,
  pub bump: u8,
}

pub const PROJECT_SIZE: usize = 8 +
    32 + // super_admin_address
    32 + // org_address
    8 + // project_id
    1; // bump

pub const PROJECT_PREFIX: &str = "project";
pub const PROJECT_MINT_PREFIX: &str = "project-mint";
pub const PROJECT_VAULT_PREFIX: &str = "project-vault";

#[account]
#[derive(Default)]
pub struct ClaimAccount {
  pub claimer: Pubkey,
  pub bump: u8,
}
