export interface Vehicle {
  id: string;
  plateNumber: string;
  vehicleType: string;
  capacity: number;
  status: string;
  assignedRiderId: string | null;
  createdAt: unknown;
  updatedAt: unknown;
}