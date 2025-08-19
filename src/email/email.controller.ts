import {Body, Controller, Post} from '@nestjs/common';
import {EmailService} from "./email.service";

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @Post('/support')
    async sendEmailToSupport(@Body('email') body: string, @Body('subject') subject: string){
        // send email to support inbox and have a replyto set to the userEmail for easy communication
    }

    @Post('/send-to-user')
    async sendEmailToUser(@Body('email') body: string, @Body('subject') subject: string){}

    @Post("/send-broadcast")
    async sendBroadcast(@Body('emails') body: string, @Body('subject') subject: string){}

}
