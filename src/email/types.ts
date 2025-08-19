export interface BaseEmailProps {
    to: string;
    from?: string; // Optional, can have defaults per email type
}

// Specific email props
export interface WelcomeEmailProps extends BaseEmailProps {
    userName: string;
    loginUrl: string;
}

export interface PasswordResetProps extends BaseEmailProps {
    resetLink: string;
    token: string;
}

export interface AdminEmailProps extends BaseEmailProps {
    htmlContent: string; // From WYSIWYG
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