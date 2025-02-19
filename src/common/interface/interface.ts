export interface JwtPayload {
  email: string;
  sub: number; 
}

export interface FastifyFileUpload {
    filename: string;
    mimetype: string;
    buffer: Buffer;
    encoding: string;
    fieldname: string;
  }

