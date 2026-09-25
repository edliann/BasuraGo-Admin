import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  getRider,
} from '../../services/firebase/riders/riders.services';

import {
  getRiderApplication,
  reviewRiderApplication,
} from '../../services/firebase/riders/rider-applications.services';

import type {
  Rider,
} from '../../services/firebase/riders/riders.types';

import type {
  RiderApplication as RiderApplicationData,
  RiderApplicationStatus,
} from '../../services/firebase/riders/rider-applications.services';

import './RiderApplication.css';

function RiderApplication() {
  const { riderId } = useParams();

  const [rider, setRider] =
    useState<Rider | null>(null);

  const [application, setApplication] =
    useState<RiderApplicationData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState('');

  const [correctionMessage, setCorrectionMessage] =
    useState('');

  const [rejectionReason, setRejectionReason] =
    useState('');

  const [confirmationStatus, setConfirmationStatus] =
    useState<
      | 'under_review'
      | 'approved'
      | 'rejected'
      | null
    >(null);

  useEffect(() => {
    async function loadApplication() {
      if (!riderId) {
        setError('Rider ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const [
          riderData,
          applicationData,
        ] = await Promise.all([
          getRider(riderId),
          getRiderApplication(riderId),
        ]);

        if (!riderData) {
          setError('Rider not found.');
          return;
        }

        setRider(riderData);
        setApplication(applicationData);
      } catch (loadError) {
        console.error(
          'Failed to load rider application:',
          loadError,
        );

        setError(
          'Failed to load rider application. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [riderId]);

    async function handleReview(
    status:
        | 'under_review'
        | 'approved'
        | 'needs_correction'
        | 'rejected',
    ) {
    if (!riderId) {
        return;
    }

    setActionError('');

    if (
        status === 'needs_correction' &&
        !correctionMessage.trim()
    ) {
        setActionError(
        'Please enter a correction message.',
        );
        return;
    }

    if (
        status === 'rejected' &&
        !rejectionReason.trim()
    ) {
        setActionError(
        'Please enter a rejection reason.',
        );
        return;
    }

    try {
        setActionLoading(true);

        const result =
        await reviewRiderApplication({
            riderId,
            status,
            correctionMessage:
            status === 'needs_correction'
                ? correctionMessage
                : undefined,
            rejectionReason:
            status === 'rejected'
                ? rejectionReason
                : undefined,
        });

        setApplication(
        (current) =>
            current
            ? {
                ...current,
                status:
                    result.status as RiderApplicationStatus,
                }
            : current,
        );

        setCorrectionMessage('');
        setRejectionReason('');
    } catch (reviewError) {
        console.error(
        'Failed to review rider application:',
        reviewError,
        );

        setActionError(
        'Failed to update the application. Please try again.',
        );
    } finally {
        setActionLoading(false);
        setConfirmationStatus(null);
    }
    }

  function getStatusLabel(
    status: RiderApplicationStatus,
  ) {
    return status
      .replaceAll('_', ' ')
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase(),
      );
  }

  function renderCompletion(
    label: string,
    completed: boolean,
  ) {
    return (
      <div className="rider-application-check">
        <span>
          {label}
        </span>

        <strong
          className={
            completed
              ? 'completed'
              : 'incomplete'
          }
        >
          {completed
            ? 'Complete'
            : 'Incomplete'}
        </strong>
      </div>
    );
  }

    function requestConfirmation(
    status:
        | 'under_review'
        | 'approved'
        | 'rejected',
    ) {
    if (
        status === 'rejected' &&
        !rejectionReason.trim()
    ) {
        setActionError(
        'Please enter a rejection reason.',
        );
        return;
    }

    setActionError('');
    setConfirmationStatus(status);
    }

  if (loading) {
    return (
      <section className="rider-application-page">
        <div className="rider-application-state">
          Loading rider application...
        </div>
      </section>
    );
  }

  if (
    error ||
    !rider ||
    !application
  ) {
    return (
      <section className="rider-application-page">
        <Link
          to="/riders"
          className="rider-application-back"
        >
          ← Back to Riders
        </Link>

        <div className="rider-application-state error">
          {error ||
            'Rider application not found.'}
        </div>
      </section>
    );
  }

  const canReview =
    application.status ===
      'submitted' ||
    application.status ===
      'under_review';

  return (
    <section className="rider-application-page">
      <div className="rider-application-header">
        <div>
          <Link
            to={`/riders/${rider.id}`}
            className="rider-application-back"
          >
            ← Back to Rider
          </Link>

          <h1>
            Rider Application
          </h1>

          <p>
            Review the onboarding
            application for{' '}
            <strong>
              {rider.fullName}
            </strong>
            .
          </p>
        </div>

        <div
          className={`rider-application-status status-${application.status}`}
        >
          {getStatusLabel(
            application.status,
          )}
        </div>
      </div>

      <div className="rider-application-grid">
        <section className="rider-application-card">
          <h2>
            Application Progress
          </h2>

          {renderCompletion(
            'Basic Information',
            application.basicInformationCompleted,
          )}

          {renderCompletion(
            'Government ID',
            application.identityDocumentCompleted,
          )}

          {renderCompletion(
            "Driver's License",
            application.driversLicenseCompleted,
          )}

          {renderCompletion(
            'Face Verification',
            application.faceVerificationCompleted,
          )}

          {renderCompletion(
            'Vehicle Information',
            application.vehicleInformationCompleted,
          )}
        </section>

        <section className="rider-application-card">
          <h2>
            Rider Information
          </h2>

          <div className="rider-application-info">
            <span>
              Full Name
            </span>
            <strong>
              {rider.fullName}
            </strong>
          </div>

          <div className="rider-application-info">
            <span>
              Phone
            </span>
            <strong>
              {rider.phoneNumber ||
                'Not provided'}
            </strong>
          </div>

          <div className="rider-application-info">
            <span>
              Rider ID
            </span>
            <strong className="monospace">
              {rider.id}
            </strong>
          </div>

          <div className="rider-application-info">
            <span>
              Account Status
            </span>
            <strong>
              {rider.status}
            </strong>
          </div>
        </section>
      </div>

      {application.rejectionReason && (
        <section className="rider-application-card">
          <h2>
            Previous Rejection Reason
          </h2>

          <p>
            {application.rejectionReason}
          </p>
        </section>
      )}

      {application.correctionMessage && (
        <section className="rider-application-card">
          <h2>
            Previous Correction Message
          </h2>

          <p>
            {application.correctionMessage}
          </p>
        </section>
      )}

      {canReview && (
        <section className="rider-application-card">
          <h2>
            Review Application
          </h2>

          <div className="rider-application-actions">
            <button
              type="button"
              disabled={actionLoading}
              onClick={() =>
              requestConfirmation(
                  'under_review',
              )
              }
            >
              Mark Under Review
            </button>

            <button
              type="button"
              className="approve"
              disabled={actionLoading}
              onClick={() =>
              requestConfirmation(
                  'approved',
              )
              }
            >
              Approve Rider
            </button>
          </div>

          <div className="rider-application-review-section">
            <label>
              Correction Message
            </label>

            <textarea
              value={correctionMessage}
              onChange={(event) =>
                setCorrectionMessage(
                  event.target.value,
                )
              }
              placeholder="Explain what the rider needs to correct..."
              rows={4}
              disabled={actionLoading}
            />

            <button
              type="button"
              disabled={actionLoading}
              onClick={() =>
                handleReview(
                  'needs_correction',
                )
              }
            >
              Request Correction
            </button>
          </div>

          <div className="rider-application-review-section">
            <label>
              Rejection Reason
            </label>

            <textarea
              value={rejectionReason}
              onChange={(event) =>
                setRejectionReason(
                  event.target.value,
                )
              }
              placeholder="Explain why the application is being rejected..."
              rows={4}
              disabled={actionLoading}
            />

            <button
              type="button"
              className="reject"
              disabled={actionLoading}
              onClick={() =>
              requestConfirmation(
                  'rejected',
              )
              }
            >
              Reject Application
            </button>
          </div>

          {actionError && (
            <div className="rider-application-action-error">
              {actionError}
            </div>
          )}
        </section>
      )}

        {confirmationStatus && (
        <div
            className="rider-confirmation-overlay"
            role="presentation"
            onMouseDown={(event) => {
            if (
                event.target === event.currentTarget &&
                !actionLoading
            ) {
                setConfirmationStatus(null);
            }
            }}
        >
            <div
            className="rider-confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rider-confirmation-title"
            >
            <div className="rider-confirmation-icon">
                !
            </div>

            <h2 id="rider-confirmation-title">
                {confirmationStatus ===
                'approved'
                ? 'Approve Rider?'
                : confirmationStatus ===
                    'rejected'
                    ? 'Reject Application?'
                    : 'Mark Under Review?'}
            </h2>

            <p>
                {confirmationStatus ===
                'approved'
                ? `Are you sure you want to approve ${rider.fullName}'s rider application? This will activate the rider account.`
                : confirmationStatus ===
                    'rejected'
                    ? `Are you sure you want to reject ${rider.fullName}'s rider application?`
                    : `Are you sure you want to mark ${rider.fullName}'s application as under review?`}
            </p>

            {confirmationStatus ===
                'approved' && (
                <div className="rider-confirmation-warning">
                The rider's account will be changed
                from <strong>Pending</strong> to{' '}
                <strong>Active</strong>.
                </div>
            )}

            {confirmationStatus ===
                'rejected' && (
                <div className="rider-confirmation-warning">
                The rejection reason entered above
                will be recorded on this application.
                </div>
            )}

            <div className="rider-confirmation-actions">
                <button
                type="button"
                className="rider-confirmation-cancel"
                disabled={actionLoading}
                onClick={() =>
                    setConfirmationStatus(null)
                }
                >
                Cancel
                </button>

                <button
                type="button"
                className={`rider-confirmation-confirm ${
                    confirmationStatus ===
                    'rejected'
                    ? 'danger'
                    : confirmationStatus ===
                        'approved'
                        ? 'success'
                        : ''
                }`}
                disabled={actionLoading}
                onClick={() =>
                    handleReview(
                    confirmationStatus,
                    )
                }
                >
                {actionLoading
                    ? 'Processing...'
                    : confirmationStatus ===
                    'approved'
                    ? 'Approve Rider'
                    : confirmationStatus ===
                        'rejected'
                        ? 'Reject Application'
                        : 'Mark Under Review'}
                </button>
            </div>
            </div>
        </div>
        )}
    </section>
  );
}

export default RiderApplication;