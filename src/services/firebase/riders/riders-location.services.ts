import {
  collection,
  doc,
  GeoPoint,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import app from '../firebase';
import type { RiderLocation } from './riders.types';

const db = getFirestore(app);

export async function updateRiderLocation(
  riderId: string,
  latitude: number,
  longitude: number,
) {
  const locationRef = doc(
    db,
    'riders',
    riderId,
    'location',
    'current',
  );

  await setDoc(
    locationRef,
    {
      location: new GeoPoint(latitude, longitude),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function subscribeToRiderLocation(
  riderId: string,
  onLocationChanged: (
    location: RiderLocation | null,
  ) => void,
) {
  const locationRef = doc(
    db,
    'riders',
    riderId,
    'location',
    'current',
  );

  return onSnapshot(
    locationRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onLocationChanged(null);
        return;
      }

      const data = snapshot.data();

      const location =
        data.location as GeoPoint | undefined;

      if (!location) {
        onLocationChanged(null);
        return;
      }

      onLocationChanged({
        riderId,
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: data.updatedAt,
      });
    },
    (error) => {
      console.error(
        `Failed to listen to rider ${riderId} location:`,
        error,
      );

      onLocationChanged(null);
    },
  );
}

export function subscribeToRiderLocations(
  onLocationsChanged: (locations: RiderLocation[]) => void,
) {
  const ridersRef = collection(db, 'riders');

  const riderLocationUnsubscribers = new Map<
    string,
    () => void
  >();

  const riderLocations = new Map<
    string,
    RiderLocation
  >();

  const unsubscribeRiders = onSnapshot(
    ridersRef,
    (ridersSnapshot) => {
      const currentRiderIds = new Set(
        ridersSnapshot.docs.map(
          (riderDoc) => riderDoc.id,
        ),
      );

      // Remove listeners for riders that no longer exist.
      riderLocationUnsubscribers.forEach(
        (unsubscribeLocation, riderId) => {
          if (!currentRiderIds.has(riderId)) {
            unsubscribeLocation();
            riderLocationUnsubscribers.delete(
              riderId,
            );

            riderLocations.delete(riderId);
          }
        },
      );

      // Create a location listener for each rider.
      ridersSnapshot.docs.forEach((riderDoc) => {
        const riderId = riderDoc.id;

        if (
          riderLocationUnsubscribers.has(riderId)
        ) {
          return;
        }

        const locationRef = doc(
          db,
          'riders',
          riderId,
          'location',
          'current',
        );

        const unsubscribeLocation = onSnapshot(
          locationRef,
          (locationSnapshot) => {
            if (!locationSnapshot.exists()) {
              riderLocations.delete(riderId);

              onLocationsChanged(
                Array.from(riderLocations.values()),
              );

              return;
            }

            const data = locationSnapshot.data();

            const location =
              data.location as GeoPoint | undefined;

            if (!location) {
              return;
            }

            riderLocations.set(riderId, {
              riderId,
              latitude: location.latitude,
              longitude: location.longitude,
              updatedAt: data.updatedAt,
            });

            onLocationsChanged(
              Array.from(riderLocations.values()),
            );
          },
          (error) => {
            console.error(
              `Failed to listen to rider ${riderId} location:`,
              error,
            );
          },
        );

        riderLocationUnsubscribers.set(
          riderId,
          unsubscribeLocation,
        );
      });

      onLocationsChanged(
        Array.from(riderLocations.values()),
      );
    },
    (error) => {
      console.error(
        'Failed to listen to riders:',
        error,
      );
    },
  );

  return () => {
    unsubscribeRiders();

    riderLocationUnsubscribers.forEach(
      (unsubscribeLocation) => {
        unsubscribeLocation();
      },
    );

    riderLocationUnsubscribers.clear();
    riderLocations.clear();
  };
}