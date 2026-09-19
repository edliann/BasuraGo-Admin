import {
  collection,
  doc,
  getDocs,
  getDoc,
  getFirestore,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import type { Vehicle } from './vehicle.types';

import app from '../firebase';

const db = getFirestore(app);

export async function createVehicle(
  plateNumber: string,
  vehicleType: string,
  capacity: number,
): Promise<string> {
  const vehicleRef = doc(
    collection(db, 'vehicles'),
  );

  await setDoc(vehicleRef, {
    plateNumber,
    vehicleType,
    capacity,
    status: 'active',
    assignedRiderId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return vehicleRef.id;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const vehiclesRef = collection(
    db,
    'vehicles',
  );

  const snapshot = await getDocs(
    vehiclesRef,
  );

  return snapshot.docs.map((vehicleDoc) => {
    const data = vehicleDoc.data();

    return {
      id: vehicleDoc.id,
      plateNumber: data.plateNumber ?? '',
      vehicleType: data.vehicleType ?? '',
      capacity: data.capacity ?? 0,
      status: data.status ?? 'active',
      assignedRiderId:
        data.assignedRiderId ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function getVehicle(
  vehicleId: string,
): Promise<Vehicle | null> {
  const vehicleRef = doc(
    db,
    'vehicles',
    vehicleId,
  );

  const snapshot =
    await getDoc(vehicleRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Vehicle;
}

export async function assignRiderToVehicle(
  riderId: string,
  vehicleId: string,
): Promise<void> {
  const riderRef = doc(
    db,
    'riders',
    riderId,
  );

  const vehicleRef = doc(
    db,
    'vehicles',
    vehicleId,
  );

  await runTransaction(
    db,
    async (transaction) => {
      const riderSnapshot =
        await transaction.get(riderRef);

      const vehicleSnapshot =
        await transaction.get(vehicleRef);

      if (!riderSnapshot.exists()) {
        throw new Error('Rider not found.');
      }

      if (!vehicleSnapshot.exists()) {
        throw new Error('Vehicle not found.');
      }

      const riderData =
        riderSnapshot.data();

      const vehicleData =
        vehicleSnapshot.data();

      const currentVehicleId =
        riderData.vehicleId ?? null;

      const currentRiderId =
        vehicleData.assignedRiderId ?? null;

      if (
        currentVehicleId &&
        currentVehicleId !== vehicleId
      ) {
        throw new Error(
          'Rider is already assigned to another vehicle.',
        );
      }

      if (
        currentRiderId &&
        currentRiderId !== riderId
      ) {
        throw new Error(
          'Vehicle is already assigned to another rider.',
        );
      }

      transaction.update(
        riderRef,
        {
          vehicleId,
          updatedAt: serverTimestamp(),
        },
      );

      transaction.update(
        vehicleRef,
        {
          assignedRiderId: riderId,
          updatedAt: serverTimestamp(),
        },
      );
    },
  );
}