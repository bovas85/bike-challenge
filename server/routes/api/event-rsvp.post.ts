import {
  createError,
  defineEventHandler,
  readBody,
  setResponseStatus,
} from "h3";

interface RsvpBody {
  name?: string;
  email?: string;
}

export default defineEventHandler(async (event) => {
  const body = (await readBody<RsvpBody>(event)) || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();

  if (!name || !email || !email.includes("@")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Valid name and email are required",
    });
  }

  const record = {
    name,
    email,
    submittedAt: new Date().toISOString(),
  };

  const cfEnv = (
    event.context as {
      cloudflare?: {
        env?: {
          EVENT_RSVPS?: {
            put: (key: string, value: string) => Promise<void>;
          };
        };
      };
    }
  )?.cloudflare?.env;

  if (cfEnv?.EVENT_RSVPS) {
    const key = `rsvp:${Date.now()}:${email.toLowerCase()}`;
    await cfEnv.EVENT_RSVPS.put(key, JSON.stringify(record));
  }

  setResponseStatus(event, 200);
  return {
    ok: true,
    message: "RSVP received",
    rsvp: {
      name: record.name,
      email: record.email,
    },
  };
});
