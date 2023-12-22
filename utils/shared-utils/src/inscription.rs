use anchor_lang::{prelude::*, solana_program};
use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::{pubkey, pubkey::Pubkey};

pub const ID: Pubkey = pubkey!("1NSCRfGeyo7wPUazGbaPBUsTM49e1k2aXewHGARfzSo");

#[derive(Clone)]
pub struct Inscription;

impl anchor_lang::Id for Inscription {
  fn id() -> Pubkey {
    ID
  }
}

#[derive(Accounts)]
pub struct InitializeFromMint<'info> {
  pub mint_inscription_account: AccountInfo<'info>,
  pub metadata_account: AccountInfo<'info>,
  pub mint_account: AccountInfo<'info>,
  pub token_metadata_account: AccountInfo<'info>,
  pub inscription_shard_account: AccountInfo<'info>,
  pub payer: AccountInfo<'info>,
  pub authority: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
}

#[derive(BorshDeserialize, BorshSerialize)]
struct InitializeFromMintInstructionData {
  discriminator: u8,
}

impl InitializeFromMintInstructionData {
  fn new() -> Self {
    Self { discriminator: 1 }
  }
}

pub fn initialize_from_mint<'info>(
  ctx: CpiContext<'_, '_, '_, 'info, InitializeFromMint<'info>>,
) -> Result<()> {
  let mut accounts: Vec<AccountMeta> = Vec::with_capacity(8);
  accounts.push(solana_program::instruction::AccountMeta::new(
    ctx.accounts.mint_inscription_account.key(),
    false,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new(
    ctx.accounts.metadata_account.key(),
    false,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new_readonly(
    ctx.accounts.mint_account.key(),
    false,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new_readonly(
    ctx.accounts.token_metadata_account.key(),
    false,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new(
    ctx.accounts.inscription_shard_account.key(),
    false,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new(
    ctx.accounts.payer.key(),
    true,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new_readonly(
    ctx.accounts.authority.key(),
    true,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new_readonly(
    ctx.accounts.system_program.key(),
    false,
  ));

  let data = InitializeFromMintInstructionData::new()
    .try_to_vec()
    .unwrap();

  let instruction = solana_program::instruction::Instruction {
    program_id: ID,
    accounts,
    data,
  };

  let mut account_infos = Vec::with_capacity(8);
  account_infos.push(ctx.accounts.mint_inscription_account.clone());
  account_infos.push(ctx.accounts.metadata_account.clone());
  account_infos.push(ctx.accounts.mint_account.clone());
  account_infos.push(ctx.accounts.token_metadata_account.clone());
  account_infos.push(ctx.accounts.inscription_shard_account.clone());
  account_infos.push(ctx.accounts.payer.clone());
  account_infos.push(ctx.accounts.authority.clone());
  account_infos.push(ctx.accounts.system_program.clone());

  solana_program::program::invoke_signed(&instruction, &account_infos[..], ctx.signer_seeds)
    .map_err(Into::into)
}

#[derive(Accounts)]
pub struct Initialize<'info> {
  pub inscription_account: AccountInfo<'info>,
  pub metadata_account: AccountInfo<'info>,
  pub inscription_shard_account: AccountInfo<'info>,
  pub payer: AccountInfo<'info>,
  pub authority: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
}

#[derive(BorshDeserialize, BorshSerialize)]
struct InitializeInstructionData {
  discriminator: u8,
}

impl InitializeInstructionData {
  fn new() -> Self {
    Self { discriminator: 0 }
  }
}

pub fn initialize<'info>(ctx: CpiContext<'_, '_, '_, 'info, Initialize<'info>>) -> Result<()> {
  let mut accounts: Vec<AccountMeta> = Vec::with_capacity(8);

  accounts.push(solana_program::instruction::AccountMeta::new(
    ctx.accounts.inscription_account.key(),
    true,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new(
    ctx.accounts.metadata_account.key(),
    false,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new(
    ctx.accounts.inscription_shard_account.key(),
    false,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new(
    ctx.accounts.payer.key(),
    true,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new_readonly(
    ctx.accounts.authority.key(),
    true,
  ));
  accounts.push(solana_program::instruction::AccountMeta::new_readonly(
    ctx.accounts.system_program.key(),
    false,
  ));

  let data = InitializeInstructionData::new().try_to_vec().unwrap();

  let instruction = solana_program::instruction::Instruction {
    program_id: ID,
    accounts,
    data,
  };

  let mut account_infos = Vec::with_capacity(6);
  account_infos.push(ctx.accounts.inscription_account.clone());
  account_infos.push(ctx.accounts.metadata_account.clone());
  account_infos.push(ctx.accounts.inscription_shard_account.clone());
  account_infos.push(ctx.accounts.payer.clone());
  account_infos.push(ctx.accounts.authority.clone());
  account_infos.push(ctx.accounts.system_program.clone());

  solana_program::program::invoke_signed(&instruction, &account_infos[..], ctx.signer_seeds)
    .map_err(Into::into)
}

#[derive(Accounts)]
pub struct WriteData<'info> {
  pub inscription_account: AccountInfo<'info>,
  pub metadata_account: AccountInfo<'info>,
  pub payer: AccountInfo<'info>,
  pub authority: AccountInfo<'info>,
  pub system_program: AccountInfo<'info>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct WriteDataInstructionData {
  discriminator: u8,
  value: Vec<u8>,
}

impl WriteDataInstructionData {
  fn new(value: Vec<u8>) -> Self {
    Self {
      discriminator: 3,
      value,
    }
  }
}

pub fn write_data<'info>(
  ctx: CpiContext<'_, '_, '_, 'info, WriteData<'info>>,
  value: Vec<u8>,
) -> Result<()> {
  let mut accounts: Vec<AccountMeta> = Vec::with_capacity(5);

  accounts.push(AccountMeta::new(
    ctx.accounts.inscription_account.key(),
    false,
  ));
  accounts.push(AccountMeta::new(ctx.accounts.metadata_account.key(), false));
  accounts.push(AccountMeta::new(ctx.accounts.payer.key(), true));
  accounts.push(AccountMeta::new_readonly(
    ctx.accounts.authority.key(),
    true,
  ));
  accounts.push(AccountMeta::new_readonly(
    ctx.accounts.system_program.key(),
    false,
  ));

  let data = WriteDataInstructionData::new(value).try_to_vec().unwrap();

  let instruction = solana_program::instruction::Instruction {
    program_id: ID,
    accounts,
    data,
  };

  let account_infos = vec![
    ctx.accounts.inscription_account.to_account_info(),
    ctx.accounts.metadata_account.to_account_info(),
    ctx.accounts.payer.to_account_info(),
    ctx.accounts.authority.to_account_info(),
    ctx.accounts.system_program.to_account_info(),
  ];

  solana_program::program::invoke_signed(&instruction, &account_infos, ctx.signer_seeds)
    .map_err(Into::into)
}
