import {
  collection,
  deleteDoc,
  doc,
  GeoPoint,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import app from '../firebase';
import type { CustomerAddress } from './customers.types';

const db = getFirestore(app);

export async function createCustomerAddress(
  customerId: string,
  label: string,
  address: string,
  latitude: number,
  longitude: number,
  isDefault: boolean,
): Promise<string> {
  const addressesRef = collection(
    db,
    'customers',
    customerId,
    'addresses',
  );

  const addressRef = doc(
    addressesRef,
  );

  const existingAddresses =
    await getDocs(addressesRef);

  const batch = writeBatch(db);

  if (isDefault) {
    existingAddresses.docs.forEach(
      (addressDoc) => {
        batch.update(
          addressDoc.ref,
          {
            isDefault: false,
            updatedAt:
              serverTimestamp(),
          },
        );
      },
    );
  }

  batch.set(addressRef, {
    label,
    address,
    location: new GeoPoint(
      latitude,
      longitude,
    ),
    isDefault,
    createdAt:
      serverTimestamp(),
    updatedAt:
      serverTimestamp(),
  });

  await batch.commit();

  return addressRef.id;
}

export async function getCustomerAddresses(
  customerId: string,
): Promise<CustomerAddress[]> {
  const addressesRef =
    collection(
      db,
      'customers',
      customerId,
      'addresses',
    );

  const snapshot =
    await getDocs(addressesRef);

  return snapshot.docs.map(
    (addressDoc) => {
      const data =
        addressDoc.data();

      const location =
        data.location as
          | GeoPoint
          | undefined;

      return {
        id: addressDoc.id,
        label:
          data.label ?? '',
        address:
          data.address ?? '',
        latitude:
          location?.latitude ?? 0,
        longitude:
          location?.longitude ?? 0,
        isDefault:
          data.isDefault === true,
        createdAt:
          data.createdAt,
        updatedAt:
          data.updatedAt,
      };
    },
  );
}

export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  label: string,
  address: string,
  latitude: number,
  longitude: number,
  isDefault: boolean,
): Promise<void> {
  const addressRef = doc(
    db,
    'customers',
    customerId,
    'addresses',
    addressId,
  );

  const addressesRef = collection(
    db,
    'customers',
    customerId,
    'addresses',
  );

  const addressSnapshot =
    await getDoc(addressRef);

  if (!addressSnapshot.exists()) {
    throw new Error(
      'Address not found.',
    );
  }

  const existingAddresses =
    await getDocs(addressesRef);

  const batch = writeBatch(db);

  if (isDefault) {
    existingAddresses.docs.forEach(
      (addressDoc) => {
        if (
          addressDoc.id !== addressId
        ) {
          batch.update(
            addressDoc.ref,
            {
              isDefault: false,
              updatedAt:
                serverTimestamp(),
            },
          );
        }
      },
    );
  }

  batch.update(addressRef, {
    label,
    address,
    location: new GeoPoint(
      latitude,
      longitude,
    ),
    isDefault,
    updatedAt:
      serverTimestamp(),
  });

  await batch.commit();
}

export async function setDefaultCustomerAddress(
  customerId: string,
  addressId: string,
): Promise<void> {
  const addressRef = doc(
    db,
    'customers',
    customerId,
    'addresses',
    addressId,
  );

  const addressesRef = collection(
    db,
    'customers',
    customerId,
    'addresses',
  );

  const addressSnapshot =
    await getDoc(addressRef);

  if (!addressSnapshot.exists()) {
    throw new Error(
      'Address not found.',
    );
  }

  const existingAddresses =
    await getDocs(addressesRef);

  const batch = writeBatch(db);

  existingAddresses.docs.forEach(
    (addressDoc) => {
      batch.update(
        addressDoc.ref,
        {
          isDefault:
            addressDoc.id ===
            addressId,
          updatedAt:
            serverTimestamp(),
        },
      );
    },
  );

  await batch.commit();
}

export async function deleteCustomerAddress(
  customerId: string,
  addressId: string,
): Promise<void> {
  const addressRef = doc(
    db,
    'customers',
    customerId,
    'addresses',
    addressId,
  );

  await deleteDoc(addressRef);
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  capacity: number;
  status: string;
  assignedRiderId: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}