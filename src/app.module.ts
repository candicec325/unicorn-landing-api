import {Module} from '@nestjs/common';
import {auth} from './auth';

import {AppService} from './app.service';
import {AppController} from './app.controller';

import {AuthModule} from '@thallesp/nestjs-better-auth';
import {AuthEmailHook} from './auth/auth-email.hook';

import {EventsModule} from './events/events.module';
import {EventsController} from './events/events.controller';

import {ClubsService} from './clubs/clubs.service';
import {ClubsModule} from './clubs/clubs.module';
import {ClubsController} from './clubs/clubs.controller';

import {EmailModule} from './email/email.module';
import {EmailController} from "./email/email.controller";
import {EmailService} from "./email/email.service";

import {MediaModule} from './media/media.module';
import {MediaController} from "./media/media.controller";
import {MediaService} from "./media/media.service";

@Module({
    imports: [
        AuthModule.forRoot(auth),
        MediaModule,
        EventsModule,
        ClubsModule,
        EmailModule,
    ],
    controllers: [
        AppController,
        EventsController,
        EmailController,
        ClubsController,
        MediaController
    ],
    providers: [
        AppService,
        ClubsService,
        AuthEmailHook,
        EmailService,
        MediaService
    ],
})
export class AppModule {
}
