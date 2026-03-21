use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("An6HpDp4ypTZB1mKEFzmvXyHSP1oBPf2KeG9J2MkP2my");

#[program]
pub mod blinktasks {
    use super::*;

    pub fn init_profile(ctx: Context<InitProfile>) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        profile.authority = *ctx.accounts.user.key;
        profile.tasks_completed = 0;
        profile.reputation = 0;
        Ok(())
    }

    // ✅ init_vault ya no necesita existir — la vault se crea sola en create_task
    // Si quieres mantenerla, usa esta versión corregida:
    pub fn init_vault(ctx: Context<InitVault>) -> Result<()> {
        // Solo necesitamos que la cuenta exista (se crea via system_program en el constraint)
        let vault = &ctx.accounts.vault;
        msg!("Vault initialized at: {}", vault.key());
        Ok(())
    }

    pub fn create_task(ctx: Context<CreateTask>, amount: u64) -> Result<()> {
        let task = &mut ctx.accounts.task;

        task.creator = *ctx.accounts.creator.key;
        task.worker = Pubkey::default();
        task.amount = amount;
        task.is_completed = false;
        task.is_paid = false;
        task.bump = ctx.bumps.task;
        task.vault_bump = ctx.bumps.vault;

        let cpi_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );

        system_program::transfer(cpi_ctx, amount)?;
        Ok(())
    }

    pub fn accept_task(ctx: Context<AcceptTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;

        require!(task.worker == Pubkey::default(), CustomError::AlreadyTaken);
        require!(task.creator != ctx.accounts.worker.key(), CustomError::Unauthorized);

        task.worker = *ctx.accounts.worker.key;
        Ok(())
    }

    pub fn complete_task(ctx: Context<CompleteTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let profile = &mut ctx.accounts.profile;

        require!(task.worker == *ctx.accounts.worker.key, CustomError::Unauthorized);

        task.is_completed = true;
        profile.tasks_completed += 1;
        profile.reputation += 10;
        Ok(())
    }

    pub fn release_payment(ctx: Context<ReleasePayment>) -> Result<()> {
        let task = &mut ctx.accounts.task;

        require!(task.creator == *ctx.accounts.creator.key, CustomError::Unauthorized);
        require!(task.worker == ctx.accounts.worker.key(), CustomError::Unauthorized);
        require!(task.is_completed, CustomError::NotCompleted);
        require!(!task.is_paid, CustomError::AlreadyPaid);

        let amount = task.amount;

        let seeds = &[
            b"vault",
            task.creator.as_ref(),
            &[task.vault_bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.worker.to_account_info(),
            },
            signer,
        );

        system_program::transfer(cpi_ctx, amount)?;
        task.is_paid = true;
        Ok(())
    }
}

#[account]
pub struct Task {
    pub creator: Pubkey,
    pub worker: Pubkey,
    pub amount: u64,
    pub is_completed: bool,
    pub is_paid: bool,
    pub bump: u8,
    pub vault_bump: u8,
}

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub tasks_completed: u64,
    pub reputation: u64,
}

// ✅ CORREGIDO: init_vault usa UncheckedAccount en lugar de SystemAccount
#[derive(Accounts)]
pub struct InitVault<'info> {
    /// CHECK: PDA vault, se valida con seeds
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8,  // ✅ espacio exacto: discriminator + authority + tasks_completed + reputation
        seeds = [b"profile", user.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + 32 + 32 + 8 + 1 + 1 + 1 + 1, // ✅ espacio exacto para Task
        seeds = [b"task", creator.key().as_ref()],
        bump
    )]
    pub task: Account<'info, Task>,

    /// CHECK: PDA vault validada con seeds
    #[account(
        mut,
        seeds = [b"vault", creator.key().as_ref()],
        bump
    )]
    pub vault: UncheckedAccount<'info>,

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

    #[account(mut)]
    pub worker: Signer<'info>,

    #[account(
        mut,
        seeds = [b"profile", worker.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, UserProfile>,
}

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,

    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub worker: SystemAccount<'info>,

    /// CHECK: PDA vault validada con seeds y bump guardado en task
    #[account(
        mut,
        seeds = [b"vault", task.creator.as_ref()],
        bump = task.vault_bump
    )]
    pub vault: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
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