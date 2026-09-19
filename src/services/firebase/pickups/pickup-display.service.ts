import {
  getCustomer,
} from '../customers/customers.services';

import {
  getCustomerAddresses,
} from '../customers/address.services';

import {
  getRider,
} from '../riders/riders.services';

import {
  getVehicle,
} from '../vehicles/vehicle.services';

import {
  getWasteType,
} from '../waste-types/waste-types.service';

import type {
  Pickup,
  PickupDisplayData,
} from './pickup.types';

export async function resolvePickupDisplayData(
  pickup: Pickup,
): Promise<PickupDisplayData> {
  const [
    customer,
    addresses,
    wasteType,
    rider,
    vehicle,
  ] = await Promise.all([
    getCustomer(pickup.customerId),
    getCustomerAddresses(pickup.customerId),
    getWasteType(pickup.wasteTypeId),
    pickup.riderId
      ? getRider(pickup.riderId)
      : Promise.resolve(null),
    pickup.vehicleId
      ? getVehicle(pickup.vehicleId)
      : Promise.resolve(null),
  ]);

  const address =
    addresses.find(
      (item) =>
        item.id === pickup.addressId,
    ) ?? null;

  return {
    pickup,

    customerName:
      customer?.fullName ??
      'Unknown Customer',

    customerAddress:
      address?.address ??
      'Unknown Address',

    wasteTypeName:
      wasteType?.name ??
      'Unknown Waste Type',

    riderName:
      rider?.fullName ??
      null,

    vehiclePlateNumber:
      vehicle?.plateNumber ??
      null,
  };
}