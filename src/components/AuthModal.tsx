import React, { useState } from 'react';
import { storage } from '../services/storage';
import { supabase } from '../services/supabase';
import { User } from '../types';
import { Heart, Lock, Mail, User as UserIcon, X, Sparkles, Shield, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'otp_verify'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (tab === 'login') {
        // First try Supabase login if user was registered on Supabase
        const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (!supaErr && supaData.user) {
          const coupleCode = supaData.user.user_metadata?.coupleCode || 'LOVE-' + Math.floor(1000 + Math.random() * 9000);
          const userName = supaData.user.user_metadata?.name || email.split('@')[0];
          
          const supaUser: User = {
            id: supaData.user.id,
            name: userName,
            email: supaData.user.email || email,
            avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName)}`,
            coupleCode,
            role: email.includes('admin') ? 'admin' : 'user',
            createdAt: supaData.user.created_at,
            lastLoginAt: new Date().toISOString()
          };

          // Save/sync locally and record login
          const users = storage.getUsers();
          const existingIdx = users.findIndex((u) => u.email.toLowerCase() === supaUser.email.toLowerCase());
          if (existingIdx >= 0) {
            users[existingIdx] = { ...users[existingIdx], ...supaUser };
          } else {
            users.push(supaUser);
          }
          storage.saveUsers(users);
          storage.setCurrentUser(supaUser);
          storage.recordLogin(supaUser);

          onLoginSuccess(supaUser);
          onClose();
          return;
        }

        // Fallback to local storage demo users (e.g. tonkla@sweet.love)
        const res = storage.login(email);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
        } else {
          setError(supaErr?.message || res.message || 'เข้าสู่ระบบไม่สำเร็จ ตรวจสอบอีเมลหรือรหัสผ่าน');
        }
      } else if (tab === 'register') {
        if (!name.trim()) {
          setError('กรุณาระบุชื่อของคุณ');
          setLoading(false);
          return;
        }

        const generatedCode = 'LOVE-' + Math.floor(1000 + Math.random() * 9000);

        // Attempt Supabase signUp with Email Verification
        const { data: supaData, error: supaErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              name: name.trim(),
              coupleCode: generatedCode
            }
          }
        });

        if (supaErr) {
          setError(supaErr.message);
          setLoading(false);
          return;
        }

        // If email confirmation is required
        if (supaData.user && !supaData.session) {
          setTab('otp_verify');
          setInfoMessage(`ระบบของ Supabase ได้ส่งอีเมลยืนยันตัวตนไปที่ ${email} เรียบร้อยแล้ว 💌\n(กรุณาเปิดอีเมลฉบับล่าสุดจาก "Supabase Auth" แล้วคลิกปุ่ม "Confirm email address" ได้เลยครับ)`);
          setLoading(false);
          return;
        }

        // If session was immediately created (e.g. email confirm disabled or auto-confirmed)
        const newUser: User = {
          id: supaData.user?.id || 'user-' + Date.now(),
          name: name.trim(),
          email: email.trim(),
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
          coupleCode: generatedCode,
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        const users = storage.getUsers();
        users.push(newUser);
        storage.saveUsers(users);
        storage.setCurrentUser(newUser);
        storage.recordLogin(newUser);

        onLoginSuccess(newUser);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { data, error: otpErr } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: 'signup'
      });

      if (otpErr) {
        setError(otpErr.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุ');
        setLoading(false);
        return;
      }

      if (data.user) {
        const coupleCode = data.user.user_metadata?.coupleCode || 'LOVE-' + Math.floor(1000 + Math.random() * 9000);
        const userName = data.user.user_metadata?.name || name || email.split('@')[0];

        const newUser: User = {
          id: data.user.id,
          name: userName,
          email: data.user.email || email,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userName)}`,
          coupleCode,
          role: 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };

        const users = storage.getUsers();
        users.push(newUser);
        storage.saveUsers(users);
        storage.setCurrentUser(newUser);
        storage.recordLogin(newUser);

        onLoginSuccess(newUser);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'ยืนยันรหัส OTP ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    const res = storage.login(demoEmail);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-rose-50 text-rose-500 rounded-2xl mb-2">
            <Heart className="w-7 h-7 fill-rose-500 animate-pulse" />
          </div>
          <h2 className="font-cute text-2xl font-bold text-slate-800">
            {tab === 'login' ? 'ยินดีต้อนรับกลับมา 💕' : tab === 'register' ? 'สร้างบัญชีคู่รักใหม่ 🌸' : 'ยืนยันรหัส OTP ในอีเมล 💌'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'otp_verify' ? 'กรอกรหัสยืนยัน 6 หลักที่ได้รับในอีเมลของคุณ' : 'เชื่อมต่อฐานข้อมูลจริงผ่าน Supabase'}
          </p>
        </div>

        {/* Tab Toggle (only shown when not in OTP mode) */}
        {tab !== 'otp_verify' && (
          <div className="flex bg-rose-50/70 p-1 rounded-2xl mb-6 border border-pink-100">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); setInfoMessage(''); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                tab === 'login'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); setInfoMessage(''); }}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                tab === 'register'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              สมัครสมาชิกใหม่
            </button>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center leading-relaxed">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-center">
            {error}
          </div>
        )}

        {/* OTP / EMAIL CONFIRMATION VIEW */}
        {tab === 'otp_verify' ? (
          <div className="space-y-4">
            <div className="bg-rose-50/70 p-4 rounded-2xl border border-pink-200 text-center">
              <span className="text-3xl block mb-2">📬</span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Supabase ได้ส่งอีเมลยืนยันไปที่ <b>{email}</b> แล้ว
              </p>
              <p className="text-[11px] text-rose-600 mt-1">
                👉 เพียงเปิดอีเมลจาก <b>Supabase Auth</b> แล้วคลิกปุ่ม <b>"Confirm email address"</b>
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError('');
                setInfoMessage('กรุณากรอกรหัสผ่านเพื่อเข้าสู่ระบบ');
              }}
              className="w-full py-3.5 rounded-2xl bg-linear-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-cute font-bold shadow-md shadow-pink-200 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ฉันกดยืนยันในอีเมลแล้ว → เข้าสู่ระบบเลย 💕</span>
            </button>

            {/* Optional 6-digit OTP manual input */}
            <div className="pt-2 border-t border-slate-100">
              <details className="text-xs text-slate-500">
                <summary className="cursor-pointer hover:text-slate-700 font-semibold mb-2">
                  หรือต้องการกรอกรหัส OTP 6 หลักด้วยตนเอง?
                </summary>
                <form onSubmit={handleVerifyOtp} className="space-y-2 mt-2">
                  <input
                    type="text"
                    placeholder="เช่น 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.trim())}
                    className="w-full px-4 py-2 rounded-xl border border-pink-200 text-center font-mono text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!otpCode.trim()}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition"
                  >
                    ยืนยันด้วยรหัส 6 หลัก
                  </button>
                </form>
              </details>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <button
                type="button"
                onClick={async () => {
                  setError('');
                  setInfoMessage('กำลังส่งอีเมลยืนยันซ้ำ...');
                  await supabase.auth.resend({ type: 'signup', email: email.trim() });
                  setInfoMessage('ส่งอีเมลยืนยันใหม่อีกครั้งเรียบร้อยแล้วครับ 💌');
                }}
                className="hover:text-rose-500 hover:underline"
              >
                ขอส่งอีเมลใหม่อีกครั้ง
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className="hover:text-slate-600 hover:underline"
              >
                ← เปลี่ยนอีเมล
              </button>
            </div>
          </div>
        ) : (
          /* LOGIN & REGISTER VIEW */
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อของคุณ (หรือชื่อเล่นน่ารักๆ):
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น หนึ่ง 🐻 หรือ นาย 🐰"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมล:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="your-email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสผ่าน:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-linear-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 disabled:opacity-50 text-white font-cute font-bold shadow-md shadow-pink-200 transition"
            >
              {loading
                ? 'กำลังเชื่อมต่อระบบ...'
                : tab === 'login'
                ? 'เข้าสู่ระบบ 💖'
                : 'สมัครสมาชิกและส่งรหัสยืนยัน 🌸'}
            </button>
          </form>
        )}

        {/* Quick Demo Logins */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            ⚡ หรือคลิกเดียวเพื่อทดสอบระบบจำลอง:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('tonkla@sweet.love')}
              className="p-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-xs font-medium text-pink-800 text-left transition"
            >
              <span className="block font-bold">ต้นกล้า 🐻</span>
              <span className="text-[10px] text-pink-500">tonkla@sweet.love</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('namwaan@sweet.love')}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-medium text-rose-800 text-left transition"
            >
              <span className="block font-bold">น้ำหวาน 🐰</span>
              <span className="text-[10px] text-rose-500">namwaan@sweet.love</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@sweet.love')}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-medium text-purple-800 text-left transition col-span-2 flex items-center justify-between"
            >
              <div>
                <span className="block font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-600" /> แอดมิน โรส 🌹 (เข้าดูหลังบ้าน)
                </span>
                <span className="text-[10px] text-purple-500">admin@sweet.love</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-200 text-purple-800 font-semibold">
                Admin
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
