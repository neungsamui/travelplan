export type PlaceCategory = 'cafe' | 'food' | 'sightseeing' | 'hotel' | 'shopping' | 'transport';

export interface PlaceActivity {
  id: string;
  title: string;
  category: PlaceCategory;
  time: string; // e.g. "09:30"
  notes?: string;
  budget?: number;
  lat: number;
  lng: number;
  address: string;
  googleMapUrl?: string;
  rating?: number;
  done?: boolean;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  date: string; // "YYYY-MM-DD"
  title: string; // e.g. "วันแรก ตะลอนคาเฟ่นิมมาน"
  places: PlaceActivity[];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  emoji: string;
  createdBy: string; // userId
  createdByName: string;
  partnerId?: string; // userId of partner
  partnerName?: string;
  notes?: string;
  budgetTotal?: number;
  days: DayPlan[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  coupleCode: string; // Unique 6-8 char code, e.g. "LOVE-4819"
  partnerId?: string;
  partnerName?: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLoginAt: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  timestamp: string; // ISO
  dateStr: string; // "YYYY-MM-DD"
  timeStr: string; // "HH:mm:ss"
  device: string; // "Mobile Chrome" / "Windows Desktop"
}
