import { useState } from 'react';

import { createRiderInvitation } from '../../services/firebase/riders/invitation.services';
import {
  createRiderInvitationLink,
} from '../../utils/invitation-link';

import './InviteRider.css';

export default function InviteRider() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState('');

  const [invitation, setInvitation] = useState<{
    invitationId: string;
    invitationToken: string;
    expiresAt: string;
  } | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setInvitation(null);

    if (!email.trim()) {
      setError('Please enter the rider email.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Please enter the rider phone number.');
      return;
    }

    try {
      setLoading(true);

      const result = await createRiderInvitation({
        email,
        phoneNumber,
      });

      setInvitation(result);

      setEmail('');
      setPhoneNumber('');
    } catch (err) {
      console.error(
        'Failed to create rider invitation:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create rider invitation.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyInvitationLink() {
    if (!invitation) {
      return;
    }

    try {
      setCopying(true);

      const link = createRiderInvitationLink(
        invitation.invitationId,
        invitation.invitationToken,
      );

      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error(
        'Failed to copy invitation link:',
        err,
      );

      setError(
        'Unable to copy the invitation link. Please copy it manually.',
      );
    } finally {
      setCopying(false);
    }
  }

  const invitationLink = invitation
    ? createRiderInvitationLink(
        invitation.invitationId,
        invitation.invitationToken,
      )
    : '';

  return (
    <main className="invite-rider-page">
      <div className="invite-rider-header">
        <div>
          <h1>Invite Rider</h1>

          <p>
            Send an invitation to a rider to create
            their BasuraGo Rider account.
          </p>
        </div>
      </div>

      <section className="invite-rider-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="rider-email">
              Email Address
            </label>

            <input
              id="rider-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="rider@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rider-phone">
              Phone Number
            </label>

            <input
              id="rider-phone"
              type="tel"
              value={phoneNumber}
              onChange={(event) =>
                setPhoneNumber(event.target.value)
              }
              placeholder="+639XXXXXXXXX"
              autoComplete="tel"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Creating Invitation...'
              : 'Create Invitation'}
          </button>
        </form>

        {invitation && (
          <div className="invitation-success">
            <h2>Invitation Created</h2>

            <p>
              The rider invitation was created
              successfully.
            </p>

            <div className="invitation-detail">
              <span>Invitation ID</span>

              <strong>
                {invitation.invitationId}
              </strong>
            </div>

            <div className="invitation-detail">
              <span>Expires</span>

              <strong>
                {new Date(
                  invitation.expiresAt,
                ).toLocaleString()}
              </strong>
            </div>

            <div className="invitation-link-section">
              <span>Invitation Link</span>

              <div className="invitation-link-row">
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                />

                <button
                  type="button"
                  onClick={handleCopyInvitationLink}
                  disabled={copying}
                >
                  {copying
                    ? 'Copied'
                    : 'Copy Link'}
                </button>
              </div>
            </div>

            <p className="invitation-note">
              Share this invitation link only with
              the intended rider. The link contains a
              private invitation token.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}