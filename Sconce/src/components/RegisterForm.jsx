import { useState } from 'react';

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', childAge: '' });
  const next = () => setStep(s => Math.min(s + 1, 3));
  const prev = () => setStep(s => Math.max(s - 1, 1));
  const submit = e => { e.preventDefault(); alert('Submitted! (placeholder)'); };

  return (
    <section id="register" className="py-24 bg-gradient-to-br from-desert/40 via-white to-mint/30 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 fade-in">
          <h2 className="text-3xl font-display font-bold mb-3">Join The Journey</h2>
          <p className="text-slate-600">Select your role and start building Arabic mastery today.</p>
        </div>
        <form onSubmit={submit} className="bg-white/80 backdrop-blur rounded-3xl shadow-soft p-8 md:p-12 space-y-8">
          <ProgressBar step={step} />
          {step === 1 && <RoleSelect role={role} setRole={setRole} />}
          {step === 2 && <InfoInputs form={form} setForm={setForm} role={role} />}
          {step === 3 && <Confirm form={form} role={role} />}
          <div className="flex justify-between pt-4">
            <button type="button" disabled={step === 1} onClick={prev} className="btn-accent disabled:opacity-40 disabled:cursor-not-allowed !px-5 !py-2 text-sm">Back</button>
            {step < 3 && <button type="button" onClick={() => { if (step === 1 && !role) return; if (step === 2 && (!form.name || !form.email)) return; next(); }} className="btn-primary !px-6 !py-2 text-sm">Next</button>}
            {step === 3 && <button type="submit" className="btn-primary !px-6 !py-2 text-sm">Submit</button>}
          </div>
        </form>
      </div>
    </section>
  );
};

const RoleSelect = ({ role, setRole }) => {
  const roles = [
    { id: 'parent', label: 'Parent', icon: '👩', desc: 'Track progress & support learning' },
    { id: 'student', label: 'Student', icon: '👨‍🎓', desc: 'Learn Arabic through playful stages' },
    { id: 'instructor', label: 'Instructor', icon: '👩‍🏫', desc: 'Teach and inspire globally' }
  ];
  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {roles.map(r => (
        <button key={r.id} type="button" onClick={() => setRole(r.id)} className={`relative group rounded-3xl border p-6 text-left transition-all shadow-soft hover:shadow-lift ${role === r.id ? 'border-coral bg-white' : 'border-mint/40 bg-white/60'}`}>
          <div className="text-4xl mb-3">{r.icon}</div>
          <div className="font-semibold mb-1">{r.label}</div>
          <div className="text-xs text-slate-600 leading-relaxed">{r.desc}</div>
          {role === r.id && <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-coral" />}
        </button>
      ))}
    </div>
  );
};

const InfoInputs = ({ form, setForm, role }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <label className="text-sm font-medium">Full Name</label>
      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl border border-mint/50 bg-white/70 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-turquoise" required />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Email</label>
      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-xl border border-mint/50 bg-white/70 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-turquoise" required />
    </div>
    {role === 'parent' && <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-medium">Child Age</label>
      <input value={form.childAge} onChange={e => setForm(f => ({ ...f, childAge: e.target.value }))} className="rounded-xl border border-mint/50 bg-white/70 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-turquoise" />
    </div>}
    {role === 'student' && <div className="md:col-span-2 text-sm text-slate-600">You will begin with a placement exam after signup.</div>}
    {role === 'instructor' && <div className="md:col-span-2 text-sm text-slate-600">We will email onboarding & curriculum guidelines.</div>}
  </div>
);

const Confirm = ({ form, role }) => (
  <div className="space-y-4 text-slate-700">
    <div className="text-sm">Role: <span className="font-semibold capitalize">{role}</span></div>
    <div className="text-sm">Name: <span className="font-semibold">{form.name}</span></div>
    <div className="text-sm">Email: <span className="font-semibold">{form.email}</span></div>
    {form.childAge && <div className="text-sm">Child Age: <span className="font-semibold">{form.childAge}</span></div>}
    <div className="text-xs text-slate-500">Submitting creates a placeholder (no backend wired yet).</div>
  </div>
);

const ProgressBar = ({ step }) => (
  <div className="flex items-center justify-center gap-4 mb-4">
    {[1, 2, 3].map(n => (
      <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${n <= step ? 'bg-coral text-white border-coral' : 'bg-white border-mint/50 text-slate-500'}`}>{n}</div>
    ))}
  </div>
);

export default RegisterForm;
