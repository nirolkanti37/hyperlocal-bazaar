import { 
  collection, addDoc, getDocs, query, where, 
  orderBy, doc, updateDoc, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export const addRating = async (sellerId, buyerId, orderId, rating, review = '') => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('orderId', '==', orderId),
      where('buyerId', '==', buyerId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return { success: false, error: 'Already rated' };
    }

    await addDoc(collection(db, 'ratings'), {
      sellerId, buyerId, orderId,
      rating: Math.min(5, Math.max(1, rating)),
      review: review.trim(),
      createdAt: serverTimestamp()
    });

    const ratingsQ = query(collection(db, 'ratings'), where('sellerId', '==', sellerId));
    const ratingsSnap = await getDocs(ratingsQ);
    const ratings = ratingsSnap.docs.map(d => d.data().rating);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    await updateDoc(doc(db, 'users', sellerId), {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getSellerRatings = async (sellerId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'ratings'),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return { success: true, ratings: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getSellerRating = async (sellerId) => {
  try {
    const userSnap = await getDoc(doc(db, 'users', sellerId));
    if (userSnap.exists()) {
      const data = userSnap.data();
      return { success: true, rating: data.rating || 0, count: data.reviewCount || 0 };
    }
    return { success: true, rating: 0, count: 0 };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
