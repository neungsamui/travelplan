import { User, Trip, LoginLog, PlaceActivity } from '../types';

const USERS_KEY = 'sweet_journey_users';
const TRIPS_KEY = 'sweet_journey_trips';
const LOGS_KEY = 'sweet_journey_login_logs';
const CURRENT_USER_KEY = 'sweet_journey_current_user';

// Initial sample users
const INITIAL_USERS: User[] = [
  {
    id: 'user-tonkla',
    name: 'ต้นกล้า 🐻',
    email: 'tonkla@sweet.love',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    coupleCode: 'LOVE-5201',
    partnerId: 'user-namwaan',
    partnerName: 'น้ำหวาน 🐰',
    role: 'user',
    createdAt: '2026-10-20T10:00:00.000Z',
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'user-namwaan',
    name: 'น้ำหวาน 🐰',
    email: 'namwaan@sweet.love',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    coupleCode: 'LOVE-1314',
    partnerId: 'user-tonkla',
    partnerName: 'ต้นกล้า 🐻',
    role: 'user',
    createdAt: '2026-10-20T10:05:00.000Z',
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'user-admin',
    name: 'แอดมิน โรส 🌹',
    email: 'admin@sweet.love',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    coupleCode: 'LOVE-9999',
    role: 'admin',
    createdAt: '2026-10-01T08:00:00.000Z',
    lastLoginAt: new Date().toISOString()
  },
  {
    id: 'user-single',
    name: 'น้องมายด์ (โสด) 🐱',
    email: 'mild@sweet.love',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    coupleCode: 'LOVE-7788',
    role: 'user',
    createdAt: '2026-10-25T14:20:00.000Z',
    lastLoginAt: new Date().toISOString()
  }
];

