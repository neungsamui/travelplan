import React, { useState } from 'react';
import { storage } from '../services/storage';
import { 
  Shield, Users, Heart, MapPin, Activity, 
  Calendar, Search, ArrowLeft, Smartphone, Laptop, 
  CheckCircle2, Clock, Sparkles 
} from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const analytics = storage.getAdminAnalytics();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Filter logs
  const filteredLogs = analytics.recentLogs.filter((log) => {
    const matchQuery =
      log.userName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.device.toLowerCase().includes(filterQuery.toLowerCase());
    const matchDate = selectedDateFilter === 'all' || log.dateStr === selectedDateFilter;
    return matchQuery && matchDate;
  });

  // Calculate highest login day for relative bar chart height
  const dates = Object.keys(analytics.loginsByDate).sort();
  const maxLogins = Math.max(...Object.values(analytics.loginsByDate), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Admin Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-100 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition"
            title="กลับไปหน้าหลัก"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <Shield className="w-5 h-5" />
              </span>
              <h1 className="font-cute text-2xl sm:text-3xl font-bold text-slate-800">
                ระบบจัดการหลังบ้าน & สถิติภาพรวม
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-11">
              ตรวจสอบสถิติผู้เข้าใช้งานรายวัน (Daily Logins), คู่รักในระบบ และข้อมูลภาพรวม
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-11 sm:pl-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            ระบบกำลังบันทึก Log เรียลไทม์
          </span>
        </div>
      </div>

      {/* 4 KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        
        {/* Total Users */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-pink-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ผู้ใช้งานทั้งหมด
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
              {analytics.totalUsers} <span className="text-sm font-normal text-slate-400">คน</span>
            </div>
            <span className="text-[11px] text-pink-600 font-medium mt-1 inline-block">
              สมาชิกที่ลงทะเบียน
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Paired Couples */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              คู่รักที่ผูกโค้ดแล้ว
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-rose-600 mt-1">
              {analytics.pairedCouples} <span className="text-sm font-normal text-slate-400">คู่</span>
            </div>
            <span className="text-[11px] text-rose-500 font-medium mt-1 inline-block">
              💖 ผูกรหัสสำเร็จ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-rose-600" />
          </div>
        </div>

        {/* Total Trips */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ทริปท่องเที่ยวทั้งหมด
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
              {analytics.totalTrips} <span className="text-sm font-normal text-slate-400">ทริป</span>
            </div>
            <span className="text-[11px] text-amber-600 font-medium mt-1 inline-block">
              ✈️ ในฐานข้อมูล
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        {/* Total Logins Recorded */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              สถิติการ Login รวม
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">
              {analytics.totalLogins} <span className="text-sm font-normal text-slate-400">ครั้ง</span>
            </div>
            <span className="text-[11px] text-purple-600 font-medium mt-1 inline-block">
              📈 ประวัติการเข้าใช้
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* DAILY LOGINS ACTIVITY CHART */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-pink-100 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-cute text-xl font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              <span>สถิติการเข้าใช้งานรายวัน (Daily Logins Breakdown)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              กราฟแสดงจำนวนการเข้าสู่ระบบในแต่ละวัน
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">กรองวัน:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-semibold bg-white text-slate-700"
            >
              <option value="all">ดูทุกวัน ({dates.length} วัน)</option>
              {dates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-4 border-t border-pink-50">
          {dates.map((date) => {
            const count = analytics.loginsByDate[date] || 0;
            const heightPercent = Math.max(15, Math.round((count / maxLogins) * 100));

            return (
              <div
                key={date}
                onClick={() => setSelectedDateFilter(selectedDateFilter === date ? 'all' : date)}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col justify-end ${
                  selectedDateFilter === date
                    ? 'border-rose-400 bg-rose-50 ring-2 ring-rose-200'
                    : 'border-pink-100 hover:border-pink-300 bg-pink-50/20'
                }`}
              >
                <div className="h-24 w-full flex items-end justify-center mb-2">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-10 rounded-xl bg-linear-to-t from-rose-500 to-pink-400 shadow-sm flex items-center justify-center text-[11px] font-bold text-white transition-all duration-500"
                  >
                    {count}
                  </div>
                </div>

                <div className="text-[11px] font-bold text-slate-700 truncate">
                  {date}
                </div>
                <div className="text-[10px] text-slate-400">
                  {count} ครั้ง
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LOGIN AUDIT LOG TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-pink-100 mb-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-cute text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span>บันทึกประวัติการ Login ล่าสุด (Audit Log)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              แสดง {filteredLogs.length} รายการ จากทั้งหมด {analytics.totalLogins} รายการ
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล หรืออุปกรณ์..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-pink-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-pink-100 text-slate-400 text-xs uppercase font-semibold">
                <th className="py-3 px-4">วัน & เวลา</th>
                <th className="py-3 px-4">ผู้ใช้งาน</th>
                <th className="py-3 px-4">อีเมล</th>
                <th className="py-3 px-4">อุปกรณ์ / เบราว์เซอร์</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลประวัติการ Login ตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-rose-50/30 transition">
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div>{log.dateStr}</div>
                      <div className="text-[11px] text-slate-400">{log.timeStr} น.</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                      {log.userEmail}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs">
                        {log.device.includes('iPhone') || log.device.includes('Android') ? (
                          <Smartphone className="w-3.5 h-3.5 text-pink-500" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-blue-500" />
                        )}
                        <span>{log.device}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> สำเร็จ
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTERED USERS & COUPLES LIST */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-pink-100">
        <h2 className="font-cute text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-pink-500" />
          <span>รายชื่อสมาชิกและสถานะคู่รัก (Users Directory)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.usersList.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-2xl border border-pink-100 bg-rose-50/20 hover:border-pink-300 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border border-pink-200 object-cover"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 truncate text-sm">
                    {user.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate font-mono">
                    {user.email}
                  </p>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-pink-200 text-rose-600 font-bold mt-1 inline-block">
                    {user.coupleCode}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-pink-100 text-xs">
                {user.partnerName ? (
                  <div className="flex items-center gap-1 text-rose-600 font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>ผูกคู่กับ: {user.partnerName}</span>
                  </div>
                ) : (
                  <div className="text-slate-400">
                    ⚪ ยังไม่ได้ผูกคู่รัก
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
