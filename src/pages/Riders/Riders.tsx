import { useEffect, useState } from 'react';

import {
  getRiders,
} from '../../services/firebase/riders/riders.services';

import type { Rider } from '../../services/firebase/riders/riders.types';

import './Riders.css';
import { Link } from 'react-router-dom';

function Riders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRiders() {
      try {
        setLoading(true);
        setError('');

        const riderList = await getRiders();

        setRiders(riderList);
      } catch (error) {
        console.error(
          'Failed to load riders:',
          error,
        );

        setError(
          'Failed to load riders. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadRiders();
  }, []);

  if (loading) {
    return (
      <section className="riders-page">
        <div className="riders-header">
          <div>
            <h1>Riders</h1>
            <p>Manage BasuraGo riders.</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="riders-page">
        <div className="riders-header">
          <div>
            <h1>Riders</h1>
            <p>Manage BasuraGo riders.</p>
          </div>
        </div>

        <div className="riders-state riders-error">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="riders-page">
      <div className="riders-header">
        <div>
          <h1>Riders</h1>
          <p>Manage BasuraGo riders.</p>
        </div>

          <div className="riders-header-actions">
            <span className="riders-count">
              {riders.length} rider
              {riders.length !== 1 ? 's' : ''}
            </span>

            <Link
              to="/riders/invite"
              className="invite-rider-button"
            >
              + Invite Rider
            </Link>
          </div>
      </div>

      <div className="riders-table-card">
        <table className="riders-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Vehicle</th>
            </tr>
          </thead>

          <tbody>
            {riders.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="riders-empty"
                >
                  No riders found.
                </td>
              </tr>
            ) : (
              riders.map((rider) => (
                <tr key={rider.id}>
                  <td>
                    <Link
                    to={`/riders/${rider.id}`}
                    className="rider-name-link"
                    >
                    {rider.fullName || 'Unnamed Rider'}
                    </Link>
                  </td>

                  <td>
                    {rider.phoneNumber || '—'}
                  </td>

                  <td>
                    <span
                      className={`rider-status rider-status-${rider.status}`}
                    >
                      {rider.status}
                    </span>
                  </td>

                  <td>
                    {rider.vehicleId || 'Unassigned'}
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

export default Riders;