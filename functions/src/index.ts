import { setGlobalOptions } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';

import {
  createRiderInvitation,
  getRiderInvitation,
  createRiderAccountFromInvitation,
} from './riders/invitation.functions';

if (process.env.FUNCTIONS_EMULATOR === 'true') {
  process.env.FIRESTORE_EMULATOR_HOST =
    '127.0.0.1:8082';

  console.log(
    'FIRESTORE_EMULATOR_HOST:',
    process.env.FIRESTORE_EMULATOR_HOST,
  );
}

initializeApp();

console.log(
  'FUNCTIONS_EMULATOR:',
  process.env.FUNCTIONS_EMULATOR,
);

console.log(
  'FIRESTORE_EMULATOR_HOST:',
  process.env.FIRESTORE_EMULATOR_HOST,
);

setGlobalOptions({
  maxInstances: 10,
});

export {
  createRiderInvitation,
  getRiderInvitation,
  createRiderAccountFromInvitation,
};