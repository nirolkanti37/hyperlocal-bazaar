import { 
  collection, addDoc, getDoc, getDocs, query, 
  where, orderBy, limit, updateDoc, doc, deleteDoc,
  serverTimestamp, startAfter
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// Create new product
export const createProduct = async (data, userId) => {
  try {
    const productRef = await addDoc(collection(db, 'products'), {
      ...data,
      sellerId: userId,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewCount: 0,
      favoriteCount: 0,
    });
    return { success: true, id: productRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get product by ID
export const getProduct = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return { success: true, data: { id: productSnap.id, ...productSnap.data() } };
    }
    return { success: false, error: 'Product not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get products with filters
export const getProducts = async (filters = {}, lastDoc = null) => {
  try {
    let constraints = [where('status', '==', 'active'), orderBy('createdAt', 'desc')];

    if (filters.category) {
      constraints.push(where('category', '==', filters.category));
    }
    if (filters.minPrice !== undefined) {
      constraints.push(where('price', '>=', filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      constraints.push(where('price', '<=', filters.maxPrice));
    }
    if (filters.search) {
      // Note: Full-text search requires Algolia or similar
      // For now, we'll filter client-side or use title prefix
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
    return { success: false, error: error.message };
  }
};

// Get products by seller
export const getProductsBySeller = async (sellerId) => {
  try {
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
    return { success: false, error: error.message };
  }
};

// Update product
export const updateProduct = async (productId, data) => {
  try {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete product
export const deleteProduct = async (productId) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
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
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const currentCount = productSnap.data().viewCount || 0;
      await updateDoc(productRef, { viewCount: currentCount + 1 });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};
