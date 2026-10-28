import React, { useState, useEffect } from 'react';
import { User, Trip } from './types';
import { storage } from './services/storage';
import { Navbar } from './components/Navbar';
import { TripList } from './components/TripList';
import { ItineraryView } from './components/ItineraryView';
import { AdminDashboard } from './components/AdminDashboard';
import { CouplePairingModal } from './components/CouplePairingModal';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [trips, setTrips] = useState<Trip[]>(() => storage.getTrips(currentUser?.id));
  const [activeTrip, setActiveTrip] = useState<Trip | null>(() => {
    const list = storage.getTrips(currentUser?.id);
    return list.length > 0 ? list[0] : null;
  });
  const [activeView, setActiveView] = useState<'trips' | 'itinerary' | 'admin'>('trips');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPairingOpen, setIsPairingOpen] = useState(false);

  // Refresh trips whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      const userTrips = storage.getTrips(currentUser.id);
      setTrips(userTrips);
      if (activeTrip) {
        const found = userTrips.find((t) => t.id === activeTrip.id);
        setActiveTrip(found || (userTrips.length > 0 ? userTrips[0] : null));
      }
    } else {
      setTrips([]);
      setActiveTrip(null);
    }
  }, [currentUser?.id, currentUser?.partnerId]);

  const handleSelectTrip = (trip: Trip) => {
    setActiveTrip(trip);
    setActiveView('itinerary');
  };

  const handleCreateTrip = (newTrip: Trip) => {
    storage.saveTrip(newTrip);
    const updated = storage.getTrips(currentUser?.id);
    setTrips(updated);
    setActiveTrip(newTrip);
    setActiveView('itinerary');
  };

  const handleUpdateTrip = (updatedTrip: Trip) => {
    storage.saveTrip(updatedTrip);
    setActiveTrip(updatedTrip);
    setTrips(storage.getTrips(currentUser?.id));
  };

  const handleDeleteTrip = (tripId: string) => {
    storage.deleteTrip(tripId);
    const updated = storage.getTrips(currentUser?.id);
    setTrips(updated);
    if (activeTrip?.id === tripId) {
      setActiveTrip(updated.length > 0 ? updated[0] : null);
      setActiveView('trips');
    }
  };

  const handleSwitchUser = (email: string) => {
    const res = storage.login(email);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      const userTrips = storage.getTrips(res.user.id);
      setTrips(userTrips);
      setActiveTrip(userTrips.length > 0 ? userTrips[0] : null);
    }
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
    setTrips([]);
    setActiveTrip(null);
    setActiveView('trips');
  };

  return (
    <div className="min-h-screen bg-rose-50/30 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPairing={() => setIsPairingOpen(true)}
        onOpenAdmin={() => setActiveView('admin')}
        onGoHome={() => setActiveView('trips')}
        onLogout={handleLogout}
        activeView={activeView}
        activeTrip={activeTrip}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeView === 'admin' ? (
          <AdminDashboard onBack={() => setActiveView('trips')} />
        ) : activeView === 'itinerary' && activeTrip ? (
          <ItineraryView
            trip={activeTrip}
            currentUser={currentUser}
            onUpdateTrip={handleUpdateTrip}
            onBackToTrips={() => setActiveView('trips')}
          />
        ) : (
          <TripList
            trips={trips}
            currentUser={currentUser}
            onSelectTrip={handleSelectTrip}
            onCreateTrip={handleCreateTrip}
            onDeleteTrip={handleDeleteTrip}
            onOpenPairing={() => setIsPairingOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
      />

      {currentUser && (
        <CouplePairingModal
          isOpen={isPairingOpen}
          onClose={() => setIsPairingOpen(false)}
          currentUser={currentUser}
          onUpdateUser={(updated) => setCurrentUser(updated)}
          onSwitchUser={handleSwitchUser}
        />
      )}

      {/* Sweet Footer */}
      <footer className="border-t border-pink-100 py-6 text-center text-xs text-slate-400 bg-white/60">
        <p className="flex items-center justify-center gap-1">
          สร้างด้วยความรัก 💕 SweetJourney • บันทึกทุกช่วงเวลาประทับใจไปกับคุณ
        </p>
      </footer>

    </div>
  );
};

export default App;
