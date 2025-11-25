import { useState } from 'react';
import '../index.css';
import { COUNTRIES } from '@/constants/countries';

const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

export default function StudentRegister() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    heard: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const onChange = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    // Clear error for this field when user starts typing
    if (errors[k]) {
      setErrors((e) => ({ ...e, [k]: '' }));
    }
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('one digit');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('one special character');
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = form;
    
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrors({ general: 'Please complete all required fields.' });
      return;
    }

    // Validate password requirements
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors({ 
        password: `Password must contain ${passwordErrors.join(', ')}.` 
      });
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('https://sconce.runasp.net/api/Student/Account/RegisterStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain',
        },
        body: JSON.stringify({
          email: email,
          fullName: `${firstName} ${lastName}`,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Registration failed. Please try again.';
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors) {
            errorMessage = Object.values(errorData.errors).flat().join(' ');
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        setErrors({ general: errorMessage });
        return;
      }

      // Success - Email verification required
      setRegistrationSuccess(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setSubmitting(false);
    }
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
          {registrationSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-green-700">Check Your Email!</h1>
              <p className="text-lg text-[#0f5a56] mb-2">Registration successful! 🎉</p>
              <p className="text-sm text-[#0f5a56]/80 mb-6 max-w-md mx-auto">
                We've sent a verification link to <strong>{form.email}</strong>. 
                Please check your inbox and click the link to verify your account before logging in.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>📧 Didn't receive the email?</strong>
                </p>
                <ul className="text-xs text-blue-700 space-y-1 ml-4">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• Wait a few minutes and refresh your inbox</li>
                </ul>
              </div>
              <button 
                onClick={() => (window.location.hash = '#/login?role=student')}
                className="px-8 py-3 rounded-full bg-[#58ACA9] text-white font-semibold hover:brightness-95 transition"
              >
                Go to Login Page
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Sign up as Student</h1>
              <p className="text-sm text-[#0f5a56]/80 mb-6">Tell us a bit about you to get started. You'll learn about the proficiency exam in your dashboard after sign-up.</p>
              
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.general}
                </div>
              )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">First Name *</label>
              <input required value={form.firstName} onChange={(e)=>onChange('firstName', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Last Name *</label>
              <input required value={form.lastName} onChange={(e)=>onChange('lastName', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={(e)=>onChange('email', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Country</label>
              <select value={form.country} onChange={(e)=>onChange('country', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2">
                <option value="" disabled>Select a country</option>
                {COUNTRIES.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Password *</label>
              <div className="flex flex-col gap-1">
                <input 
                  type="password" 
                  required 
                  value={form.password} 
                  onChange={(e)=>onChange('password', e.target.value)} 
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" 
                />
                {errors.password && (
                  <span className="text-xs text-red-600">{errors.password}</span>
                )}
                <span className="text-xs text-gray-500">Min 8 chars, uppercase, lowercase, digit, special character</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirm Password *</label>
              <div className="flex flex-col gap-1">
                <input 
                  type="password" 
                  required 
                  value={form.confirmPassword} 
                  onChange={(e)=>onChange('confirmPassword', e.target.value)} 
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2" 
                />
                {errors.confirmPassword && (
                  <span className="text-xs text-red-600">{errors.confirmPassword}</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">How did you hear about us?</label>
              <select value={form.heard} onChange={(e)=>onChange('heard', e.target.value)} className="w-full bg-transparent border-b border-gray-300 focus:border-[#0f5a56] outline-none py-2">
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
                {submitting ? 'Submitting…' : 'Create Account'}
              </button>
            </div>
            <div className="md:col-span-2 text-center text-xs text-[#0f5a56]/70">
              Already have an account?
              <button type="button" onClick={()=> (window.location.hash = '#/login?role=student')} className="ml-2 underline hover:no-underline text-[#0f5a56]">Log in</button>
            </div>
          </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
