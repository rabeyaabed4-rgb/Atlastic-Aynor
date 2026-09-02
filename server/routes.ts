import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import {
  AuthenticatedRequest,
  generateToken,
  requireAdmin,
  rateLimiter,
  sanitizeString,
} from './auth';
import { Product, Order, SelectedOrderItem, OrderStatus } from '../src/types';

const router = Router();

// ==========================================
// 1. PUBLIC ENDPOINTS (Landing & Order Submit)
// ==========================================

// Get public landing data (Settings + Active Products)
router.get('/public/landing', (req: Request, res: Response) => {
  const settings = db.getSettings();
  const products = db.getProducts(true); // only active

  res.json({
    success: true,
    data: {
      settings,
      products,
    },
  });
});

// Submit a new customer order
router.post(
  '/public/orders',
  rateLimiter(10, 60000, 'অতিরিক্ত অর্ডার রিকোয়েস্ট পাওয়া গেছে।'),
  (req: Request, res: Response) => {
    try {
      const {
        customerName,
        phone,
        division,
        district,
        upazila,
        address,
        deliveryLocation,
        items,
        paymentMethod,
        notes,
      } = req.body;

      // 1. Validation
      if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'অনুগ্রহ করে আপনার সঠিক পূর্ণ নাম লিখুন।',
        });
      }

      // Bangladesh Phone validation (e.g. 017XXXXXXXX, +88017XXXXXXXX, 88017XXXXXXXX)
      const cleanPhone = (phone || '').replace(/[\s\-]/g, '');
      const bdPhoneRegex = /^(?:\+?88)?(01[3-9]\d{8})$/;
      const match = cleanPhone.match(bdPhoneRegex);

      if (!match) {
        return res.status(400).json({
          success: false,
          message: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।',
        });
      }
      const formattedPhone = match[1]; // Extracts 01XXXXXXXXX

      if (!division || !district || !address || address.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'অনুগ্রহ করে বিভাগ, জেলা এবং আপনার সম্পূর্ণ সঠিক ঠিকানা দিন।',
        });
      }

      if (!['inside_dhaka', 'outside_dhaka'].includes(deliveryLocation)) {
        return res.status(400).json({
          success: false,
          message: 'অনুগ্রহ করে সঠিক ডেলিভারি লোকেশন নির্বাচন করুন।',
        });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'অনুগ্রহ করে অন্তত একটি পণ্য নির্বাচন করুন।',
        });
      }

      // 2. Process Items and Verify Stock & Snapshot Prices
      const orderItems: SelectedOrderItem[] = [];
      let calculatedItemsSubtotal = 0;

      for (const item of items) {
        const prod = db.getProductById(item.productId);
        if (!prod) {
          return res.status(400).json({
            success: false,
            message: `নির্বাচিত পণ্যটি ডাটাবেজে পাওয়া যায়নি।`,
          });
        }

        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

        if (prod.stock < quantity) {
          return res.status(400).json({
            success: false,
            message: `দুঃখিত, '${prod.name}'-এর পর্যাপ্ত স্টক নেই (বর্তমান স্টক: ${prod.stock}টি)।`,
          });
        }

        const priceSnapshot = Number(prod.price) || 0;
        const subtotal = priceSnapshot * quantity;
        calculatedItemsSubtotal += subtotal;

        orderItems.push({
          productId: prod.id,
          productName: prod.name,
          productImage: prod.mainImage || (prod.images && prod.images[0]) || '',
          price: priceSnapshot,
          quantity,
          size: sanitizeString(item.size || ''),
          color: sanitizeString(item.color || ''),
          subtotal,
        });
      }

      // 3. Calculate Delivery Charge from DB Settings
      const settings = db.getSettings();
      const deliveryCharge =
        deliveryLocation === 'inside_dhaka'
          ? Number(settings.insideDhakaDeliveryCharge) || 60
          : Number(settings.outsideDhakaDeliveryCharge) || 135;

      const totalAmount = calculatedItemsSubtotal + deliveryCharge;

      // 4. Generate Unique Order ID (e.g. ORD-639102)
      let uniqueOrderId = '';
      let isUnique = false;
      while (!isUnique) {
        const randNum = Math.floor(100000 + Math.random() * 900000);
        uniqueOrderId = `ORD-${randNum}`;
        if (!db.getOrderById(uniqueOrderId)) {
          isUnique = true;
        }
      }

      // 5. Create Order Object
      const newOrder: Order = {
        id: uniqueOrderId,
        customerName: sanitizeString(customerName),
        phone: formattedPhone,
        division: sanitizeString(division),
        district: sanitizeString(district),
        upazila: sanitizeString(upazila || ''),
        address: sanitizeString(address),
        deliveryLocation,
        deliveryCharge,
        items: orderItems,
        itemsSubtotal: calculatedItemsSubtotal,
        discountTotal: 0,
        totalAmount,
        paymentMethod: ['cod', 'bkash', 'nagad'].includes(paymentMethod) ? paymentMethod : 'cod',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        notes: sanitizeString(notes || ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 6. Deduct Stock and Save Order
      db.decrementStock(
        orderItems.map((it) => ({ productId: it.productId, quantity: it.quantity }))
      );
      db.createOrder(newOrder);

      return res.status(201).json({
        success: true,
        message: 'আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।',
        data: newOrder,
      });
    } catch (err: any) {
      console.error('Order creation error:', err);
      return res.status(500).json({
        success: false,
        message: 'অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    }
  }
);

// Public Order Tracking
router.get('/public/orders/track/:orderId', (req: Request, res: Response) => {
  const orderId = (req.params.orderId || '').trim();
  const phone = (req.query.phone as string || '').trim();

  const order = db.getOrderById(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'এই আইডি নম্বরে কোনো অর্ডার পাওয়া যায়নি।',
    });
  }

  // If phone provided, verify matching last 4 digits or full phone
  if (phone && !order.phone.includes(phone)) {
    return res.status(400).json({
      success: false,
      message: 'অর্ডার আইডির সাথে মোবাইল নম্বরের মিল পাওয়া যায়নি।',
    });
  }

  res.json({
    success: true,
    data: order,
  });
});

