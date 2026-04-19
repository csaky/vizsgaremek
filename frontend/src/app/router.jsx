import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './provider.jsx';

import Navbar from '../components/Navbar.jsx';

import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import SalonList from '../pages/SalonList.jsx';
import SalonDetails from '../pages/SalonDetails.jsx';

import MyAppointments from '../features/appointment/MyAppointments.jsx';
import BookAppointment from '../features/appointment/BookAppointment.jsx';

import MySalon from '../features/salon/MySalon.jsx';
import EditSalon from '../features/salon/EditSalon.jsx';
import ManageServices from '../features/service/ManageServices.jsx';
import SalonServices from '../features/service/SalonServices.jsx';
import SalonAppointments from '../features/salon/SalonAppointments.jsx';

import BarberAppointments from '../features/barber/BarberAppointments.jsx';
import BarberServices from '../features/barber/BarberServices.jsx';
import ManageBarbers from '../features/barber/ManageBarbers.jsx';


function PrivateRoute({ children, role }) {
  const { user, hasRole } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && !hasRole(role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          {/* Nyilvános */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/salons" element={<SalonList />} />
          <Route path="/salons/:id" element={<SalonDetails />} />

          {/* Ügyfél */}
          <Route path="/my-appointments" element={
            <PrivateRoute><MyAppointments /></PrivateRoute>
          } />
          <Route path="/book" element={
            <PrivateRoute><BookAppointment /></PrivateRoute>
          } />

          {/* Tulajdonos */}
          <Route path="/owner/salon" element={
            <PrivateRoute role="owner"><MySalon /></PrivateRoute>
          } />
          <Route path="/owner/salon/edit/:id" element={
            <PrivateRoute role="owner"><EditSalon /></PrivateRoute>
          } />
          <Route path="/owner/services" element={
            <PrivateRoute role="owner"><ManageServices /></PrivateRoute>
          } />
          <Route path="/owner/appointments/:id" element={
            <PrivateRoute role="owner"><SalonAppointments /></PrivateRoute>
          } />
          <Route path="/owner/salon/:id/barbers" element={
            <PrivateRoute role="owner"><ManageBarbers /></PrivateRoute>
          } />
          <Route path="/owner/salon/:id/services" element={
            <PrivateRoute role="owner"><SalonServices /></PrivateRoute>
          } />

          {/* Borbély */}
          <Route path="/barber/appointments" element={
            <PrivateRoute role="barber"><BarberAppointments /></PrivateRoute>
          } />
          <Route path="/barber/services" element={
            <PrivateRoute role="barber"><BarberServices /></PrivateRoute>
          } />

          {/* Visszaesési útvonal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}
