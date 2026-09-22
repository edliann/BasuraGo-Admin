import { Navigate, Route, Routes } from 'react-router-dom';

import Login from '../pages/Login/Login';
import AccessDenied from '../pages/AccessDenied/AccessDenied';

import PublicRoute from './PublicRoute';
import AdminRoute from './AdminRoute';

import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import Dashboard from '../pages/Dashboard/Dashboard';

import Riders from '../pages/Riders/Riders';
import InviteRider from '../pages/Riders/InviteRider';
import RiderDetails from '../pages/RiderDetails/RiderDetails';

import Vehicles from '../pages/Vehicles/Vehicles';
import VehicleDetails from '../pages/VehicleDetails/VehicleDetails';

import Customers from '../pages/Customers/Customers';
import CustomerDetails from '../pages/CustomerDetails/CustomerDetails';

import Pickups from '../pages/Pickups/Pickups';
import PickupDetails from '../pages/PickupDetails/PickupDetails';

import WasteTypes from '../pages/WasteTypes/WasteTypes';

import Staff from '../pages/Staff/Staff';
import StaffDetails from '../pages/Staff/StaffDetails';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/:userId" element={<StaffDetails />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:customerId" element={<CustomerDetails />} />
          <Route path="/riders" element={<Riders />} />
          <Route path="/riders/invite" element={<InviteRider />} />
          <Route path="/riders/:riderId" element={<RiderDetails />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:vehicleId" element={<VehicleDetails />} />
          <Route path="/pickups" element={<Pickups />} />
          <Route path="/pickups/:pickupId" element={<PickupDetails />} />
          <Route path="/waste-types" element={<WasteTypes />} />
        </Route>
      </Route>

      <Route
        path="/access-denied"
        element={<AccessDenied />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;