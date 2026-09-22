import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import { logout } from '../../services/firebase/auth';
import './AdminLayout.css';

function AdminLayout() {
  const { user, isSuperAdmin } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h1>BasuraGo</h1>
          <span>ADMIN</span>
        </div>

        <nav className="admin-navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Customers
          </NavLink>

          <NavLink
            to="/riders"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Riders
          </NavLink>

          <NavLink
            to="/pickups"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Pickups
          </NavLink>

          <NavLink
            to="/vehicles"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Vehicles
          </NavLink>

          <NavLink
            to="/waste-types"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Waste Types
          </NavLink>

          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Pricing
          </NavLink>

          <NavLink
            to="/facilities"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Facilities
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Reports
          </NavLink>

          {isSuperAdmin && (
            <NavLink
              to="/staff"
              className={({ isActive }) =>
                isActive ? 'active' : ''
              }
            >
              Staff Management
            </NavLink>
          )}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <strong>{user?.displayName || 'Admin'}</strong>
            <span>{user?.email}</span>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <h2>Admin Portal</h2>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;