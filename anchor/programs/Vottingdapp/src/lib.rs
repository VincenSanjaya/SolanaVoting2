#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod Vottingdapp {
    use super::*;

  pub fn close(_ctx: Context<CloseVottingdapp>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.Vottingdapp.count = ctx.accounts.Vottingdapp.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.Vottingdapp.count = ctx.accounts.Vottingdapp.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeVottingdapp>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.Vottingdapp.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeVottingdapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Vottingdapp::INIT_SPACE,
  payer = payer
  )]
  pub Vottingdapp: Account<'info, Vottingdapp>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseVottingdapp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub Vottingdapp: Account<'info, Vottingdapp>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub Vottingdapp: Account<'info, Vottingdapp>,
}

#[account]
#[derive(InitSpace)]
pub struct Vottingdapp {
  count: u8,
}
