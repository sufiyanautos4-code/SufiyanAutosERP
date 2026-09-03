import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  EveeBike,
  AuthUser,
  InstallmentPayment,
  SaleTransactionRecord,
  PaymentTransactionRecord,
  ShopRecord
} from '../types';
import { SAMPLE_DEMO_BIKES } from '../data/initialBikes';

const LOCAL_BIKES_CACHE_KEY = 'evee_inventory_bikes_live';
const LOCAL_SHOPS_CACHE_KEY = 'evee_owner_shops_v2';

import { getLocalSessionUser } from './authService';

// Clean helper to remove undefined fields from Firestore payloads
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): any {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Timestamp)) {
        clean[key] = sanitizeForFirestore(value);
      } else if (Array.isArray(value)) {
        clean[key] = value.map(item => (typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item));
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// ==========================================
// 1. VEHICLES / BIKES FIRESTORE OPERATIONS
// ==========================================

/**
 * Real-time listener for user's bikes in `users/{userId}/bikes`
 */
export function subscribeBikes(
  userIdOrCb: string | ((bikes: EveeBike[]) => void) | undefined,
  onUpdateOrError?: ((bikes: EveeBike[]) => void) | ((error: any) => void),
  onError?: (error: any) => void
): () => void {
  let userId: string | undefined;
  let onUpdate: (bikes: EveeBike[]) => void;
  let errCb: ((error: any) => void) | undefined;

  if (typeof userIdOrCb === 'function') {
    onUpdate = userIdOrCb;
    errCb = onUpdateOrError as any;
    userId = getLocalSessionUser()?.id;
  } else {
    userId = userIdOrCb;
    onUpdate = onUpdateOrError as any;
    errCb = onError;
  }

  if (!userId) {
    if (onUpdate) onUpdate([]);
    return () => {};
  }

  const bikesRef = collection(db, 'users', userId, 'bikes');
  const q = query(bikesRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const bikesList: EveeBike[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as EveeBike;
        bikesList.push({
          ...data,
          id: docSnap.id || data.id
        });
      });

      // Sort by entryDate descending or createdAt descending
      bikesList.sort((a, b) => {
        const dateA = a.entryDate || a.createdAt || '';
        const dateB = b.entryDate || b.createdAt || '';
        return dateB.localeCompare(dateA);
      });

      // Update local storage backup cache for this specific user
      try {
        localStorage.setItem(`evee_inventory_bikes_${userId}`, JSON.stringify(bikesList));
      } catch (err) {
        console.warn('Cache write error:', err);
      }

      if (onUpdate) onUpdate(bikesList);
    },
    (err) => {
      console.error('Firestore bikes subscription error:', err);
      if (errCb) errCb(err);
    }
  );
}

/**
 * Save or update a single bike document in `users/{userId}/bikes/{id}`
 */
export async function saveBikeToFirestore(
  bike: EveeBike,
  currentUser?: AuthUser | null
): Promise<void> {
  const activeUser = currentUser || getLocalSessionUser();
  if (!activeUser?.id) return;

  const bikeId = bike.id || `bike_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const bikeRef = doc(db, 'users', activeUser.id, 'bikes', bikeId);
  const nowIso = new Date().toISOString();

  const payload: EveeBike = {
    ...bike,
    id: bikeId,
    createdAt: bike.createdAt || nowIso,
    updatedAt: nowIso,
    createdBy: bike.createdBy || activeUser.id,
    createdByName: bike.createdByName || activeUser.name || 'Showroom Staff'
  };

  if (bike.status !== 'IN_STOCK' && !bike.soldByUserId) {
    payload.soldByUserId = activeUser.id;
    payload.soldByUserName = activeUser.name;
  }

  const sanitized = sanitizeForFirestore(payload);
  await setDoc(bikeRef, {
    ...sanitized,
    _lastServerSync: serverTimestamp()
  }, { merge: true });

  // Relational Record: If vehicle is sold, write/update sales ledger entry
  if (bike.status !== 'IN_STOCK' && bike.saleInvoiceNumber && bike.customer) {
    await recordSaleTransactionDoc(payload, activeUser).catch(err => {
      console.warn('Failed to record sales ledger entry:', err);
    });
  }
}

/**
 * Delete a bike document from user's Firestore collection
 */
export async function deleteBikeFromFirestore(
  bikeId: string,
  currentUser?: AuthUser | null
): Promise<void> {
  const activeUser = currentUser || getLocalSessionUser();
  if (!activeUser?.id) return;
  const bikeRef = doc(db, 'users', activeUser.id, 'bikes', bikeId);
  await deleteDoc(bikeRef);
}

/**
 * Batch seed sample demonstration bikes to user's collection
 */
export async function batchSeedBikes(
  sampleBikes: EveeBike[] = SAMPLE_DEMO_BIKES,
  currentUser?: AuthUser | null
): Promise<void> {
  const activeUser = currentUser || getLocalSessionUser();
  if (!activeUser?.id) return;

  const batch = writeBatch(db);
  const nowIso = new Date().toISOString();

  sampleBikes.forEach((b) => {
    const bikeId = b.id || `bike_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const bikeRef = doc(db, 'users', activeUser.id, 'bikes', bikeId);
    const bikeData: EveeBike = {
      ...b,
      id: bikeId,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: activeUser.id,
      createdByName: activeUser.name || 'System Demo'
    };
    batch.set(bikeRef, sanitizeForFirestore(bikeData));
  });

  await batch.commit();
}

