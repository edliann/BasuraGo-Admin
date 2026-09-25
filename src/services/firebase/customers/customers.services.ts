import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  deleteDoc,
  GeoPoint,
} from 'firebase/firestore';

import app from '../firebase';
import type { Customer, CustomerAddress, CustomerStatus, } from './customers.types';

import {
  getFunctions,
  httpsCallable,
} from "firebase/functions";


const db = getFirestore(app);

const functions = getFunctions(
  app,
  "us-central1",
);

export async function createCustomerProfile(
  uid: string,
  fullName: string,
  phoneNumber: string,
): Promise<void> {
  const customerRef = doc(
    db,
    'customers',
    uid,
  );

  await setDoc(customerRef, {
    fullName,
    phoneNumber,
    status: 'active',
    createdAt:
      serverTimestamp(),
    updatedAt:
      serverTimestamp(),
  });
}

export async function getCustomers(): Promise<Customer[]> {
  const customersRef = collection(
    db,
    "customers",
  );

  const snapshot = await getDocs(
    customersRef,
  );

  return snapshot.docs.map((customerDoc) => {
    const data = customerDoc.data();

    return {
      id: customerDoc.id,
      fullName:
        typeof data.fullName === "string"
          ? data.fullName
          : "",
      email:
        typeof data.email === "string"
          ? data.email
          : "",
      phoneNumber:
        typeof data.phoneNumber === "string"
          ? data.phoneNumber
          : "",
      phoneCountryCode:
        typeof data.phoneCountryCode === "string"
          ? data.phoneCountryCode
          : "",
      phoneVerified:
        data.phoneVerified === true,
      onboardingCompleted:
        data.onboardingCompleted === true,
      status:
        data.status === "inactive" ||
        data.status === "suspended"
          ? data.status
          : "active",
      defaultAddressId:
        typeof data.defaultAddressId === "string"
          ? data.defaultAddressId
          : undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
}

export async function getCustomer(
  customerId: string,
): Promise<Customer | null> {
  const customerRef = doc(
    db,
    "customers",
    customerId,
  );

  const snapshot = await getDoc(
    customerRef,
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    fullName:
      typeof data.fullName === "string"
        ? data.fullName
        : "",
    email:
      typeof data.email === "string"
        ? data.email
        : "",
    phoneNumber:
      typeof data.phoneNumber === "string"
        ? data.phoneNumber
        : "",
    phoneCountryCode:
      typeof data.phoneCountryCode === "string"
        ? data.phoneCountryCode
        : "",
    phoneVerified:
      data.phoneVerified === true,
    onboardingCompleted:
      data.onboardingCompleted === true,
    status:
      data.status === "inactive" ||
      data.status === "suspended"
        ? data.status
        : "active",
    defaultAddressId:
      typeof data.defaultAddressId === "string"
        ? data.defaultAddressId
        : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function updateCustomer(
  customerId: string,
  fullName: string,
): Promise<void> {
  if (!fullName.trim()) {
    throw new Error(
      "Customer name is required.",
    );
  }

  const customerRef = doc(
    db,
    "customers",
    customerId,
  );

  await updateDoc(customerRef, {
    fullName: fullName.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCustomerStatus(
  customerId: string,
  status: CustomerStatus,
): Promise<void> {
  const callable = httpsCallable<
    {
      customerId: string;
      status: CustomerStatus;
    },
    {success: boolean}
  >(
    functions,
    "updateCustomerStatusFunction",
  );

  await callable({
    customerId,
    status,
  });
}

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