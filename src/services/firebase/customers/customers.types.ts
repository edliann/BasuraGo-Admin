export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  status: string;
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