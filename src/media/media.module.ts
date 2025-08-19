import {Module} from '@nestjs/common';
import {MediaService} from './media.service';
import {MediaController} from './media.controller';
import {CloudflareService} from './cloudflare.service';

@Module({
    controllers: [MediaController],
    providers: [MediaService, CloudflareService],
    exports: [CloudflareService],
})
export class MediaModule {
}
