import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { FastifyFileUpload } from 'src/common/interface/interface';
  
  @Injectable()
  export class StorageService {
    private storage: Storage;
    private bucket: string;
  
    constructor() {
  
      this.storage = new Storage({
        projectId: process.env.PROJECT_ID,
        keyFilename: process.env.KEY_FILENAME,
      });
  
      this.bucket = process.env.BUCKET;
    }
  
    async uploadFile(
      file: FastifyFileUpload,
      folder: string = 'uploads',
    ): Promise<string> {
      try {
        const bucket = this.storage.bucket(this.bucket);
        const fileName = `${folder}/${Date.now()}-${file.filename}`;
        const blob = bucket.file(fileName);
  
        const stream = blob.createWriteStream({
          resumable: false,
          gzip: true,
          metadata: {
            contentType: file.mimetype,
          },
        });
  
        return new Promise((resolve, reject) => {
          stream.on('error', (err) => {
            reject(err);
          });
  
          stream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${this.bucket}/${fileName}`;
            resolve(publicUrl);
          });
  
          stream.end(file.buffer);
        });
      } catch (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
      }
    }
  
    async deleteFile(fileName: string): Promise<void> {
      try {
        const bucket = this.storage.bucket(this.bucket);
        await bucket.file(fileName).delete();
      } catch (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    }
  
    async getSignedUrl(fileName: string, expires: number = 3600): Promise<string> {
      try {
        const bucket = this.storage.bucket(this.bucket);
        const [url] = await bucket.file(fileName).getSignedUrl({
          action: 'read',
          expires: Date.now() + expires * 1000, // 1 hour
        });
        return url;
      } catch (error) {
        throw new Error(`Failed to get signed URL: ${error.message}`);
      }
    }
  }