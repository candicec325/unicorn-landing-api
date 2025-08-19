export interface BaseEmailProps {
    to: string;
    from?: string;
}
export interface WelcomeEmailProps extends BaseEmailProps {
    userName: string;
    loginUrl: string;
}
export interface PasswordResetProps extends BaseEmailProps {
    resetLink: string;
    token: string;
}
export interface AdminEmailProps extends BaseEmailProps {
    htmlContent: string;
    adminName: string;
}
export interface BroadcastEmailProps extends Omit<BaseEmailProps, 'to'> {
    recipients: string[];
    htmlContent: string;
    adminName: string;
}
export interface VerificationEmailProps extends BaseEmailProps {
    verificationUrl: string;
    token: string;
}
//# sourceMappingURL=types.d.ts.map