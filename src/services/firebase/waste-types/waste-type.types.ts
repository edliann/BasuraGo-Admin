export const WASTE_TYPE_STATUSES = [
  'active',
  'inactive',
] as const;

export type WasteTypeStatus =
  (typeof WASTE_TYPE_STATUSES)[number];

export interface WasteType {
  id: string;

  name: string;
  description: string;

  status: WasteTypeStatus;

  createdAt: unknown;
  updatedAt: unknown;
}