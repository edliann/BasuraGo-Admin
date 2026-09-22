import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext/AuthContext';
import {
  createStaffAccount,
  listStaffAccounts,
  type StaffAccount,
} from '../../services/firebase/staff/staff.services';

import { useNavigate } from 'react-router-dom';

import './Staff.css';

export default function Staff() {
  const { isSuperAdmin } = useAuth();

  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const loadStaff = useCallback(async () => {
    try {
      setLoadingStaff(true);

      const accounts = await listStaffAccounts();

      setStaff(accounts);
    } catch (err) {
      console.error('Failed to load staff accounts:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load staff accounts.',
      );
    } finally {
      setLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      void loadStaff();
    }
  }, [isSuperAdmin, loadStaff]);

  if (!isSuperAdmin) {
    return (
      <main className="staff-page">
        <h1>Access Denied</h1>
        <p>Only the Super Admin can manage staff accounts.</p>
      </main>
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!fullName.trim()) {
      setError(
        "Please enter the staff member's full name.",
      );
      return;
    }

    if (!email.trim()) {
      setError('Please enter the staff member\'s email.');
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.',
      );
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError(
        'Password must contain at least one lowercase character.',
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        'Password must contain at least one uppercase character.',
      );
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError(
        'Password must contain at least one non-alphanumeric character.',
      );
      return;
    }

    try {
      setLoading(true);

      const result = await createStaffAccount({
        fullName,
        email,
        password,
      });

      console.log(
        'Created staff account:',
        result.userId,
      );

      setFullName('');
      setEmail('');
      setPassword('');

      setSuccess(
        'Staff account created successfully.',
      );

      await loadStaff();
    } catch (err) {
      console.error(
        'Failed to create staff account:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create staff account.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="staff-page">
      <div className="staff-header">
        <div>
          <h1>Staff Management</h1>
          <p>
            Create and manage BasuraGo staff accounts.
          </p>
        </div>
      </div>

      <section className="staff-card">
        <h2>Create Staff Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="staff-form-group">
            <label htmlFor="staff-full-name">
              Full Name
            </label>

            <input
              id="staff-full-name"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Enter full name"
              disabled={loading}
            />
          </div>

          <div className="staff-form-group">
            <label htmlFor="staff-email">
              Email
            </label>

            <input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="staff@basurago.com"
              disabled={loading}
            />
          </div>

          <div className="staff-form-group">
            <label htmlFor="staff-password">
              Temporary Password
            </label>

            <input
              id="staff-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter temporary password"
              disabled={loading}
            />

            <small>
              8+ characters, with uppercase, lowercase,
              and a special character.
            </small>
          </div>

          {error && (
            <div className="staff-message staff-error">
              {error}
            </div>
          )}

          {success && (
            <div className="staff-message staff-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating Account...'
              : 'Create Staff Account'}
          </button>
        </form>
      </section>

      <section className="staff-card">
        <div className="staff-list-header">
          <div>
            <h2>Staff Accounts</h2>
            <p>
              BasuraGo staff members with administrative
              access.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadStaff()}
            disabled={loadingStaff}
          >
            {loadingStaff ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loadingStaff ? (
          <div className="staff-empty-state">
            Loading staff accounts...
          </div>
        ) : staff.length === 0 ? (
          <div className="staff-empty-state">
            No staff accounts found.
          </div>
        ) : (
          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((account) => (
                  <tr
                    key={account.userId}
                    onClick={() =>
                        navigate(`/staff/${account.userId}`)
                    }
                    className="staff-table-row"
                    >
                    <td>{account.fullName}</td>

                    <td>{account.email}</td>

                    <td>
                      <span
                        className={`staff-status staff-status-${account.status}`}
                      >
                        {account.status}
                      </span>
                    </td>

                    <td>
                      {account.createdAt
                        ? new Date(
                            account.createdAt,
                          ).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}