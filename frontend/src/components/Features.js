// components/Features.js
import React from 'react';
import './Features.css';

const Features = () => {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Why Choose ResumeCraft?</h2>
        <div className="features-grid">
          <div className="feature-card card text-center p-4">
            <div className="feature-icon">
              <i className="fas fa-magic"></i>
            </div>
            <h3>Easy to Use</h3>
            <p>Our intuitive interface makes resume building simple, even for first-time users.</p>
          </div>
          
          <div className="feature-card card text-center p-4">
            <div className="feature-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <h3>PDF Export</h3>
            <p>Download your resume as a professional PDF document with one click.</p>
          </div>
          
          <div className="feature-card card text-center p-4">
            <div className="feature-icon">
              <i className="fas fa-history"></i>
            </div>
            <h3>Version History</h3>
            <p>Keep track of all your resume versions and revert to any previous version.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;