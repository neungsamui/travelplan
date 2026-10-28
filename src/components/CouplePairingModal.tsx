import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../services/storage';
import { Heart, Copy, Check, Users, Sparkles, X, Unlink, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CouplePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onSwitchUser: (email: string) => void;
}

export const CouplePairingModal: React.FC<CouplePairingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onSwitchUser
}) => {
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.coupleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerCodeInput.trim()) return;

    const res = storage.pairCouple(currentUser.id, partnerCodeInput);
    if (res.success && res.partner) {
      setStatusMessage({ text: res.message, type: 'success' });
      // Fire cute confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#f472b6', '#fda4af']
      });
      // Refresh current user
      const updated = storage.getCurrentUser();
      if (updated) onUpdateUser(updated);
      setPartnerCodeInput('');
    } else {
      setStatusMessage({ text: res.message, type: 'error' });
    }
  };

  const handleUnpair = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการผูกคู่รักกับ ' + currentUser.partnerName + ' ?')) {
      storage.unpairCouple(currentUser.id);
      const updated = storage.getCurrentUser();
      if (updated) onUpdateUser(updated);
      setStatusMessage({ text: 'ยกเลิกการผูกคู่รักเรียบร้อยแล้ว', type: 'success' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-pink-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Floating Heart background decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-100 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-rose-100 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-rose-50 text-rose-500 rounded-2xl mb-3 shadow-inner">
            <Heart className="w-8 h-8 fill-rose-500 animate-bounce" />
          </div>
          <h2 className="font-cute text-2xl font-bold text-slate-800">
            ระบบผูกหัวใจคู่รัก 💕
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            นำโค้ดไปให้แฟน หรือป้อนโค้ดของแฟนเพื่อร่วมสร้างทริปในฝันด้วยกัน
          </p>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl text-xs sm:text-sm font-medium mb-4 text-center transition ${
              statusMessage.type === 'success'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* CURRENT PAIR STATUS */}
        {currentUser.partnerId ? (
          <div className="bg-linear-to-b from-rose-50 to-pink-50/50 rounded-2xl p-5 border border-pink-200 text-center mb-6">
            <div className="text-xs uppercase tracking-wider font-semibold text-rose-500 mb-3">
              💖 สถานะ: ผูกคู่รักสำเร็จแล้ว!
            </div>
            
            {/* Couple avatars connected with heart */}
            <div className="flex items-center justify-center gap-4 my-2">
              <div className="text-center">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-full border-2 border-pink-400 shadow-md mx-auto object-cover"
                />
                <span className="text-xs font-semibold text-slate-700 block mt-1">
                  {currentUser.name}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-rose-500 animate-pulse text-xl">💞</span>
                <span className="text-[10px] text-rose-400 font-medium">คู่รักของกันและกัน</span>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 rounded-full border-2 border-rose-400 shadow-md mx-auto bg-rose-200 flex items-center justify-center text-xl overflow-hidden">
                  👩‍❤️‍👨
                </div>
                <span className="text-xs font-semibold text-slate-700 block mt-1">
                  {currentUser.partnerName}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              ทริปที่คุณและ <b>{currentUser.partnerName}</b> สร้าง จะซิงค์หากันอัตโนมัติแล้วนะ! ✈️
            </p>

            <button
              onClick={handleUnpair}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 hover:underline transition"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>ต้องการยกเลิกการผูกคู่รัก</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Your Own Shareable Code Box */}
            <div className="bg-rose-50/70 border border-pink-200 rounded-2xl p-4 text-center">
              <div className="text-xs text-rose-600 font-medium mb-1">
                💌 รหัสโค้ดคู่รักของคุณ (ส่งให้แฟนป้อน):
              </div>
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="font-mono text-2xl font-extrabold tracking-wider text-rose-600 bg-white px-4 py-2 rounded-xl border border-pink-200 shadow-xs">
                  {currentUser.coupleCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-medium shadow-xs transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                </button>
              </div>
            </div>

            {/* Input Partner's Code */}
            <form onSubmit={handlePair} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  หรือป้อนโค้ดของแฟนคุณที่นี่:
                </label>
                <input
                  type="text"
                  placeholder="เช่น LOVE-1314"
                  value={partnerCodeInput}
                  onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-center font-mono tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:tracking-normal font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={!partnerCodeInput.trim()}
                className="w-full py-3.5 rounded-2xl bg-linear-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 text-white font-cute text-base font-bold shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>เชื่อมหัวใจ ผูกคู่รักเลย 💖</span>
              </button>
            </form>
          </div>
        )}

        {/* DEMO QUICK SWITCHER FOR TESTING */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            💡 ทดสอบสลับบัญชีเพื่อลองผูกโค้ดไป-มา:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSwitchUser('tonkla@sweet.love')}
              className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                currentUser.email === 'tonkla@sweet.love'
                  ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ต้นกล้า 🐻
              <span className="block text-[10px] text-slate-400 font-mono">LOVE-5201</span>
            </button>
            <button
              onClick={() => onSwitchUser('namwaan@sweet.love')}
              className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                currentUser.email === 'namwaan@sweet.love'
                  ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              น้ำหวาน 🐰
              <span className="block text-[10px] text-slate-400 font-mono">LOVE-1314</span>
            </button>
            <button
              onClick={() => onSwitchUser('mild@sweet.love')}
              className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                currentUser.email === 'mild@sweet.love'
                  ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              น้องมายด์ 🐱
              <span className="block text-[10px] text-slate-400 font-mono">LOVE-7788</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
