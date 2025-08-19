import { MediaService } from './media.service';
import { CloudflareService } from './cloudflare.service';
export declare class MediaController {
    private readonly mediaService;
    private readonly cloudflareService;
    constructor(mediaService: MediaService, cloudflareService: CloudflareService);
    uploadAvatar(file: Express.Multer.File, userId: string): Promise<any>;
    uploadMessageMedia(file: Express.Multer.File, conversationId: string, userId: string): Promise<any>;
    uploadProfileImage(file: Express.Multer.File, userId: string): Promise<any>;
    uploadPlatformMedia(file: Express.Multer.File): Promise<any>;
    deleteImage(encodedKey: string): Promise<{
        success: boolean;
        message: string;
        key: string;
    }>;
    listImages(folder: string): Promise<{
        success: boolean;
        data: {
            key: string;
            size: number;
            lastModified: Date;
            url: string;
        }[];
        folder: string;
    }>;
    debugS3(): Promise<any>;
    private validateImageFile;
    private validateUserId;
}
//# sourceMappingURL=media.controller.d.ts.map