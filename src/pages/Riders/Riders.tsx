import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  getRiders,
} from '../../services/firebase/riders/riders.services';

import type {
  Rider,
  RiderStatus,
} from '../../services/firebase/riders/riders.types';

import './Riders.css';

type StatusFilter = 'all' | RiderStatus;

function Riders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');

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

  const filteredRiders = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return riders.filter((rider) => {
      const matchesSearch =
        query.length === 0 ||
        rider.fullName
          .toLowerCase()
          .includes(query) ||
        rider.phoneNumber
          .toLowerCase()
          .includes(query) ||
        rider.id
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        rider.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    riders,
    searchQuery,
    statusFilter,
  ]);

  const hasFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'all';

  function clearFilters() {
    setSearchQuery('');
    setStatusFilter('all');
  }

  if (loading) {
    return (
      <section className="riders-page">
        <div className="riders-header">
          <div>
            <h1>Riders</h1>
            <p>
              Manage BasuraGo riders.
            </p>
          </div>
        </div>

        <div className="riders-state">
          Loading riders...
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
            <p>
              Manage BasuraGo riders.
            </p>
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

          <p>
            Manage BasuraGo riders.
          </p>
        </div>

        <div className="riders-header-actions">
          <span className="riders-count">
            {filteredRiders.length} of{' '}
            {riders.length} rider
            {riders.length !== 1
              ? 's'
              : ''}
          </span>

          <Link
            to="/riders/invite"
            className="invite-rider-button"
          >
            + Invite Rider
          </Link>
        </div>
      </div>

      <div className="riders-toolbar">
        <div className="riders-search">
          <label htmlFor="rider-search">
            Search riders
          </label>

          <input
            id="rider-search"
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value,
              )
            }
            placeholder="Search by name, phone, or ID..."
          />
        </div>

        <div className="riders-filter">
          <label htmlFor="rider-status">
            Status
          </label>

          <select
            id="rider-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as StatusFilter,
              )
            }
          >
            <option value="all">
              All statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="active">
              Active
            </option>

            <option value="suspended">
              Suspended
            </option>

            <option value="disabled">
              Disabled
            </option>
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            className="clear-riders-button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="riders-table-card">
        <div className="riders-table-wrapper">
          <table className="riders-table">
            <thead>
              <tr>
                <th>Rider</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Vehicle</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRiders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="riders-empty"
                  >
                    {hasFilters
                      ? 'No riders match your filters.'
                      : 'No riders found.'}
                  </td>
                </tr>
              ) : (
                filteredRiders.map(
                  (rider) => (
                    <tr key={rider.id}>
                      <td>
                        <Link
                          to={`/riders/${rider.id}`}
                          className="rider-name-link"
                        >
                          {rider.fullName ||
                            'Unnamed Rider'}
                        </Link>

                        <span className="rider-id-preview">
                          {rider.id}
                        </span>
                      </td>

                      <td>
                        {rider.phoneNumber ||
                          '—'}
                      </td>

                      <td>
                        <span
                          className={
                            `rider-status ` +
                            `rider-status-${rider.status}`
                          }
                        >
                          {rider.status}
                        </span>
                      </td>

                      <td>
                        {rider.vehicleId ||
                          'Unassigned'}
                      </td>

                      <td>
                        <Link
                          to={`/riders/${rider.id}`}
                          className="view-rider-link"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Riders;