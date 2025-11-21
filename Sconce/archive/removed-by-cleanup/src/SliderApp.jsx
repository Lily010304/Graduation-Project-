import React, { useEffect, useState } from 'react';
import './slider.css';

// A standalone slider-based landing page variant (user-provided design)
// Does not replace the existing Tailwind-powered App; import this in main.jsx if you want to preview it.

const SLIDES = ['hero','testimonial','courses','instructor','contact'];

export default function SliderApp() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider-app-root">
      <header className="slider-navbar">
        <div className="slider-logo flex items-center gap-2">
          <img src="/sconceLogo-removebg-preview.svg" alt="Sconce LMS Logo" className="h-8 w-8 object-contain" />
          <span>S C O N C E LMS</span>
        </div>
        <nav>
          <ul>
            <li><a href="#">Courses</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#" className="btn">Sign Up</a></li>
            <li><a href="#">Log In</a></li>
          </ul>
        </nav>
      </header>

      <main className="slider-container">
        <section className={`slide hero ${currentIndex === 0 ? 'active' : ''}`}>
          <div className="content">
            <h1>Master Arabic, connect with your roots</h1>
            <p>Interactive lessons designed for non-Arabic speaking countries.</p>
            <a href="#" className="btn">Register Now</a>
          </div>
        </section>

        <section className={`slide testimonial ${currentIndex === 1 ? 'active' : ''}`}>
          <div className="content">
            <blockquote>
              "I’ve tried other courses, but nothing compares to Sconce. The support, lessons, and community kept me motivated."
            </blockquote>
            <p>- Mohammad Ali, Graduate</p>
          </div>
        </section>

        <section className={`slide courses ${currentIndex === 2 ? 'active' : ''}`}>
          <div className="content">
            <h2>Our Courses</h2>
            <div className="levels">
              <div className="level">Level A – Beginner</div>
              <div className="level">Level B – Intermediate</div>
              <div className="level">Level C – Advanced</div>
            </div>
          </div>
        </section>

        <section className={`slide instructor ${currentIndex === 3 ? 'active' : ''}`}>
          <div className="content">
            <h2>Teach with Sconce</h2>
            <p>Share your passion for Arabic and empower students worldwide.</p>
            <a href="#" className="btn">Apply as Instructor</a>
          </div>
        </section>

        <section className={`slide contact ${currentIndex === 4 ? 'active' : ''}`}>
          <div className="content">
            <h2>Request Information</h2>
            <form onSubmit={e=> e.preventDefault()}>
              <input type="text" placeholder="First Name" required />
              <input type="text" placeholder="Last Name" required />
              <input type="email" placeholder="Email" required />
              <button type="submit" className="btn">Get Info</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
