import { NextRequest, NextResponse } from "next/server";

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

type Entry = {
  count: number;
  resetAt: number;
};

const STORE_KEY = "__nomade_rate_limit_store__";

function getStore(): Map<string, Entry> {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: Map<string, Entry>;
  };

  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, Entry>();
  }

  return g[STORE_KEY]!;
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

type RateLimitResult = {
  count: number;
  retryAfterSec: number;
};

async function runUpstashCommand(
  command: string,
  args: Array<string | number>
): Promise<number | null> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!baseUrl || !token) {
    return null;
  }

  const encodedArgs = args.map((arg) => encodeURIComponent(String(arg))).join("/");
  const commandPath = [command.toLowerCase(), encodedArgs].filter(Boolean).join("/");

  try {
    const response = await fetch(`${baseUrl}/${commandPath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { result?: unknown };
    const value = Number(data?.result);

    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

async function enforceDistributedRateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult | null> {
  const count = await runUpstashCommand("INCR", [key]);
  if (count === null) {
    return null;
  }

  if (count === 1) {
    await runUpstashCommand("PEXPIRE", [key, options.windowMs]);
  }

  const ttlMs = await runUpstashCommand("PTTL", [key]);
  const retryAfterSec =
    ttlMs && ttlMs > 0 ? Math.max(1, Math.ceil(ttlMs / 1000)) : Math.ceil(options.windowMs / 1000);

  return {
    count,
    retryAfterSec,
  };
}

function enforceLocalRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  const current = store.get(key);

  if (!current || now >= current.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      count: 1,
      retryAfterSec: Math.ceil(options.windowMs / 1000),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    count: current.count,
    retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export async function enforceRateLimit(
  request: NextRequest,
  scope: string,
  options: RateLimitOptions
): Promise<NextResponse | null> {
  const client = getClientIdentifier(request);
  const key = `${scope}:${client}`;

  const distributed = await enforceDistributedRateLimit(key, options);
  const result = distributed ?? enforceLocalRateLimit(key, options);

  if (result.count > options.maxRequests) {
    const retryAfterSec = result.retryAfterSec;

    return NextResponse.json(
      { error: "Trop de requêtes, réessayez plus tard." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
        },
      }
    );
  }

  return null;
}
