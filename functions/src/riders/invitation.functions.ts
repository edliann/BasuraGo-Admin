import { randomBytes, createHash } from 'node:crypto';

import {
  getFirestore,
  Timestamp,
} from 'firebase-admin/firestore';

import {
  getAuth,
} from 'firebase-admin/auth';

import {
  onCall,
  HttpsError,
} from 'firebase-functions/v2/https';

function getDb() {
  return getFirestore();
}

const INVITATION_EXPIRATION_DAYS = 7;

function hashInvitationToken(token: string): string {
  return createHash('sha256')
    .update(token)
    .digest('hex');
}

function isAdmin(request: {
  auth?: {
    token: Record<string, unknown>;
  };
}): boolean {
  return request.auth?.token?.admin === true;
}

export const createRiderInvitation = onCall(
  async (request) => {
    if (!isAdmin(request)) {
      throw new HttpsError(
        'permission-denied',
        'Only administrators can create rider invitations.',
      );
    }

    const email =
      typeof request.data?.email === 'string'
        ? request.data.email.trim().toLowerCase()
        : '';

    const phoneNumber =
      typeof request.data?.phoneNumber === 'string'
        ? request.data.phoneNumber.trim()
        : '';

    if (!email) {
      throw new HttpsError(
        'invalid-argument',
        'Rider email is required.',
      );
    }

    if (!phoneNumber) {
      throw new HttpsError(
        'invalid-argument',
        'Rider phone number is required.',
      );
    }

    const invitationToken = randomBytes(32).toString('hex');
    const tokenHash =
      hashInvitationToken(invitationToken);

    const invitationRef =
      getDb().collection('riderInvitations').doc();

    const createdAt = Timestamp.now();

    const expiresAt = Timestamp.fromMillis(
      createdAt.toMillis() +
        INVITATION_EXPIRATION_DAYS *
          24 *
          60 *
          60 *
          1000,
    );

    await invitationRef.set({
      email,
      phoneNumber,

      status: 'pending',

      invitedBy: request.auth!.uid,

      tokenHash,

      createdAt,
      expiresAt,

      acceptedAt: null,
      acceptedBy: null,
    });

    return {
      invitationId: invitationRef.id,
      invitationToken,
      expiresAt: expiresAt.toDate().toISOString(),
    };
  },
);

export const getRiderInvitation = onCall(
  async (request) => {

    try {
      const invitationId =
        typeof request.data?.invitationId === 'string'
          ? request.data.invitationId.trim()
          : '';

      const invitationToken =
        typeof request.data?.invitationToken === 'string'
          ? request.data.invitationToken.trim()
          : '';

      if (!invitationId || !invitationToken) {
        throw new HttpsError(
          'invalid-argument',
          'Invitation information is required.',
        );
      }

      const invitationRef = getDb()
        .collection('riderInvitations')
        .doc(invitationId);

      const snapshot =
        await invitationRef.get();

      if (!snapshot.exists) {
        throw new HttpsError(
          'not-found',
          'Invitation not found.',
        );
      }

      const invitation =
        snapshot.data();

      if (!invitation) {
        throw new HttpsError(
          'not-found',
          'Invitation not found.',
        );
      }

      if (invitation.status !== 'pending') {
        throw new HttpsError(
          'failed-precondition',
          'This invitation is no longer available.',
        );
      }

      const expiresAt =
        invitation.expiresAt as Timestamp;

      if (
        !expiresAt ||
        expiresAt.toMillis() <= Date.now()
      ) {
        throw new HttpsError(
          'failed-precondition',
          'This invitation has expired.',
        );
      }

      const suppliedTokenHash =
        hashInvitationToken(
          invitationToken,
        );

      if (
        suppliedTokenHash !==
        invitation.tokenHash
      ) {
        throw new HttpsError(
          'permission-denied',
          'Invalid invitation.',
        );
      }

      return {
        invitationId,
        email: invitation.email,
        phoneNumber: invitation.phoneNumber,
        expiresAt:
          expiresAt.toDate().toISOString(),
      };
    } catch (error) {

      throw error;
    }
  },
);