// Initial Chiang Mai sample trip with real spots and coordinates
const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-chiangmai-1',
    title: 'แอ่วเชียงใหม่หน้าหนาวกับคนดี 🌸❄️',
    destination: 'เชียงใหม่, ประเทศไทย',
    startDate: '2026-11-15',
    endDate: '2026-11-17',
    coverImage: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80',
    emoji: '🌸',
    createdBy: 'user-tonkla',
    createdByName: 'ต้นกล้า 🐻',
    partnerId: 'user-namwaan',
    partnerName: 'น้ำหวาน 🐰',
    notes: 'ทริปครบรอบ 2 ปี อยากพาเธอไปกินเค้กอร่อยๆ และถ่ายรูปมุมสวยๆ ทุกที่เลยนะ 💕',
    budgetTotal: 15000,
    createdAt: '2026-10-22T08:00:00.000Z',
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        date: '2026-11-15',
        title: 'วันแรก: เช็คอินคาเฟ่ & ตะลุย One Nimman',
        places: [
          {
            id: 'p-101',
            title: 'สนามบินเชียงใหม่ (CNX)',
            category: 'transport',
            time: '09:00',
            notes: 'รับรถเช่าที่สนามบิน เดินทางไปนิมมาน',
            budget: 800,
            lat: 18.7677,
            lng: 98.9640,
            address: 'สนามบินนานาชาติเชียงใหม่',
            done: true
          },
          {
            id: 'p-102',
            title: 'ข้าวซอยนิมมาน (Khao Soi Nimman)',
            category: 'food',
            time: '11:30',
            notes: 'กินข้าวซอยไก่กับไส้อั่วลำๆ แฟนชอบมาก',
            budget: 350,
            lat: 18.7981,
            lng: 98.9686,
            address: 'ซอย 7 ถนนนิมมานเหมินท์ เชียงใหม่',
            rating: 4.6,
            done: true
          },
          {
            id: 'p-103',
            title: 'One Nimman & Transit No.8 Cafe',
            category: 'cafe',
            time: '14:00',
            notes: 'ถ่ายรูปมุมตึกอิฐสไตล์ยุโรป กินกาแฟกับชาพีช ☕🍑',
            budget: 400,
            lat: 18.8002,
            lng: 98.9682,
            address: 'ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมืองเชียงใหม่',
            rating: 4.8,
            done: false
          },
          {
            id: 'p-104',
            title: 'U Nimman Chiang Mai (โรงแรม)',
            category: 'hotel',
            time: '17:00',
            notes: 'เช็คอิน พักผ่อน ว่ายน้ำชมวิวดอยสุเทพ',
            budget: 3200,
            lat: 18.8009,
            lng: 98.9678,
            address: 'แยกนิมมานเหมินท์ เชียงใหม่',
            done: false
          }
        ]
      },
      {
        id: 'day-2',
        dayNumber: 2,
        date: '2026-11-16',
        title: 'วันที่สอง: รับลมหนาว ดอยสุเทพ & คาเฟ่ป่า Chom Cafe',
        places: [
          {
            id: 'p-201',
            title: 'วัดพระธาตุดอยสุเทพราชวรวิหาร',
            category: 'sightseeing',
            time: '08:30',
            notes: 'ขึ้นไปไหว้พระขอพรให้ความรักยืนยาว ชมวิวเมืองเชียงใหม่มุมสูง',
            lat: 18.8050,
            lng: 98.9215,
            address: 'ต.สุเทพ อ.เมืองเชียงใหม่',
            rating: 4.9,
            done: false
          },
          {
            id: 'p-202',
            title: 'Chom Cafe and Restaurant (ชมคาเฟ่)',
            category: 'cafe',
            time: '12:30',
            notes: 'สวนมอสในฝัน หมอกฟุ้งๆ ถ่ายรูปสวยเหมือนดินแดนอลิซ 🌿✨',
            budget: 700,
            lat: 18.7518,
            lng: 98.9507,
            address: 'ต.แม่เหียะ อ.เมืองเชียงใหม่',
            rating: 4.7,
            done: false
          },
          {
            id: 'p-203',
            title: 'ประตูท่าแพ (Tha Phae Gate)',
            category: 'sightseeing',
            time: '17:30',
            notes: 'ถ่ายรูปให้อาหารนกพิราบ แสงเย็นสวยมาก',
            lat: 18.7878,
            lng: 98.9934,
            address: 'ถ.มูลเมือง ต.ช้างคลาน อ.เมืองเชียงใหม่',
            rating: 4.5,
            done: false
          }
        ]
      },
      {
        id: 'day-3',
        dayNumber: 3,
        date: '2026-11-17',
        title: 'วันสุดท้าย: ซื้อของฝาก & บินกลับกรุงเทพฯ',
        places: [
          {
            id: 'p-301',
            title: 'ตลาดวโรรส (กาดหลวง)',
            category: 'shopping',
            time: '10:00',
            notes: 'ซื้อแคบหมู น้ำพริกหนุ่ม ของฝากครอบครัว',
            budget: 1500,
            lat: 18.7906,
            lng: 99.0007,
            address: 'ถ.วิชยานนท์ ต.ช้างม่อย อ.เมืองเชียงใหม่',
            rating: 4.4,
            done: false
          },
          {
            id: 'p-302',
            title: 'สนามบินเชียงใหม่ เดินทางกลับ',
            category: 'transport',
            time: '14:30',
            notes: 'คืนรถเช่า ขึ้นเครื่องบินกลับด้วยความประทับใจ 💖',
            lat: 18.7677,
            lng: 98.9640,
            address: 'สนามบินนานาชาติเชียงใหม่',
            done: false
          }
        ]
      }
    ]
  }
];

