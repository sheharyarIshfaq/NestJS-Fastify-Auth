import { Controller, Post, Delete, Get, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FastifyFileInterceptor, FastifyMultipartFile } from './fastify-file.interceptor';
import { FastifyFileUpload } from 'src/common/interface/interface';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FastifyFileInterceptor('file'))
  async uploadFile(@UploadedFile() file: FastifyMultipartFile) {
    const fileUpload: FastifyFileUpload = {
      filename: file.filename,
      mimetype: file.mimetype,
      buffer: file.buffer,
      encoding: file.encoding,
      fieldname: 'file' 
    };
    return await this.storageService.uploadFile(fileUpload);
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    return await this.storageService.deleteFile(key);
  }

  @Get('signed-url')
  async getSignedUrl(
    @Query('key') key: string,
    @Query('expiry') expiry?: number
  ) {
    return await this.storageService.getSignedUrl(key, expiry);
  }
}