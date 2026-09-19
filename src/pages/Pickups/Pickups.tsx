import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import {
  getPickups,
} from '../../services/firebase/pickups/pickup.services';

import type {
  PickupDisplayData,
} from '../../services/firebase/pickups/pickup.types';

import {
  resolvePickupDisplayData,
} from '../../services/firebase/pickups/pickup-display.service';

import './Pickups.css';

function Pickups() {
  const [pickups, setPickups] =
    useState<PickupDisplayData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadPickups() {
      try {
        setLoading(true);
        setError('');

        const data =
          await getPickups();

        const resolvedPickups =
          await Promise.all(
            data.map((pickup) =>
              resolvePickupDisplayData(
                pickup,
              ),
            ),
          );

        setPickups(resolvedPickups);
      } catch (err) {
        console.error(
          'Failed to load pickups:',
          err,
        );

        setError(
          'Failed to load pickups.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadPickups();
  }, []);

  if (loading) {
    return (
      <section className="pickups-page">
        <div className="pickups-header">
          <div>
            <h1>Pickups</h1>
            <p>
              Manage scheduled waste
              pickups.
            </p>
          </div>
        </div>

        <div className="pickups-state">
          Loading pickups...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pickups-page">
        <div className="pickups-header">
          <div>
            <h1>Pickups</h1>
            <p>
              Manage scheduled waste
              pickups.
            </p>
          </div>
        </div>

        <div className="pickups-state pickups-error">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="pickups-page">
      <div className="pickups-header">
        <div>
          <h1>Pickups</h1>

          <p>
            Manage scheduled waste
            pickups.
          </p>
        </div>
      </div>

      {pickups.length === 0 ? (
        <div className="pickups-state">
          No pickups found.
        </div>
      ) : (
        <div className="pickups-table-container">
          <table className="pickups-table">
            <thead>
              <tr>
                <th>Pickup ID</th>
                <th>Customer</th>
                <th>Schedule</th>
                <th>Waste Type</th>
                <th>Est. Weight</th>
                <th>Status</th>
                <th>Rider</th>
                <th>Vehicle</th>
              </tr>
            </thead>

            <tbody>
              {pickups.map((pickup) => (
                <tr key={pickup.pickup.id}>
                  <td>
                    <Link
                      to={`/pickups/${pickup.pickup.id}`}
                    >
                      {pickup.pickup.id}
                    </Link>
                  </td>

                  <td>
                    {pickup.customerName}
                  </td>

                  <td>
                    <div>
                      {pickup.pickup.scheduledDate}
                    </div>

                    <small>
                      {pickup.pickup.scheduledTime}
                    </small>
                  </td>

                  <td>
                    {pickup.wasteTypeName}
                  </td>

                  <td>
                    {pickup.pickup.estimatedWeight} kg
                  </td>

                  <td>
                    <span
                      className={`pickup-status pickup-status-${pickup.pickup.status}`}
                    >
                      {pickup.pickup.status}
                    </span>
                  </td>

                  <td>
                    {pickup.riderName ?? 'Unassigned'}
                  </td>

                  <td>
                    {pickup.vehiclePlateNumber ?? 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Pickups;