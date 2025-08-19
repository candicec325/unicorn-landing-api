// src/media/media.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CloudflareService } from './cloudflare.service';

@Controller('media')
export class MediaController {
  constructor(
      private readonly mediaService: MediaService,
      private readonly cloudflareService: CloudflareService,
  ) {}

  @Post('/upload/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
      @UploadedFile() file: Express.Multer.File,
      @Body('userId') userId: string,
  ): Promise<any> {
    this.validateImageFile(file);
    this.validateUserId(userId);

    try {
      const key = this.cloudflareService.generateAvatarKey(userId, file.originalname);
      const url = await this.cloudflareService.uploadFileWithModeration(
          key,
          file.buffer,
          file.mimetype,
          file.originalname,
      );

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
    } catch (error) {
      throw new BadRequestException(`Avatar upload failed: ${error.message}`);
    }
  }

  @Post('/upload/message-media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMessageMedia(
      @UploadedFile() file: Express.Multer.File,
      @Body('conversationId') conversationId: string,
      @Body('userId') userId: string,
  ): Promise<any> {
    this.validateImageFile(file);
    this.validateUserId(userId);

    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    try {
      const key = this.cloudflareService.generateMessageMediaKey(
          conversationId,
          userId,
          file.originalname,
      );
      const url = await this.cloudflareService.uploadFile(
          key,
          file.buffer,
          file.mimetype,
      );

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
    } catch (error) {
      throw new BadRequestException(`Message media upload failed: ${error.message}`);
    }
  }

  @Post('/upload/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
      @UploadedFile() file: Express.Multer.File,
      @Body('userId') userId: string,
  ): Promise<any> {
    this.validateImageFile(file);
    this.validateUserId(userId);

    try {
      const key = this.cloudflareService.generateProfileImageKey(userId, file.originalname);
      const url = await this.cloudflareService.uploadFileWithModeration(
          key,
          file.buffer,
          file.mimetype,
          file.originalname,
      );

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
    } catch (error) {
      throw new BadRequestException(`Profile image upload failed: ${error.message}`);
    }
  }

  @Post('/upload/platform-media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlatformMedia(
      @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    this.validateImageFile(file);

    try {
      const key = this.cloudflareService.generatePlatformMediaKey(file.originalname);
      const url = await this.cloudflareService.uploadFile(
          key,
          file.buffer,
          file.mimetype,
      );

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
    } catch (error) {
      throw new BadRequestException(`Platform media upload failed: ${error.message}`);
    }
  }

  @Delete('/delete/:encodedKey')
  async deleteImage(@Param('encodedKey') encodedKey: string) {
    try {
      // Decode the key in case it's URL encoded
      const key = decodeURIComponent(encodedKey);
      await this.cloudflareService.deleteFile(key);

      return {
        success: true,
        message: 'Image deleted successfully',
        key,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  @Get('/list/:folder')
  async listImages(@Param('folder') folder: string) {
    try {
      const validFolders = ['avatars', 'message-media', 'profile-image', 'uploads'];
      if (!validFolders.includes(folder)) {
        throw new BadRequestException(`Invalid folder. Must be one of: ${validFolders.join(', ')}`);
      }

      const files = await this.cloudflareService.listFiles(`${folder}/`);
      return {
        success: true,
        data: files,
        folder,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to list files: ${error.message}`);
    }
  }

  @Get('/debugS3')
  async debugS3(): Promise<any> {
    try {
      return await this.cloudflareService.getBucketsCommand();
    } catch (error) {
      return {
        error: error.message,
        success: false,
      };
    }
  }

  private validateImageFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Only allow images
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      );
    }

    // 10MB limit for social media images
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 10MB.');
    }
  }

  private validateUserId(userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
  }
}