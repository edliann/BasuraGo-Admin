import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { logout } from '../../services/firebase/auth';

import { db } from '../../services/firebase/firestore';

function DashboardTest() {
  const { user, isAdmin } = useAuth();

  const [status, setStatus] = useState('Testing Firestore...');

  useEffect(() => {
    async function testFirestore() {
      if (!user) {
        setStatus('No authenticated user.');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          setStatus(
            `Firestore read successful. User: ${snapshot.data().fullName}`,
          );
        } else {
          setStatus('Firestore document does not exist.');
        }
      } catch (error) {
        console.error('Firestore test failed:', error);
        setStatus('Firestore read failed.');
      }
    }

    testFirestore();
  }, [user]);

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <p>Authenticated: {user ? 'Yes' : 'No'}</p>

      <p>Admin: {isAdmin ? 'Yes' : 'No'}</p>

      <p>{status}</p>

      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </main>
  );
}

export default DashboardTest;