// ==========================================
// 2. ADMIN AUTHENTICATION & INITIAL SETUP
// ==========================================

// Check if any admin account is currently registered
router.get('/admin/auth/has-admin', (req: Request, res: Response) => {
  const hasAdmin = db.hasAnyAdmin();
  res.json({
    success: true,
    hasAdmin,
  });
});

// Setup the initial Primary Super Admin (Allowed ONLY ONCE when no admin exists)
router.post(
  '/admin/auth/setup',
  rateLimiter(5, 60000, 'অতিরিক্ত রিকোয়েস্ট পাওয়া গেছে।'),
  (req: Request, res: Response) => {
    try {
      if (db.hasAnyAdmin()) {
        return res.status(403).json({
          success: false,
          message: 'সিস্টেমে ইতিমধ্যে অ্যাডমিন অ্যাকাউন্ট বিদ্যমান। নতুন সেটআপ অনুমোদিত নয়।',
        });
      }

      const { name, email, password } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'অনুগ্রহ করে অ্যাডমিনের সঠিক পূর্ণ নাম প্রদান করুন।',
        });
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস প্রদান করুন।',
        });
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'পাসওয়ার্ড অবশ্যই অন্তত ৬ অক্ষরের হতে হবে।',
        });
      }

      const salt = bcrypt.genSaltSync(12);
      const passwordHash = bcrypt.hashSync(password, salt);

      const newAdmin = {
        id: `admin_${Date.now().toString().slice(-6)}`,
        name: sanitizeString(name.trim()),
        email: email.trim().toLowerCase(),
        role: 'superadmin' as const,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      db.createAdmin(newAdmin);

      const token = generateToken({
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt,
      });

      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        message: 'আলহামদুলিল্লাহ! সুপার অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
        token,
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      });
    } catch (err: any) {
      console.error('Admin setup error:', err);
      return res.status(500).json({
        success: false,
        message: 'অ্যাডমিন অ্যাকাউন্ট তৈরিতে ত্রুটি দেখা দিয়েছে।',
      });
    }
  }
);