// Initial mock login history for realistic admin statistics
const INITIAL_LOGS: LoginLog[] = [
  {
    id: 'log-1',
    userId: 'user-tonkla',
    userName: 'ต้นกล้า 🐻',
    userEmail: 'tonkla@sweet.love',
    timestamp: '2026-10-26T08:15:20.000Z',
    dateStr: '2026-10-26',
    timeStr: '08:15:20',
    device: 'Desktop Chrome (Windows 10)'
  },
  {
    id: 'log-2',
    userId: 'user-namwaan',
    userName: 'น้ำหวาน 🐰',
    userEmail: 'namwaan@sweet.love',
    timestamp: '2026-10-26T09:20:10.000Z',
    dateStr: '2026-10-26',
    timeStr: '09:20:10',
    device: 'iPhone Safari (iOS 18)'
  },
  {
    id: 'log-3',
    userId: 'user-tonkla',
    userName: 'ต้นกล้า 🐻',
    userEmail: 'tonkla@sweet.love',
    timestamp: '2026-10-27T10:05:00.000Z',
    dateStr: '2026-10-27',
    timeStr: '10:05:00',
    device: 'Desktop Chrome (Windows 10)'
  },
  {
    id: 'log-4',
    userId: 'user-namwaan',
    userName: 'น้ำหวาน 🐰',
    userEmail: 'namwaan@sweet.love',
    timestamp: '2026-10-27T12:44:30.000Z',
    dateStr: '2026-10-27',
    timeStr: '12:44:30',
    device: 'iPhone Safari (iOS 18)'
  },
  {
    id: 'log-5',
    userId: 'user-single',
    userName: 'น้องมายด์ (โสด) 🐱',
    userEmail: 'mild@sweet.love',
    timestamp: '2026-10-27T16:10:05.000Z',
    dateStr: '2026-10-27',
    timeStr: '16:10:05',
    device: 'Android Chrome (Galaxy S24)'
  },
  {
    id: 'log-6',
    userId: 'user-tonkla',
    userName: 'ต้นกล้า 🐻',
    userEmail: 'tonkla@sweet.love',
    timestamp: '2026-10-28T09:12:00.000Z',
    dateStr: '2026-10-28',
    timeStr: '09:12:00',
    device: 'Desktop Chrome (Windows 10)'
  },
  {
    id: 'log-7',
    userId: 'user-namwaan',
    userName: 'น้ำหวาน 🐰',
    userEmail: 'namwaan@sweet.love',
    timestamp: '2026-10-28T11:30:15.000Z',
    dateStr: '2026-10-28',
    timeStr: '11:30:15',
    device: 'iPhone Safari (iOS 18)'
  },
  {
    id: 'log-8',
    userId: 'user-admin',
    userName: 'แอดมิน โรส 🌹',
    userEmail: 'admin@sweet.love',
    timestamp: '2026-10-28T13:00:00.000Z',
    dateStr: '2026-10-28',
    timeStr: '13:00:00',
    device: 'MacBook Safari (macOS Sonoma)'
  }
];

