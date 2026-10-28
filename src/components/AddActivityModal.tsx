import React, { useState, useEffect } from 'react';
import { PlaceActivity, PlaceCategory } from '../types';
import { X, Clock, MapPin, DollarSign, Heart, Sparkles } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: PlaceActivity) => void;
  initialData?: Partial<PlaceActivity> | null;
  dayNumber: number;
}

const CATEGORIES: { id: PlaceCategory; label: string; icon: string; color: string }[] = [
  { id: 'cafe', label: 'คาเฟ่ & ขนม', icon: '☕', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'food', label: 'ร้านอาหาร & สตรีทฟู้ด', icon: '🍜', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'sightseeing', label: 'ที่เที่ยว & ถ่ายรูป', icon: '📸', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'hotel', label: 'โรงแรม & ที่พัก', icon: '🏨', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'shopping', label: 'ช้อปปิ้ง & ของฝาก', icon: '🛍️', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'transport', label: 'การเดินทาง & รถเช่า', icon: '🚗', color: 'bg-slate-50 text-slate-700 border-slate-200' }
];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  dayNumber
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('cafe');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(18.7961);
  const [lng, setLng] = useState<number>(98.9793);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'cafe');
      setTime(initialData.time || '10:00');
      setNotes(initialData.notes || '');
      setBudget(initialData.budget ? initialData.budget.toString() : '');
      setAddress(initialData.address || '');
      if (initialData.lat) setLat(initialData.lat);
      if (initialData.lng) setLng(initialData.lng);
    } else {
      setTitle('');
      setCategory('cafe');
      setTime('10:00');
      setNotes('');
      setBudget('');
      setAddress('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const activity: PlaceActivity = {
      id: initialData?.id || 'act-' + Date.now(),
      title: title.trim(),
      category,
      time: time || '10:00',
      notes: notes.trim(),
      budget: budget ? parseFloat(budget) : undefined,
      address: address.trim() || 'พิกัดที่กำหนดเอง',
      lat: Number(lat) || 18.7961,
      lng: Number(lng) || 98.9793,
      rating: initialData?.rating || 4.8,
      googleMapUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      done: initialData?.done || false
    };

    onSave(activity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>แพลนสำหรับ Day {dayNumber}</span>
          </div>
          <h3 className="font-cute text-2xl font-bold text-slate-800">
            {initialData?.id ? 'แก้ไขสถานที่ / กิจกรรม ✏️' : 'เพิ่มสถานที่ในแพลนเที่ยว 🌸'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            ระบุเวลา และบันทึกโน้ตหวานๆ ให้แฟนเห็น
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อสถานที่ หรือกิจกรรม: *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น Transit No.8 Cafe หรือ กินหมูกระทะบนดอย"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-semibold"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              หมวดหมู่:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 transition ${
                    category === cat.id
                      ? `${cat.color} ring-2 ring-pink-400 font-bold shadow-xs`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate">{cat.label.split('&')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time & Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-pink-500" /> เวลา:
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-pink-500" /> งบประมาณประมาณ (บาท):
              </label>
              <input
                type="number"
                placeholder="เช่น 500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-500" /> ที่อยู่ หรือจุดสังเกต:
            </label>
            <input
              type="text"
              placeholder="เช่น ถนนนิมมานเหมินท์ ซอย 9"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
            />
          </div>

          {/* Couple Romantic Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> โน้ตน่ารักๆ ถึงแฟน / สิ่งที่ต้องทำร่วมกัน:
            </label>
            <textarea
              rows={2}
              placeholder="เช่น ถ่ายรูปมุมบันไดวน อย่าลืมสั่งครัวซองต์ช็อกโกแลตที่แฟนชอบ 🥐🍫"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-cute text-base font-bold shadow-md shadow-pink-200 transition"
            >
              บันทึกสถานที่ 💖
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
