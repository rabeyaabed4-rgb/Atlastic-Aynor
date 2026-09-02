import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Store, Sparkles, Phone, Mail, Facebook, Loader2 } from 'lucide-react';
import { SiteSettings } from '../../types';

interface AdminSiteSettingsProps {
  settings: SiteSettings;
  onSaveSettings: (updated: Partial<SiteSettings>) => Promise<void>;
}

export const AdminSiteSettings: React.FC<AdminSiteSettingsProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [shopName, setShopName] = useState(settings.shopName || 'পছন্দের শপ');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [phone, setPhone] = useState(settings.phone || '01700000000');
  const [email, setEmail] = useState(settings.email || 'support@pochendershop.com');
  const [facebookPageUrl, setFacebookPageUrl] = useState(settings.facebookPageUrl || '');
  const [noticeText, setNoticeText] = useState(settings.noticeText || '');
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || 'আসসালামু আলাইকুম');
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');

    try {
      await onSaveSettings({
        shopName: shopName.trim(),
        tagline: tagline.trim(),
        logoUrl: logoUrl.trim(),
        phone: phone.trim(),
        email: email.trim(),
        facebookPageUrl: facebookPageUrl.trim(),
        noticeText: noticeText.trim(),
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle.trim(),
      });
      setSuccessMsg('সাইটের তথ্য সফলভাবে আপডেট করা হয়েছে!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-1">সাইট ও ল্যান্ডিং পেজ সেটিংস</h3>
        <p className="text-xs text-slate-400 mb-6">
          দোকানের নাম, যোগাযোগের তথ্য, নোটিশ বার এবং হিরো টেক্সট কাস্টমাইজ করুন
        </p>

        {successMsg && (
          <div className="p-3.5 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Shop Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                দোকানের নাম (Shop Name) <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="যেমন: পছন্দের শপ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                লোগো ইমেজ URL (ঐচ্ছিক)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              শপের ট্যাগলাইন / স্লোগান
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="আপনার পছন্দের প্রিমিয়াম পণ্য কিনুন ঘরে বসে সহজেই অর্ডার করুন"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <hr className="border-slate-100" />

          {/* Top Notice Bar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              টপ নোটিশ বার টেক্সট (Notice Bar)
            </label>
            <input
              type="text"
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা! কোনো অগ্রিম পেমেন্ট নেই।"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Hero Greeting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                হিরো ব্যাজ টেক্সট
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="যেমন: আসসালামু আলাইকুম"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ফেসবুক পেজ লিংক (Facebook Page URL)
              </label>
              <input
                type="url"
                value={facebookPageUrl}
                onChange={(e) => setFacebookPageUrl(e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                যোগাযোগের মোবাইল নম্বর
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                সাপোর্ট ইমেইল
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="support@pochendershop.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>সেটিংস সেভ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
