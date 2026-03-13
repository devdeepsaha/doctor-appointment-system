import React, { useState, useEffect } from 'react';
import PatientHome from './components/PatientHome';
import DoctorAdmin from './components/Admin/DoctorAdmin';
import Login from './components/Admin/Login';
import { supabase } from './components/Admin/supabaseClient';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deviceId] = useState(() => {
    let id = localStorage.getItem('medbook_device_id');
    if (!id) {
      id = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('medbook_device_id', id);
    }
    return id;
  });

  const fetchData = async () => {
    try {
      const { data: slotsData, error: slotsError } = await supabase
        .from('slots')
        .select('*')
        .order('date', { ascending: true });
      
      if (slotsError) throw slotsError;
      setAvailableSlots(slotsData || []);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
    } catch (err) {
      console.error("Error fetching data:", err.message);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setIsAuthenticated(true);

      await fetchData();
      setLoading(false);

      const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') setIsAuthenticated(true);
        if (event === 'SIGNED_OUT') setIsAuthenticated(false);
      });

      const dbListener = supabase
        .channel('any')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
        .subscribe();

      return () => {
        authListener.unsubscribe();
        supabase.removeChannel(dbListener);
      };
    };
    initialize();
  }, []);

  // --- UPDATED TICK ACTION ---
  const markBookingComplete = async (bookingId) => {
    try {
      console.log("Attempting to complete booking:", bookingId);
      
      // Update the 'completed' column in Supabase
      const { error } = await supabase
        .from('bookings')
        .update({ completed: true })
        .eq('id', bookingId);

      if (error) throw error;

      // Force a re-fetch to update the Admin UI immediately
      await fetchData(); 
    } catch (err) {
      console.error("Error marking booking complete:", err.message);
      alert("Action failed: " + err.message);
    }
  };

  const handleNewBooking = async (bookingData) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { error: bookingError } = await supabase.from('bookings').insert([{
      id,
      patient_name: bookingData.name,
      phone: bookingData.phone,
      problem: bookingData.problem,
      date: bookingData.date,
      time: bookingData.time,
      device_id: deviceId,
      completed: false
    }]);

    if (!bookingError) {
      await supabase.from('slots').delete().match({ date: bookingData.date, time: bookingData.time });
      fetchData();
    } else {
      alert("Booking failed: " + bookingError.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    const b = bookings.find(b => b.id === bookingId);
    if (b) {
      await supabase.from('bookings').delete().eq('id', bookingId);
      await supabase.from('slots').insert([{ id: Math.random().toString(36).substr(2, 9), date: b.date, time: b.time }]);
      fetchData();
    }
  };

  const addMassSlots = async (newSlots) => {
    await supabase.from('slots').insert(newSlots);
    fetchData();
  };

  const deleteSlot = async (slotId) => {
    await supabase.from('slots').delete().eq('id', slotId);
    fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-background"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>;

  if (currentPath === '/admin') {
    return isAuthenticated ? (
      <DoctorAdmin 
        slots={availableSlots} 
        bookings={bookings} 
        onAdd={addMassSlots}
        onDelete={deleteSlot}
        onCompleteBooking={markBookingComplete} // Ensure this is passed correctly
        onLogout={handleLogout} 
      />
    ) : (
      <Login onLogin={() => setIsAuthenticated(true)} /> 
    );
  }

  const myBookings = bookings.filter(b => b.device_id === deviceId);

  return (
    <PatientHome 
      availableSlots={availableSlots} 
      bookings={myBookings} 
      onBook={handleNewBooking} 
      onCancelBooking={cancelBooking} 
    />
  );
}

export default App;