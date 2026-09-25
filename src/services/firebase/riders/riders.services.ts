import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import app from '../firebase';

import type {
  Rider,
  RiderStatus,
} from './riders.types';

const db = getFirestore(app);

export async function createRiderProfile(
  uid: string,
  fullName: string,
  phoneNumber: string,
) {
  await setDoc(
    doc(db, 'riders', uid),
    {
      fullName,
      phoneNumber,
      status: 'pending',
      vehicleId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );
}

function mapRider(
  riderId: string,
  data: Record<string, unknown>,
): Rider {
  const rawStatus = data.status;

  const status: RiderStatus =
    rawStatus === 'active' ||
    rawStatus === 'suspended' ||
    rawStatus === 'disabled' ||
    rawStatus === 'pending'
      ? rawStatus
      : 'pending';

  return {
    id: riderId,
    fullName:
      typeof data.fullName === 'string'
        ? data.fullName
        : '',
    phoneNumber:
      typeof data.phoneNumber === 'string'
        ? data.phoneNumber
        : '',
    status,
    vehicleId:
      typeof data.vehicleId === 'string'
        ? data.vehicleId
        : null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getRiders(): Promise<Rider[]> {
  const snapshot = await getDocs(
    collection(db, 'riders'),
  );

  return snapshot.docs
    .map((riderDoc) =>
      mapRider(
        riderDoc.id,
        riderDoc.data() as Record<string, unknown>,
      ),
    )
    .sort((a, b) =>
      a.fullName.localeCompare(b.fullName),
    );
}

export async function getRider(
  riderId: string,
): Promise<Rider | null> {
  const snapshot = await getDoc(
    doc(db, 'riders', riderId),
  );

  if (!snapshot.exists()) {
    return null;
  }

  return mapRider(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );
}