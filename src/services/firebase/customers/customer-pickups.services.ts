import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

import app from "../firebase";

import type {
  Pickup,
} from "../pickups/pickup.types";

const db = getFirestore(app);

export async function getCustomerPickups(
  customerId: string,
): Promise<Pickup[]> {
  const pickupsRef = collection(
    db,
    "pickups",
  );

  const pickupQuery = query(
    pickupsRef,
    where("customerId", "==", customerId),
  );

  const snapshot = await getDocs(
    pickupQuery,
  );

  return snapshot.docs
    .map((pickupDoc) => {
      const data = pickupDoc.data();

      return {
        id: pickupDoc.id,
        customerId:
          data.customerId ?? "",
        addressId:
          data.addressId ?? "",
        wasteTypeId:
          data.wasteTypeId ?? "",
        estimatedWeight:
          data.estimatedWeight ?? 0,
        actualWeight:
          data.actualWeight ?? null,
        scheduledDate:
          data.scheduledDate ?? "",
        scheduledTime:
          data.scheduledTime ?? "",
        status:
          data.status ?? "pending",
        riderId:
          data.riderId ?? null,
        vehicleId:
          data.vehicleId ?? null,
        notes:
          data.notes ?? "",
        createdAt:
          data.createdAt,
        updatedAt:
          data.updatedAt,
        completedAt:
          data.completedAt ?? null,
      };
    })
    .sort((a, b) =>
      `${b.scheduledDate} ${b.scheduledTime}`.localeCompare(
        `${a.scheduledDate} ${a.scheduledTime}`,
      ),
    );
}