import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private bucketName = process.env.R2_BUCKET_NAME || 'seunovocarro-media';

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Return public URL based on the public R2 domain
      const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-your-r2-domain.r2.dev';
      return `${publicDomain}/${fileName}`;
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new InternalServerErrorException('Falha ao fazer upload da imagem');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-your-r2-domain.r2.dev';
      const key = fileUrl.replace(`${publicDomain}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new InternalServerErrorException('Falha ao deletar a imagem');
    }
  }
}
