import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import type {
  PickupDisplayData,
} from '../../services/firebase/pickups/pickup.types';

import {
  resolvePickupDisplayData,
} from '../../services/firebase/pickups/pickup-display.service';

import {
  getPickup,
} from '../../services/firebase/pickups/pickup.services';

import './PickupDetails.css';

function PickupDetails() {
  const { pickupId } = useParams<{
    pickupId: string;
  }>();

  const [pickup, setPickup] =
    useState<PickupDisplayData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadPickup() {
      if (!pickupId) {
        setError('Pickup ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const data =
          await getPickup(pickupId);

        if (!data) {
          setError('Pickup not found.');
          setLoading(false);
          return;
        }

        const resolvedPickup =
          await resolvePickupDisplayData(
            data,
          );

        setPickup(resolvedPickup);
      } catch (err) {
        console.error(
          'Failed to load pickup:',
          err,
        );

        setError(
          'Failed to load pickup.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadPickup();
  }, [pickupId]);

  if (loading) {
    return (
      <section className="pickup-details-page">
        <p>Loading pickup...</p>
      </section>
    );
  }

  if (error || !pickup) {
    return (
      <section className="pickup-details-page">
        <Link
          to="/pickups"
          className="pickup-details-back"
        >
          ← Back to Pickups
        </Link>

        <div className="pickup-details-state">
          {error || 'Pickup not found.'}
        </div>
      </section>
    );
  }

  return (
    <section className="pickup-details-page">
      <div className="pickup-details-header">
        <div>
          <Link
            to="/pickups"
            className="pickup-details-back"
          >
            ← Back to Pickups
          </Link>

          <h1>Pickup Details</h1>

          <p>
            Pickup ID: {pickup.pickup.id}
          </p>
        </div>

        <span
          className={`pickup-status pickup-status-${pickup.pickup.status}`}
        >
          {pickup.pickup.status.replace(
            '_',
            ' ',
          )}
        </span>
      </div>

      <div className="pickup-details-grid">
        <div className="pickup-details-card">
          <h2>Customer</h2>

          <div className="pickup-detail-row">
            <span>Customer ID</span>
            <strong>
              {pickup.pickup.customerId}
            </strong>
          </div>

          <div className="pickup-detail-row">
            <span>Address ID</span>
            <strong>
              {pickup.pickup.addressId}
            </strong>
          </div>
        </div>

        <div className="pickup-details-card">
          <h2>Waste Information</h2>

          <div className="pickup-detail-row">
            <span>Waste Type ID</span>
            <strong>
              {pickup.pickup.wasteTypeId}
            </strong>
          </div>

          <div className="pickup-detail-row">
            <span>Estimated Weight</span>
            <strong>
              {pickup.pickup.estimatedWeight} kg
            </strong>
          </div>

          <div className="pickup-detail-row">
            <span>Actual Weight</span>
            <strong>
              {pickup.pickup.actualWeight !== null
                ? `${pickup.pickup.actualWeight} kg`
                : 'Not recorded'}
            </strong>
          </div>
        </div>

        <div className="pickup-details-card">
          <h2>Schedule</h2>

          <div className="pickup-detail-row">
            <span>Date</span>
            <strong>
              {pickup.pickup.scheduledDate}
            </strong>
          </div>

          <div className="pickup-detail-row">
            <span>Time</span>
            <strong>
              {pickup.pickup.scheduledTime}
            </strong>
          </div>
        </div>

        <div className="pickup-details-card">
          <h2>Assignment</h2>

          <div className="pickup-detail-row">
            <span>Rider</span>
            <strong>
              {pickup.pickup.riderId ??
                'Unassigned'}
            </strong>
          </div>

          <div className="pickup-detail-row">
            <span>Vehicle</span>
            <strong>
              {pickup.pickup.vehicleId ??
                'Unassigned'}
            </strong>
          </div>
        </div>

        <div className="pickup-details-card pickup-details-card-full">
          <h2>Notes</h2>

          <p className="pickup-notes">
            {pickup.pickup.notes ||
              'No notes added.'}
          </p>
        </div>

        <div className="pickup-details-card">
          <h2>Created</h2>

          <p>
            {pickup.pickup.createdAt
              ? String(pickup.pickup.createdAt)
              : 'Not available'}
          </p>
        </div>

        <div className="pickup-details-card">
          <h2>Last Updated</h2>

          <p>
            {pickup.pickup.updatedAt
              ? String(pickup.pickup.updatedAt)
              : 'Not available'}
          </p>
        </div>

        <div className="pickup-details-card">
          <h2>Completed</h2>

          <p>
            {pickup.pickup.completedAt
              ? String(pickup.pickup.completedAt)
              : 'Not completed'}
          </p>
        </div>
      </div>
    </section>
  );
}

export default PickupDetails;