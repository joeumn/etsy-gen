export class PrismaClientKnownRequestError extends Error {
  code: string;
  constructor(message: string, options: { code: string }) {
    super(message);
    this.code = options.code;
  }
}
