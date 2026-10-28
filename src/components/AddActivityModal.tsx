import React, { useState, useEffect, useRef } from 'react';
import { PlaceActivity, PlaceCategory } from '../types';
import { X, Clock, MapPin, DollarSign, Heart, Sparkles, Search, Loader2, CheckCircle2, Navigation } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: PlaceActivity) => void;
  initialData?: Partial<PlaceActivity> | null;
  dayNumber: number;
}

interface SearchPlaceResult {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
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

  // Search autocomplete states
  const [searchResults, setSearchResults] = useState<SearchPlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [hasSelectedFromMap, setHasSelectedFromMap] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      setHasSelectedFromMap(true);
    } else {
      setTitle('');
      setCategory('cafe');
      setTime('10:00');
      setNotes('');
      setBudget('');
      setAddress('');
      setLat(18.7961);
      setLng(98.9793);
      setHasSelectedFromMap(false);
    }
    setSearchResults([]);
    setShowSearchDropdown(false);
  }, [initialData, isOpen]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Place Search (like Google Maps)
  useEffect(() => {
    if (!title.trim() || title.length < 2 || hasSelectedFromMap) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const encoded = encodeURIComponent(title.trim());
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=6&accept-language=th,en`,
          {
            headers: {
              'User-Agent': 'SweetJourneyApp/1.0'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
          setShowSearchDropdown(data.length > 0);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, hasSelectedFromMap]);

  const guessCategory = (name: string, type?: string): PlaceCategory => {
    const text = (name + ' ' + (type || '')).toLowerCase();
    if (text.includes('cafe') || text.includes('coffee') || text.includes('คาเฟ่') || text.includes('ชา')) return 'cafe';
    if (text.includes('food') || text.includes('restaurant') || text.includes('ร้านอาหาร') || text.includes('ครัว') || text.includes('ข้าว')) return 'food';
    if (text.includes('hotel') || text.includes('resort') || text.includes('โรงแรม') || text.includes('รีสอร์ท') || text.includes('โฮสเทล')) return 'hotel';
    if (text.includes('mall') || text.includes('market') || text.includes('ตลาด') || text.includes('ช้อปปิ้ง')) return 'shopping';
    if (text.includes('airport') || text.includes('station') || text.includes('สนามบิน') || text.includes('สถานี')) return 'transport';
    return 'sightseeing';
  };

  const handleSelectSearchResult = (item: SearchPlaceResult) => {
    const parts = item.display_name.split(',');
    const mainTitle = parts[0].trim();
    const addr = parts.slice(1, 4).join(', ').trim();
    const itemLat = parseFloat(item.lat);
    const itemLng = parseFloat(item.lon);

    setTitle(mainTitle);
    setAddress(addr || item.display_name);
    setLat(itemLat);
    setLng(itemLng);
    setCategory(guessCategory(mainTitle, item.type));
    setHasSelectedFromMap(true);
    setShowSearchDropdown(false);
  };

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
      address: address.trim() || 'พิกัดบนแผนที่ Google Maps',
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
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
            พิมพ์ค้นหาสถานที่ระบบจะค้นหาจาก Google Maps ให้อัตโนมัติ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* TITLE & LIVE SEARCH AUTOCOMPLETE */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>ชื่อสถานที่ หรือพิมพ์ค้นหา: *</span>
              {searching && (
                <span className="text-rose-500 text-[11px] flex items-center gap-1 font-normal">
                  <Loader2 className="w-3 h-3 animate-spin" /> กำลังค้นหาแผนที่...
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="เช่น แม่โจ้, ประตูท่าแพ, One Nimman, วัดพระธาตุ..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasSelectedFromMap(false);
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-semibold shadow-xs"
              />
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5" />
            </div>

            {/* Google Maps Style Autocomplete Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-pink-200 z-50 divide-y divide-pink-50 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95">
                <div className="p-2 bg-rose-50/80 px-3 text-[11px] font-bold text-rose-600 flex items-center justify-between">
                  <span>เลือกสถานที่ที่ต้องการปักหมุด 📍</span>
                  <span className="text-[10px] text-slate-400 font-normal">คลิกเพื่อเลือก</span>
                </div>
                {searchResults.map((item) => {
                  const parts = item.display_name.split(',');
                  const mainName = parts[0].trim();
                  const subAddr = parts.slice(1, 4).join(', ').trim();

                  return (
                    <div
                      key={item.place_id}
                      onClick={() => handleSelectSearchResult(item)}
                      className="p-3 hover:bg-rose-50/50 cursor-pointer transition flex items-start gap-2.5 text-left"
                    >
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {mainName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {subAddr || item.display_name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Coordinates / Map Pin Confirmation Badge */}
            {hasSelectedFromMap && (
              <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ปักหมุดพิกัด Google Maps เรียบร้อย: <b>{lat.toFixed(4)}, {lng.toFixed(4)}</b></span>
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline text-[11px] font-bold"
                >
                  เปิดดู ↗
                </a>
              </div>
            )}
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

          {/* Address / Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-500" /> ที่อยู่ หรือจุดสังเกต:
            </label>
            <input
              type="text"
              placeholder="เช่น อำเภอสันทราย, จังหวัดเชียงใหม่"
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