// Admin Login with Rate Limiting and Password Verification
router.post(
  '/admin/login',
  rateLimiter(8, 300000, 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে লগইন সাময়িক বন্ধ রয়েছে।'),
  (req: Request, res: Response) => {
    try {
      if (!db.hasAnyAdmin()) {
        return res.status(400).json({
          success: false,
          setupRequired: true,
          message: 'সিস্টেমে কোনো অ্যাডমিন অ্যাকাউন্ট তৈরি করা নেই। অনুগ্রহ করে প্রথমে অ্যাডমিন সেটআপ সম্পন্ন করুন।',
        });
      }

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।',
        });
      }

      const admin = db.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'ভুল ইমেইল অথবা পাসওয়ার্ড।',
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, admin.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'ভুল ইমেইল অথবা পাসওয়ার্ড।',
        });
      }

      const token = generateToken({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      });

      // Set secure cookie
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.json({
        success: true,
        message: 'সফলভাবে অ্যাডমিন প্যানেলে লগইন হয়েছে।',
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({
        success: false,
        message: 'লগইনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      });
    }
  }
);

// Admin Logout
router.post('/admin/logout', (req: Request, res: Response) => {
  res.clearCookie('admin_token');
  res.json({
    success: true,
    message: 'সফলভাবে লগআউট সম্পন্ন হয়েছে।',
  });
});

// Check Admin Profile
router.get('/admin/me', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    admin: req.admin,
  });
});

// Change Admin Password
router.put('/admin/change-password', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।',
      });
    }

    const admin = db.getAdminById(req.admin!.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'অ্যাডমিন পাওয়া যায়নি।' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'বর্তমান পাসওয়ার্ড সঠিক নয়।',
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);
    db.updateAdminPassword(admin.id, newHash);

    res.json({
      success: true,
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' });
  }
});

// ==========================================
// 3. ADMIN DASHBOARD & ANALYTICS
// ==========================================

router.get('/admin/dashboard', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts();

  const todayStr = new Date().toISOString().split('T')[0];

  let totalSales = 0;
  let todayOrders = 0;
  let pendingCount = 0;
  let confirmedCount = 0;
  let processingCount = 0;
  let shippedCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;

  // Group by day for last 7 days
  const last7DaysMap: { [key: string]: { sales: number; count: number; displayDate: string } } = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
    last7DaysMap[dateStr] = { sales: 0, count: 0, displayDate: dayName };
  }

  for (const ord of orders) {
    // Only calculate sales for non-cancelled orders
    if (ord.orderStatus !== 'cancelled') {
      totalSales += ord.totalAmount;
    }

    const orderDateStr = ord.createdAt.split('T')[0];
    if (orderDateStr === todayStr) {
      todayOrders += 1;
    }

    if (last7DaysMap[orderDateStr] && ord.orderStatus !== 'cancelled') {
      last7DaysMap[orderDateStr].sales += ord.totalAmount;
      last7DaysMap[orderDateStr].count += 1;
    }

    switch (ord.orderStatus) {
      case 'pending':
        pendingCount += 1;
        break;
      case 'confirmed':
        confirmedCount += 1;
        break;
      case 'processing':
        processingCount += 1;
        break;
      case 'shipped':
        shippedCount += 1;
        break;
      case 'delivered':
        deliveredCount += 1;
        break;
      case 'cancelled':
        cancelledCount += 1;
        break;
    }
  }

  const salesByDay = Object.keys(last7DaysMap).map((k) => ({
    date: k,
    displayDate: last7DaysMap[k].displayDate,
    sales: last7DaysMap[k].sales,
    count: last7DaysMap[k].count,
  }));

  const statusDistribution: { name: string; count: number; color: string; key: OrderStatus }[] = [
    { name: 'পেন্ডিং', count: pendingCount, color: '#F59E0B', key: 'pending' },
    { name: 'কনফার্মড', count: confirmedCount, color: '#10B981', key: 'confirmed' },
    { name: 'প্রসেসিং', count: processingCount, color: '#3B82F6', key: 'processing' },
    { name: 'শিপড', count: shippedCount, color: '#8B5CF6', key: 'shipped' },
    { name: 'ডেলিভার্ড', count: deliveredCount, color: '#059669', key: 'delivered' },
    { name: 'ক্যানসেলড', count: cancelledCount, color: '#EF4444', key: 'cancelled' },
  ];

  res.json({
    success: true,
    data: {
      totalOrders: orders.length,
      todayOrders,
      totalSales,
      pendingOrders: pendingCount,
      confirmedOrders: confirmedCount,
      processingOrders: processingCount,
      shippedOrders: shippedCount,
      deliveredOrders: deliveredCount,
      cancelledOrders: cancelledCount,
      recentOrders: orders.slice(0, 10),
      salesByDay,
      statusDistribution,
    },
  });
});