export const createRiderAccountFromInvitation = onCall(
  async (request) => {
    const invitationId =
      typeof request.data?.invitationId === 'string'
        ? request.data.invitationId.trim()
        : '';

    const invitationToken =
      typeof request.data?.invitationToken === 'string'
        ? request.data.invitationToken.trim()
        : '';

    const fullName =
      typeof request.data?.fullName === 'string'
        ? request.data.fullName.trim()
        : '';

    const password =
      typeof request.data?.password === 'string'
        ? request.data.password
        : '';

    if (
      !invitationId ||
      !invitationToken ||
      !fullName ||
      !password
    ) {
      throw new HttpsError(
        'invalid-argument',
        'Invitation information and account details are required.',
      );
    }

    if (fullName.length < 2) {
      throw new HttpsError(
        'invalid-argument',
        'Please enter your full name.',
      );
    }

    if (password.length < 6) {
      throw new HttpsError(
        'invalid-argument',
        'Password must be at least 6 characters.',
      );
    }

    const invitationRef = getDb()
      .collection('riderInvitations')
      .doc(invitationId);

    /*
     * Claim the invitation atomically.
     *
     * This prevents two requests from both seeing
     * the invitation as "pending".
     */
    const invitationData =
      await getDb().runTransaction(
        async (transaction) => {
          const snapshot =
            await transaction.get(
              invitationRef,
            );

          if (!snapshot.exists) {
            throw new HttpsError(
              'not-found',
              'Invitation not found.',
            );
          }

          const invitation =
            snapshot.data();

          if (!invitation) {
            throw new HttpsError(
              'not-found',
              'Invitation not found.',
            );
          }

          if (
            invitation.status !==
            'pending'
          ) {
            throw new HttpsError(
              'failed-precondition',
              'This invitation is no longer available.',
            );
          }

          const expiresAt =
            invitation.expiresAt as Timestamp;

          if (
            !expiresAt ||
            expiresAt.toMillis() <=
              Date.now()
          ) {
            throw new HttpsError(
              'failed-precondition',
              'This invitation has expired.',
            );
          }

          const suppliedTokenHash =
            hashInvitationToken(
              invitationToken,
            );

          if (
            suppliedTokenHash !==
            invitation.tokenHash
          ) {
            throw new HttpsError(
              'permission-denied',
              'Invalid invitation.',
            );
          }

          const email =
            typeof invitation.email ===
            'string'
              ? invitation.email
                  .trim()
                  .toLowerCase()
              : '';

          const phoneNumber =
            typeof invitation.phoneNumber ===
            'string'
              ? invitation.phoneNumber.trim()
              : '';

          if (!email || !phoneNumber) {
            throw new HttpsError(
              'failed-precondition',
              'This invitation is missing required account information.',
            );
          }

          /*
           * Temporarily mark the invitation as
           * being accepted.
           */
          transaction.update(
            invitationRef,
            {
              status: 'accepted',
              acceptedAt: Timestamp.now(),
              acceptedBy: null,
            },
          );

          return {
            email,
            phoneNumber,
          };
        },
      );

    let userRecord;

    try {
      userRecord =
        await getAuth().createUser({
          email:
            invitationData.email,
          password,
          displayName:
            fullName,
        });
    } catch (error: any) {
      console.error(
        'Failed to create Firebase Auth user:',
        error,
      );

      /*
       * Restore the invitation so the rider can
       * retry if Auth account creation failed.
       */
      try {
        await invitationRef.update({
          status: 'pending',
          acceptedAt: null,
          acceptedBy: null,
        });
      } catch (rollbackError) {
        console.error(
          'Failed to restore invitation:',
          rollbackError,
        );
      }

      if (
        error?.code ===
        'auth/email-already-exists'
      ) {
        throw new HttpsError(
          'already-exists',
          'An account with this email already exists.',
        );
      }

      throw new HttpsError(
        'internal',
        'Unable to create the rider account.',
      );
    }

    const riderId =
      userRecord.uid;

    try {
      const batch =
        getDb().batch();

      const userRef =
        getDb()
          .collection('users')
          .doc(riderId);

      const applicationRef =
        getDb()
          .collection(
            'riderApplications',
          )
          .doc(riderId);

      batch.set(userRef, {
        fullName,
        email:
          invitationData.email,
        phoneNumber:
          invitationData.phoneNumber,

        role: 'pending',
        status: 'pending',

        createdAt:
          Timestamp.now(),
      });

      batch.set(
        applicationRef,
        {
          riderId,

          status: 'incomplete',

          basicInformationCompleted:
            true,

          identityDocumentCompleted:
            false,

          driversLicenseCompleted:
            false,

          faceVerificationCompleted:
            false,

          vehicleInformationCompleted:
            false,

          submittedAt: null,
          reviewedAt: null,
          rejectionReason: null,
          correctionMessage: null,

          createdAt:
            Timestamp.now(),

          updatedAt:
            Timestamp.now(),
        },
      );

      /*
       * Now that the Auth account and Firestore
       * records exist, permanently associate
       * the invitation with this rider.
       */
      batch.update(
        invitationRef,
        {
          acceptedBy: riderId,
          acceptedAt:
            Timestamp.now(),
        },
      );

      await batch.commit();
    } catch (error) {
      console.error(
        'Failed to create rider Firestore records:',
        error,
      );

      /*
       * Roll back the Auth account.
       */
      try {
        await getAuth().deleteUser(
          riderId,
        );
      } catch (rollbackError) {
        console.error(
          'Failed to roll back Auth user:',
          rollbackError,
        );
      }

      /*
       * Restore the invitation.
       */
      try {
        await invitationRef.update({
          status: 'pending',
          acceptedAt: null,
          acceptedBy: null,
        });
      } catch (rollbackError) {
        console.error(
          'Failed to restore invitation:',
          rollbackError,
        );
      }

      throw new HttpsError(
        'internal',
        'Unable to finish creating the rider account.',
      );
    }

    return {
      riderId,
      email:
        invitationData.email,
      phoneNumber:
        invitationData.phoneNumber,
    };
  },
);