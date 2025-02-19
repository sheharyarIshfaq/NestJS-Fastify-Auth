import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Type, mixin } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';

export interface FastifyMultipartFile {
  filename: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
}

export function FastifyFileInterceptor(fieldName: string): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const req = context.switchToHttp().getRequest<FastifyRequest>();
      
      try {
        const data = await req.file();
        if (!data) {
          throw new Error('No file uploaded');
        }

        const file: FastifyMultipartFile = {
          filename: data.filename,
          encoding: data.encoding,
          mimetype: data.mimetype,
          buffer: await data.toBuffer()
        };

        req['uploadedFile'] = file;
        return next.handle();
      } catch (err) {
        throw new Error(`File upload failed: ${err.message}`);
      }
    }
  }

  return mixin(MixinInterceptor);
}