// ==========================================
// 4. ADMIN PRODUCT MANAGEMENT
// ==========================================

// Get all products (Admin)
router.get('/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const products = db.getProducts();
  res.json({
    success: true,
    data: products,
  });
});

// Create new product
router.post('/admin/products', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      mainImage,
      images,
      description,
      details,
      price,
      oldPrice,
      sizes,
      colors,
      stock,
      isActive,
      isFeatured,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'পণ্যের নাম আবশ্যক।' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ success: false, message: 'সঠিক মূল্য প্রদান করুন।' });
    }

    const numOldPrice = oldPrice ? Number(oldPrice) : null;
    let discountPercent: number | undefined = undefined;
    if (numOldPrice && numOldPrice > numPrice) {
      discountPercent = Math.round(((numOldPrice - numPrice) / numOldPrice) * 100);
    }

    const newProd: Product = {
      id: `PROD-${Date.now().toString().slice(-6)}`,
      name: sanitizeString(name),
      mainImage: mainImage || (Array.isArray(images) && images[0]) || '',
      images: Array.isArray(images) ? images : mainImage ? [mainImage] : [],
      description: sanitizeString(description || ''),
      details: Array.isArray(details) ? details.map((d: any) => sanitizeString(d)) : [],
      price: numPrice,
      oldPrice: numOldPrice,
      discountPercent,
      sizes: Array.isArray(sizes) ? sizes.map((s: any) => sanitizeString(s)) : [],
      colors: Array.isArray(colors) ? colors.map((c: any) => sanitizeString(c)) : [],
      stock: Math.max(0, parseInt(stock, 10) || 0),
      isActive: isActive !== false,
      isFeatured: isFeatured === true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.createProduct(newProd);
    res.status(201).json({
      success: true,
      message: 'পণ্যটি সফলভাবে ডাটাবেজে সংরক্ষণ করা হয়েছে।',
      data: saved,
    });
  } catch (err) {
    console.error('Product create error:', err);
    res.status(500).json({ success: false, message: 'পণ্য তৈরিতে সমস্যা হয়েছে।' });
  }
});

// Update product
router.put('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      mainImage,
      images,
      description,
      details,
      price,
      oldPrice,
      sizes,
      colors,
      stock,
      isActive,
      isFeatured,
    } = req.body;

    const numPrice = price !== undefined ? Number(price) : undefined;
    const numOldPrice = oldPrice !== undefined ? (oldPrice ? Number(oldPrice) : null) : undefined;
    
    let discountPercent: number | undefined = undefined;
    if (numPrice && numOldPrice && numOldPrice > numPrice) {
      discountPercent = Math.round(((numOldPrice - numPrice) / numOldPrice) * 100);
    }

    const updates: Partial<Product> = {};
    if (name) updates.name = sanitizeString(name);
    if (mainImage !== undefined) updates.mainImage = mainImage;
    if (images !== undefined) updates.images = Array.isArray(images) ? images : [images];
    if (description !== undefined) updates.description = sanitizeString(description);
    if (details !== undefined) updates.details = Array.isArray(details) ? details.map((d) => sanitizeString(d)) : [];
    if (numPrice !== undefined) updates.price = numPrice;
    if (numOldPrice !== undefined) updates.oldPrice = numOldPrice;
    if (discountPercent !== undefined) updates.discountPercent = discountPercent;
    if (sizes !== undefined) updates.sizes = Array.isArray(sizes) ? sizes.map((s) => sanitizeString(s)) : [];
    if (colors !== undefined) updates.colors = Array.isArray(colors) ? colors.map((c) => sanitizeString(c)) : [];
    if (stock !== undefined) updates.stock = Math.max(0, parseInt(stock, 10) || 0);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);

    const updated = db.updateProduct(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });
    }

    res.json({
      success: true,
      message: 'পণ্যটি সফলভাবে আপডেট করা হয়েছে।',
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'পণ্য আপডেট ব্যর্থ হয়েছে।' });
  }
});

// Delete product
router.delete('/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const deleted = db.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });
  }
  res.json({
    success: true,
    message: 'পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।',
  });
});

// Quick toggle active status
router.patch('/admin/products/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const updated = db.updateProduct(id, { isActive: Boolean(isActive) });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });
  }
  res.json({
    success: true,
    message: `পণ্যটি ${updated.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে।`,
    data: updated,
  });
});

