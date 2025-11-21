const Footer = () => (
  <footer id="contact" className="bg-gradient-to-br from-white to-desert/50 pt-20 pb-10 relative overflow-hidden">
    <div className="absolute -top-20 right-10 w-52 h-52 bg-turquoise/20 rounded-full blur-3xl" />
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-5 gap-12">
      <div className="md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <img src="/sconceLogo-removebg-preview.svg" alt="Sconce LMS Logo" className="w-12 h-12 object-contain drop-shadow-sm" />
          <span className="font-display font-semibold text-xl tracking-wide">SCONCE</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed max-w-sm">A joyful Arabic learning platform helping children abroad build lasting language roots through play, structure and community.</p>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Platform</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li><a href="#levels" className="hover:text-coral">Levels</a></li>
          <li><a href="#testimonials" className="hover:text-coral">Testimonials</a></li>
          <li><a href="#register" className="hover:text-coral">Register</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Resources</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li><a href="#" className="hover:text-coral">Placement Guide</a></li>
          <li><a href="#" className="hover:text-coral">For Parents</a></li>
          <li><a href="#" className="hover:text-coral">For Instructors</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3">Contact</h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li><a href="mailto:info@sconcelms.com" className="hover:text-coral">info@sconcelms.com</a></li>
          <li><a href="tel:+1234567890" className="hover:text-coral">+1 (234) 567‑890</a></li>
        </ul>
      </div>
    </div>
    <div className="mt-16 text-center text-xs text-slate-500">© {new Date().getFullYear()} SCONCE. All rights reserved.</div>
  </footer>
);

export default Footer;
