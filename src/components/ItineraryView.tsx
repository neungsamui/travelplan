import React, { useState } from 'react';
import { Trip, DayPlan, PlaceActivity, User } from '../types';
import { PlaceSearchBox } from './PlaceSearchBox';
import { MapView } from './MapView';
import { AddActivityModal } from './AddActivityModal';
import { 
  Calendar, MapPin, Plus, Heart, Clock, DollarSign, 
  Trash2, Edit3, ArrowUp, ArrowDown, ExternalLink, 
  CheckCircle2, Circle, Share2, Sparkles, Map as MapIcon, 
  ListFilter, ChevronRight 
} from 'lucide-react';

interface ItineraryViewProps {
  trip: Trip;
  currentUser: User | null;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onBackToTrips: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  currentUser,
  onUpdateTrip,
  onBackToTrips
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<PlaceActivity | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [focusedCoords, setFocusedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mobileTab, setMobileTab] = useState<'plan' | 'map'>('plan');

  const currentDay: DayPlan = (trip.days && trip.days[selectedDayIndex]) || {
    id: 'day-fallback',
    dayNumber: 1,
    date: trip.startDate || '2026-11-15',
    title: 'วันที่ 1',
    places: []
  };

  // Add place from search directly
  const handleSelectFromSearch = (partialPlace: Partial<PlaceActivity>) => {
    const newPlace: PlaceActivity = {
      id: 'place-' + Date.now(),
      title: partialPlace.title || 'สถานที่ใหม่',
      category: partialPlace.category || 'cafe',
      time: '11:00',
      address: partialPlace.address || '',
      lat: partialPlace.lat || 18.7961,
      lng: partialPlace.lng || 98.9793,
      rating: partialPlace.rating || 4.5,
      googleMapUrl: partialPlace.googleMapUrl,
      notes: '',
      done: false
    };

    const updatedDays = [...trip.days];
    updatedDays[selectedDayIndex].places.push(newPlace);
    const updatedTrip = { ...trip, days: updatedDays };
    onUpdateTrip(updatedTrip);

    // Focus map on added place
    setFocusedCoords({ lat: newPlace.lat, lng: newPlace.lng });
  };

  // Save from Add/Edit Modal
  const handleSaveActivity = (activity: PlaceActivity) => {
    const updatedDays = [...trip.days];
    const places = [...updatedDays[selectedDayIndex].places];
    const existingIndex = places.findIndex((p) => p.id === activity.id);

    if (existingIndex >= 0) {
      places[existingIndex] = activity;
    } else {
      places.push(activity);
    }

    updatedDays[selectedDayIndex].places = places;
    const updatedTrip = { ...trip, days: updatedDays };
    onUpdateTrip(updatedTrip);
    setFocusedCoords({ lat: activity.lat, lng: activity.lng });
  };

  // Delete activity
  const handleDeleteActivity = (id: string) => {
    const updatedDays = [...trip.days];
    updatedDays[selectedDayIndex].places = updatedDays[selectedDayIndex].places.filter((p) => p.id !== id);
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Toggle visited
  const handleToggleDone = (id: string) => {
    const updatedDays = [...trip.days];
    const places = updatedDays[selectedDayIndex].places.map((p) =>
      p.id === id ? { ...p, done: !p.done } : p
    );
    updatedDays[selectedDayIndex].places = places;
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Reorder activities
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const places = [...currentDay.places];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= places.length) return;

    const temp = places[index];
    places[index] = places[targetIndex];
    places[targetIndex] = temp;

    const updatedDays = [...trip.days];
    updatedDays[selectedDayIndex].places = places;
    onUpdateTrip({ ...trip, days: updatedDays });
  };

  // Add new day to trip
  const handleAddDay = () => {
    const nextDayNumber = trip.days.length + 1;
    const startDateObj = new Date(trip.startDate);
    startDateObj.setDate(startDateObj.getDate() + trip.days.length);
    const dateStr = startDateObj.toISOString().split('T')[0];

    const newDay: DayPlan = {
      id: 'day-' + Date.now(),
      dayNumber: nextDayNumber,
      date: dateStr,
      title: `วันที่ ${nextDayNumber}: สำรวจเมือง`,
      places: []
    };

    const updatedTrip = { ...trip, days: [...trip.days, newDay] };
    onUpdateTrip(updatedTrip);
    setSelectedDayIndex(trip.days.length);
  };

