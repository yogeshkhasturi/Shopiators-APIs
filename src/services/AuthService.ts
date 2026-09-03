import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import Store from '../../models/store.js';

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

    // 3. Verify user is the store owner
    // if (store.userId.toString() !== user._id.toString()) {
    //   throw new Error('INVALID_CREDENTIALS');
    // }

    // 4. Verify password
    const isMatch = await bcrypt.compare(passwordString, user.password);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // 5. Generate Access Token
    const secret = process.env.PUBLIC_API_JWT_SECRET;
    if (!secret) {
      throw new Error('Server configuration error: Missing JWT secret');
    }

    const payload = {
      sub: user._id.toString(),
      storeSlug: store.storeSlug,
      type: 'public_api_access',
      scopes: [
        'products:read', 'products:write',
        'collections:read', 'collections:write',
        'customers:read', 'customers:write',
        'addresses:read', 'addresses:write',
        'attributes:read', 'attributes:write',
        'variants:read', 'variants:write',
        'orders:read', 'orders:write',
      ]
    };

    const expiresIn = parseInt(process.env.PUBLIC_API_ACCESS_TOKEN_TTL_SEC || '3600', 10);

    const token = jwt.sign(payload, secret, { expiresIn });
    console.log("Token: ", token);
    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn
    };
  }
}
