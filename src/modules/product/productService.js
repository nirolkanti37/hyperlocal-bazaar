import { 
  collection, addDoc, getDoc, getDocs, query, 
  where, orderBy, limit, updateDoc, doc, deleteDoc,
  serverTimestamp, startAfter
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// ── Network Check ──────────────────────────────────────
const isOnline = () => {
  return navigator.onLine;
};

// ── Product Service ──────────────────────────────────────

// Create new product
export const createProduct = async (data, userId) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    // Validate required fields
    if (!data.title || !data.title.trim()) {
      return { success: false, error: 'পণ্যের নাম আবশ্যক।' };
    }

    if (!data.price || data.price <= 0) {
      return { success: false, error: 'দাম 0 এর চেয়ে বেশি হতে হবে।' };
    }

    if (!data.category || !data.category.trim()) {
      return { success: false, error: 'ক্যাটাগরি নির্বাচন করুন।' };
    }

    if (!data.location || !data.location.lat || !data.location.lng) {
      return { success: false, error: 'অবস্থান প্রয়োজন।' };
    }

    // Ensure sellerId matches userId for security
    const productData = {
      ...data,
      sellerId: userId,  // Always use the authenticated user ID
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewCount: 0,
      favoriteCount: 0,
      title: data.title.trim(),
      description: (data.description || '').trim(),
      price: parseFloat(data.price),
      images: Array.isArray(data.images) ? data.images : [],
    };

    const productRef = await addDoc(collection(db, 'products'), productData);
    return { success: true, id: productRef.id };
  } catch (error) {
    // Detailed error handling
    let friendlyError = 'পণ্য যোগ করতে সমস্যা হয়েছে';

    if (error.code === 'permission-denied') {
      friendlyError = 'আপনার কাছে পণ্য যোগ করার অনুমতি নেই। লগইন চেক করুন।';
    } else if (error.code === 'unauthenticated') {
      friendlyError = 'লগইন প্রয়োজন। পুনরায় লগইন করুন।';
    } else if (error.message && error.message.includes('quota')) {
      friendlyError = 'ডেটাবেস সীমা অতিক্রম করেছে। কিছুক্ষণ পর চেষ্টা করুন।';
    } else if (!isOnline()) {
      friendlyError = 'নেটওয়ার্ক সংযোগ হারিয়েছি। ইন্টারনেট চেক করুন।';
    }

    console.error('Product creation error:', error);
    return { success: false, error: friendlyError };
  }
};

// Get product by ID
export const getProduct = async (productId) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return { success: true, data: { id: productSnap.id, ...productSnap.data() } };
    }
    return { success: false, error: 'পণ্য পাওয়া যায়নি' };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { success: false, error: 'পণ্য লোড করতে সমস্যা হয়েছে' };
  }
};

// Get products with filters
export const getProducts = async (filters = {}, lastDoc = null) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    let constraints = [where('status', '==', 'active'), orderBy('createdAt', 'desc')];

    if (filters.category && filters.category.trim()) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      constraints.push(where('price', '>=', filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }

    constraints.push(limit(filters.limit || 20));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'products'), ...constraints);
    const snapshot = await getDocs(q);

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { 
      success: true, 
      data: products,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
      hasMore: snapshot.docs.length === (filters.limit || 20)
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'পণ্য লোড করতে সমস্যা হয়েছে' };
  }
};

// Get products by seller
export const getProductsBySeller = async (sellerId) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    if (!sellerId) {
      return { success: false, error: 'বিক্রেতা আইডি প্রয়োজন' };
    }

    const q = query(
      collection(db, 'products'),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return { 
      success: true, 
      data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    };
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return { success: false, error: 'পণ্য লোড করতে সমস্যা হয়েছে' };
  }
};

// Update product
export const updateProduct = async (productId, data) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    if (!productId) {
      return { success: false, error: 'পণ্য আইডি প্রয়োজন' };
    }

    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'এই পণ্য আপডেট করার অনুমতি নেই।' };
    }

    return { success: false, error: 'পণ্য আপডেট করতে সমস্যা হয়েছে' };
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    // Check network connection
    if (!isOnline()) {
      return { success: false, error: 'নেটওয়ার্ক সংযোগ নেই। ইন্টারনেট চেক করুন।' };
    }

    if (!productId) {
      return { success: false, error: 'পণ্য আইডি প্রয়োজন' };
    }

    await deleteDoc(doc(db, 'products', productId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);

    if (error.code === 'permission-denied') {
      return { success: false, error: 'এই পণ্য মুছে ফেলার অনুমতি নেই।' };
    }

    return { success: false, error: 'পণ্য মুছে ফেলতে সমস্যা হয়েছে' };
  }
};

// Mark product as sold
export const markAsSold = async (productId) => {
  return updateProduct(productId, { status: 'sold', soldAt: serverTimestamp() });
};

// Toggle product visibility
export const toggleProductVisibility = async (productId, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
  return updateProduct(productId, { status: newStatus });
};

// Increment view count
export const incrementViewCount = async (productId) => {
  try {
    // Don't fail if this is offline - it's non-critical
    if (!isOnline()) {
      return;
    }

    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const currentCount = productSnap.data().viewCount || 0;
      await updateDoc(productRef, { viewCount: currentCount + 1 });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
    // Don't throw - view count is not critical
  }
};
