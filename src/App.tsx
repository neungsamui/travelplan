import React, { useState, useEffect } from 'react';
import { User, Trip } from './types';
import { storage } from './services/storage';
import { supabase } from './services/supabase';
import { Navbar } from './components/Navbar';
import { TripList } from './components/TripList';
import { ItineraryView } from './components/ItineraryView';
import { AdminDashboard } from './components/AdminDashboard';
import { CouplePairingModal } from './components/CouplePairingModal';
import { UserProfileModal } from './components/UserProfileModal';
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Listen for Supabase email confirmation or login callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const coupleCode = session.user.user_metadata?.coupleCode || 'LOVE-' + Math.floor(1000 + Math.random() * 9000);
        const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'เราสองคน';

        const supaUser: User = {
          id: session.user.id,
          name: userName,
          email: session.user.email || '',
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName)}`,
          coupleCode,
          role: session.user.email?.includes('admin') ? 'admin' : 'user',
          createdAt: session.user.created_at,
          lastLoginAt: new Date().toISOString()
        };

        const users = storage.getUsers();
        const existingIdx = users.findIndex((u) => u.email.toLowerCase() === supaUser.email.toLowerCase());
        if (existingIdx >= 0) {
          users[existingIdx] = { ...users[existingIdx], ...supaUser };
        } else {
          users.push(supaUser);
        }
        storage.saveUsers(users);
        storage.setCurrentUser(supaUser);
        storage.recordLogin(supaUser);
        setCurrentUser(supaUser);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        onOpenProfile={() => setIsProfileOpen(true)}
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
        <>
          <CouplePairingModal
            isOpen={isPairingOpen}
            onClose={() => setIsPairingOpen(false)}
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onSwitchUser={handleSwitchUser}
          />

          <UserProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onOpenPairing={() => setIsPairingOpen(true)}
          />
        </>
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
