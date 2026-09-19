import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import app from '../firebase';

import type { Pickup } from './pickup.types';

import {
  getCustomer,
} from '../customers/customers.services';

import {
  getCustomerAddresses,
} from '../customers/address.services';

import {
  getWasteType,
} from '../waste-types/waste-types.service';

const db = getFirestore(app);

export async function createPickup(
  customerId: string,
  addressId: string,
  wasteTypeId: string,
  estimatedWeight: number,
  scheduledDate: string,
  scheduledTime: string,
  notes: string,
): Promise<string> {
  const [
    customer,
    addresses,
    wasteType,
  ] = await Promise.all([
    getCustomer(customerId),
    getCustomerAddresses(customerId),
    getWasteType(wasteTypeId),
  ]);

  if (!customer) {
    throw new Error(
      'Customer not found.',
    );
  }

  const address =
    addresses.find(
      (item) =>
        item.id === addressId,
    ) ?? null;

  if (!address) {
    throw new Error(
      'Pickup address not found.',
    );
  }

  if (!wasteType) {
    throw new Error(
      'Waste type not found.',
    );
  }

  const pickupRef = doc(
    collection(db, 'pickups'),
  );

  await setDoc(pickupRef, {
    // Relationship IDs.
    customerId,
    addressId,
    wasteTypeId,

    // Display snapshots.
    customerName: customer.fullName,
    pickupAddress: address.address,
    wasteTypeName: wasteType.name,

    estimatedWeight,
    actualWeight: null,

    scheduledDate,
    scheduledTime,

    status: 'pending',

    riderId: null,
    vehicleId: null,

    notes,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  });

  return pickupRef.id;
}

export async function getPickups(): Promise<Pickup[]> {
  const pickupsRef = collection(
    db,
    'pickups',
  );

  const snapshot = await getDocs(
    pickupsRef,
  );

  return snapshot.docs.map((pickupDoc) => {
    const data = pickupDoc.data();

    return {
      id: pickupDoc.id,
      customerId: data.customerId ?? '',
      addressId: data.addressId ?? '',
      wasteTypeId: data.wasteTypeId ?? '',
      estimatedWeight:
        data.estimatedWeight ?? 0,
      actualWeight:
        data.actualWeight ?? null,
      scheduledDate:
        data.scheduledDate ?? '',
      scheduledTime:
        data.scheduledTime ?? '',
      status:
        data.status ?? 'pending',
      riderId:
        data.riderId ?? null,
      vehicleId:
        data.vehicleId ?? null,
      notes:
        data.notes ?? '',
      createdAt:
        data.createdAt,
      updatedAt:
        data.updatedAt,
      completedAt:
        data.completedAt ?? null,
    };
  });
}

export async function getPickup(
  pickupId: string,
): Promise<Pickup | null> {
  const pickupRef = doc(
    db,
    'pickups',
    pickupId,
  );

  const snapshot =
    await getDoc(pickupRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    customerId:
      data.customerId ?? '',
    addressId:
      data.addressId ?? '',
    wasteTypeId:
      data.wasteTypeId ?? '',
    estimatedWeight:
      data.estimatedWeight ?? 0,
    actualWeight:
      data.actualWeight ?? null,
    scheduledDate:
      data.scheduledDate ?? '',
    scheduledTime:
      data.scheduledTime ?? '',
    status:
      data.status ?? 'pending',
    riderId:
      data.riderId ?? null,
    vehicleId:
      data.vehicleId ?? null,
    notes:
      data.notes ?? '',
    createdAt:
      data.createdAt,
    updatedAt:
      data.updatedAt,
    completedAt:
      data.completedAt ?? null,
  };
}

export async function updatePickup(
  pickupId: string,
  data: {
    customerId?: string;
    addressId?: string;
    wasteTypeId?: string;
    estimatedWeight?: number;
    actualWeight?: number | null;
    scheduledDate?: string;
    scheduledTime?: string;
    status?: string;
    riderId?: string | null;
    vehicleId?: string | null;
    notes?: string;
    completedAt?: unknown;
  },
): Promise<void> {
  const pickupRef = doc(
    db,
    'pickups',
    pickupId,
  );

  await updateDoc(pickupRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function acceptPickup(
  pickupId: string,
  riderId: string,
): Promise<void> {
  const pickupRef = doc(
    db,
    'pickups',
    pickupId,
  );

  const riderRef = doc(
    db,
    'riders',
    riderId,
  );

  await runTransaction(
    db,
    async (transaction) => {
      const pickupSnapshot =
        await transaction.get(
          pickupRef,
        );

      const riderSnapshot =
        await transaction.get(
          riderRef,
        );

      if (!pickupSnapshot.exists()) {
        throw new Error(
          'Pickup not found.',
        );
      }

      if (!riderSnapshot.exists()) {
        throw new Error(
          'Rider not found.',
        );
      }

      const pickupData =
        pickupSnapshot.data();

      const riderData =
        riderSnapshot.data();

      if (
        pickupData.status !==
        'pending'
      ) {
        throw new Error(
          'This pickup is no longer available.',
        );
      }

      const vehicleId =
        riderData.vehicleId ?? null;

      if (!vehicleId) {
        throw new Error(
          'Rider does not have an assigned vehicle.',
        );
      }

      const vehicleRef = doc(
        db,
        'vehicles',
        vehicleId,
      );

      const vehicleSnapshot =
        await transaction.get(
          vehicleRef,
        );

      if (!vehicleSnapshot.exists()) {
        throw new Error(
          'Assigned vehicle not found.',
        );
      }

      const vehicleData =
        vehicleSnapshot.data();

      if (
        vehicleData.assignedRiderId !==
        riderId
      ) {
        throw new Error(
          'Rider is not assigned to this vehicle.',
        );
      }

      transaction.update(
        pickupRef,
        {
          riderId,
          vehicleId,
          status: 'accepted',
          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );
}