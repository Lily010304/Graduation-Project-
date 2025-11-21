import { useState } from 'react';
import '../index.css';
import { COUNTRIES } from '@/constants/countries';

const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

// Countries moved to shared constant

export default function InstructorRegister() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    heard: '',
    cv: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return onChange('cv', null);
    const allowed = ['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) return alert('Please upload a PDF or Word document (.pdf, .doc, .docx).');
    if (file.size > 5 * 1024 * 1024) return alert('File must be 5MB or less.');
    onChange('cv', file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.country || !form.heard || !form.cv) {
      return alert('Please fill in all required fields and upload your CV.');
    }
    setSubmitting(true);
    // Placeholder: simulate submit
    setTimeout(() => {
      setSubmitting(false);
      alert('Application submitted successfully!');
      window.location.hash = '#/';
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white" style={{ backgroundImage: unifiedBackground, backgroundColor: '#034242' }}>
      {/* Utility top bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-end px-6 text-[11px] tracking-wide bg-black/30 backdrop-blur z-50 gap-4 text-white/80">
        <select className="bg-transparent focus:outline-none"><option>USD</option></select>
        <select className="bg-transparent focus:outline-none"><option>English</option></select>
        <div className="hidden md:flex gap-3">
          <a href="mailto:info@sconcelms.com" className="hover:text-white">info@sconce.com</a>
          <span className="text-white/40">|</span>
          <a href="tel:+972597111111" className="hover:text-white">+972 597 111 111</a>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="absolute top-8 left-0 right-0 z-40 flex items-center justify-between px-10 h-16 bg-white/5 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-4">
          <img src="/sconceLogo-removebg-preview.svg" alt="logo" className="w-12 h-12 drop-shadow" />
          <span className="font-display font-semibold tracking-[0.4rem] text-sm md:text-base">S C O N C E</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs">
          <button className="px-5 py-2 rounded-full bg-[#58ACA9] text-dark font-semibold tracking-wide transition-all duration-300 hover:bg-[#034242] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#034242]/60 active:scale-95" onClick={() => (window.location.hash = '#/')}>Home</button>
        </div>
      </div>

      {/* Form card */}
      <div className="pt-32 pb-16 px-6 flex items-start justify-center">
        <div className="w-full max-w-3xl bg-white text-[#0f5a56] rounded-3xl shadow-xl p-6 md:p-8 border border-white/20">
          <h1 className="text-2xl font-bold mb-2">Apply as Instructor</h1>
          <p className="text-sm text-[#0f5a56]/80 mb-6">Please provide your contact details and upload your CV.</p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">First Name</label>
              <input required value={form.firstName} onChange={(e)=>onChange('firstName', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Last Name</label>
              <input required value={form.lastName} onChange={(e)=>onChange('lastName', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e)=>onChange('email', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Country</label>
              <select required value={form.country} onChange={(e)=>onChange('country', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2">
                <option value="" disabled>Select a country</option>
                {COUNTRIES.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Upload CV (PDF or Word, max 5MB)</label>
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#58ACA9] file:px-4 file:py-2 file:text-white hover:file:brightness-95" />
              {form.cv && <div className="text-xs text-[#0f5a56]/70 mt-1">Selected: {form.cv.name}</div>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">How did you hear about us?</label>
              <select required value={form.heard} onChange={(e)=>onChange('heard', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2">
                <option value="" disabled>Select an option</option>
                <option>Search</option>
                <option>Friend</option>
                <option>Social Media</option>
                <option>Advertisement</option>
                <option>Other</option>
              </select>
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#58ACA9] text-white font-semibold hover:brightness-95 transition disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
            <div className="md:col-span-2 text-center text-xs text-[#0f5a56]/70">
              Already have an account?
              <button type="button" onClick={()=> (window.location.hash = '#/login?role=instructor')} className="ml-2 underline hover:no-underline text-[#0f5a56]">Log in</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
