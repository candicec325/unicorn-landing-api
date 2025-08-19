export declare class CloudflareService {
    private readonly logger;
    private readonly sightengineUser;
    private readonly sightengineSecret;
    private readonly s3Client;
    private readonly bucketName;
    private readonly publicDomain;
    constructor();
    moderateImage(buffer: Buffer, filename: string): Promise<void>;
    uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string>;
    uploadFileWithModeration(key: string, buffer: Buffer, contentType: string, filename: string): Promise<string>;
    deleteFile(key: string): Promise<void>;
    listFiles(prefix?: string, maxKeys?: number): Promise<{
        key: string;
        size: number;
        lastModified: Date;
        url: string;
    }[]>;
    getPublicUrl(key: string): string;
    generateAvatarKey(userId: string, originalName: string): string;
    generateMessageMediaKey(conversationId: string, userId: string, originalName: string): string;
    generateProfileImageKey(userId: string, originalName: string): string;
    generatePlatformMediaKey(originalName: string): string;
    getBucketsCommand(): Promise<{
        success: boolean;
        bucketName: string;
        objectCount: number;
        objects: {
            key: string;
            size: number;
            lastModified: Date;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        bucketName?: undefined;
        objectCount?: undefined;
        objects?: undefined;
    }>;
    private extractAccountHash;
}
//# sourceMappingURL=cloudflare.service.d.ts.map