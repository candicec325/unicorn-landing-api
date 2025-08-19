// src/media/cloudflare.service.ts
import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import axios from 'axios';

@Injectable()
export class CloudflareService {
  private readonly logger = new Logger(CloudflareService.name);
  private readonly sightengineUser = process.env.SIGHTENGINE_API_USER;
  private readonly sightengineSecret = process.env.SIGHTENGINE_API_KEY;
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicDomain: string;

  constructor() {
    this.bucketName = process.env.CLOUDFLARE_BUCKET_NAME;
    this.publicDomain = process.env.CLOUDFLARE_PUBLIC_DOMAIN;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_BUCKET_URL,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });
  }

  /**
   * Moderate image before upload
   */
  async moderateImage(buffer: Buffer, filename: string): Promise<void> {
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

      const response = await axios({
        method: 'post',
        url: 'https://api.sightengine.com/1.0/check.json',
        data: data,
        headers: data.getHeaders(),
        timeout: 30000, // 30 second timeout
      });

      const result = response.data;
      console.log({result: JSON.stringify(result, null, 2)});

      // BLOCK: Explicit sexual activity (very strict)
      if (result.nudity?.sexual_activity > 0.3 || result.nudity?.sexual_display > 0.3) {
        throw new BadRequestException('Image contains explicit sexual content and cannot be uploaded');
      }

      // BLOCK: Full nudity detection through specific classes
      const suggestiveClasses = result.nudity?.suggestive_classes || {};

      // Block if showing actual nudity/genitals
      if (suggestiveClasses.visibly_undressed > 0.8) {
        throw new BadRequestException('Image contains nudity and cannot be uploaded');
      }

      // Block sex toys
      if (suggestiveClasses.sextoy > 0.5) {
        throw new BadRequestException('Image contains sexual content and cannot be uploaded');
      }

      // ENHANCED: Catch see-through/transparent clothing showing nudity
      // This is the key addition for your lingerie case
      if (result.nudity?.erotica > 0.95 &&
          result.nudity?.very_suggestive > 0.95 &&
          suggestiveClasses.lingerie > 0.005 &&
          result.nudity?.none < 0.05) {
        throw new BadRequestException('Image shows nudity through clothing and cannot be uploaded');
      }

      // ENHANCED: Catch high suggestive + low "none" score (indicates visible body parts)
      if (result.nudity?.very_suggestive > 0.98 &&
          result.nudity?.none < 0.02) {
        throw new BadRequestException('Image contains visible nudity and cannot be uploaded');
      }

      // BLOCK: Art/drawings of nudity that might slip through
      if (suggestiveClasses.nudity_art > 0.5) {
        throw new BadRequestException('Image contains nudity and cannot be uploaded');
      }

      // BLOCK: Violence and weapons (keep strict)
      if (result.weapon?.classes?.firearm > 0.5 ||
          result.weapon?.classes?.knife > 0.5 ||
          result.violence?.prob > 0.7) {
        throw new BadRequestException('Image contains violent content and cannot be uploaded');
      }

      // BLOCK: Gore and graphic content
      if (result.gore?.prob > 0.7) {
        throw new BadRequestException('Image contains graphic content and cannot be uploaded');
      }

      // BLOCK: Self-harm
      if (result['self-harm']?.prob > 0.7) {
        throw new BadRequestException('Image contains self-harm content and cannot be uploaded');
      }

      // BLOCK: Minors (very important for adult platforms)
      if (result.faces?.some(face => face.minor > 0.6)) {
        throw new BadRequestException('Image may contain minors and cannot be uploaded to this platform');
      }

      // ALLOW: Recreational drugs (many lifestyle events may have social drinking/cannabis)
      // Only block hard drugs or obvious drug dealing
      if (result.recreational_drug?.classes?.recreational_drugs_not_cannabis > 0.8) {
        throw new BadRequestException('Image contains illegal drug content and cannot be uploaded');
      }

      // BLOCK: Hate symbols and offensive gestures
      const offensive = result.offensive || {};
      if (offensive.nazi > 0.3 || offensive.supremacist > 0.3 ||
          offensive.terrorist > 0.3 || offensive.confederate > 0.5) {
        throw new BadRequestException('Image contains hate symbols and cannot be uploaded');
      }

      this.logger.log(`Image moderation passed for ${filename}`);

    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) {
        throw error; // Re-throw our custom errors
      }

      this.logger.error(`Moderation failed for ${filename}:`, error.message);

      // In production, you might want to fail-safe (allow upload if moderation fails)
      // For now, we'll be strict and reject if moderation fails
      throw new BadRequestException('Image moderation failed, please try again');
    }
  }

  /**
   * Upload a file and return public URL
   */
  async uploadFile(
      key: string,
      buffer: Buffer,
      contentType: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000', // 1 year cache for images
      });

      await this.s3Client.send(command);
      this.logger.log(`File uploaded: ${key}`);

      return this.getPublicUrl(key);
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Upload a file with pre-upload moderation
   */
  async uploadFileWithModeration(
      key: string,
      buffer: Buffer,
      contentType: string,
      filename: string,
  ): Promise<string> {
    // Moderate the image first
    await this.moderateImage(buffer, filename);

    // If moderation passes, proceed with upload
    return this.uploadFile(key, buffer, contentType);
  }

  /**
   * Delete a file
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(prefix?: string, maxKeys: number = 100) {
    try {
      const command = new ListObjectsV2Command({
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
    } catch (error) {
      this.logger.error(`Failed to list files:`, error);
      throw new Error(`List files failed: ${error.message}`);
    }
  }

  /**
   * Generate public URL - works immediately after upload
   */
  getPublicUrl(key: string): string {
    // Use custom domain if configured (recommended for production)
    if (this.publicDomain) {
      return `https://${this.publicDomain}/${key}`;
    }

    // Use R2.dev subdomain (auto-generated public URL)
    return `https://pub-${this.extractAccountHash()}.r2.dev/${key}`;
  }

  /**
   * Generate avatar key: /avatars/:userId/avatar.jpg
   */
  generateAvatarKey(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `avatars/${userId}/${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Generate message media key: /message-media/:conversationId/:userId/upload.jpg
   */
  generateMessageMediaKey(conversationId: string, userId: string, originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `message-media/${conversationId}/${userId}/${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Generate profile image key: /profile-image/:userId/profile.jpg
   */
  generateProfileImageKey(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `profile-image/${userId}/${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Generate platform media key: /uploads/upload.jpg
   */
  generatePlatformMediaKey(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    return `uploads/${baseName}-${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Debug method to test bucket access
   */
  async getBucketsCommand() {
    try {
      const command = new ListObjectsV2Command({
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
    } catch (error) {
      this.logger.error('Failed to list bucket contents:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private extractAccountHash(): string {
    // Extract the account hash from the endpoint URL
    const url = process.env.CLOUDFLARE_BUCKET_URL;
    return url.split('.')[0].split('//')[1];
  }
}