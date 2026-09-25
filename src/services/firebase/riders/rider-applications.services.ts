import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';

import app from '../firebase';

export type RiderApplicationStatus =
  | 'incomplete'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'needs_correction'
  | 'rejected';

export interface RiderApplication {
  id: string;
  riderId: string;
  status: RiderApplicationStatus;

  basicInformationCompleted: boolean;
  identityDocumentCompleted: boolean;
  driversLicenseCompleted: boolean;
  faceVerificationCompleted: boolean;
  vehicleInformationCompleted: boolean;

  submittedAt: unknown;
  reviewedAt: unknown;

  rejectionReason: string | null;
  correctionMessage: string | null;

  createdAt: unknown;
  updatedAt: unknown;

  documents?: Record<string, unknown>;
  vehicleInformation?: Record<string, unknown>;
}

interface GetRiderApplicationResponse {
  riderId: string;
  application: RiderApplication;
}

interface ReviewRiderApplicationInput {
  riderId: string;
  status:
    | 'under_review'
    | 'approved'
    | 'needs_correction'
    | 'rejected';
  rejectionReason?: string;
  correctionMessage?: string;
}

interface ReviewRiderApplicationResponse {
  riderId: string;
  status:
    | 'under_review'
    | 'approved'
    | 'needs_correction'
    | 'rejected';
}

const functions =
  getFunctions(app, 'us-central1');

const getRiderApplicationFunction =
  httpsCallable<
    { riderId: string },
    GetRiderApplicationResponse
  >(
    functions,
    'getRiderApplicationFunction',
  );

const reviewRiderApplicationFunction =
  httpsCallable<
    ReviewRiderApplicationInput,
    ReviewRiderApplicationResponse
  >(
    functions,
    'reviewRiderApplicationFunction',
  );

export async function getRiderApplication(
  riderId: string,
): Promise<RiderApplication> {
  const result =
    await getRiderApplicationFunction({
      riderId: riderId.trim(),
    });

  return result.data.application;
}

export async function reviewRiderApplication(
  input: ReviewRiderApplicationInput,
): Promise<ReviewRiderApplicationResponse> {
  const result =
    await reviewRiderApplicationFunction({
      ...input,
      riderId: input.riderId.trim(),
      rejectionReason:
        input.rejectionReason?.trim(),
      correctionMessage:
        input.correctionMessage?.trim(),
    });

  return result.data;
}