/**
 * Clear all vehicles from user's collection
 */
export async function clearAllBikesFromFirestore(
  currentUser?: AuthUser | null
): Promise<void> {
  const activeUser = currentUser || getLocalSessionUser();
  if (!activeUser?.id) return;

  const snapshot = await getDocs(collection(db, 'users', activeUser.id, 'bikes'));
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });
  await batch.commit();

  try {
    localStorage.removeItem(`evee_inventory_bikes_${activeUser.id}`);
  } catch {}
}

// ==========================================
// 2. SHOPS & BRANCHES FIRESTORE OPERATIONS
// ==========================================

export function subscribeShops(
  userIdOrCb: string | ((shops: string[]) => void) | undefined,
  onUpdateOrError?: ((shops: string[]) => void) | ((error: any) => void),
  onError?: (error: any) => void
): () => void {
  let userId: string | undefined;
  let onUpdate: (shops: string[]) => void;
  let errCb: ((error: any) => void) | undefined;

  if (typeof userIdOrCb === 'function') {
    onUpdate = userIdOrCb;
    errCb = onUpdateOrError as any;
    userId = getLocalSessionUser()?.id;
  } else {
    userId = userIdOrCb;
    onUpdate = onUpdateOrError as any;
    errCb = onError;
  }

  if (!userId) {
    if (onUpdate) onUpdate([]);
    return () => {};
  }

  const shopsRef = collection(db, 'users', userId, 'shops');

  return onSnapshot(
    shopsRef,
    (snapshot) => {
      const shopNames: string[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.name && typeof data.name === 'string') {
          shopNames.push(data.name.trim());
        }
      });

      const uniqueShops = Array.from(new Set(shopNames.filter(Boolean)));
      
      try {
        localStorage.setItem(`evee_owner_shops_${userId}`, JSON.stringify(uniqueShops));
      } catch (err) {
        console.warn('Shops cache write error:', err);
      }

      if (onUpdate) onUpdate(uniqueShops);
    },
    (err) => {
      console.error('Firestore shops subscription error:', err);
      if (errCb) errCb(err);
    }
  );
}

export async function addShopToFirestore(
  shopName: string,
  currentUser?: AuthUser | null
): Promise<void> {
  const activeUser = currentUser || getLocalSessionUser();
  if (!activeUser?.id) return;
  const trimmed = shopName.trim();
  if (!trimmed) return;

  const shopDocId = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const shopRef = doc(db, 'users', activeUser.id, 'shops', shopDocId);
  const nowIso = new Date().toISOString();

  const shopData: ShopRecord = {
    id: shopDocId,
    name: trimmed,
    createdBy: activeUser.id,
    createdByName: activeUser.name || 'Staff',
    createdAt: nowIso,
    updatedAt: nowIso
  };

  await setDoc(shopRef, sanitizeForFirestore(shopData), { merge: true });
}

