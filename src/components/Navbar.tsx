import React from 'react';
import { User, Trip } from '../types';
import { Heart, Compass, Shield, UserCheck, UserPlus, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenPairing: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  onLogout: () => void;
  activeView: 'trips' | 'itinerary' | 'admin';
  activeTrip: Trip | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuth,
  onOpenPairing,
  onOpenProfile,
  onOpenAdmin,
  onGoHome,
  onLogout,
  activeView,
  activeTrip
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={onGoHome} 
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-pink-400 to-rose-400 flex items-center justify-center shadow-md shadow-pink-200 group-hover:scale-105 transition-transform">
            <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cute text-2xl font-bold bg-linear-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                SweetJourney
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-medium font-cute">
                สำหรับคู่รัก 💕
              </span>
            </div>
            <p className="text-[11px] text-pink-400 -mt-1 hidden sm:block">
              {activeTrip ? `กำลังดู: ${activeTrip.title}` : 'วางแผนเที่ยวให้ใจฟูไปด้วยกัน'}
            </p>
          </div>
        </div>

        {/* Right Navigation & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <>
              {/* Couple Pairing Badge / Button */}
              {currentUser.partnerId ? (
                <button
                  onClick={onOpenPairing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100/80 border border-pink-200 text-pink-700 text-xs sm:text-sm font-medium transition shadow-2xs"
                  title="คลิกเพื่อดูข้อมูลคู่รัก"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span className="hidden md:inline">คู่รักของ:</span>
                  <span className="font-bold text-rose-600">{currentUser.partnerName}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenPairing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-xs sm:text-sm font-medium transition shadow-md shadow-pink-200 animate-bounce"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ผูกโค้ดกับแฟน 💌</span>
                </button>
              )}

              {/* Admin Portal Button - Only visible for Admin email */}
              {(currentUser.role === 'admin' || currentUser.email === 'arunjamsri@gmail.com' || currentUser.email === 'admin@sweet.love') && (
                <button
                  onClick={onOpenAdmin}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                    activeView === 'admin'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title="ระบบจัดการหลังบ้าน & สถิติการเข้าใช้งาน"
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span className="hidden sm:inline">ระบบหลังบ้าน</span>
                </button>
              )}

              {/* User Avatar & Info */}
              <div 
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-2 border-l border-pink-100 cursor-pointer group"
                title="คลิกเพื่อดูและแก้ไขโปรไฟล์ 👤"
              >
                <div 
                  className="w-9 h-9 rounded-full overflow-hidden border-2 border-pink-300 shadow-xs group-hover:ring-2 group-hover:ring-rose-400 group-hover:scale-105 transition"
                >
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-rose-600 transition flex items-center gap-1">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400">✎</span>
                  </div>
                  <div className="text-[10px] text-pink-500 font-mono">
                    {currentUser.coupleCode}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition ml-1"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-linear-to-r from-pink-500 to-rose-400 text-white text-sm font-medium shadow-md shadow-pink-200 hover:opacity-95 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>เข้าสู่ระบบ / สมัคร</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
