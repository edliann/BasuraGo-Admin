export type RiderStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'disabled';

export interface Rider {
  id: string;
  fullName: string;
  phoneNumber: string;
  status: RiderStatus;
  vehicleId: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface RiderLocation {
  riderId: string;
  latitude: number;
  longitude: number;
  updatedAt: unknown;
}