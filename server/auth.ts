import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { AdminUser } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'pochender_shop_super_secret_jwt_key_2026_bd';

export interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

export function generateToken(admin: AdminUser): string {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      createdAt: decoded.createdAt || new Date().toISOString(),
    };
  } catch (err) {
    return null;
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check header or cookie
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'অননুমোদিত প্রবেশাধিকার। দয়া করে লগইন করুন।',
    });
  }

  const admin = verifyToken(token);
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'সেশন মেয়াদোত্তীর্ণ হয়েছে। দয়া করে পুনরায় লগইন করুন।',
    });
  }

  // Verify that admin actually exists in db
  const adminInDb = db.getAdminById(admin.id);
  if (!adminInDb) {
    return res.status(401).json({
      success: false,
      message: 'ব্যবহারকারী পাওয়া যায়নি।',
    });
  }

  req.admin = {
    id: adminInDb.id,
    name: adminInDb.name,
    email: adminInDb.email,
    role: adminInDb.role,
    createdAt: adminInDb.createdAt,
  };

  next();
}

// In-Memory Rate Limiter for Login & Order Submissions
interface RateLimitRecord {
  count: number;
  firstRequest: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function rateLimiter(maxRequests: number, windowMs: number, customMessage: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${req.path}_${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);
    if (!record) {
      rateLimitMap.set(key, { count: 1, firstRequest: now });
      return next();
    }

    if (now - record.firstRequest > windowMs) {
      // Reset window
      rateLimitMap.set(key, { count: 1, firstRequest: now });
      return next();
    }

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((windowMs - (now - record.firstRequest)) / 1000);
      return res.status(429).json({
        success: false,
        message: `${customMessage} অনুগ্রহ করে ${waitSeconds} সেকেন্ড পর চেষ্টা করুন।`,
      });
    }

    record.count += 1;
    next();
  };
}

// Input Sanitizer to prevent XSS
export function sanitizeString(str: any): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
