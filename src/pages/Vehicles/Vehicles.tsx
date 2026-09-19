import { Link } from 'react-router-dom';
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  createVehicle,
  getVehicles,
} from '../../services/firebase/vehicles/vehicle.services';

import type { Vehicle } from '../../services/firebase/vehicles/vehicle.types';

import './Vehicles.css';

function Vehicles() {
  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [showForm, setShowForm] =
    useState(false);

  const [plateNumber, setPlateNumber] =
    useState('');

  const [vehicleType, setVehicleType] =
    useState('');

  const [capacity, setCapacity] =
    useState('');

  const [creating, setCreating] =
    useState(false);

  const [formError, setFormError] =
    useState('');

  async function loadVehicles() {
    try {
      setLoading(true);
      setError('');

      const vehicleList =
        await getVehicles();

      setVehicles(vehicleList);
    } catch (error) {
      console.error(
        'Failed to load vehicles:',
        error,
      );

      setError(
        'Failed to load vehicles. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  function resetForm() {
    setPlateNumber('');
    setVehicleType('');
    setCapacity('');
    setFormError('');
  }

  function closeForm() {
    if (creating) {
      return;
    }

    resetForm();
    setShowForm(false);
  }

  async function handleCreateVehicle(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setFormError('');

    const trimmedPlateNumber =
      plateNumber.trim();

    const trimmedVehicleType =
      vehicleType.trim();

    const parsedCapacity =
      Number(capacity);

    if (!trimmedPlateNumber) {
      setFormError(
        'Plate number is required.',
      );
      return;
    }

    if (!trimmedVehicleType) {
      setFormError(
        'Vehicle type is required.',
      );
      return;
    }

    if (
      !capacity ||
      !Number.isFinite(parsedCapacity) ||
      parsedCapacity <= 0
    ) {
      setFormError(
        'Capacity must be greater than 0.',
      );
      return;
    }

    try {
      setCreating(true);

      await createVehicle(
        trimmedPlateNumber,
        trimmedVehicleType,
        parsedCapacity,
      );

      resetForm();
      setShowForm(false);

      await loadVehicles();
    } catch (error) {
      console.error(
        'Failed to create vehicle:',
        error,
      );

      setFormError(
        'Failed to create vehicle. Please try again.',
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <section className="vehicles-page">
        <div className="vehicles-header">
          <div>
            <h1>Vehicles</h1>

            <p>
              Manage BasuraGo vehicles.
            </p>
          </div>
        </div>

        <div className="vehicles-state">
          Loading vehicles...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="vehicles-page">
        <div className="vehicles-header">
          <div>
            <h1>Vehicles</h1>

            <p>
              Manage BasuraGo vehicles.
            </p>
          </div>
        </div>

        <div className="vehicles-state vehicles-error">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="vehicles-page">
      <div className="vehicles-header">
        <div>
          <h1>Vehicles</h1>

          <p>
            Manage BasuraGo vehicles.
          </p>
        </div>

        <div className="vehicles-header-actions">
          <span className="vehicles-count">
            {vehicles.length} vehicle
            {vehicles.length !== 1
              ? 's'
              : ''}
          </span>

          <button
            type="button"
            className="vehicles-add-button"
            onClick={() => {
              setFormError('');
              setShowForm(true);
            }}
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      {showForm && (
        <div className="vehicle-form-card">
          <div className="vehicle-form-header">
            <div>
              <h2>Add Vehicle</h2>

              <p>
                Enter the vehicle information.
              </p>
            </div>

            <button
              type="button"
              className="vehicle-close-button"
              onClick={closeForm}
              disabled={creating}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form
            className="vehicle-form"
            onSubmit={handleCreateVehicle}
          >
            <div className="vehicle-form-grid">
              <div className="vehicle-form-field">
                <label htmlFor="plateNumber">
                  Plate Number
                </label>

                <input
                  id="plateNumber"
                  type="text"
                  value={plateNumber}
                  onChange={(event) =>
                    setPlateNumber(
                      event.target.value,
                    )
                  }
                  placeholder="ABC-1234"
                  disabled={creating}
                />
              </div>

              <div className="vehicle-form-field">
                <label htmlFor="vehicleType">
                  Vehicle Type
                </label>

                <input
                  id="vehicleType"
                  type="text"
                  value={vehicleType}
                  onChange={(event) =>
                    setVehicleType(
                      event.target.value,
                    )
                  }
                  placeholder="Truck"
                  disabled={creating}
                />
              </div>

              <div className="vehicle-form-field">
                <label htmlFor="capacity">
                  Capacity
                </label>

                <input
                  id="capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={capacity}
                  onChange={(event) =>
                    setCapacity(
                      event.target.value,
                    )
                  }
                  placeholder="5000"
                  disabled={creating}
                />

                <span className="vehicle-form-help">
                  Enter capacity in kilograms.
                </span>
              </div>
            </div>

            {formError && (
              <div className="vehicle-form-error">
                {formError}
              </div>
            )}

            <div className="vehicle-form-actions">
              <button
                type="button"
                className="vehicle-cancel-button"
                onClick={closeForm}
                disabled={creating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="vehicles-save-button"
                disabled={creating}
              >
                {creating
                  ? 'Creating...'
                  : 'Create Vehicle'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="vehicles-table-card">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Vehicle Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Assigned Rider</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="vehicles-empty"
                >
                  No vehicles found.
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td>
                    <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="vehicle-name-link"
                    >
                    {vehicle.plateNumber || '—'}
                    </Link>
                  </td>

                  <td>
                    {vehicle.vehicleType ||
                      '—'}
                  </td>

                  <td>
                    {vehicle.capacity.toLocaleString()}{' '}
                    kg
                  </td>

                  <td>
                    <span
                      className={`vehicle-status vehicle-status-${vehicle.status}`}
                    >
                      {vehicle.status}
                    </span>
                  </td>

                  <td>
                    {vehicle.assignedRiderId ||
                      'Unassigned'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Vehicles;