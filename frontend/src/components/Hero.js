// components/Hero.js
import React from 'react';
import './Hero.css';

const Hero = ({ onGetStartedClick }) => {
  return (
    <section className="hero-section">
      <div className="container text-center">
        <h1 className="display-4 fw-bold mb-4">Create Professional Resumes in Minutes</h1>
        <p className="lead mb-4">Build your perfect resume with our easy-to-use platform. Impress employers with a professionally designed resume.</p>
        <button className="btn btn-light btn-lg px-5 py-3 fw-bold" onClick={onGetStartedClick}>
          Get Started <i className="fas fa-arrow-right ms-2"></i>
        </button>
      </div>
    </section>
  );
};

export default Hero;