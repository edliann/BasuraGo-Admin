export interface Rider {
  id: string;
  fullName: string;
  phoneNumber: string;
  status: string;
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