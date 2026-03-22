use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("An6HpDp4ypTZB1mKEFzmvXyHSP1oBPf2KeG9J2MkP2my");

const MAX_USERNAME:    usize = 50;
const MAX_BIO:         usize = 200;
const MAX_SKILLS:      usize = 100;
const MAX_CONTACT:     usize = 100;
const MAX_TITLE:       usize = 100;
const MAX_DESCRIPTION: usize = 500;
const MAX_CATEGORY:    usize = 50;
const MAX_DELIVERY:    usize = 200;
const MAX_NOTE:        usize = 200;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TaskStatus {
    Open,
    InProgress,
    Submitted,
    Disputed,
    Paid,
    Cancelled,
}

impl Default for TaskStatus {
    fn default() -> Self { TaskStatus::Open }
}

#[program]
pub mod blinktasks {
    use super::*;

    pub fn init_profile(
        ctx: Context<InitProfile>,
        username: String,
        bio: String,
        skills: String,
        contact: String,
    ) -> Result<()> {
        require!(username.len() <= MAX_USERNAME,    CustomError::StringTooLong);
        require!(bio.len()      <= MAX_BIO,         CustomError::StringTooLong);
        require!(skills.len()   <= MAX_SKILLS,      CustomError::StringTooLong);
        require!(contact.len()  <= MAX_CONTACT,     CustomError::StringTooLong);

        let p = &mut ctx.accounts.profile;
        p.authority         = *ctx.accounts.user.key;
        p.username          = username;
        p.bio               = bio;
        p.skills            = skills;
        p.contact           = contact;
        p.tasks_completed   = 0;
        p.tasks_created     = 0;
        p.reputation        = 0;
        p.total_rating      = 0;   // ✅ nuevo
        p.rating_count      = 0;   // ✅ nuevo
        Ok(())
    }

    pub fn update_profile(
        ctx: Context<UpdateProfile>,
        username: String,
        bio: String,
        skills: String,
        contact: String,
    ) -> Result<()> {
        require!(username.len() <= MAX_USERNAME,    CustomError::StringTooLong);
        require!(bio.len()      <= MAX_BIO,         CustomError::StringTooLong);
        require!(skills.len()   <= MAX_SKILLS,      CustomError::StringTooLong);
        require!(contact.len()  <= MAX_CONTACT,     CustomError::StringTooLong);

        let p = &mut ctx.accounts.profile;
        p.username = username;
        p.bio      = bio;
        p.skills   = skills;
        p.contact  = contact;
        Ok(())
    }

    pub fn init_vault(ctx: Context<InitVault>) -> Result<()> {
        msg!("Vault: {}", ctx.accounts.vault.key());
        Ok(())
    }

    pub fn create_task(
        ctx: Context<CreateTask>,
        amount: u64,
        title: String,
        description: String,
        category: String,
        deadline: i64,
    ) -> Result<()> {
        require!(title.len()       <= MAX_TITLE,       CustomError::StringTooLong);
        require!(description.len() <= MAX_DESCRIPTION, CustomError::StringTooLong);
        require!(category.len()    <= MAX_CATEGORY,    CustomError::StringTooLong);
        require!(amount > 0,                           CustomError::InvalidAmount);

        let task    = &mut ctx.accounts.task;
        let profile = &mut ctx.accounts.profile;

        task.creator      = *ctx.accounts.creator.key;
        task.worker       = Pubkey::default();
        task.amount       = amount;
        task.title        = title;
        task.description  = description;
        task.category     = category;
        task.deadline     = deadline;
        task.delivery_url = String::new();
        task.error_note   = String::new();
        task.status       = TaskStatus::Open;
        task.bump         = ctx.bumps.task;
        task.vault_bump   = ctx.bumps.vault;
        task.task_id      = profile.tasks_created;

        profile.tasks_created += 1;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.creator.to_account_info(),
                    to:   ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn accept_task(ctx: Context<AcceptTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Open,           CustomError::InvalidStatus);
        require!(task.creator != ctx.accounts.worker.key(), CustomError::Unauthorized);

        task.worker = *ctx.accounts.worker.key;
        task.status = TaskStatus::InProgress;
        Ok(())
    }

    pub fn submit_delivery(ctx: Context<SubmitDelivery>, delivery_url: String) -> Result<()> {
        require!(delivery_url.len() <= MAX_DELIVERY, CustomError::StringTooLong);
        let task = &mut ctx.accounts.task;
        require!(
            task.status == TaskStatus::InProgress || task.status == TaskStatus::Disputed,
            CustomError::InvalidStatus
        );
        require!(task.worker == *ctx.accounts.worker.key, CustomError::Unauthorized);

        task.delivery_url = delivery_url;
        task.status       = TaskStatus::Submitted;
        task.error_note   = String::new();
        Ok(())
    }

    /// Aprueba la entrega, libera pago y registra rating (1-5)
    pub fn approve_and_pay(ctx: Context<ApproveAndPay>, rating: u8) -> Result<()> {
        require!(rating >= 1 && rating <= 5, CustomError::InvalidRating); // ✅ nuevo

        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Submitted,      CustomError::InvalidStatus);
        require!(task.creator == *ctx.accounts.creator.key, CustomError::Unauthorized);
        require!(task.worker  == ctx.accounts.worker.key(), CustomError::Unauthorized);

