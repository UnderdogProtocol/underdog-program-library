use anchor_lang::{prelude::*, solana_program};
use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use mpl_bubblegum::{
  state::metaplex_adapter::{Creator, MetadataArgs},
  ID,
};

#[derive(Clone)]
pub struct Bubblegum;

impl anchor_lang::Id for Bubblegum {
  fn id() -> Pubkey {
    ID
  }
}

#[derive(Accounts)]
pub struct Transfer<'info> {
  pub tree_authority: AccountInfo<'info>,
  pub leaf_owner: AccountInfo<'info>,
  pub leaf_delegate: AccountInfo<'info>,
  pub new_leaf_owner: AccountInfo<'info>,
  pub merkle_tree: AccountInfo<'info>,
  pub log_wrapper: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
  pub compression_program: AccountInfo<'info>,
}

pub fn transfer<'info>(
  ctx: CpiContext<'_, '_, '_, 'info, Transfer<'info>>,
  root: [u8; 32],
  data_hash: [u8; 32],
  creator_hash: [u8; 32],
  leaf_index: u32,
) -> Result<()> {
  let remaining_accounts_len = ctx.remaining_accounts.len();
  let mut accounts = Vec::with_capacity(
    8 // space for the 8 AccountMetas that are always included  (below)
          + remaining_accounts_len,
  );
  accounts.extend(vec![
    AccountMeta::new_readonly(ctx.accounts.tree_authority.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_owner.key(), true),
    AccountMeta::new_readonly(ctx.accounts.leaf_delegate.key(), false),
    AccountMeta::new_readonly(ctx.accounts.new_leaf_owner.key(), false),
    AccountMeta::new(ctx.accounts.merkle_tree.key(), false),
    AccountMeta::new_readonly(ctx.accounts.log_wrapper.key(), false),
    AccountMeta::new_readonly(ctx.accounts.compression_program.key(), false),
    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
  ]);

  let transfer_discriminator: [u8; 8] = [163, 52, 200, 231, 140, 3, 69, 186];

  let mut data = Vec::with_capacity(
    8 // The length of transfer_discriminator,
        + root.len()
        + data_hash.len()
        + creator_hash.len()
        + 8 // The length of the nonce
        + 8, // The length of the index
  );

  data.extend(transfer_discriminator);
  data.extend(root);
  data.extend(data_hash);
  data.extend(creator_hash);
  data.extend(u64::from(leaf_index).to_le_bytes());
  data.extend(leaf_index.to_le_bytes());

  let mut account_infos = Vec::with_capacity(
    8 // space for the 8 AccountInfos that are always included (below)
        + remaining_accounts_len,
  );

  account_infos.extend(vec![
    ctx.accounts.tree_authority.to_account_info(),
    ctx.accounts.leaf_owner.to_account_info(),
    ctx.accounts.leaf_delegate.to_account_info(),
    ctx.accounts.new_leaf_owner.to_account_info(),
    ctx.accounts.merkle_tree.to_account_info(),
    ctx.accounts.log_wrapper.to_account_info(),
    ctx.accounts.compression_program.to_account_info(),
    ctx.accounts.system_program.to_account_info(),
  ]);

  // Add "accounts" (hashes) that make up the merkle proof from the remaining accounts.
  for acc in ctx.remaining_accounts.iter() {
    accounts.push(AccountMeta::new_readonly(acc.key(), false));
    account_infos.push(acc.to_account_info());
    msg!(&acc.key().to_string());
  }

  let instruction = solana_program::instruction::Instruction {
    program_id: ID,
    accounts,
    data,
  };

  solana_program::program::invoke_signed(&instruction, &account_infos[..], ctx.signer_seeds)
    .map_err(Into::into)
}

