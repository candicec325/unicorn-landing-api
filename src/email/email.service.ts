import {Injectable} from '@nestjs/common';
import {ResendService} from "nestjs-resend";
import {BaseEmailProps, PasswordResetProps, VerificationEmailProps} from "./types";

@Injectable()
export class EmailService {
    constructor(private readonly resendService: ResendService) {
    }

    async sendEmail() {
    }

    // we may want to use a worker/queue here for batching
    //resend batch emails have size * time limits
    async sendBatchEmail() {
    }

    async sendPasswordResetEmail(emailProps: PasswordResetProps) {
    }

    async sendVerificationEmail(emailProps: VerificationEmailProps) {
    }

    // async sendWelcomeEmail(emailProps: EmailProps) {
    // }
    //
    // async sendEmailToSupport(emailProps: EmailProps) {
    //     // send email to support inbox and have a replyto set to the userEmail for easy communication
    // }
    //
    // async sendEmailToUser(emailProps: EmailProps) {
    //     // send email to user with a replyto set to the userEmail for easy communication
    // }
    //
    // async sendBroadcastEmail(emailProps: EmailProps[]) {
    //     // send email to multiple users with a replyto set to the userEmail for easy communication
    // }
    //
    // async sendEmailToAdmin(emailProps: EmailProps) {
    //     // send email to admin with a replyto set to the userEmail for easy communication
    // }


}