export async function deleteShopFromFirestore(
  shopName: string,
  currentUser?: AuthUser | null
): Promise<void> {
  const activeUser = currentUser || getLocalSessionUser();
  if (!activeUser?.id) return;
  const trimmed = shopName.trim();
  const shopDocId = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const shopRef = doc(db, 'users', activeUser.id, 'shops', shopDocId);
  await deleteDoc(shopRef);
}

export async function updateShopInFirestore(
  oldName: string,
  newName: string,
  currentUser?: AuthUser | null
): Promise<void> {
  const activeUser = currentUser || getLocalSessionUser();
  if (!activeUser?.id) return;
  const trimmedOld = oldName.trim();
  const trimmedNew = newName.trim();
  if (!trimmedNew || trimmedOld === trimmedNew) return;

  await deleteShopFromFirestore(trimmedOld, activeUser);
  await addShopToFirestore(trimmedNew, activeUser);
}

// ==========================================
// 3. RELATIONAL SALES & PAYMENT TRANSACTIONS
// ==========================================

/**
 * Record a sale transaction in `users/{userId}/sales_records/{invoiceNumber}`
 */
export async function recordSaleTransactionDoc(
  bike: EveeBike,
  currentUser?: AuthUser | null
): Promise<void> {
  if (!currentUser?.id || !bike.saleInvoiceNumber || !bike.customer) return;

  const invoiceDocId = bike.saleInvoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const saleRef = doc(db, 'users', currentUser.id, 'sales_records', invoiceDocId);
  const nowIso = new Date().toISOString();

  const saleRecord: SaleTransactionRecord = {
    id: invoiceDocId,
    invoiceNumber: bike.saleInvoiceNumber,
    bikeId: bike.id,
    chassisNumber: bike.chassisNumber,
    modelName: bike.modelName,
    color: bike.color,
    saleType: bike.saleType || 'FULL_PAYMENT',
    totalPrice: bike.actualSoldPrice || bike.sellingPrice,
    downPayment: bike.installmentPlan?.downPayment || (bike.saleType === 'FULL_PAYMENT' ? (bike.actualSoldPrice || bike.sellingPrice) : 0),
    remainingBalance: bike.installmentPlan?.remainingBalance || 0,
    customer: bike.customer,
    shopName: bike.shopName || bike.saleShopName || 'Main Hub',
    soldByUserId: currentUser.id,
    soldByUserName: currentUser.name || bike.soldByUserName || 'Staff',
    saleDate: bike.saleDate || nowIso.slice(0, 10),
    createdAt: nowIso
  };

  await setDoc(saleRef, sanitizeForFirestore(saleRecord), { merge: true });
}

/**
 * Record an installment payment transaction in `users/{userId}/payment_transactions/{receiptNumber}`
 */
export async function recordPaymentTransactionDoc(
  bike: EveeBike,
  payment: InstallmentPayment,
  currentUser?: AuthUser | null
): Promise<void> {
  if (!currentUser?.id) return;

  const receiptDocId = (payment.receiptNumber || `rcpt_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const payRef = doc(db, 'users', currentUser.id, 'payment_transactions', receiptDocId);
  const nowIso = new Date().toISOString();

  const paymentRecord: PaymentTransactionRecord = {
    id: receiptDocId,
    receiptNumber: payment.receiptNumber,
    bikeId: bike.id,
    chassisNumber: bike.chassisNumber,
    modelName: bike.modelName,
    amount: payment.amount,
    payerName: payment.payerName,
    paymentMethod: payment.paymentMethod,
    receivedByUserId: currentUser.id,
    receivedByName: currentUser.name || payment.receivedByName,
    paymentDate: payment.paidDate,
    shopName: payment.shopName || bike.shopName,
    notes: payment.notes,
    createdAt: nowIso
  };

  await setDoc(payRef, sanitizeForFirestore(paymentRecord), { merge: true });
}

// ==========================================
// 4. FAST LOCAL BACKUP INITIALIZATION
// ==========================================

export function getCachedBikes(userId?: string | null): EveeBike[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`evee_inventory_bikes_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCachedShops(userId?: string | null): string[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`evee_owner_shops_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
