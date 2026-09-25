export type CustomerStatus =
  | "active"
  | "inactive"
  | "suspended";

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  phoneCountryCode: string;
  phoneVerified: boolean;
  onboardingCompleted: boolean;
  status: CustomerStatus;
  defaultAddressId?: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface CustomerAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}