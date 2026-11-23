import {
  createError,
  defineEventHandler,
  readBody,
  setResponseStatus,
} from "h3";

interface LotteryEntryBody {
  email?: string;
}

interface LotteryKvBinding {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const devLotteryEntries = new Map<string, string>();

/**
 * Clears the in-memory fallback lottery store used during local dev/tests.
 */
export function resetDevLotteryEntries() {
  devLotteryEntries.clear();
}

export default defineEventHandler(async (event) => {
  const body = (await readBody<LotteryEntryBody>(event)) || {};
  const email = String(body.email || "")
    .trim()
    .toLowerCase();

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid email address is required.",
    });
  }

  const entryKey = `entry:${email}`;

  const cfEnv = (
    event.context as {
      cloudflare?: {
        env?: {
          XMAS_LOTTERY?: LotteryKvBinding;
        };
      };
    }
  )?.cloudflare?.env;

  const kv = cfEnv?.XMAS_LOTTERY;

  if (kv) {
    const existing = await kv.get(entryKey);
    if (existing !== null) {
      throw createError({
        statusCode: 409,
        statusMessage: "This email is already entered in the Xmas Lottery.",
      });
    }
  } else if (devLotteryEntries.has(entryKey)) {
    throw createError({
      statusCode: 409,
      statusMessage: "This email is already entered in the Xmas Lottery.",
    });
  }

  const record = {
    email,
    submittedAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(record);

  if (kv) {
    await kv.put(entryKey, serialized);
  } else {
    devLotteryEntries.set(entryKey, serialized);
  }

  setResponseStatus(event, 200);
  return {
    ok: true,
    message: "You're in the Xmas Lottery!",
    entry: record,
  };
});
