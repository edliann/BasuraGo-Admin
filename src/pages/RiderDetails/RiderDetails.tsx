import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  subscribeToRiderLocation,
} from '../../services/firebase/riders/riders-location.services';

import { getRiders, } from '../../services/firebase/riders/riders.services';

import type { 
  Rider, 
  RiderLocation 
} from '../../services/firebase/riders/riders.types';

import RiderMap from '../../components/RiderMap/RiderMap';

import './RiderDetails.css';

function RiderDetails() {
  const { riderId } = useParams();

  const [rider, setRider] =
    useState<Rider | null>(null);

  const [riderLocation, setRiderLocation] =
    useState<RiderLocation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  // Used to periodically recalculate
  // the rider's online/offline status.
  const [currentTime, setCurrentTime] =
    useState(Date.now());

  useEffect(() => {
    async function loadRider() {
      if (!riderId) {
        setError('Rider ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const riders = await getRiders();

        const foundRider = riders.find(
          (item) => item.id === riderId,
        );

        if (!foundRider) {
          setError('Rider not found.');
          setRider(null);
          return;
        }

        setRider(foundRider);
      } catch (error) {
        console.error(
          'Failed to load rider:',
          error,
        );

        setError(
          'Failed to load rider. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadRider();
  }, [riderId]);

  useEffect(() => {
    if (!riderId) {
      return;
    }

    const unsubscribe =
      subscribeToRiderLocation(
        riderId,
        (location) => {
          setRiderLocation(location);
        },
      );

    return unsubscribe;
  }, [riderId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  function getLocationStatus() {
    if (!riderLocation?.updatedAt) {
      return {
        label: 'Offline',
        className: 'offline',
      };
    }

    const updatedAt =
      riderLocation.updatedAt as {
        toDate?: () => Date;
      };

    if (!updatedAt.toDate) {
      return {
        label: 'Offline',
        className: 'offline',
      };
    }

    const lastUpdated =
      updatedAt.toDate().getTime();

    const ageInMilliseconds =
      currentTime - lastUpdated;

    const twoMinutes =
      2 * 60 * 1000;

    if (
      ageInMilliseconds <
      twoMinutes
    ) {
      return {
        label: 'Online',
        className: 'online',
      };
    }

    return {
      label: 'Offline',
      className: 'offline',
    };
  }

  if (loading) {
    return (
      <section className="rider-details-page">
        <div className="rider-details-state">
          Loading rider...
        </div>
      </section>
    );
  }

  if (error || !rider) {
    return (
      <section className="rider-details-page">
        <Link
          to="/riders"
          className="rider-details-back"
        >
          ← Back to Riders
        </Link>

        <div className="rider-details-state rider-details-error">
          {error || 'Rider not found.'}
        </div>
      </section>
    );
  }

  const locationStatus =
    getLocationStatus();

  return (
    <section className="rider-details-page">
      <div className="rider-details-header">
        <div>
          <Link
            to="/riders"
            className="rider-details-back"
          >
            ← Back to Riders
          </Link>

          <h1>
            {rider.fullName ||
              'Unnamed Rider'}
          </h1>

          <p>
            Rider information and
            account details.
          </p>
        </div>
      </div>

      <div className="rider-details-grid">
        <div className="rider-details-card">
          <h2>
            Personal Information
          </h2>

          <div className="rider-detail-row">
            <span>Name</span>

            <strong>
              {rider.fullName || '—'}
            </strong>
          </div>

          <div className="rider-detail-row">
            <span>Phone Number</span>

            <strong>
              {rider.phoneNumber || '—'}
            </strong>
          </div>

          <div className="rider-detail-row">
            <span>Rider ID</span>

            <strong className="rider-id">
              {rider.id}
            </strong>
          </div>
        </div>

        <div className="rider-details-card">
          <h2>Rider Status</h2>

          <div className="rider-detail-row">
            <span>
              Account Status
            </span>

            <span
              className={`rider-status rider-status-${rider.status}`}
            >
              {rider.status}
            </span>
          </div>

          <div className="rider-detail-row">
            <span>
              Location Status
            </span>

            <span
              className={`location-status location-status-${locationStatus.className}`}
            >
              <span className="location-status-dot" />

              {locationStatus.label}
            </span>
          </div>

          <div className="rider-detail-row">
            <span>
              Assigned Vehicle
            </span>

            <strong>
              {rider.vehicleId ||
                'Unassigned'}
            </strong>
          </div>
        </div>
      </div>

      <div className="rider-details-card">
        <div className="rider-location-header">
          <div>
            <h2>
              Live Location
            </h2>

            <p className="rider-location-status-text">
              {locationStatus.label}
            </p>
          </div>
        </div>

        <RiderMap
          riderId={rider.id}
        />

        {riderLocation && (
          <div className="rider-coordinates">
            <div>
              <span>
                Latitude
              </span>

              <strong>
                {riderLocation.latitude.toFixed(
                  6,
                )}
              </strong>
            </div>

            <div>
              <span>
                Longitude
              </span>

              <strong>
                {riderLocation.longitude.toFixed(
                  6,
                )}
              </strong>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default RiderDetails;