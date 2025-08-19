import { EmailService } from "./email.service";
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmailToSupport(body: string, subject: string): Promise<void>;
    sendEmailToUser(body: string, subject: string): Promise<void>;
    sendBroadcast(body: string, subject: string): Promise<void>;
}
//# sourceMappingURL=email.controller.d.ts.map