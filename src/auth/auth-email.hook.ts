import {Injectable} from '@nestjs/common';
import {Hook, AfterHook} from '@thallesp/nestjs-better-auth';
import {EmailService} from '../email/email.service';

@Hook()
@Injectable()
export class AuthEmailHook {
    constructor(private readonly emailService: EmailService) {
    }

    @AfterHook('/sign-in/email')
    async handleSignInEmail(ctx: any) {
        // This runs after better-auth processes the email sign-in request
        console.log('Email sign-in hook triggered:', ctx);

        // Extract the necessary data from the context
        // You might need to inspect what's available in ctx
        // const {user} = ctx.body || ctx.context || ctx;
    }

    @AfterHook('/forget-password')
    async handlePasswordReset(ctx: any) {
        // This runs after better-auth processes the password reset request
        console.log('Password reset hook triggered:', ctx);

        // Extract the necessary data from the context
        // You might need to inspect what's available in ctx
        const {user, url, token} = ctx.body || ctx.context || ctx;

        if (user && user.email) {
            await this.emailService.sendPasswordResetEmail({
                to: user.email,
                resetLink: url,
                token,
                // other props from your EmailProps type
            });
        }
    }

    @AfterHook('/send-verification-email')
    async handleEmailVerification(ctx: any) {
        // This runs after better-auth processes the verification email request
        console.log('Email verification hook triggered:', ctx);

        const {user, url, token} = ctx.body || ctx.context || ctx;

        if (user && user.email) {
            await this.emailService.sendVerificationEmail({
                to: user.email,
                verificationUrl: url,
                token,
                // other props
            });
        }
    }

    // You can also use @BeforeHook if you need to intercept before processing
    @AfterHook('/request-password-reset')
    async handlePasswordResetRequest(ctx: any) {
        // Alternative hook for the newer endpoint name
        console.log('Password reset request hook triggered:', ctx);
        // Same logic as above
    }
}