import { ResendService } from "nestjs-resend";
import { PasswordResetProps, VerificationEmailProps } from "./types";
export declare class EmailService {
    private readonly resendService;
    constructor(resendService: ResendService);
    sendEmail(): Promise<void>;
    sendBatchEmail(): Promise<void>;
    sendPasswordResetEmail(emailProps: PasswordResetProps): Promise<void>;
    sendVerificationEmail(emailProps: VerificationEmailProps): Promise<void>;
}
//# sourceMappingURL=email.service.d.ts.map