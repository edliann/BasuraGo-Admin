import { acceptPickup } from './pickup.services';

const pickupId = 'YOUR_TEST_PICKUP_ID';
const riderId = 'YOUR_TEST_RIDER_ID';

async function testAcceptPickup() {
  try {
    await acceptPickup(
      pickupId,
      riderId,
    );

    console.log(
      'Pickup accepted successfully.',
    );
  } catch (error) {
    console.error(
      'Failed to accept pickup:',
      error,
    );
  }
}

testAcceptPickup();