pub fn delegated_transfer<'info>(
  ctx: CpiContext<'_, '_, '_, 'info, Transfer<'info>>,
  root: [u8; 32],
  data_hash: [u8; 32],
  creator_hash: [u8; 32],
  leaf_index: u32,
) -> Result<()> {
  let remaining_accounts_len = ctx.remaining_accounts.len();
  let mut accounts = Vec::with_capacity(
    8 // space for the 8 AccountMetas that are always included  (below)
          + remaining_accounts_len,
  );
  accounts.extend(vec![
    AccountMeta::new_readonly(ctx.accounts.tree_authority.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_owner.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_delegate.key(), true),
    AccountMeta::new_readonly(ctx.accounts.new_leaf_owner.key(), false),
    AccountMeta::new(ctx.accounts.merkle_tree.key(), false),
    AccountMeta::new_readonly(ctx.accounts.log_wrapper.key(), false),
    AccountMeta::new_readonly(ctx.accounts.compression_program.key(), false),
    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
  ]);

  let transfer_discriminator: [u8; 8] = [163, 52, 200, 231, 140, 3, 69, 186];

  let mut data = Vec::with_capacity(
    8 // The length of transfer_discriminator,
        + root.len()
        + data_hash.len()
        + creator_hash.len()
        + 8 // The length of the nonce
        + 8, // The length of the index
  );

  data.extend(transfer_discriminator);
  data.extend(root);
  data.extend(data_hash);
  data.extend(creator_hash);
  data.extend(u64::from(leaf_index).to_le_bytes());
  data.extend(leaf_index.to_le_bytes());

  let mut account_infos = Vec::with_capacity(
    8 // space for the 8 AccountInfos that are always included (below)
        + remaining_accounts_len,
  );

  account_infos.extend(vec![
    ctx.accounts.tree_authority.to_account_info(),
    ctx.accounts.leaf_owner.to_account_info(),
    ctx.accounts.leaf_delegate.to_account_info(),
    ctx.accounts.new_leaf_owner.to_account_info(),
    ctx.accounts.merkle_tree.to_account_info(),
    ctx.accounts.log_wrapper.to_account_info(),
    ctx.accounts.compression_program.to_account_info(),
    ctx.accounts.system_program.to_account_info(),
  ]);

  // Add "accounts" (hashes) that make up the merkle proof from the remaining accounts.
  for acc in ctx.remaining_accounts.iter() {
    accounts.push(AccountMeta::new_readonly(acc.key(), false));
    account_infos.push(acc.to_account_info());
    msg!(&acc.key().to_string());
  }

  let instruction = solana_program::instruction::Instruction {
    program_id: ID,
    accounts,
    data,
  };

  solana_program::program::invoke_signed(&instruction, &account_infos[..], ctx.signer_seeds)
    .map_err(Into::into)
}

#[derive(Accounts)]
pub struct Burn<'info> {
  pub tree_authority: AccountInfo<'info>,
  pub leaf_owner: AccountInfo<'info>,
  pub leaf_delegate: AccountInfo<'info>,
  pub merkle_tree: AccountInfo<'info>,
  pub log_wrapper: AccountInfo<'info>,
  pub compression_program: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
}

pub fn burn<'info>(
  ctx: CpiContext<'_, '_, '_, 'info, Burn<'info>>,
  root: [u8; 32],
  data_hash: [u8; 32],
  creator_hash: [u8; 32],
  leaf_index: u32,
) -> Result<()> {
  let remaining_accounts_len = ctx.remaining_accounts.len();
  let mut accounts = Vec::with_capacity(
    8 // space for the 8 AccountMetas that are always included  (below)
          + remaining_accounts_len,
  );
  accounts.extend(vec![
    AccountMeta::new_readonly(ctx.accounts.tree_authority.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_owner.key(), true),
    AccountMeta::new_readonly(ctx.accounts.leaf_delegate.key(), false),
    AccountMeta::new(ctx.accounts.merkle_tree.key(), false),
    AccountMeta::new_readonly(ctx.accounts.log_wrapper.key(), false),
    AccountMeta::new_readonly(ctx.accounts.compression_program.key(), false),
    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
  ]);

  let burn_discriminator: [u8; 8] = [116, 110, 29, 56, 107, 219, 42, 93];

  let mut data = Vec::with_capacity(
    8 // The length of transfer_discriminator,
        + root.len()
        + data_hash.len()
        + creator_hash.len()
        + 8 // The length of the nonce
        + 8, // The length of the index
  );

  data.extend(burn_discriminator);
  data.extend(root);
  data.extend(data_hash);
  data.extend(creator_hash);
  data.extend(u64::from(leaf_index).to_le_bytes());
  data.extend(leaf_index.to_le_bytes());

  let mut account_infos = Vec::with_capacity(
    8 // space for the 8 AccountInfos that are always included (below)
        + remaining_accounts_len,
  );

  account_infos.extend(vec![
    ctx.accounts.tree_authority.to_account_info(),
    ctx.accounts.leaf_owner.to_account_info(),
    ctx.accounts.leaf_delegate.to_account_info(),
    ctx.accounts.merkle_tree.to_account_info(),
    ctx.accounts.log_wrapper.to_account_info(),
    ctx.accounts.compression_program.to_account_info(),
    ctx.accounts.system_program.to_account_info(),
  ]);

  // Add "accounts" (hashes) that make up the merkle proof from the remaining accounts.
  for acc in ctx.remaining_accounts.iter() {
    accounts.push(AccountMeta::new_readonly(acc.key(), false));
    account_infos.push(acc.to_account_info());
    msg!(&acc.key().to_string());
  }

  let instruction = solana_program::instruction::Instruction {
    program_id: ID,
    accounts,
    data,
  };

  solana_program::program::invoke_signed(&instruction, &account_infos[..], ctx.signer_seeds)
    .map_err(Into::into)
}

