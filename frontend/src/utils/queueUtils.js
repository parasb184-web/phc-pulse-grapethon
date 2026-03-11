const DEFAULT_PREFIX = "A";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toPositiveInt = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
};

export const parseToken = (tokenInput, fallbackPrefix = DEFAULT_PREFIX) => {
  if (typeof tokenInput === "number" && Number.isFinite(tokenInput)) {
    return { prefix: fallbackPrefix, number: Math.max(0, Math.floor(tokenInput)) };
  }

  if (tokenInput == null) return null;

  const raw = String(tokenInput).trim().toUpperCase();
  if (!raw) return null;

  const plainNumberMatch = raw.match(/^(\d+)$/);
  if (plainNumberMatch) {
    return { prefix: fallbackPrefix, number: Number(plainNumberMatch[1]) };
  }

  const tokenMatch = raw.match(/^([A-Z]{1,3})[-\s]?(\d{1,5})$/);
  if (!tokenMatch) return null;

  return {
    prefix: tokenMatch[1],
    number: Number(tokenMatch[2]),
  };
};

export const formatToken = ({ prefix, number }) => {
  const safePrefix = (prefix || DEFAULT_PREFIX).toUpperCase();
  const safeNumber = toPositiveInt(number);
  return `${safePrefix}-${safeNumber}`;
};

const estimatePerPatientMinutes = ({ queueCount, waitMinutes, doctorsAvailable }) => {
  const q = Math.max(1, toPositiveInt(queueCount, 1));
  const docs = Math.max(1, toPositiveInt(doctorsAvailable, 1));
  const wait = toPositiveInt(waitMinutes, 0);

  if (wait > 0) {
    return clamp(wait / q, 2, 12);
  }
  return clamp(6 / docs, 2, 12);
};

export const buildNowServingSummary = ({
  serving,
  queueCount,
  waitMinutes,
  doctorsAvailable,
  tokenPrefix = DEFAULT_PREFIX,
  nextCount = 4,
}) => {
  const nowServing = parseToken(serving, tokenPrefix) || { prefix: tokenPrefix, number: 1 };
  const queue = toPositiveInt(queueCount, 0);
  const nextTokens = Array.from({ length: Math.max(0, nextCount) }, (_, idx) =>
    formatToken({ prefix: nowServing.prefix, number: nowServing.number + idx + 1 })
  );
  const perPatientMinutes = estimatePerPatientMinutes({
    queueCount: queue,
    waitMinutes,
    doctorsAvailable,
  });

  return {
    nowServing: formatToken(nowServing),
    nextTokens,
    nextRange:
      nextTokens.length > 1
        ? `${nextTokens[0]} to ${nextTokens[nextTokens.length - 1]}`
        : nextTokens[0] || "Updating...",
    approxWaitForNewEntry: Math.round(queue * perPatientMinutes),
    perPatientMinutes,
  };
};

export const trackToken = ({
  tokenInput,
  serving,
  queueCount,
  waitMinutes,
  doctorsAvailable,
  doctorLabel,
  tokenPrefix = DEFAULT_PREFIX,
}) => {
  const parsedToken = parseToken(tokenInput, tokenPrefix);
  if (!parsedToken) {
    return { ok: false, reason: "Please enter a valid token like A-27." };
  }

  const servingToken = parseToken(serving, parsedToken.prefix) || { prefix: parsedToken.prefix, number: 1 };
  const queue = toPositiveInt(queueCount, 0);
  const delta = parsedToken.number - servingToken.number;
  const patientsAhead = Math.max(0, delta);
  const perPatientMinutes = estimatePerPatientMinutes({
    queueCount: queue,
    waitMinutes,
    doctorsAvailable,
  });
  const estimatedTurnMinutes = Math.max(0, Math.round(patientsAhead * perPatientMinutes));

  let status = "Waiting";
  if (delta < -2) status = "Completed";
  else if (delta < 0) status = "In Consultation";
  else if (delta === 0) status = "Please Proceed";
  else if (delta <= 2) status = "Approaching Soon";
  else if (delta > queue + 10) status = "Missed / Recheck";

  return {
    ok: true,
    token: formatToken(parsedToken),
    nowServing: formatToken(servingToken),
    patientsAhead,
    estimatedTurnMinutes,
    doctorOrCounter: doctorLabel || "General OPD Counter",
    status,
  };
};
