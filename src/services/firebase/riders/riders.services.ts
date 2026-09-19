import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  getFirestore,
  serverTimestamp,
} from 'firebase/firestore';

import app from '../firebase';
import type { Rider } from './riders.types';

const db = getFirestore(app);


export async function createRiderProfile(
  uid: string,
  fullName: string,
  phoneNumber: string,
) {
  await setDoc(doc(db, 'riders', uid), {
    fullName,
    phoneNumber,
    status: 'pending',
    vehicleId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getRiders(): Promise<Rider[]> {
  const ridersRef = collection(db, 'riders');

  const snapshot = await getDocs(ridersRef);

  return snapshot.docs.map((riderDoc) => {
    const data = riderDoc.data();

    return {
      id: riderDoc.id,
      fullName: data.fullName ?? '',
      phoneNumber: data.phoneNumber ?? '',
      status: data.status ?? 'pending',
      vehicleId: data.vehicleId ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function getRider(
  riderId: string,
): Promise<Rider | null> {
  const riderRef = doc(
    db,
    'riders',
    riderId,
  );

  const snapshot =
    await getDoc(riderRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Rider;
}