pub fn delegated_burn<'info>(
  ctx: CpiContext<'_, '_, '_, 'info, Burn<'info>>,
  root: [u8; 32],
  data_hash: [u8; 32],
  creator_hash: [u8; 32],
  leaf_index: u32,
) -> Result<()> {
  let remaining_accounts_len = ctx.remaining_accounts.len();
  let mut accounts = Vec::with_capacity(
    8 // space for the 8 AccountMetas that are always included  (below)
          + remaining_accounts_len,
  );
  accounts.extend(vec![
    AccountMeta::new_readonly(ctx.accounts.tree_authority.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_owner.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_delegate.key(), true),
    AccountMeta::new(ctx.accounts.merkle_tree.key(), false),
    AccountMeta::new_readonly(ctx.accounts.log_wrapper.key(), false),
    AccountMeta::new_readonly(ctx.accounts.compression_program.key(), false),
    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
  ]);

  let burn_discriminator: [u8; 8] = [116, 110, 29, 56, 107, 219, 42, 93];

  let mut data = Vec::with_capacity(
    8 // The length of transfer_discriminator,
        + root.len()
        + data_hash.len()
        + creator_hash.len()
        + 8 // The length of the nonce
        + 8, // The length of the index
  );

  data.extend(burn_discriminator);
  data.extend(root);
  data.extend(data_hash);
  data.extend(creator_hash);
  data.extend(u64::from(leaf_index).to_le_bytes());
  data.extend(leaf_index.to_le_bytes());

  let mut account_infos = Vec::with_capacity(
    8 // space for the 8 AccountInfos that are always included (below)
        + remaining_accounts_len,
  );

  account_infos.extend(vec![
    ctx.accounts.tree_authority.to_account_info(),
    ctx.accounts.leaf_owner.to_account_info(),
    ctx.accounts.leaf_delegate.to_account_info(),
    ctx.accounts.merkle_tree.to_account_info(),
    ctx.accounts.log_wrapper.to_account_info(),
    ctx.accounts.compression_program.to_account_info(),
    ctx.accounts.system_program.to_account_info(),
  ]);

  // Add "accounts" (hashes) that make up the merkle proof from the remaining accounts.
  for acc in ctx.remaining_accounts.iter() {
    accounts.push(AccountMeta::new_readonly(acc.key(), false));
    account_infos.push(acc.to_account_info());
    msg!(&acc.key().to_string());
  }

  let instruction = solana_program::instruction::Instruction {
    program_id: ID,
    accounts,
    data,
  };

  solana_program::program::invoke_signed(&instruction, &account_infos[..], ctx.signer_seeds)
    .map_err(Into::into)
}

