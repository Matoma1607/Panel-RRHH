import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Announcement,
  DocumentItem,
  CelebrationItem,
  AppNotification,
  CompanyInfo
} from '../types';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_CELEBRATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPANY_INFO
} from '../mockData';

let isBootstrapCheckDone = false;

// One-time bootstrap: Only populate initial company info if the DB is freshly created
export async function initializeFirestoreDefaults() {
  if (isBootstrapCheckDone) return;
  isBootstrapCheckDone = true;

  try {
    const bootstrapRef = doc(db, 'company', 'bootstrap');
    const snap = await getDoc(bootstrapRef);

    if (!snap.exists()) {
      await setDoc(doc(db, 'company', 'main'), INITIAL_COMPANY_INFO);

      await setDoc(bootstrapRef, {
        initializedAt: new Date().toISOString(),
        version: 3
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'company/bootstrap');
  }
}

// Generic helper to subscribe to any collection in Firestore
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  initialFallback: T[]
) {
  try {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...(docSnap.data() as T), id: docSnap.id });
        });
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, collectionName);
        onData(initialFallback);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return () => {};
  }
}

// Subscribe to a single document (like company settings)
export function subscribeDocument<T>(
  collectionName: string,
  docId: string,
  onData: (data: T) => void,
  initialFallback: T
) {
  try {
    const docRef = doc(db, collectionName, docId);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onData(docSnap.data() as T);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
        onData(initialFallback);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${collectionName}/${docId}`);
    return () => {};
  }
}

// Save document helper
export async function saveDocToFirestore<T extends { id?: string }>(
  collectionName: string,
  docId: string,
  data: T
) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, id: docId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// Delete document helper
export async function deleteDocFromFirestore(collectionName: string, docId: string) {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

// Save single document by collection/id
export async function saveSingleConfig<T>(collectionName: string, docId: string, data: T) {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data as any, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}
