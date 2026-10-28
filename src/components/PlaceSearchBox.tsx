import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Plus, Loader2, Sparkles, Navigation, Star } from 'lucide-react';
import { PlaceActivity, PlaceCategory } from '../types';
import { searchPlaces } from '../services/placeSearch';

interface SearchResultItem {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  category?: string;
  namedetails?: { name?: string };
}

interface PlaceSearchBoxProps {
  onSelectPlace: (place: Partial<PlaceActivity>) => void;
  onFocusCoordinates?: (lat: number, lng: number) => void;
  currentDayNumber: number;
}

export const PlaceSearchBox: React.FC<PlaceSearchBoxProps> = ({
  onSelectPlace,
  onFocusCoordinates,
  currentDayNumber
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search using OpenStreetMap Nominatim
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchPlaces(query);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const guessCategory = (name: string, type?: string): PlaceCategory => {
    const text = (name + ' ' + (type || '')).toLowerCase();
    if (text.includes('cafe') || text.includes('coffee') || text.includes('คาเฟ่') || text.includes('ชา')) return 'cafe';
    if (text.includes('food') || text.includes('restaurant') || text.includes('ร้านอาหาร') || text.includes('ครัว') || text.includes('ข้าว')) return 'food';
    if (text.includes('hotel') || text.includes('resort') || text.includes('โรงแรม') || text.includes('รีสอร์ท') || text.includes('โฮสเทล')) return 'hotel';
    if (text.includes('mall') || text.includes('market') || text.includes('ตลาด') || text.includes('ช้อปปิ้ง')) return 'shopping';
    if (text.includes('airport') || text.includes('station') || text.includes('สนามบิน') || text.includes('สถานี')) return 'transport';
    return 'sightseeing';
  };

  const handleAddSearchResult = (item: SearchResultItem) => {
    const mainTitle = item.display_name.split(',')[0].trim();
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    const newActivity: Partial<PlaceActivity> = {
      title: mainTitle,
      address: item.display_name,
      lat,
      lng,
      category: guessCategory(mainTitle, item.type),
      time: '12:00',
      rating: 4.5,
      googleMapUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    };

    onSelectPlace(newActivity);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-pink-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="🔍 ค้นหาสถานที่ เช่น คาเฟ่นิมมาน, ประตูท่าแพ, วัดพระธาตุ..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-pink-200 rounded-2xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 shadow-xs transition"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-300 hover:text-slate-500"
          >
            ×
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-pink-100 max-h-80 overflow-y-auto z-50 divide-y divide-pink-50 animate-in fade-in zoom-in-95">
          <div className="p-2 bg-rose-50/50 flex items-center justify-between text-[11px] text-pink-600 font-semibold px-3">
            <span>ผลการค้นหาสถานที่ (เหมือน Google Map)</span>
            <span>เพิ่มลงใน Day {currentDayNumber}</span>
          </div>

          {results.map((item) => {
            const parts = item.display_name.split(',');
            const title = parts[0];
            const address = parts.slice(1, 3).join(', ');
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);

            return (
              <div
                key={item.place_id}
                className="p-3 hover:bg-rose-50/40 transition flex items-center justify-between gap-3 group"
              >
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onFocusCoordinates?.(lat, lng)}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                      {title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate pl-5">
                    {address || item.display_name}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onFocusCoordinates?.(lat, lng)}
                    className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-pink-100/50 transition"
                    title="เลื่อนแผนที่ไปจุดนี้"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSearchResult(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Day {currentDayNumber}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