#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
  pub tree_authority: AccountInfo<'info>,
  pub authority: AccountInfo<'info>,
  pub collection_mint: AccountInfo<'info>,
  pub collection_metadata: AccountInfo<'info>,
  pub collection_authority_record_pda: AccountInfo<'info>,
  pub leaf_owner: AccountInfo<'info>,
  pub leaf_delegate: AccountInfo<'info>,
  pub payer: AccountInfo<'info>,
  pub merkle_tree: AccountInfo<'info>,
  pub log_wrapper: AccountInfo<'info>,
  pub compression_program: AccountInfo<'info>,
  pub token_metadata_program: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
}

#[derive(BorshDeserialize, BorshSerialize)]
struct UpdateMetadataInstructionData {
  discriminator: [u8; 8],
}

impl UpdateMetadataInstructionData {
  fn new() -> Self {
    Self {
      discriminator: [170, 182, 43, 239, 97, 78, 225, 186],
    }
  }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct UpdateMetadataInstructionArgs {
  pub discriminator: [u8; 8],
  pub root: [u8; 32],
  pub nonce: u64,
  pub index: u32,
  pub current_metadata: MetadataArgs,
  pub update_args: UpdateArgs,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone, Default)]
pub struct UpdateArgs {
  pub name: Option<String>,
  pub symbol: Option<String>,
  pub uri: Option<String>,
  pub creators: Option<Vec<Creator>>,
  pub seller_fee_basis_points: Option<u16>,
  pub primary_sale_happened: Option<bool>,
  pub is_mutable: Option<bool>,
}

pub fn update_metadata<'info>(
  ctx: CpiContext<'_, '_, '_, 'info, UpdateMetadata<'info>>,
  root: [u8; 32],
  current_metadata: MetadataArgs,
  update_args: UpdateArgs,
  nonce: u64,
  index: u32,
) -> Result<()> {
  let remaining_accounts_len = ctx.remaining_accounts.len();

  let mut accounts = Vec::with_capacity(13 + remaining_accounts_len);

  accounts.extend(vec![
    AccountMeta::new_readonly(ctx.accounts.tree_authority.key(), false),
    AccountMeta::new_readonly(ctx.accounts.authority.key(), true),
    AccountMeta::new_readonly(ctx.accounts.collection_mint.key(), false),
    AccountMeta::new_readonly(ctx.accounts.collection_metadata.key(), false),
    AccountMeta::new_readonly(ctx.accounts.collection_authority_record_pda.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_owner.key(), false),
    AccountMeta::new_readonly(ctx.accounts.leaf_delegate.key(), false),
    AccountMeta::new(ctx.accounts.payer.key(), true),
    AccountMeta::new(ctx.accounts.merkle_tree.key(), false),
    AccountMeta::new_readonly(ctx.accounts.log_wrapper.key(), false),
    AccountMeta::new_readonly(ctx.accounts.compression_program.key(), false),
    AccountMeta::new_readonly(ctx.accounts.token_metadata_program.key(), false),
    AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
  ]);

  let data = UpdateMetadataInstructionArgs {
    discriminator: [170, 182, 43, 239, 97, 78, 225, 186],
    root,
    nonce,
    index,
    current_metadata: current_metadata.clone(),
    update_args: update_args.clone(),
  }
  .try_to_vec()
  .unwrap();

  let mut account_infos = vec![
    ctx.accounts.tree_authority.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    ctx.accounts.collection_mint.to_account_info(),
    ctx.accounts.collection_metadata.to_account_info(),
    ctx
      .accounts
      .collection_authority_record_pda
      .to_account_info(),
    ctx.accounts.leaf_owner.to_account_info(),
    ctx.accounts.leaf_delegate.to_account_info(),
    ctx.accounts.payer.to_account_info(),
    ctx.accounts.merkle_tree.to_account_info(),
    ctx.accounts.log_wrapper.to_account_info(),
    ctx.accounts.compression_program.to_account_info(),
    ctx.accounts.token_metadata_program.to_account_info(),
    ctx.accounts.system_program.to_account_info(),
  ];

  for acc in ctx.remaining_accounts.iter() {
    accounts.push(AccountMeta::new_readonly(acc.key(), false));
    account_infos.push(acc.to_account_info());
  }

  let instruction = solana_program::instruction::Instruction {
    program_id: ID,
    accounts,
    data,
  };

  solana_program::program::invoke_signed(&instruction, &account_infos[..], ctx.signer_seeds)
    .map_err(Into::into)
}
