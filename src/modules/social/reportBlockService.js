import { 
  collection, addDoc, getDocs, query, where, 
  doc, updateDoc, serverTimestamp, deleteDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';

// ===== REPORT SYSTEM =====

export const reportProduct = async (productId, reporterId, reason, details = '') => {
  try {
    await addDoc(collection(db, 'reports'), {
      type: 'product',
      targetId: productId,
      reporterId,
      reason,
      details: details.trim(),
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const reportUser = async (targetUserId, reporterId, reason, details = '') => {
  try {
    await addDoc(collection(db, 'reports'), {
      type: 'user',
      targetId: targetUserId,
      reporterId,
      reason,
      details: details.trim(),
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ===== BLOCK SYSTEM =====

export const blockUser = async (blockerId, blockedId) => {
  try {
    if (blockerId === blockedId) return { success: false, error: 'Cannot block yourself' };

    const q = query(
      collection(db, 'blocks'),
      where('blockerId', '==', blockerId),
      where('blockedId', '==', blockedId)
    );
    const existing = await getDocs(q);
    if (!existing.empty) return { success: false, error: 'Already blocked' };

    await addDoc(collection(db, 'blocks'), {
      blockerId, blockedId,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const unblockUser = async (blockerId, blockedId) => {
  try {
    const q = query(
      collection(db, 'blocks'),
      where('blockerId', '==', blockerId),
      where('blockedId', '==', blockedId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(doc(db, 'blocks', snapshot.docs[0].id));
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const isBlocked = async (blockerId, blockedId) => {
  try {
    const q = query(
      collection(db, 'blocks'),
      where('blockerId', '==', blockerId),
      where('blockedId', '==', blockedId)
    );
    const snapshot = await getDocs(q);
    return { success: true, blocked: !snapshot.empty };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBlockedUsers = async (blockerId) => {
  try {
    const q = query(collection(db, 'blocks'), where('blockerId', '==', blockerId));
    const snapshot = await getDocs(q);
    return { success: true, blocks: snapshot.docs.map(d => ({ id: d.id, ...d.data() })) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
