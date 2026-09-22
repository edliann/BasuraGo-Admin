import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';

import app from '../firebase';

const staffFunctions = getFunctions(
  app,
  'us-central1',
);

export interface StaffAccount {
  userId: string;
  fullName: string;
  email: string;
  role: 'admin';
  status:
    | 'pending'
    | 'active'
    | 'suspended'
    | 'disabled';
  createdAt: string | null;
}

interface CreateStaffAccountInput {
  fullName: string;
  email: string;
  password: string;
}

interface CreateStaffAccountResponse {
  userId: string;
}

interface ListStaffAccountsResponse {
  staff: StaffAccount[];
}

export type StaffStatus =
  | 'active'
  | 'suspended'
  | 'disabled';

interface UpdateStaffStatusResponse {
  success: boolean;
}

export async function createStaffAccount(
  input: CreateStaffAccountInput,
): Promise<CreateStaffAccountResponse> {
  const callable = httpsCallable<
    CreateStaffAccountInput,
    CreateStaffAccountResponse
  >(
    staffFunctions,
    'createStaffAccountFunction',
  );

  const result = await callable({
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    password: input.password,
  });

  return result.data;
}

export async function listStaffAccounts(): Promise<
  StaffAccount[]
> {
  const callable = httpsCallable<
    Record<string, never>,
    ListStaffAccountsResponse
  >(
    staffFunctions,
    'listStaffAccountsFunction',
  );

  const result = await callable({});

  return result.data.staff;
}

export async function updateStaffStatus(
  userId: string,
  status: StaffStatus,
): Promise<void> {
  const callable = httpsCallable<
    {
      userId: string;
      status: StaffStatus;
    },
    UpdateStaffStatusResponse
  >(
    staffFunctions,
    'updateStaffStatusFunction',
  );

  await callable({
    userId,
    status,
  });
}