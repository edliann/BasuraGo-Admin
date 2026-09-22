import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext/AuthContext';
import {
  listStaffAccounts,
  updateStaffStatus,
  type StaffAccount,
  type StaffStatus,
} from '../../services/firebase/staff/staff.services';

import './StaffDetails.css';

export default function StaffDetails() {
  const { isSuperAdmin } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState<StaffAccount | null>(
    null,
  );
  const [updatingStatus, setUpdatingStatus] =
  useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {

    async function loadStaffDetails() {
      if (!userId) {
        setError('Staff account was not specified.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const accounts = await listStaffAccounts();

        const account = accounts.find(
          (item) => item.userId === userId,
        );

        if (!account) {
          setError('Staff account was not found.');
          return;
        }

        setStaff(account);
      } catch (err) {
        console.error(
          'Failed to load staff details:',
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load staff details.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadStaffDetails();
  }, [userId]);

    async function handleStatusChange(
    status: StaffStatus,
    ) {
    if (!staff) {
        return;
    }

    const action =
        status === 'active'
        ? 'reactivate'
        : status === 'suspended'
            ? 'suspend'
            : 'disable';

    const confirmed = window.confirm(
        `Are you sure you want to ${action} ${staff.fullName}?`,
    );

    if (!confirmed) {
        return;
    }

    try {
        setUpdatingStatus(true);
        setError('');

        await updateStaffStatus(
        staff.userId,
        status,
        );

        setStaff({
        ...staff,
        status,
        });
    } catch (err) {
        console.error(
        'Failed to update staff status:',
        err,
        );

        setError(
        err instanceof Error
            ? err.message
            : 'Failed to update staff status.',
        );
    } finally {
        setUpdatingStatus(false);
    }
    }  

  if (!isSuperAdmin) {
    return (
      <main className="staff-details-page">
        <h1>Access Denied</h1>
        <p>
          Only the Super Admin can manage staff accounts.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="staff-details-page">
        <p>Loading staff details...</p>
      </main>
    );
  }

  if (error || !staff) {
    return (
      <main className="staff-details-page">
        <button
          type="button"
          onClick={() => navigate('/staff')}
        >
          ← Back to Staff
        </button>

        <h1>Staff Account</h1>

        <p>
          {error || 'Staff account was not found.'}
        </p>
      </main>
    );
  }

  return (
    <main className="staff-details-page">
      <div className="staff-details-header">
        <button
          type="button"
          onClick={() => navigate('/staff')}
        >
          ← Back to Staff
        </button>

        <div>
          <h1>{staff.fullName}</h1>
          <p>Staff Account Details</p>
        </div>
      </div>

      <section className="staff-details-card">
        <h2>Account Information</h2>

        <div className="staff-details-grid">
          <div>
            <span>Name</span>
            <strong>{staff.fullName}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{staff.email}</strong>
          </div>

          <div>
            <span>Role</span>
            <strong>Admin Staff</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{staff.status}</strong>
          </div>

          <div>
            <span>Created</span>
            <strong>
              {staff.createdAt
                ? new Date(
                    staff.createdAt,
                  ).toLocaleString()
                : '—'}
            </strong>
          </div>

          <div>
            <span>User ID</span>
            <strong>{staff.userId}</strong>
          </div>
        </div>

        <div className="staff-status-actions">
        <h2>Account Status</h2>

        <p>
            Current status:{' '}
            <strong>{staff.status}</strong>
        </p>

        <div className="staff-status-buttons">
            {staff.status === 'active' && (
            <>
                <button
                type="button"
                onClick={() =>
                    void handleStatusChange('suspended')
                }
                disabled={updatingStatus}
                >
                {updatingStatus
                    ? 'Updating...'
                    : 'Suspend Staff'}
                </button>

                <button
                type="button"
                onClick={() =>
                    void handleStatusChange('disabled')
                }
                disabled={updatingStatus}
                >
                Disable Staff
                </button>
            </>
            )}

            {staff.status === 'suspended' && (
            <>
                <button
                type="button"
                onClick={() =>
                    void handleStatusChange('active')
                }
                disabled={updatingStatus}
                >
                {updatingStatus
                    ? 'Updating...'
                    : 'Reactivate Staff'}
                </button>

                <button
                type="button"
                onClick={() =>
                    void handleStatusChange('disabled')
                }
                disabled={updatingStatus}
                >
                Disable Staff
                </button>
            </>
            )}

            {staff.status === 'disabled' && (
            <button
                type="button"
                onClick={() =>
                void handleStatusChange('active')
                }
                disabled={updatingStatus}
            >
                {updatingStatus
                ? 'Updating...'
                : 'Reactivate Staff'}
            </button>
            )}
        </div>
        </div>
      </section>
    </main>
  );
}