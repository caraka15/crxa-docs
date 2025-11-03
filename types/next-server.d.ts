declare module 'next/server' {
  export class NextResponse extends Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
    static next(init?: ResponseInit): NextResponse;
    static redirect(input: string | URL, init?: number | ResponseInit): NextResponse;
    static rewrite(input: string | URL, init?: ResponseInit): NextResponse;
    static json(data: unknown, init?: ResponseInit): NextResponse;
  }

  export interface NextRequest extends Request {
    readonly nextUrl: URL;
    ip?: string;
    geo?: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
  }
}
