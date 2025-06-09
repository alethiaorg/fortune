import { Context } from 'hono';
import axios from 'axios';

interface FlareSolverrRequest {
  cmd: 'request.get' | 'request.post';
  url: string;
  maxTimeout?: number;
  headers?: Record<string, string>;
}

interface FlareSolverrResponse {
  status: string;
  message: string;
  solution: {
    url: string;
    status: number;
    headers: Record<string, string>;
    response: string;
    cookies: Array<{
      domain: string;
      httpOnly: boolean;
      name: string;
      path: string;
      sameSite: string;
      secure: boolean;
      value: string;
    }>;
    userAgent: string;
  };
}

// Get environment variables from context in Cloudflare Workers
function getEnvVar(c: Context | undefined, key: string, defaultValue: string): string {
  // In Cloudflare Workers, env vars are accessed via c.env
  if (c && c.env && c.env[key]) {
    return c.env[key] as string;
  }
  return defaultValue;
}

// We'll need to pass context to these functions
let context: Context | undefined;

export function setContext(c: Context) {
  context = c;
}

export async function fetchWithFlareSolverr(url: string, headers?: Record<string, string>): Promise<string> {
  const FLARESOLVERR_URL = getEnvVar(context, 'FLARESOLVERR_URL', 'https://flaresolverr.akasha-yuzu.dev/v1');
  
  try {
    const payload: FlareSolverrRequest = {
      cmd: 'request.get',
      url,
      maxTimeout: 60000, // 60 seconds timeout
      headers
    };

    const response = await axios.post<FlareSolverrResponse>(FLARESOLVERR_URL, payload);

    if (response.data.status !== 'ok') {
      throw new Error(`FlareSolverr error: ${response.data.message}`);
    }

    return response.data.solution.response;
  } catch (error) {
    console.error('FlareSolverr request failed:', error);
    throw error;
  }
}

// Fallback to direct request if FlareSolverr fails or is disabled
export async function fetchWithFallback(url: string, userAgent: string, c?: Context): Promise<string> {
  // Update context if provided
  if (c) {
    setContext(c);
  }
  
  const USE_FLARESOLVERR = getEnvVar(context, 'USE_FLARESOLVERR', 'false') === 'true';
  
  if (!USE_FLARESOLVERR) {
    // Direct request if FlareSolverr is disabled
    const response = await axios.get(url, {
      headers: { 'User-Agent': userAgent }
    });
    return response.data;
  }

  try {
    // First try with FlareSolverr
    return await fetchWithFlareSolverr(url, { 'User-Agent': userAgent });
  } catch (error) {
    console.warn('FlareSolverr failed, falling back to direct request:', error);
    
    // Fallback to direct axios request
    const response = await axios.get(url, {
      headers: { 'User-Agent': userAgent }
    });
    
    return response.data;
  }
}