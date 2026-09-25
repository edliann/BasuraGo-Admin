import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

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
  const [downloading, setDownloading] = useState(false);

  const [error, setError] = useState('');

  const [qrCodeDataUrl, setQrCodeDataUrl] =
    useState('');

  const [invitation, setInvitation] = useState<{
    invitationId: string;
    invitationToken: string;
    expiresAt: string;
  } | null>(null);

  const invitationLink = invitation
    ? createRiderInvitationLink(
        invitation.invitationId,
        invitation.invitationToken,
      )
    : '';

  useEffect(() => {
    if (!invitationLink) {
      setQrCodeDataUrl('');
      return;
    }

    let cancelled = false;

    async function generateQrCode() {
      try {
        const dataUrl =
          await QRCode.toDataURL(
            invitationLink,
            {
              width: 512,
              margin: 3,
              errorCorrectionLevel: 'M',
            },
          );

        if (!cancelled) {
          setQrCodeDataUrl(dataUrl);
        }
      } catch (err) {
        console.error(
          'Failed to generate invitation QR code:',
          err,
        );

        if (!cancelled) {
          setError(
            'Failed to generate the invitation QR code.',
          );
        }
      }
    }

    generateQrCode();

    return () => {
      cancelled = true;
    };
  }, [invitationLink]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError('');
    setInvitation(null);
    setQrCodeDataUrl('');

    if (!email.trim()) {
      setError(
        'Please enter the rider email.',
      );
      return;
    }

    if (!phoneNumber.trim()) {
      setError(
        'Please enter the rider phone number.',
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await createRiderInvitation({
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
      setError('');

      await navigator.clipboard.writeText(
        invitationLink,
      );
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

  function handleDownloadQrCode() {
    if (!qrCodeDataUrl || !invitation) {
      return;
    }

    try {
      setDownloading(true);
      setError('');

      const link =
        document.createElement('a');

      link.href = qrCodeDataUrl;

      link.download =
        `basurago-rider-invitation-${invitation.invitationId}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(
        'Failed to download invitation QR code:',
        err,
      );

      setError(
        'Unable to download the QR code.',
      );
    } finally {
      setDownloading(false);
    }
  }

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

            <div className="invitation-qr-section">
              <h3>
                Rider Invitation QR Code
              </h3>

              <p>
                Send this QR code to the intended
                rider. They can scan it to open
                the Rider invitation.
              </p>

              <div className="invitation-qr-wrapper">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="BasuraGo Rider invitation QR code"
                    className="invitation-qr-code"
                  />
                ) : (
                  <div className="invitation-qr-loading">
                    Generating QR code...
                  </div>
                )}
              </div>

              <button
                type="button"
                className="download-qr-button"
                onClick={handleDownloadQrCode}
                disabled={
                  !qrCodeDataUrl ||
                  downloading
                }
              >
                {downloading
                  ? 'Downloading...'
                  : 'Download QR Code'}
              </button>
            </div>

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
              <span>
                Invitation Link
              </span>

              <div className="invitation-link-row">
                <input
                  type="text"
                  value={invitationLink}
                  readOnly
                />

                <button
                  type="button"
                  onClick={
                    handleCopyInvitationLink
                  }
                  disabled={copying}
                >
                  {copying
                    ? 'Copied'
                    : 'Copy Link'}
                </button>
              </div>
            </div>

            <p className="invitation-note">
              The QR code and invitation link
              contain a private invitation token.
              Share them only with the intended
              rider.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}