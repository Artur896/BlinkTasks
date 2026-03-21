use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("An6HpDp4ypTZB1mKEFzmvXyHSP1oBPf2KeG9J2MkP2my");

#[program]
pub mod blinktasks {

    use super::*;

    pub fn create_task(ctx: Context<CreateTask>, amount: u64) -> Result<()> {
        let task = &mut ctx.accounts.task;

        task.creator = *ctx.accounts.creator.key;
        task.worker = Pubkey::default();
        task.amount = amount;
        task.is_completed = false;
        task.is_paid = false;
        task.bump = ctx.bumps.task;

        let cpi_ctx = Cpicontext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.task.to_account_info(),
            },
        );

        anchor_lang::system_program::transfer(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn accept_task(ctx: Context<AcceptTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.worker == Pubkey::default(), CustomError::AlreadyTaken);
        task.worker = *ctx.accounts.worker.key;
        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.worker == *ctx.accounts.worker.key, CustomError::Unauthorized);
        task.is_completed = true;
        Ok(())
    }

    pub fn release_payment(ctx: Context<ReleasePayment>) -> Result<()> {
        let task = &mut ctx.accounts.task;

        require!(task.creator == *ctx.accounts.creator.key, CustomError::Unauthorized);
        require!(task.is_completed, CustomError::NotCompleted);
        require!(!task.is_paid, CustomError::AlreadyPaid);

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.creator.key,
            &ctx.accounts.worker.key,
            task.amount,
        );
        task.is_paid = true;

        Ok(())
    }
}

#[account]
pub struct Task{
    pub creator: Pubkey,
    pub worker: Pubkey,
    pub amount: u64,
    pub is_completed: bool,
    pub is_paid: bool,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 100
        seeds = [b"task", creator.key().as_ref()]
        bump
    )]
    pub task: Account<'info, Task>,

    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptTask<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,

    #[account(mut)]
    pub worker: Signer<'info>,
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,

    pub worker: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut)]
    pub worker: SystemAccount<'info>,
}

#[error_code]
pub enum CustomError {
    #[msg("Task already taken")]
    AlreadyTaken,

    #[msg("Not authorized")]
    Unauthorized,

    #[msg("Task not completed")]
    NotCompleted,

    #[msg("Task already paid")]
    AlreadyPaid,
}