// Quick update stock
router.patch('/admin/products/:id/stock', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { stock } = req.body;
  const numStock = Math.max(0, parseInt(stock, 10) || 0);
  const updated = db.updateProduct(id, { stock: numStock });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'পণ্য পাওয়া যায়নি।' });
  }
  res.json({
    success: true,
    message: `স্টক সফলভাবে ${numStock} করা হয়েছে।`,
    data: updated,
  });
});

// ==========================================
// 5. ADMIN ORDER MANAGEMENT
// ==========================================

// Get all orders
router.get('/admin/orders', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  let orders = db.getOrders();

  if (status && typeof status === 'string' && status !== 'all') {
    orders = orders.filter((o) => o.orderStatus === status);
  }

  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.address.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    data: orders,
  });
});

// Get single order
router.get('/admin/orders/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
  }
  res.json({
    success: true,
    data: order,
  });
});

// Update order status & notes
router.patch('/admin/orders/:id/status', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const validStatuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'অবৈধ স্ট্যাটাস।' });
  }

  const updated = db.updateOrderStatus(id, status, notes);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
  }

  res.json({
    success: true,
    message: 'অর্ডার স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।',
    data: updated,
  });
});

// Delete order
router.delete('/admin/orders/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteOrder(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' });
  }
  res.json({
    success: true,
    message: 'অর্ডারটি সফলভাবে মুছে ফেলা হয়েছে।',
  });
});

// ==========================================
// 6. ADMIN CUSTOMER MANAGEMENT
// ==========================================

router.get('/admin/customers', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const customers = db.getCustomers();
  res.json({
    success: true,
    data: customers,
  });
});

// ==========================================
// 7. ADMIN SITE SETTINGS
// ==========================================

router.get('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const settings = db.getSettings();
  res.json({
    success: true,
    data: settings,
  });
});

router.put('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    const sanitizedUpdates: any = {};

    if (updates.shopName) sanitizedUpdates.shopName = sanitizeString(updates.shopName);
    if (updates.tagline) sanitizedUpdates.tagline = sanitizeString(updates.tagline);
    if (updates.phone) sanitizedUpdates.phone = sanitizeString(updates.phone);
    if (updates.email) sanitizedUpdates.email = sanitizeString(updates.email);
    if (updates.facebookPageUrl) sanitizedUpdates.facebookPageUrl = sanitizeString(updates.facebookPageUrl);
    if (updates.logoUrl !== undefined) sanitizedUpdates.logoUrl = updates.logoUrl;
    if (updates.heroTitle) sanitizedUpdates.heroTitle = sanitizeString(updates.heroTitle);
    if (updates.heroSubtitle) sanitizedUpdates.heroSubtitle = sanitizeString(updates.heroSubtitle);
    if (updates.heroImage !== undefined) sanitizedUpdates.heroImage = updates.heroImage;
    if (updates.noticeText !== undefined) sanitizedUpdates.noticeText = sanitizeString(updates.noticeText);

    if (updates.insideDhakaDeliveryCharge !== undefined) {
      sanitizedUpdates.insideDhakaDeliveryCharge = Math.max(0, Number(updates.insideDhakaDeliveryCharge) || 0);
    }
    if (updates.outsideDhakaDeliveryCharge !== undefined) {
      sanitizedUpdates.outsideDhakaDeliveryCharge = Math.max(0, Number(updates.outsideDhakaDeliveryCharge) || 0);
    }

    if (updates.codEnabled !== undefined) sanitizedUpdates.codEnabled = Boolean(updates.codEnabled);
    if (updates.bkashEnabled !== undefined) sanitizedUpdates.bkashEnabled = Boolean(updates.bkashEnabled);
    if (updates.nagadEnabled !== undefined) sanitizedUpdates.nagadEnabled = Boolean(updates.nagadEnabled);
    if (updates.bkashNumber !== undefined) sanitizedUpdates.bkashNumber = sanitizeString(updates.bkashNumber);
    if (updates.nagadNumber !== undefined) sanitizedUpdates.nagadNumber = sanitizeString(updates.nagadNumber);

    const saved = db.updateSettings(sanitizedUpdates);
    res.json({
      success: true,
      message: 'সেটিংস সফলভাবে আপডেট হয়েছে।',
      data: saved,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'সেটিংস সংরক্ষণে সমস্যা হয়েছে।' });
  }
});

export default router;
