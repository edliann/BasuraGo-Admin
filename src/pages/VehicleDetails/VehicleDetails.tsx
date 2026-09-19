import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  assignRiderToVehicle,
  getVehicles,
} from '../../services/firebase/vehicles/vehicle.services';

import {
  getRiders,
} from '../../services/firebase/riders/riders.services';

import type { Rider } from '../../services/firebase/riders/riders.types';
import type { Vehicle } from '../../services/firebase/vehicles/vehicle.types';

import './VehicleDetails.css';

function VehicleDetails() {
  const { vehicleId } = useParams();

  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [riders, setRiders] =
    useState<Rider[]>([]);

  const [selectedRiderId, setSelectedRiderId] =
    useState('');

  const [assigning, setAssigning] =
    useState(false);

  const [assignmentError, setAssignmentError] =
    useState('');    

  useEffect(() => {
    async function loadVehicle() {
      if (!vehicleId) {
        setError('Vehicle ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const vehicles =
          await getVehicles();

        const foundVehicle =
          vehicles.find(
            (item) =>
              item.id === vehicleId,
          );

        if (!foundVehicle) {
          setError('Vehicle not found.');
          setVehicle(null);
          return;
        }

        setVehicle(foundVehicle);
      } catch (error) {
        console.error(
          'Failed to load vehicle:',
          error,
        );

        setError(
          'Failed to load vehicle. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, [vehicleId]);

  useEffect(() => {
    async function loadRiders() {
        try {
        const riderList =
            await getRiders();

        setRiders(riderList);
        } catch (error) {
        console.error(
            'Failed to load riders:',
            error,
        );
        }
    }

    loadRiders();
    }, []);

  async function handleAssignRider() {
    if (!vehicle) {
        return;
    }

    if (!selectedRiderId) {
        setAssignmentError(
        'Please select a rider.',
        );
        return;
    }

    try {
        setAssigning(true);
        setAssignmentError('');

        await assignRiderToVehicle(
        selectedRiderId,
        vehicle.id,
        );

        const vehicles =
        await getVehicles();

        const updatedVehicle =
        vehicles.find(
            (item) =>
            item.id === vehicle.id,
        );

        if (updatedVehicle) {
        setVehicle(updatedVehicle);
        }

        setSelectedRiderId('');
    } catch (error) {
        console.error(
        'Failed to assign rider:',
        error,
        );

        if (
        error instanceof Error
        ) {
        setAssignmentError(
            error.message,
        );
        } else {
        setAssignmentError(
            'Failed to assign rider. Please try again.',
        );
        }
    } finally {
        setAssigning(false);
    }
    }  

  if (loading) {
    return (
      <section className="vehicle-details-page">
        <div className="vehicle-details-state">
          Loading vehicle...
        </div>
      </section>
    );
  }

  if (error || !vehicle) {
    return (
      <section className="vehicle-details-page">
        <Link
          to="/vehicles"
          className="vehicle-details-back"
        >
          ← Back to Vehicles
        </Link>

        <div className="vehicle-details-state vehicle-details-error">
          {error || 'Vehicle not found.'}
        </div>
      </section>
    );
  }

  return (
    <section className="vehicle-details-page">
      <div className="vehicle-details-header">
        <div>
          <Link
            to="/vehicles"
            className="vehicle-details-back"
          >
            ← Back to Vehicles
          </Link>

          <h1>
            {vehicle.plateNumber ||
              'Unnamed Vehicle'}
          </h1>

          <p>
            Vehicle information and
            assignment details.
          </p>
        </div>
      </div>

      <div className="vehicle-details-grid">
        <div className="vehicle-details-card">
          <h2>
            Vehicle Information
          </h2>

          <div className="vehicle-detail-row">
            <span>
              Plate Number
            </span>

            <strong>
              {vehicle.plateNumber ||
                '—'}
            </strong>
          </div>

          <div className="vehicle-detail-row">
            <span>
              Vehicle Type
            </span>

            <strong>
              {vehicle.vehicleType ||
                '—'}
            </strong>
          </div>

          <div className="vehicle-detail-row">
            <span>
              Capacity
            </span>

            <strong>
              {vehicle.capacity.toLocaleString()}{' '}
              kg
            </strong>
          </div>

          <div className="vehicle-detail-row">
            <span>
              Vehicle ID
            </span>

            <strong className="vehicle-id">
              {vehicle.id}
            </strong>
          </div>
        </div>

        <div className="vehicle-details-card">
          <h2>
            Vehicle Status
          </h2>

          <div className="vehicle-detail-row">
            <span>
              Status
            </span>

            <span
              className={`vehicle-status vehicle-status-${vehicle.status}`}
            >
              {vehicle.status}
            </span>
          </div>

            <div className="vehicle-detail-row vehicle-assignment-row">
            <span>Assigned Rider</span>

            {vehicle.assignedRiderId ? (
                <strong>
                {riders.find(
                    (rider) =>
                    rider.id ===
                    vehicle.assignedRiderId,
                )?.fullName ||
                    vehicle.assignedRiderId}
                </strong>
            ) : (
                <span className="vehicle-unassigned">
                Unassigned
                </span>
            )}
            </div>

            {!vehicle.assignedRiderId && (
            <div className="vehicle-assignment-form">
                <label htmlFor="assignedRider">
                Assign Rider
                </label>

                <div className="vehicle-assignment-controls">
                <select
                    id="assignedRider"
                    value={selectedRiderId}
                    onChange={(event) => {
                    setSelectedRiderId(
                        event.target.value,
                    );
                    setAssignmentError('');
                    }}
                    disabled={assigning}
                >
                    <option value="">
                    Select a rider
                    </option>

                    {riders
                    .filter(
                        (rider) =>
                        !rider.vehicleId,
                    )
                    .map((rider) => (
                        <option
                        key={rider.id}
                        value={rider.id}
                        >
                        {rider.fullName ||
                            'Unnamed Rider'}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    className="vehicle-assign-button"
                    onClick={handleAssignRider}
                    disabled={
                    assigning ||
                    !selectedRiderId
                    }
                >
                    {assigning
                    ? 'Assigning...'
                    : 'Assign Rider'}
                </button>
                </div>

                {assignmentError && (
                <div className="vehicle-assignment-error">
                    {assignmentError}
                </div>
                )}
            </div>
            )}
        </div>
      </div>
    </section>
  );
}

export default VehicleDetails;