export const storage = {
  getUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default auto-login to Tonkla so user sees the app immediately
      const defaultUser = INITIAL_USERS[0];
      this.setCurrentUser(defaultUser);
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  recordLogin(user: User) {
    const logs = this.getLoginLogs();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const ua = navigator.userAgent;
    let device = 'Desktop Browser';
    if (/android/i.test(ua)) device = 'Android Device';
    else if (/iphone|ipad|ipod/i.test(ua)) device = 'iOS Device';
    else if (/windows/i.test(ua)) device = 'Windows PC';
    else if (/mac/i.test(ua)) device = 'Mac';

    const newLog: LoginLog = {
      id: 'log-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      timestamp: now.toISOString(),
      dateStr,
      timeStr,
      device
    };

    logs.unshift(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 100))); // keep latest 100
  },

  login(email: string): { success: boolean; user?: User; message?: string } {
    const users = this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาลองใหม่หรือสมัครสมาชิก' };
    }
    found.lastLoginAt = new Date().toISOString();
    this.saveUsers(users);
    this.setCurrentUser(found);
    this.recordLogin(found);
    return { success: true, user: found };
  },

  register(name: string, email: string): { success: boolean; user?: User; message?: string } {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }

    // Generate random cute couple code LOVE-XXXX
    const randomCode = 'LOVE-' + Math.floor(1000 + Math.random() * 9000);
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      coupleCode: randomCode,
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);
    this.recordLogin(newUser);
    return { success: true, user: newUser };
  },

  pairCouple(currentUserId: string, targetCode: string): { success: boolean; message: string; partner?: User } {
    const users = this.getUsers();
    const currentUser = users.find((u) => u.id === currentUserId);
    if (!currentUser) return { success: false, message: 'ไม่พบผู้ใช้ปัจจุบัน' };

    const cleanCode = targetCode.trim().toUpperCase();
    if (cleanCode === currentUser.coupleCode) {
      return { success: false, message: 'ไม่สามารถใส่โค้ดของตัวเองได้นะ ต้องใส่โค้ดของแฟนจ้า 💌' };
    }

    const partner = users.find((u) => u.coupleCode === cleanCode);
    if (!partner) {
      return { success: false, message: 'ไม่พบโค้ดคู่รักนี้ในระบบ โปรดตรวจสอบอีกครั้ง' };
    }

    if (partner.partnerId && partner.partnerId !== currentUser.id) {
      return { success: false, message: `โค้ดนี้ถูกผูกกับคนอื่นแล้ว (${partner.partnerName}) 💔` };
    }

    // Link both together
    currentUser.partnerId = partner.id;
    currentUser.partnerName = partner.name;

    partner.partnerId = currentUser.id;
    partner.partnerName = currentUser.name;

    this.saveUsers(users);
    this.setCurrentUser(currentUser);

    // Sync partner ID onto existing user's trips
    const trips = this.getTrips(currentUserId);
    trips.forEach((t) => {
      if (t.createdBy === currentUserId || t.createdBy === partner.id) {
        t.partnerId = partner.id;
        t.partnerName = partner.name;
      }
    });
    this.saveAllTrips(trips);

    return { success: true, message: `ผูกคู่รักกับ ${partner.name} สำเร็จแล้ว! 💖`, partner };
  },

  unpairCouple(currentUserId: string): boolean {
    const users = this.getUsers();
    const currentUser = users.find((u) => u.id === currentUserId);
    if (!currentUser) return false;

    if (currentUser.partnerId) {
      const partner = users.find((u) => u.id === currentUser.partnerId);
      if (partner) {
        partner.partnerId = undefined;
        partner.partnerName = undefined;
      }
    }

    currentUser.partnerId = undefined;
    currentUser.partnerName = undefined;

    this.saveUsers(users);
    this.setCurrentUser(currentUser);
    return true;
  },

  // Trips CRUD
  getAllTrips(): Trip[] {
    const raw = localStorage.getItem(TRIPS_KEY);
    if (!raw) {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(INITIAL_TRIPS));
      return INITIAL_TRIPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TRIPS;
    }
  },

  saveAllTrips(trips: Trip[]) {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  },

  getTrips(userId?: string): Trip[] {
    const all = this.getAllTrips();
    if (!userId) return all;
    const users = this.getUsers();
    const currentUser = users.find((u) => u.id === userId);
    const partnerId = currentUser?.partnerId;

    return all.filter((t) => t.createdBy === userId || (partnerId && (t.createdBy === partnerId || t.partnerId === userId)));
  },

  saveTrip(trip: Trip) {
    const all = this.getAllTrips();
    const index = all.findIndex((t) => t.id === trip.id);
    if (index >= 0) {
      all[index] = trip;
    } else {
      all.unshift(trip);
    }
    this.saveAllTrips(all);
  },

  deleteTrip(tripId: string) {
    const all = this.getAllTrips().filter((t) => t.id !== tripId);
    this.saveAllTrips(all);
  },

  // Login Logs & Admin Analytics
  getLoginLogs(): LoginLog[] {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOGS;
    }
  },

  getAdminAnalytics() {
    const users = this.getUsers();
    const trips = this.getAllTrips();
    const logs = this.getLoginLogs();

    // Group logs by date
    const loginsByDate: Record<string, number> = {};
    logs.forEach((log) => {
      loginsByDate[log.dateStr] = (loginsByDate[log.dateStr] || 0) + 1;
    });

    // Paired couples count (each pair has 2 people)
    const pairedCount = users.filter((u) => u.partnerId).length / 2;

    return {
      totalUsers: users.length,
      pairedCouples: Math.floor(pairedCount),
      totalTrips: trips.length,
      totalLogins: logs.length,
      loginsByDate,
      recentLogs: logs.slice(0, 20),
      usersList: users
    };
  }
};
