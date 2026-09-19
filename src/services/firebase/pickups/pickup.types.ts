export const PICKUP_STATUSES = [
  'pending',
  'assigned',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export type PickupStatus =
  (typeof PICKUP_STATUSES)[number];

export interface Pickup {
  id: string;

  customerId: string;
  addressId: string;

  wasteTypeId: string;
  estimatedWeight: number;
  actualWeight: number | null;

  scheduledDate: string;
  scheduledTime: string;

  status: PickupStatus;

  riderId: string | null;
  vehicleId: string | null;

  notes: string;

  createdAt: unknown;
  updatedAt: unknown;
  completedAt: unknown;
}

export interface PickupDisplayData {
  pickup: Pickup;

  customerName: string;
  customerAddress: string;

  wasteTypeName: string;

  riderName: string | null;
  vehiclePlateNumber: string | null;
}