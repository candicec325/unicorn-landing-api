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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CloudflareService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const axios_1 = __importDefault(require("axios"));
let CloudflareService = CloudflareService_1 = class CloudflareService {
    logger = new common_1.Logger(CloudflareService_1.name);
    sightengineUser = process.env.SIGHTENGINE_API_USER;
    sightengineSecret = process.env.SIGHTENGINE_API_KEY;
    s3Client;
    bucketName;
    publicDomain;
    constructor() {
        this.bucketName = process.env.CLOUDFLARE_BUCKET_NAME;
        this.publicDomain = process.env.CLOUDFLARE_PUBLIC_DOMAIN;
        this.s3Client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: process.env.CLOUDFLARE_BUCKET_URL,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_KEY,
            },
        });
    }
    async moderateImage(buffer, filename) {
        if (!this.sightengineUser || !this.sightengineSecret) {
            this.logger.warn('Sightengine API credentials not configured, skipping moderation');
            return;
        }
        try {
            const FormData = require('form-data');
            const data = new FormData();
            data.append('media', buffer, { filename });
            data.append('models', 'nudity-2.1,weapon,recreational_drug,offensive-2.0,gore-2.0,violence,self-harm');
            data.append('api_user', this.sightengineUser);
            data.append('api_secret', this.sightengineSecret);
            const response = await (0, axios_1.default)({
                method: 'post',
                url: 'https://api.sightengine.com/1.0/check.json',
                data: data,
                headers: data.getHeaders(),
                timeout: 30000,
            });
            const result = response.data;
            console.log({ result: JSON.stringify(result, null, 2) });
            if (result.nudity?.sexual_activity > 0.3 || result.nudity?.sexual_display > 0.3) {
                throw new common_1.BadRequestException('Image contains explicit sexual content and cannot be uploaded');
            }
            const suggestiveClasses = result.nudity?.suggestive_classes || {};
            if (suggestiveClasses.visibly_undressed > 0.8) {
                throw new common_1.BadRequestException('Image contains nudity and cannot be uploaded');
            }
            if (suggestiveClasses.sextoy > 0.5) {
                throw new common_1.BadRequestException('Image contains sexual content and cannot be uploaded');
            }
            if (result.nudity?.erotica > 0.95 &&
                result.nudity?.very_suggestive > 0.95 &&
                suggestiveClasses.lingerie > 0.005 &&
                result.nudity?.none < 0.05) {
                throw new common_1.BadRequestException('Image shows nudity through clothing and cannot be uploaded');
            }
            if (result.nudity?.very_suggestive > 0.98 &&
                result.nudity?.none < 0.02) {
                throw new common_1.BadRequestException('Image contains visible nudity and cannot be uploaded');
            }
            if (suggestiveClasses.nudity_art > 0.5) {
                throw new common_1.BadRequestException('Image contains nudity and cannot be uploaded');
            }
            if (result.weapon?.classes?.firearm > 0.5 ||
                result.weapon?.classes?.knife > 0.5 ||
                result.violence?.prob > 0.7) {
                throw new common_1.BadRequestException('Image contains violent content and cannot be uploaded');
            }
            if (result.gore?.prob > 0.7) {
                throw new common_1.BadRequestException('Image contains graphic content and cannot be uploaded');
            }
            if (result['self-harm']?.prob > 0.7) {
                throw new common_1.BadRequestException('Image contains self-harm content and cannot be uploaded');
            }
            if (result.faces?.some(face => face.minor > 0.6)) {
                throw new common_1.BadRequestException('Image may contain minors and cannot be uploaded to this platform');
            }
            if (result.recreational_drug?.classes?.recreational_drugs_not_cannabis > 0.8) {
                throw new common_1.BadRequestException('Image contains illegal drug content and cannot be uploaded');
            }
            const offensive = result.offensive || {};
            if (offensive.nazi > 0.3 || offensive.supremacist > 0.3 ||
                offensive.terrorist > 0.3 || offensive.confederate > 0.5) {
                throw new common_1.BadRequestException('Image contains hate symbols and cannot be uploaded');
            }
            this.logger.log(`Image moderation passed for ${filename}`);
        }
        catch (error) {
            console.error(error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Moderation failed for ${filename}:`, error.message);
            throw new common_1.BadRequestException('Image moderation failed, please try again');
        }
    }
    async uploadFile(key, buffer, contentType) {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: contentType,
                CacheControl: 'public, max-age=31536000',
            });
            await this.s3Client.send(command);
            this.logger.log(`File uploaded: ${key}`);
            return this.getPublicUrl(key);
        }
        catch (error) {
            this.logger.error(`Failed to upload file ${key}:`, error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
    async uploadFileWithModeration(key, buffer, contentType, filename) {
        await this.moderateImage(buffer, filename);
        return this.uploadFile(key, buffer, contentType);
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            this.logger.log(`File deleted: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file ${key}:`, error);
            throw new Error(`Delete failed: ${error.message}`);
        }
    }
    async listFiles(prefix, maxKeys = 100) {
        try {
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });
            const response = await this.s3Client.send(command);
            return response.Contents?.map(item => ({
                key: item.Key,
                size: item.Size,
                lastModified: item.LastModified,
                url: this.getPublicUrl(item.Key),
            })) || [];
        }
        catch (error) {
            this.logger.error(`Failed to list files:`, error);
            throw new Error(`List files failed: ${error.message}`);
        }
    }
    getPublicUrl(key) {
        if (this.publicDomain) {
            return `https://${this.publicDomain}/${key}`;
        }
        return `https://pub-${this.extractAccountHash()}.r2.dev/${key}`;
    }
    generateAvatarKey(userId, originalName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
        return `avatars/${userId}/${timestamp}-${randomString}.${extension}`;
    }
    generateMessageMediaKey(conversationId, userId, originalName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
        return `message-media/${conversationId}/${userId}/${timestamp}-${randomString}.${extension}`;
    }
    generateProfileImageKey(userId, originalName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
        return `profile-image/${userId}/${timestamp}-${randomString}.${extension}`;
    }
    generatePlatformMediaKey(originalName) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
        const baseName = originalName.replace(/\.[^/.]+$/, '');
        return `uploads/${baseName}-${timestamp}-${randomString}.${extension}`;
    }
    async getBucketsCommand() {
        try {
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: this.bucketName,
                MaxKeys: 5,
            });
            const response = await this.s3Client.send(command);
            return {
                success: true,
                bucketName: this.bucketName,
                objectCount: response.KeyCount,
                objects: response.Contents?.slice(0, 5).map(item => ({
                    key: item.Key,
                    size: item.Size,
                    lastModified: item.LastModified,
                })),
            };
        }
        catch (error) {
            this.logger.error('Failed to list bucket contents:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    extractAccountHash() {
        const url = process.env.CLOUDFLARE_BUCKET_URL;
        return url.split('.')[0].split('//')[1];
    }
};
exports.CloudflareService = CloudflareService;
exports.CloudflareService = CloudflareService = CloudflareService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudflareService);
//# sourceMappingURL=cloudflare.service.js.map