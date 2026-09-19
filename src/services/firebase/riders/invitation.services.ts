import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from 'firebase/functions';

import app from '../firebase';

export interface CreateRiderInvitationInput {
  email: string;
  phoneNumber: string;
}

export interface CreateRiderInvitationResult {
  invitationId: string;
  invitationToken: string;
  expiresAt: string;
}

export interface CreateRiderAccountInput {
  invitationId: string;
  invitationToken: string;
  fullName: string;
  password: string;
}

export interface CreateRiderAccountResult {
  riderId: string;
  email: string;
  phoneNumber: string;
}

const functions = getFunctions(app);

if (import.meta.env.DEV) {
  connectFunctionsEmulator(
    functions,
    '127.0.0.1',
    5001,
  );
}

const createRiderInvitationFunction =
  httpsCallable<
    CreateRiderInvitationInput,
    CreateRiderInvitationResult
  >(
    functions,
    'createRiderInvitation',
  );

const createRiderAccountFunction =
  httpsCallable<
    CreateRiderAccountInput,
    CreateRiderAccountResult
  >(
    functions,
    'createRiderAccountFromInvitation',
  );

export async function createRiderInvitation(
  input: CreateRiderInvitationInput,
): Promise<CreateRiderInvitationResult> {
  const email = input.email.trim().toLowerCase();
  const phoneNumber = input.phoneNumber.trim();

  if (!email) {
    throw new Error('Rider email is required.');
  }

  if (!phoneNumber) {
    throw new Error('Rider phone number is required.');
  }

  const result =
    await createRiderInvitationFunction({
      email,
      phoneNumber,
    });

  return result.data;
}

export async function createRiderAccountFromInvitation(
  input: CreateRiderAccountInput,
): Promise<CreateRiderAccountResult> {
  const result =
    await createRiderAccountFunction({
      invitationId:
        input.invitationId.trim(),

      invitationToken:
        input.invitationToken.trim(),

      fullName:
        input.fullName.trim(),

      password:
        input.password,
    });

  return result.data;
}