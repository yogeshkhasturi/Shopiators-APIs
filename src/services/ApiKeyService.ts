import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import ApiCredential from '../../models/ApiCredential.js';

export interface GeneratedApiKey {
  keyId: string;
  secret: string;
  formattedKey: string;
}

export class ApiKeyService {
  /**
   * Generates a new API key pair
   * Format: sk_{env}_{keyId}_{secret}
   */
  static async generateKey(storeSlug: string, name: string, providerId: string, scopes: string[], env: 'test' | 'live' = 'live'): Promise<GeneratedApiKey> {
    const keyId = crypto.randomBytes(8).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');
    
    const formattedKey = `sk_${env}_${keyId}_${secret}`;
    
    const secretHash = await bcrypt.hash(secret, 10);
    
    await ApiCredential.create({
      providerId,
      name,
      keyId,
      secretHash,
      storeSlug,
      scopes,
      status: 'active'
    });
    
    return {
      keyId,
      secret,
      formattedKey
    };
  }

  /**
   * Validates a provided API key
   * Returns the ApiCredential document if valid, otherwise null
   */
  static async validateKey(formattedKey: string) {
    if (!formattedKey || !formattedKey.startsWith('sk_')) {
      return null;
    }
    
    const parts = formattedKey.split('_');
    if (parts.length !== 4) {
      return null;
    }
    
    const [prefix, env, keyId, secret] = parts;
    
    const credential = await ApiCredential.findOne({ keyId, status: 'active' });
    if (!credential) {
      return null;
    }
    
    const isValid = await bcrypt.compare(secret, credential.secretHash);
    if (!isValid) {
      return null;
    }
    
    // Update last used asynchronously
    ApiCredential.updateOne(
      { _id: credential._id },
      { $set: { lastUsedAt: new Date() } }
    ).catch(() => {}); // ignore errors
    
    return credential;
  }
}
