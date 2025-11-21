import { useState } from 'react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const items = ['Courses', 'About Us', 'Pricing', 'Contact'];
  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-white/70 border-b border-mint/40">
      <nav className="max-w-7xl mx-auto px-6 flex items-center h-16 justify-between">
        <a href="#home" className="flex items-center gap-3 group" aria-label="Sconce LMS Home">
          <img src="/sconceLogo-removebg-preview.svg" alt="Sconce LMS Logo" className="w-10 h-10 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
          <span className="font-display font-semibold text-lg text-slate-800 tracking-wide">SCONCE LMS</span>
        </a>
        <button className="md:hidden btn-accent !px-4 !py-2 text-sm" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          {open ? 'Close' : 'Menu'}
        </button>
        <ul className="md:flex hidden items-center gap-8 text-sm">
          {items.map(i => (
            <li key={i}><a className="nav-link" href={`#${i.toLowerCase().replace(/ /g, '-')}`}>{i}</a></li>
          ))}
          <li><a href="#register" className="btn-primary text-sm">Register</a></li>
        </ul>
      </nav>
      {open && (
        <div className="md:hidden px-6 pb-6 space-y-4 bg-white/90 backdrop-blur">
          {items.map(i => (
            <a key={i} className="block nav-link" href={`#${i.toLowerCase().replace(/ /g, '-')}`}>{i}</a>
          ))}
          <a href="#register" className="btn-primary w-full justify-center">Register</a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