  // Calculate day total budget
  const dayBudget = (currentDay.places || []).reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner / Trip Info */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-pink-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBackToTrips}
              className="mt-1 p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition shrink-0"
              title="กลับไปหน้ารวมทริป"
            >
              ←
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl">{trip.emoji || '✈️'}</span>
                <h1 className="font-cute text-2xl sm:text-3xl font-bold text-slate-800">
                  {trip.title}
                </h1>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs sm:text-sm text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-rose-600">
                  <MapPin className="w-3.5 h-3.5" /> {trip.destination}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {trip.startDate} ถึง {trip.endDate} ({trip.days.length} วัน)
                </span>
                {trip.partnerName && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-pink-200 text-rose-700 text-xs font-semibold">
                      <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                      สร้างร่วมกับ {trip.partnerName}
                    </span>
                  </>
                )}
              </div>
              {trip.notes && (
                <p className="mt-2 text-xs sm:text-sm text-rose-600/90 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 inline-block">
                  💌 {trip.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => {
                setEditingActivity(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-linear-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-cute font-bold shadow-md shadow-pink-200 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มสถานที่ในแพลน</span>
            </button>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-pink-100 no-scrollbar">
          {trip.days.map((day, idx) => (
            <button
              key={day.id}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition shrink-0 flex items-center gap-2 ${
                selectedDayIndex === idx
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'bg-rose-50/60 text-slate-600 hover:bg-rose-100/60'
              }`}
            >
              <span className="font-cute text-sm">Day {day.dayNumber}</span>
              <span className={`text-[11px] opacity-80 ${selectedDayIndex === idx ? 'text-rose-100' : 'text-slate-400'}`}>
                ({day.date})
              </span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedDayIndex === idx ? 'bg-rose-600 text-white' : 'bg-pink-100 text-pink-700'
              }`}>
                {day.places.length}
              </span>
            </button>
          ))}

          <button
            onClick={handleAddDay}
            className="px-3.5 py-2 rounded-2xl border border-dashed border-pink-300 text-pink-600 hover:bg-pink-50 text-xs font-semibold shrink-0 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่มวันเที่ยว</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher (Plan List vs Map) */}
      <div className="flex lg:hidden bg-white p-1 rounded-2xl border border-pink-100 mb-4 shadow-xs">
        <button
          onClick={() => setMobileTab('plan')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'plan' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>รายการแพลน ({(currentDay.places || []).length})</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mobileTab === 'map' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>แผนที่และเส้นทาง 🗺️</span>
        </button>
      </div>

      {/* Main 2-Column Wanderlog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Day Planner & Places Timeline (7 Cols) */}
        <div className={`lg:col-span-7 space-y-4 ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Quick Search Bar directly above timeline */}
          <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-sm border border-pink-100">
            <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                ค้นหาสถานที่เพื่อเพิ่มลงใน Day {currentDay.dayNumber}:
              </span>
              {dayBudget > 0 && (
                <span className="text-rose-500 font-bold">
                  งบรวมวันนี้: ฿{dayBudget.toLocaleString()}
                </span>
              )}
            </div>
            <PlaceSearchBox
              currentDayNumber={currentDay.dayNumber}
              onSelectPlace={handleSelectFromSearch}
              onFocusCoordinates={(lat, lng) => setFocusedCoords({ lat, lng })}
            />
          </div>

          {/* Timeline Places List */}
          <div className="space-y-3">
            {(currentDay.places || []).length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-pink-200">
                <span className="text-4xl block mb-3">📍</span>
                <h4 className="font-cute text-lg font-bold text-slate-700">
                  ยังไม่มีสถานที่ใน Day {currentDay.dayNumber}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  พิมพ์ชื่อสถานที่ในช่องค้นหาด้านบน หรือกดปุ่ม &quot;เพิ่มสถานที่ในแพลน&quot; ได้เลยจ้า
                </p>
                <button
                  onClick={() => {
                    setEditingActivity(null);
                    setModalOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มสถานที่แรกของวันนี้</span>
                </button>
              </div>
            ) : (
              (currentDay.places || []).map((place, index) => (
                <div
                  key={place.id}
                  onClick={() => {
                    setSelectedPlaceId(place.id);
                    setFocusedCoords({ lat: place.lat, lng: place.lng });
                  }}
                  className={`bg-white rounded-3xl p-4 sm:p-5 shadow-xs border transition relative group cursor-pointer ${
                    selectedPlaceId === place.id
                      ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20'
                      : 'border-pink-100 hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      
                      {/* Number Pin Badge */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-pink-600 px-2 py-0.5 rounded-md bg-pink-50">
                            {place.time}
                          </span>
                          <h4 className={`text-sm sm:text-base font-bold text-slate-800 truncate ${place.done ? 'line-through opacity-60' : ''}`}>
                            {place.title}
                          </h4>
                          {place.budget && (
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              ฿{place.budget.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mt-1 truncate">
                          {place.address}
                        </p>

                        {/* Sweet Couple Note */}
                        {place.notes && (
                          <div className="mt-2 text-xs text-rose-700 bg-rose-50/70 border border-pink-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0" />
                            <span>{place.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                      
                      {/* Check Visited */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDone(place.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-500 transition"
                        title={place.done ? 'ทำเครื่องหมายว่ายังไม่ได้ไป' : 'ทำเครื่องหมายว่าไปมาแล้ว'}
                      >
                        {place.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>

                      {/* Move Order */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, 'up');
                        }}
                        className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-20 transition"
                        title="เลื่อนขึ้น"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === currentDay.places.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, 'down');
                        }}
                        className="p-1 text-slate-300 hover:text-slate-600 disabled:opacity-20 transition"
                        title="เลื่อนลง"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingActivity(place);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-500 transition"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`ลบ "${place.title}" ออกจากแพลน?`)) {
                            handleDeleteActivity(place.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition"
                        title="ลบสถานที่"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Google Maps link */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                        title="เปิดใน Google Maps 🗺️"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Wanderlog Style Sticky Live Map (5 Cols) */}
        <div className={`lg:col-span-5 ${mobileTab === 'plan' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-20 h-[580px] sm:h-[650px]">
            <MapView
              places={currentDay.places}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={(id) => setSelectedPlaceId(id)}
              focusedCoordinates={focusedCoords}
            />
          </div>
        </div>

      </div>

      {/* Modal for adding/editing activity */}
      <AddActivityModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        initialData={editingActivity}
        dayNumber={currentDay.dayNumber}
      />

    </div>
  );
};
