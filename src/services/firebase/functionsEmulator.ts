import {
  connectFunctionsEmulator,
  getFunctions,
} from 'firebase/functions';

import app from './firebase';

export const emulatorFunctions = getFunctions(
  app,
  'us-central1',
);

if (import.meta.env.DEV) {
  connectFunctionsEmulator(
    emulatorFunctions,
    '127.0.0.1',
    5001,
  );
}