import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import app from '../firebase';

import type {
  WasteType,
  WasteTypeStatus,
} from './waste-type.types';

const db = getFirestore(app);

export async function createWasteType(
  name: string,
  description: string,
): Promise<string> {
  const wasteTypeRef = doc(
    collection(db, 'wasteTypes'),
  );

  await setDoc(wasteTypeRef, {
    name,
    description,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return wasteTypeRef.id;
}

export async function getWasteTypes(): Promise<WasteType[]> {
  const wasteTypesRef = collection(
    db,
    'wasteTypes',
  );

  const snapshot = await getDocs(
    wasteTypesRef,
  );

  return snapshot.docs.map(
    (wasteTypeDoc) => {
      const data =
        wasteTypeDoc.data();

      return {
        id: wasteTypeDoc.id,
        name: data.name ?? '',
        description:
          data.description ?? '',
        status:
          data.status ?? 'active',
        createdAt:
          data.createdAt,
        updatedAt:
          data.updatedAt,
      };
    },
  );
}

export async function getWasteType(
  wasteTypeId: string,
): Promise<WasteType | null> {
  const wasteTypeRef = doc(
    db,
    'wasteTypes',
    wasteTypeId,
  );

  const snapshot =
    await getDoc(wasteTypeRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data =
    snapshot.data();

  return {
    id: snapshot.id,
    name: data.name ?? '',
    description:
      data.description ?? '',
    status:
      data.status ?? 'active',
    createdAt:
      data.createdAt,
    updatedAt:
      data.updatedAt,
  };
}

export async function updateWasteType(
  wasteTypeId: string,
  name: string,
  description: string,
): Promise<void> {
  const wasteTypeRef = doc(
    db,
    'wasteTypes',
    wasteTypeId,
  );

  await updateDoc(
    wasteTypeRef,
    {
      name,
      description,
      updatedAt:
        serverTimestamp(),
    },
  );
}

export async function updateWasteTypeStatus(
  wasteTypeId: string,
  status: WasteTypeStatus,
): Promise<void> {
  const wasteTypeRef = doc(
    db,
    'wasteTypes',
    wasteTypeId,
  );

  await updateDoc(
    wasteTypeRef,
    {
      status,
      updatedAt:
        serverTimestamp(),
    },
  );
}