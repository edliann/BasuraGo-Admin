import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

import app from '../firebase';

const db = getFirestore(app);

export async function createUserProfile(
  uid: string,
  fullName: string,
  email: string,
) {
  await setDoc(doc(db, 'users', uid), {
    fullName,
    email,
    role: 'pending',
    status: 'pending',
    phoneNumber: null,
    photoURL: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}