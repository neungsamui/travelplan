import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { supabase } from '../services/supabase';
import { 
  X, Camera, Heart, Check, Copy, Mail, Shield, 
  Sparkles, Calendar, Save, RefreshCw, Upload 
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onOpenPairing: () => void;
}

// Cute preset avatars that couples love
const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bear&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bunny&backgroundColor=ffdfba',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Kitty&backgroundColor=d4f0f0',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Fox&backgroundColor=cce2cb',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Panda&backgroundColor=f3c5ff',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Love&backgroundColor=b9f2ff',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onOpenPairing
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setAvatar(currentUser.avatar);
    setSavedSuccess(false);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.coupleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      const finalAvatar = customAvatarUrl.trim() || avatar;
      
      const updatedUser: User = {
        ...currentUser,
        name: name.trim(),
        avatar: finalAvatar
      };

      // 1. Update in local storage
      const users = storage.getUsers();
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx >= 0) {
        users[idx] = updatedUser;
        storage.saveUsers(users);
      }
      storage.setCurrentUser(updatedUser);

      // 2. Sync to Supabase user metadata if logged in with Supabase
      try {
        await supabase.auth.updateUser({
          data: {
            name: name.trim(),
            avatar_url: finalAvatar
          }
        });
      } catch (err) {
        console.warn('Supabase metadata update skipped:', err);
      }

      onUpdateUser(updatedUser);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-pink-50 text-pink-500 rounded-2xl mb-2 shadow-xs">
            <Heart className="w-7 h-7 fill-pink-500 animate-pulse" />
          </div>
          <h2 className="font-cute text-2xl font-bold text-slate-800">
            โปรไฟล์ของฉัน 💕
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการข้อมูลส่วนตัว และรูปโปรไฟล์น่ารักๆ
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-700 text-center flex items-center justify-center gap-1.5 font-medium animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>บันทึกการแก้ไขโปรไฟล์สำเร็จแล้วจ้า! 🌸</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* AVATAR SECTION */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-200 shadow-md bg-pink-50 flex items-center justify-center">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload Overlay Button */}
              <label 
                htmlFor="avatar-upload-input"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md cursor-pointer transition active:scale-95"
                title="อัปโหลดรูปภาพจากเครื่อง"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <span className="text-[11px] text-slate-400 mt-2">
              คลิกไอคอนกล้องเพื่ออัปโหลดรูปจากเครื่อง หรือเลือกรูปน่ารักๆ ด้านล่าง
            </span>

            {/* PRESET AVATARS PICKER */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto p-1.5 bg-rose-50/50 rounded-2xl border border-pink-100 max-w-full">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAvatar(av);
                    setCustomAvatarUrl('');
                  }}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition shrink-0 ${
                    avatar === av
                      ? 'border-rose-500 ring-2 ring-rose-200 scale-105'
                      : 'border-white opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* DISPLAY NAME & EMAIL FIELDS */}
          <div className="space-y-4">
            
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อที่แสดง / ชื่อเล่นคู่รัก: *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น พี่หนึ่ง 🐻 หรือ น้องนาย 🐰"
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm font-semibold"
              />
            </div>

            {/* Email (Read Only - Shows verified login email) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>อีเมลที่ใช้เข้าสู่ระบบ (Login Email):</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" /> ยืนยันแล้ว
                </span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={currentUser.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm font-mono cursor-not-allowed select-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                อีเมลนี้ผูกกับบัญชี Supabase ของคุณ ใช้สำหรับการเข้าสู่ระบบ
              </p>
            </div>

            {/* Custom Image URL (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หรือใส่ลิงก์รูปภาพโปรไฟล์ (Image URL):
              </label>
              <input
                type="url"
                value={customAvatarUrl}
                onChange={(e) => {
                  setCustomAvatarUrl(e.target.value);
                  if (e.target.value.trim()) setAvatar(e.target.value.trim());
                }}
                placeholder="https://example.com/my-photo.jpg"
                className="w-full px-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-xs text-slate-600"
              />
            </div>

            {/* COUPLE STATUS & CODE CARD */}
            <div className="bg-linear-to-r from-rose-50 to-pink-50 p-4 rounded-2xl border border-pink-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  รหัสโค้ดคู่รักของคุณ:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-rose-600 bg-white px-2.5 py-0.5 rounded-lg border border-pink-200 shadow-2xs">
                    {currentUser.coupleCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="คัดลอกโค้ด"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-pink-100 text-xs">
                <span className="text-slate-500">สถานะความรัก:</span>
                {currentUser.partnerName ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPairing();
                    }}
                    className="font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <span>💖 ผูกกับ {currentUser.partnerName}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPairing();
                    }}
                    className="text-pink-600 font-semibold hover:underline"
                  >
                    + คลิกเพื่อผูกโค้ดกับแฟน
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
            >
              ปิดหน้าต่าง
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white font-cute text-sm sm:text-base font-bold shadow-md shadow-pink-200 transition flex items-center justify-center gap-1.5"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์ 💖'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
