import React, { useState } from 'react';
import { Truck, CreditCard, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { SiteSettings } from '../../types';

interface AdminDeliveryPaymentSettingsProps {
  settings: SiteSettings;
  onSaveSettings: (updated: Partial<SiteSettings>) => Promise<void>;
}

export const AdminDeliveryPaymentSettings: React.FC<AdminDeliveryPaymentSettingsProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [insideDhaka, setInsideDhaka] = useState(settings.insideDhakaDeliveryCharge?.toString() || '60');
  const [outsideDhaka, setOutsideDhaka] = useState(settings.outsideDhakaDeliveryCharge?.toString() || '135');
  const [codEnabled, setCodEnabled] = useState(settings.codEnabled !== false);
  const [bkashEnabled, setBkashEnabled] = useState(settings.bkashEnabled || false);
  const [bkashNumber, setBkashNumber] = useState(settings.bkashNumber || '');
  const [nagadEnabled, setNagadEnabled] = useState(settings.nagadEnabled || false);
  const [nagadNumber, setNagadNumber] = useState(settings.nagadNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');

    try {
      await onSaveSettings({
        insideDhakaDeliveryCharge: Number(insideDhaka) || 60,
        outsideDhakaDeliveryCharge: Number(outsideDhaka) || 135,
        codEnabled,
        bkashEnabled,
        bkashNumber: bkashNumber.trim(),
        nagadEnabled,
        nagadNumber: nagadNumber.trim(),
      });
      setSuccessMsg('ডেলিভারি ও পেমেন্ট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-1">ডেলিভারি চার্জ ও পেমেন্ট মেথড সেটিংস</h3>
        <p className="text-xs text-slate-400 mb-6">
          গ্রাহকের জন্য ডেলিভারি ফি এবং সক্রিয় পেমেন্ট অপশন নির্ধারণ করুন
        </p>

        {successMsg && (
          <div className="p-3.5 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Charges */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-600" />
              <span>ডেলিভারি চার্জ কনফিগারেশন</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ঢাকার ভিতরে ডেলিভারি চার্জ (৳)
                </label>
                <input
                  type="number"
                  value={insideDhaka}
                  onChange={(e) => setInsideDhaka(e.target.value)}
                  placeholder="60"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ঢাকার বাইরে ডেলিভারি চার্জ (৳)
                </label>
                <input
                  type="number"
                  value={outsideDhaka}
                  onChange={(e) => setOutsideDhaka(e.target.value)}
                  placeholder="135"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Payment Methods */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-600" />
              <span>পেমেন্ট মেথড কনফিগারেশন</span>
            </h4>

            {/* Cash on Delivery */}
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">ক্যাশ অন ডেলিভারি (COD)</p>
                <p className="text-[11px] text-slate-500">গ্রাহক পণ্য হাতে পেয়ে টাকা পরিশোধ করবেন</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* bKash */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">বিকাশ পেমেন্ট</p>
                  <p className="text-[11px] text-slate-500">বিকাশের মাধ্যমে অগ্রিম বা অর্ডার পেমেন্ট</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bkashEnabled}
                    onChange={(e) => setBkashEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
              {bkashEnabled && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    বিকাশ মার্চেন্ট/পার্সোনাল নম্বর
                  </label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Nagad */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">নগদ পেমেন্ট</p>
                  <p className="text-[11px] text-slate-500">নগদের মাধ্যমে পেমেন্ট গ্রহণ</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nagadEnabled}
                    onChange={(e) => setNagadEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              {nagadEnabled && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    নগদ একাউন্ট নম্বর
                  </label>
                  <input
                    type="text"
                    value={nagadNumber}
                    onChange={(e) => setNagadNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>সেটিংস সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
