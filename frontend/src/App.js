import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import ResumeBuilder from './components/ResumeBuilder';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Create a separate component for the home page that can use hooks
function HomePage({ onShowAuthModal, onScrollToFeatures }) {
  return (
    <>
      <Hero 
        onGetStartedClick={onScrollToFeatures}
      />
      <Features />
      <ResumeBuilder 
        onAuthRequired={() => onShowAuthModal('login')}
      />
    </>
  );
}

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleShowAuthModal = (tab) => {
    setActiveTab(tab);
    setShowAuthModal(true);
  };

  const handleGetStartedClick = () => {
    // This will be handled by the HomePage component
    // We'll pass the logic as a prop
    const token = localStorage.getItem('access_token');
    if (token) {
      // User is logged in, scroll to features section
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Not logged in, show signup modal
      handleShowAuthModal('signup');
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar 
              onLoginClick={() => handleShowAuthModal('login')} 
              onSignupClick={() => handleShowAuthModal('signup')}
            />
            
            <Routes>
              <Route path="/" element={
                <HomePage 
                  onShowAuthModal={handleShowAuthModal}
                  onScrollToFeatures={handleGetStartedClick}
                />
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
            </Routes>
            
            <Footer />
            
            <AuthModal 
              show={showAuthModal} 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClose={() => setShowAuthModal(false)} 
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;