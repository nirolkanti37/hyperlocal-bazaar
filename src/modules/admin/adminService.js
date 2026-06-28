import { 
  collection, getDocs, query, where, orderBy,
  doc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

export const getPendingReports = async () => {
  try {
    const q = query(collection(db, 'reports'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return { success: true, reports: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const resolveReport = async (reportId, action) => {
  try {
    await updateDoc(doc(db, 'reports', reportId), { status: 'resolved', action, resolvedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const banUser = async (userId, reason) => {
  try {
    await updateDoc(doc(db, 'users', userId), { status: 'banned', banReason: reason, bannedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAdminStats = async () => {
  try {
    const [usersSnap, productsSnap, reportsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, 'users')), getDocs(collection(db, 'products')),
      getDocs(query(collection(db, 'reports'), where('status', '==', 'pending'))),
      getDocs(collection(db, 'orders'))
    ]);
    return { success: true, stats: { totalUsers: usersSnap.size, totalProducts: productsSnap.size, pendingReports: reportsSnap.size, totalOrders: ordersSnap.size } };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