        let amount     = task.amount;
        let seeds      = &[b"vault", task.creator.as_ref(), &[task.vault_bump]];
        let signer     = &[&seeds[..]];

        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to:   ctx.accounts.worker.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        task.status = TaskStatus::Paid;

        // Actualizar perfil del worker con rating ✅
        let wp = &mut ctx.accounts.worker_profile;
        wp.tasks_completed += 1;
        wp.reputation      += 10;
        wp.total_rating    += rating as u64;
        wp.rating_count    += 1;

        Ok(())
    }

    pub fn report_error(ctx: Context<ReportError>, note: String) -> Result<()> {
        require!(note.len() <= MAX_NOTE, CustomError::StringTooLong);
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Submitted,      CustomError::InvalidStatus);
        require!(task.creator == *ctx.accounts.creator.key, CustomError::Unauthorized);

        task.error_note = note;
        task.status     = TaskStatus::Disputed;
        Ok(())
    }

    pub fn cancel_task(ctx: Context<CancelTask>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Open,           CustomError::InvalidStatus);
        require!(task.creator == *ctx.accounts.creator.key, CustomError::Unauthorized);

        let amount = task.amount;
        let seeds  = &[b"vault", task.creator.as_ref(), &[task.vault_bump]];
        let signer = &[&seeds[..]];

        system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to:   ctx.accounts.creator.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        task.status = TaskStatus::Cancelled;
        Ok(())
    }
}

// ── ACCOUNT STRUCTS ───────────────────────────────────────────

#[account]
pub struct UserProfile {
    pub authority:       Pubkey,   // 32
    pub username:        String,   // 4+50
    pub bio:             String,   // 4+200
    pub skills:          String,   // 4+100
    pub contact:         String,   // 4+100
    pub tasks_created:   u64,      // 8
    pub tasks_completed: u64,      // 8
    pub reputation:      u64,      // 8
    pub total_rating:    u64,      // 8  ✅ suma de todos los ratings recibidos
    pub rating_count:    u64,      // 8  ✅ cuántos ratings recibió
}
// space = 8 + 32 + 54 + 204 + 104 + 104 + 8+8+8+8+8 = 546
const PROFILE_SPACE: usize = 8 + 32 + 54 + 204 + 104 + 104 + 8 + 8 + 8 + 8 + 8;

#[account]
pub struct Task {
    pub creator:      Pubkey,     // 32
    pub worker:       Pubkey,     // 32
    pub amount:       u64,        // 8
    pub title:        String,     // 4+100
    pub description:  String,     // 4+500
    pub category:     String,     // 4+50
    pub deadline:     i64,        // 8
    pub delivery_url: String,     // 4+200
    pub error_note:   String,     // 4+200
    pub status:       TaskStatus, // 2
    pub bump:         u8,         // 1
    pub vault_bump:   u8,         // 1
    pub task_id:      u64,        // 8
}
// space = 8 + 32+32+8 + 104+504+54+8+204+204 + 2+1+1+8 = 1174
const TASK_SPACE: usize = 8 + 32 + 32 + 8 + 104 + 504 + 54 + 8 + 204 + 204 + 2 + 1 + 1 + 8;

// ── CONTEXT STRUCTS ───────────────────────────────────────────

#[derive(Accounts)]
pub struct InitVault<'info> {
    /// CHECK: PDA vault validada con seeds
    #[account(mut, seeds = [b"vault", user.key().as_ref()], bump)]
    pub vault: UncheckedAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitProfile<'info> {
    #[account(init, payer = user, space = PROFILE_SPACE, seeds = [b"profile", user.key().as_ref()], bump)]
    pub profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProfile<'info> {
    #[account(
        mut,
        seeds = [b"profile", user.key().as_ref()],
        bump,
        constraint = profile.authority == user.key() @ CustomError::Unauthorized
    )]
    pub profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(
        init, payer = creator, space = TASK_SPACE,
        seeds = [b"task", creator.key().as_ref(), &profile.tasks_created.to_le_bytes()],
        bump
    )]
    pub task: Account<'info, Task>,
    #[account(mut, seeds = [b"profile", creator.key().as_ref()], bump)]
    pub profile: Account<'info, UserProfile>,
    /// CHECK: PDA vault validada con seeds
    #[account(mut, seeds = [b"vault", creator.key().as_ref()], bump)]
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
pub struct SubmitDelivery<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub worker: Signer<'info>,
}

#[derive(Accounts)]
pub struct ApproveAndPay<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut)]
    pub worker: SystemAccount<'info>,
    #[account(mut, seeds = [b"profile", worker.key().as_ref()], bump)]
    pub worker_profile: Account<'info, UserProfile>,
    /// CHECK: PDA vault validada con seeds y bump guardado en task
    #[account(mut, seeds = [b"vault", task.creator.as_ref()], bump = task.vault_bump)]
    pub vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReportError<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub creator: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelTask<'info> {
    #[account(mut)]
    pub task: Account<'info, Task>,
    #[account(mut)]
    pub creator: Signer<'info>,
    /// CHECK: PDA vault validada con seeds y bump guardado en task
    #[account(mut, seeds = [b"vault", task.creator.as_ref()], bump = task.vault_bump)]
    pub vault: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

// ── ERRORS ────────────────────────────────────────────────────

#[error_code]
pub enum CustomError {
    #[msg("Not authorized")]
    Unauthorized,
    #[msg("Invalid task status for this action")]
    InvalidStatus,
    #[msg("String exceeds maximum allowed length")]
    StringTooLong,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
}