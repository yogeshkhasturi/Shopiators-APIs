import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Store from '../../models/store.js';
const RefreshToken = require('../../models/RefreshToken');

const DEFAULT_MERCHANT_SCOPES = [
  'products:read', 'products:write',
  'collections:read', 'collections:write',
  'customers:read', 'customers:write',
  'addresses:read', 'addresses:write',
  'attributes:read', 'attributes:write',
  'variants:read', 'variants:write',
  'orders:read', 'orders:write',
  'store:read',
  'inventory:read', 'inventory:write',
];

function getJwtSecret(): string {
  const secret = process.env.PUBLIC_API_JWT_SECRET;
  if (!secret) {
    throw new Error('Server configuration error: Missing JWT secret');
  }
  return secret;
}

function hashRefreshSecret(secret: string): string {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function issueAccessToken(userId: string, storeSlug: string, scopes: string[]) {
  const secret = getJwtSecret();
  const expiresIn = parseInt(process.env.PUBLIC_API_ACCESS_TOKEN_TTL_SEC || '3600', 10);
  const accessToken = jwt.sign(
    {
      sub: userId,
      storeSlug,
      type: 'public_api_access',
      scopes,
    },
    secret,
    { expiresIn }
  );
  return { accessToken, expiresIn };
}

async function createRefreshTokenRecord(
  userId: string,
  storeSlug: string,
  scopes: string[],
  familyId?: string
) {
  const tokenId = crypto.randomBytes(12).toString('hex');
  const secret = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashRefreshSecret(secret);
  const refreshExpiresIn = parseInt(process.env.PUBLIC_API_REFRESH_TOKEN_TTL_SEC || '604800', 10);
  const expiresAt = new Date(Date.now() + refreshExpiresIn * 1000);

  await RefreshToken.create({
    tokenId,
    tokenHash,
    familyId: familyId || crypto.randomBytes(12).toString('hex'),
    userId,
    storeSlug,
    scopes,
    expiresAt,
  });

  return {
    tokenId,
    refreshToken: `rt_${tokenId}_${secret}`,
    refreshExpiresIn,
  };
}

export class AuthService {
  static async login(storeSlug: string, email: string, passwordString: string) {
    // 1. Resolve Store
    const store = await Store.findOne({ storeSlug }).lean();
    if (!store) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 2. Resolve User
    const user = await User.findOne({ email, storeSlug, role: "admin" }).lean();
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(passwordString, user.password);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const userId = user._id.toString();
    const { accessToken, expiresIn } = issueAccessToken(
      userId,
      store.storeSlug,
      DEFAULT_MERCHANT_SCOPES
    );
    const { refreshToken, refreshExpiresIn } = await createRefreshTokenRecord(
      userId,
      store.storeSlug,
      DEFAULT_MERCHANT_SCOPES
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
      refreshExpiresIn,
    };
  }

  static async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken || !rawRefreshToken.startsWith('rt_')) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const parts = rawRefreshToken.split('_');
    if (parts.length !== 3) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const [, tokenId, secret] = parts;
    if (!tokenId || !secret) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const record = await RefreshToken.findOne({ tokenId });
    if (!record) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Reuse detection: if an already-revoked token is replayed, revoke its entire family
    if (record.revokedAt) {
      await RefreshToken.updateMany(
        { familyId: record.familyId, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    if (new Date(record.expiresAt) <= new Date()) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const expectedHash = hashRefreshSecret(secret);
    const a = Buffer.from(expectedHash, 'hex');
    const b = Buffer.from(record.tokenHash, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const scopes = Array.isArray(record.scopes) && record.scopes.length > 0
      ? record.scopes
      : DEFAULT_MERCHANT_SCOPES;

    const { tokenId: newTokenId, refreshToken, refreshExpiresIn } =
      await createRefreshTokenRecord(
        record.userId.toString(),
        record.storeSlug,
        scopes,
        record.familyId
      );

    record.revokedAt = new Date();
    record.replacedByTokenId = newTokenId;
    await record.save();

    const { accessToken, expiresIn } = issueAccessToken(
      record.userId.toString(),
      record.storeSlug,
      scopes
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
      refreshExpiresIn,
    };
  }
}
