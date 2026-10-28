import React, { useState } from 'react';
import { Trip, User } from '../types';
import { 
  Plus, Calendar, MapPin, Heart, Sparkles, 
  Trash2, ArrowRight, Compass, Clock 
} from 'lucide-react';

interface TripListProps {
  trips: Trip[];
  currentUser: User | null;
  onSelectTrip: (trip: Trip) => void;
  onCreateTrip: (newTrip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onOpenPairing: () => void;
}

const EMOJI_OPTIONS = ['🌸', '✈️', '🏖️', '❄️', '☕', '🎡', '🏕️', '🍜', '🍱', '🚞'];

export const TripList: React.FC<TripListProps> = ({
  trips,
  currentUser,
  onSelectTrip,
  onCreateTrip,
  onDeleteTrip,
  onOpenPairing
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [emoji, setEmoji] = useState('🌸');
  const [notes, setNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim() || !startDate || !endDate) return;

    // Calculate initial days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const dayCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const days = [];
    for (let i = 0; i < dayCount; i++) {
      const curDate = new Date(start);
      curDate.setDate(curDate.getDate() + i);
      days.push({
        id: 'day-' + Date.now() + '-' + i,
        dayNumber: i + 1,
        date: curDate.toISOString().split('T')[0],
        title: `วันที่ ${i + 1}: เที่ยวรอบเมือง`,
        places: []
      });
    }

    const newTrip: Trip = {
      id: 'trip-' + Date.now(),
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      emoji,
      notes: notes.trim(),
      createdBy: currentUser?.id || 'guest',
      createdByName: currentUser?.name || 'เราสองคน',
      partnerId: currentUser?.partnerId,
      partnerName: currentUser?.partnerName,
      days,
      createdAt: new Date().toISOString()
    };

    onCreateTrip(newTrip);
    setModalOpen(false);
    setTitle('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setNotes('');
  };

  const getDaysCountdown = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripStart = new Date(dateStr);
    tripStart.setHours(0, 0, 0, 0);
    const diff = Math.ceil((tripStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return '🎉 วันนี้เริ่มเดินทางแล้ว!';
    if (diff > 0) return `อีก ${diff} วันจะถึงวันเที่ยว! 💕`;
    return 'ทริปที่ผ่านไปด้วยความประทับใจ ✨';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Romantic Hero Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-pink-500 via-rose-400 to-pink-400 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-pink-200 mb-8">
        
        {/* Floating background decorative hearts */}
        <div className="absolute top-2 right-8 text-7xl opacity-20 pointer-events-none animate-float-heart">
          💖
        </div>
        <div className="absolute -bottom-6 right-36 text-6xl opacity-20 pointer-events-none">
          🌸
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span>พื้นที่บันทึกความทรงจำของคนมีคู่</span>
          </div>

          <h1 className="font-cute text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {currentUser?.partnerName ? (
              <>
                ทริปในฝันของ <br className="sm:hidden" />
                <span className="text-yellow-100">{currentUser.name}</span> & <span className="text-pink-100">{currentUser.partnerName}</span> 💕
              </>
            ) : (
              <>แพลนเนอร์เที่ยวสำหรับเราสองคน 🌸</>
            )}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-pink-50 leading-relaxed font-light">
            วางแผนสถานที่ แบ่งวันเที่ยว ปักหมุดบนแผนที่สไตล์ Wanderlog และบันทึกโน้ตหวานๆ ให้หัวใจเต้นแรงไปด้วยกัน
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 font-cute font-bold text-base shadow-lg shadow-rose-900/10 transition active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>+ สร้างทริปใหม่เลย</span>
            </button>

            {!currentUser?.partnerId && (
              <button
                onClick={onOpenPairing}
                className="px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-sm transition flex items-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>ยังไม่ได้ผูกกับแฟน? คลิกผูกโค้ดที่นี่</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trips Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cute text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>รายการทริปทั้งหมด</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-sans font-semibold">
              {trips.length} ทริป
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            คลิกที่ทริปเพื่อเปิดดูแพลนรายวันและแผนที่เส้นทาง
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-cute font-bold shadow-md shadow-pink-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span>สร้างทริป</span>
        </button>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-pink-200 shadow-xs">
          <span className="text-5xl block mb-3">🏖️</span>
          <h3 className="font-cute text-xl font-bold text-slate-700">
            ยังไม่มีทริปการเดินทางเลย
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            กดปุ่ม &quot;สร้างทริปใหม่&quot; ด้านบนเพื่อเริ่มปักหมุดที่เที่ยวแห่งแรกของคุณและคนที่คุณรัก
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 px-6 py-2.5 rounded-2xl bg-linear-to-r from-pink-500 to-rose-400 text-white font-cute font-bold text-sm shadow-md shadow-pink-200 transition"
          >
            สร้างทริปแรกตอนนี้เลย ✈️
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const totalPlaces = (trip.days || []).reduce((acc, d) => acc + (d.places ? d.places.length : 0), 0);

            return (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className="bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                {/* Cover Image or Pastel Header */}
                <div className="relative h-44 w-full overflow-hidden bg-linear-to-tr from-pink-300 via-rose-200 to-amber-100">
                  {trip.coverImage ? (
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {trip.emoji || '✈️'}
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-black/10" />

                  {/* Emoji Floating Badge */}
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center text-xl shadow-md">
                    {trip.emoji || '🌸'}
                  </div>

                  {/* Countdown Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-rose-600 shadow-xs">
                    {getDaysCountdown(trip.startDate)}
                  </div>

                  {/* Destination on bottom of image */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="flex items-center gap-1 text-xs font-semibold drop-shadow-md">
                      <MapPin className="w-3.5 h-3.5 text-pink-300" />
                      {trip.destination}
                    </span>
                    <span className="text-[11px] font-medium opacity-90 drop-shadow-md">
                      {trip.days.length} วัน • {totalPlaces} สถานที่
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-cute text-xl font-bold text-slate-800 group-hover:text-rose-600 transition line-clamp-1">
                      {trip.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-500" />
                      <span>{trip.startDate} ถึง {trip.endDate}</span>
                    </div>

                    {trip.notes && (
                      <p className="text-xs text-rose-600/80 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100/60 mt-3 line-clamp-2">
                        💌 {trip.notes}
                      </p>
                    )}
                  </div>

                  {/* Footer & Companion Info */}
                  <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      {trip.partnerName ? (
                        <span className="flex items-center gap-1 text-rose-600 font-semibold">
                          <Heart className="w-3.5 h-3.5 fill-rose-500" />
                          {trip.createdByName} & {trip.partnerName}
                        </span>
                      ) : (
                        <span>สร้างโดย: {trip.createdByName}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`คุณต้องการลบทริป "${trip.title}" หรือไม่?`)) {
                            onDeleteTrip(trip.id);
                          }
                        }}
                        className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                        title="ลบทริป"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition shadow-xs">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TRIP MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 animate-in fade-in zoom-in-95">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-rose-50 text-rose-500 rounded-2xl mb-2">
                <Sparkles className="w-7 h-7 text-rose-500 animate-pulse" />
              </div>
              <h3 className="font-cute text-2xl font-bold text-slate-800">
                สร้างทริปคู่รักใหม่ ✈️💕
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                กำหนดจุดหมายปลายทาง และวันที่สองเราจะไปเที่ยวด้วยกัน
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              
              {/* Emoji Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  เลือก Emoji ประจำทริป:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition shrink-0 ${
                        emoji === em
                          ? 'border-pink-400 bg-pink-50 ring-2 ring-pink-300'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อทริป: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ทริปฉลองครบรอบที่เชียงใหม่ ❄️"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จุดหมายปลายทาง (จังหวัด/ประเทศ): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เชียงใหม่, ญี่ปุ่น, เกาะกูด"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันเริ่มต้น: *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    วันสิ้นสุด: *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  โน้ตสวีท / ความตั้งใจในทริปนี้:
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น อยากพาไปถ่ายรูปกับดอกไม้ กินอาหารอร่อยๆ ทุกมื้อเลยนะ 💕"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-cute text-base font-bold shadow-lg shadow-pink-200 transition mt-2"
              >
                สร้างทริปและเริ่มวางแผนเลย 💖
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
