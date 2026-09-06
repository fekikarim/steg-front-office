import {NextRequest, NextResponse} from 'next/server';
import {ApiError} from '@/lib/api-client';
import {loginBackend} from '@/lib/api/auth';
import {setSessionCookies} from '@/lib/cookies';

function errorJson(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      {message: err.message, fieldErrors: err.fieldErrors, traceId: err.traceId},
      {status: err.status === 0 ? 502 : err.status},
    );
  }
  return NextResponse.json({message: 'Unexpected error.'}, {status: 500});
}

/** Thin token-exchange proxy: backend JWTs land in httpOnly cookies, never in the response body. */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {email?: string; password?: string};
    if (!body.email || !body.password) {
      return NextResponse.json({message: 'Email and password are required.'}, {status: 400});
    }
    const auth = await loginBackend({email: body.email, password: body.password});
    if (!auth.accessToken || !auth.refreshToken) {
      return NextResponse.json({message: 'Unexpected error.'}, {status: 502});
    }
    await setSessionCookies(auth.accessToken, auth.refreshToken);
    return NextResponse.json({ok: true});
  } catch (err) {
    return errorJson(err);
  }
}
