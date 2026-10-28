import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { PlaceActivity } from '../types';
import { ExternalLink, Navigation } from 'lucide-react';

interface MapViewProps {
  places: PlaceActivity[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (placeId: string) => void;
  focusedCoordinates?: { lat: number; lng: number } | null;
}

export const MapView: React.FC<MapViewProps> = ({
  places,
  selectedPlaceId,
  onSelectPlace,
  focusedCoordinates
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  const [mapStyle, setMapStyle] = React.useState<'google' | 'google-sat' | 'osm'>('google');
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center (e.g. Chiang Mai or Bangkok)
    const initialLat = places.length > 0 ? places[0].lat : 18.7961;
    const initialLng = places.length > 0 ? places[0].lng : 98.9793;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true
    });

    // Default to Google Maps tiles (free, direct, real Google Maps roads & landmarks in Thai!)
    const initialTile = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(map);

    tileLayerRef.current = initialTile;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Map Style Switcher (Google Maps, Satellite, OSM)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    let url = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    let attr = '&copy; Google Maps';

    if (mapStyle === 'google-sat') {
      url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attr = '&copy; Google Maps Satellite';
    } else if (mapStyle === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attr = '&copy; OpenStreetMap contributors';
    }

    tileLayerRef.current = L.tileLayer(url, {
      attribution: attr,
      maxZoom: 20
    }).addTo(map);
  }, [mapStyle]);

  // Update Markers and Polyline when places change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (places.length === 0) return;

    const validPlaces = places.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat));
    if (validPlaces.length === 0) return;

    const latLngs: L.LatLngTuple[] = [];

    validPlaces.forEach((place, index) => {
      const pos: L.LatLngTuple = [place.lat, place.lng];
      latLngs.push(pos);

      // Create cute numbered heart-teardrop icon
      const isSelected = selectedPlaceId === place.id;
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            background: ${isSelected ? 'linear-gradient(135deg, #e11d48, #be185d)' : 'linear-gradient(135deg, #f43f5e, #ec4899)'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(244,63,94,${isSelected ? '0.6' : '0.4'});
            border: 2px solid white;
            transition: all 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-weight: 800;
              font-family: 'Prompt', sans-serif;
              font-size: ${isSelected ? '14px' : '12px'};
            ">
              ${index + 1}
            </span>
          </div>
        `,
        iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
        iconAnchor: [isSelected ? 18 : 15, isSelected ? 36 : 30],
        popupAnchor: [0, isSelected ? -36 : -30]
      });

      const marker = L.marker(pos, { icon: customIcon }).addTo(map);

      // Popup content
      const popupHtml = `
        <div style="font-family: 'Prompt', sans-serif; min-width: 180px; padding: 4px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="background: #fdf2f8; color: #db2777; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 9999px;">
              ลำดับที่ ${index + 1} • ${place.time || '10:00'}
            </span>
          </div>
          <h4 style="margin: 0; font-size: 14px; font-weight: 700; color: #1e293b;">${place.title}</h4>
          <p style="margin: 4px 0 8px 0; font-size: 11px; color: #64748b; line-height: 1.3;">${place.address || 'พิกัดบนแผนที่'}</p>
          ${place.notes ? `<div style="font-size: 11px; color: #f43f5e; margin-bottom: 8px; background: #fff1f2; padding: 4px 6px; border-radius: 6px;">💌 ${place.notes}</div>` : ''}
          <a href="https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}" target="_blank" rel="noopener noreferrer" 
             style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: #2563eb; text-decoration: none; font-weight: 600;">
             เปิดใน Google Maps ↗
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectPlace?.(place.id);
      });

      markersRef.current[place.id] = marker;
    });

    // Draw route line between locations
    if (latLngs.length > 1) {
      polylineRef.current = L.polyline(latLngs, {
        color: '#f43f5e',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);
    }

    // Fit bounds smoothly to include all pins
    const group = L.featureGroup(Object.values(markersRef.current));
    map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 15 });
  }, [places, selectedPlaceId]);

  // Focus specific coordinates if requested from search
  useEffect(() => {
    if (focusedCoordinates && mapInstanceRef.current) {
      mapInstanceRef.current.setView([focusedCoordinates.lat, focusedCoordinates.lng], 16, {
        animate: true
      });
    }
  }, [focusedCoordinates]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-lg border border-pink-100 bg-rose-50/20">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Floating map controls / overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Style Selector */}
        <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-pink-100 flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMapStyle('google')}
            className={`px-2.5 py-1 rounded-xl font-semibold transition ${
              mapStyle === 'google'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Google Map 🗺️
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('google-sat')}
            className={`px-2.5 py-1 rounded-xl font-semibold transition ${
              mapStyle === 'google-sat'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ดาวเทียม 🛰️
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('osm')}
            className={`px-2.5 py-1 rounded-xl font-semibold transition ${
              mapStyle === 'osm'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            OSM
          </button>
        </div>

        {/* Count Badge */}
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-pink-100 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Navigation className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>{places.length} จุด</span>
        </div>
      </div>

      {places.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-xs pointer-events-none p-6 text-center">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100 max-w-xs">
            <span className="text-3xl block mb-2">🗺️</span>
            <p className="font-cute text-base font-bold text-slate-700">ยังไม่มีสถานที่ในวันนี้</p>
            <p className="text-xs text-slate-500 mt-1">ใช้ช่องค้นหาด้านซ้ายเพื่อเพิ่มจุดหมายแรกของคุณและแฟนกันเลย!</p>
          </div>
        </div>
      )}
    </div>
  );
};
