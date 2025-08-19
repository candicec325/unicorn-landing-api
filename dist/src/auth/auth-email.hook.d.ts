import { EmailService } from '../email/email.service';
export declare class AuthEmailHook {
    private readonly emailService;
    constructor(emailService: EmailService);
    handleSignInEmail(ctx: any): Promise<void>;
    handlePasswordReset(ctx: any): Promise<void>;
    handleEmailVerification(ctx: any): Promise<void>;
    handlePasswordResetRequest(ctx: any): Promise<void>;
}
//# sourceMappingURL=auth-email.hook.d.ts.map