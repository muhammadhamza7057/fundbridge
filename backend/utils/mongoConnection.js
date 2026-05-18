const DEFAULT_DB_NAME = 'FundBridge';

function normalizeMongoUri(uri) {
  if (!uri) return '';
  return uri.replace(/\/(fundbridge)(?=\?|$)/i, `/${DEFAULT_DB_NAME}`);
}

function getMongoUriCandidates() {
  const primary = normalizeMongoUri(process.env.MONGO_URI || process.env.MONGODB_URI);
  const localFallback = normalizeMongoUri(
    process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/FundBridge'
  );

  return [primary, localFallback].filter(Boolean);
}

function isDnsMongoError(error) {
  const text = String(error?.message || '');
  return ['querySrv', 'ESERVFAIL', 'ECONNREFUSED', 'EAI_AGAIN', 'ETIMEDOUT', 'ENOTFOUND'].some((needle) => text.includes(needle));
}

async function connectMongo(mongoose, { label = 'MongoDB', retryCount = 1, retryDelayMs = 2000 } = {}) {
  const candidates = getMongoUriCandidates();

  if (!candidates.length) {
    throw new Error('MONGO_URI, MONGODB_URI, or MONGO_LOCAL_URI is not defined');
  }

  let lastError = null;

  for (const uri of candidates) {
    for (let attempt = 1; attempt <= retryCount; attempt += 1) {
      try {
        if (uri === candidates[0]) {
          console.log(`Connecting to ${label}...`);
        } else {
          console.log(`Connecting to ${label} using fallback URI...`);
        }

        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 10000,
        });

        return { uri };
      } catch (error) {
        lastError = error;

        if (attempt < retryCount && isDnsMongoError(error)) {
          const waitMs = retryDelayMs * attempt;
          console.warn(`${label} connection attempt ${attempt} failed (${error.message}). Retrying in ${waitMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          continue;
        }

        if (uri === candidates[0] && candidates.length > 1 && isDnsMongoError(error)) {
          console.warn(`${label} SRV lookup failed (${error.message}). Trying fallback Mongo URI...`);
          break;
        }

        if (uri !== candidates[0]) {
          throw new Error(`${label} fallback connection failed: ${error.message}`);
        }
      }
    }
  }

  throw lastError || new Error(`Unable to connect to ${label}`);
}

module.exports = {
  DEFAULT_DB_NAME,
  normalizeMongoUri,
  getMongoUriCandidates,
  connectMongo,
  isDnsMongoError,
};
