"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const media_service_1 = require("./media.service");
const cloudflare_service_1 = require("./cloudflare.service");
let MediaController = class MediaController {
    mediaService;
    cloudflareService;
    constructor(mediaService, cloudflareService) {
        this.mediaService = mediaService;
        this.cloudflareService = cloudflareService;
    }
    async uploadAvatar(file, userId) {
        this.validateImageFile(file);
        this.validateUserId(userId);
        try {
            const key = this.cloudflareService.generateAvatarKey(userId, file.originalname);
            const url = await this.cloudflareService.uploadFileWithModeration(key, file.buffer, file.mimetype, file.originalname);
            return {
                success: true,
                data: {
                    key,
                    url,
                    type: 'avatar',
                    userId,
                    moderated: true
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Avatar upload failed: ${error.message}`);
        }
    }
    async uploadMessageMedia(file, conversationId, userId) {
        this.validateImageFile(file);
        this.validateUserId(userId);
        if (!conversationId) {
            throw new common_1.BadRequestException('conversationId is required');
        }
        try {
            const key = this.cloudflareService.generateMessageMediaKey(conversationId, userId, file.originalname);
            const url = await this.cloudflareService.uploadFile(key, file.buffer, file.mimetype);
            return {
                success: true,
                data: {
                    key,
                    url,
                    type: 'message-media',
                    conversationId,
                    userId,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Message media upload failed: ${error.message}`);
        }
    }
    async uploadProfileImage(file, userId) {
        this.validateImageFile(file);
        this.validateUserId(userId);
        try {
            const key = this.cloudflareService.generateProfileImageKey(userId, file.originalname);
            const url = await this.cloudflareService.uploadFileWithModeration(key, file.buffer, file.mimetype, file.originalname);
            return {
                success: true,
                data: {
                    key,
                    url,
                    type: 'profile-image',
                    userId,
                    moderated: true
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Profile image upload failed: ${error.message}`);
        }
    }
    async uploadPlatformMedia(file) {
        this.validateImageFile(file);
        try {
            const key = this.cloudflareService.generatePlatformMediaKey(file.originalname);
            const url = await this.cloudflareService.uploadFile(key, file.buffer, file.mimetype);
            return {
                success: true,
                data: {
                    key,
                    url,
                    type: 'platform-media',
                    originalName: file.originalname,
                    size: file.size,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Platform media upload failed: ${error.message}`);
        }
    }
    async deleteImage(encodedKey) {
        try {
            const key = decodeURIComponent(encodedKey);
            await this.cloudflareService.deleteFile(key);
            return {
                success: true,
                message: 'Image deleted successfully',
                key,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to delete image: ${error.message}`);
        }
    }
    async listImages(folder) {
        try {
            const validFolders = ['avatars', 'message-media', 'profile-image', 'uploads'];
            if (!validFolders.includes(folder)) {
                throw new common_1.BadRequestException(`Invalid folder. Must be one of: ${validFolders.join(', ')}`);
            }
            const files = await this.cloudflareService.listFiles(`${folder}/`);
            return {
                success: true,
                data: files,
                folder,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to list files: ${error.message}`);
        }
    }
    async debugS3() {
        try {
            return await this.cloudflareService.getBucketsCommand();
        }
        catch (error) {
            return {
                error: error.message,
                success: false,
            };
        }
    }
    validateImageFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File too large. Maximum size is 10MB.');
        }
    }
    validateUserId(userId) {
        if (!userId) {
            throw new common_1.BadRequestException('userId is required');
        }
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('/upload/avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Post)('/upload/message-media'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('conversationId')),
    __param(2, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadMessageMedia", null);
__decorate([
    (0, common_1.Post)('/upload/profile-image'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadProfileImage", null);
__decorate([
    (0, common_1.Post)('/upload/platform-media'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "uploadPlatformMedia", null);
__decorate([
    (0, common_1.Delete)('/delete/:encodedKey'),
    __param(0, (0, common_1.Param)('encodedKey')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Get)('/list/:folder'),
    __param(0, (0, common_1.Param)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "listImages", null);
__decorate([
    (0, common_1.Get)('/debugS3'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "debugS3", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService,
        cloudflare_service_1.CloudflareService])
], MediaController);
//# sourceMappingURL=media.controller.js.map