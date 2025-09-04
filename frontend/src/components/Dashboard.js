import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { resumeAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [resumesData, activitiesData] = await Promise.all([
        resumeAPI.getAll(),
        resumeAPI.getActivities(10)
      ]);
      
      setResumes(resumesData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = (resume) => {
    let score = 0;
    if (resume.personal_info.name) score += 20;
    if (resume.personal_info.email) score += 20;
    if (resume.personal_info.summary) score += 10;
    if (resume.experience.length > 0) score += 25;
    if (resume.education.length > 0) score += 25;
    return score;
  };

  const handleDeleteResume = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeAPI.delete(resumeId);
        setResumes(resumes.filter(r => r.id !== resumeId));
      } catch (error) {
        console.error('Error deleting resume:', error);
        alert('Error deleting resume. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Your Resume Dashboard</h2>
        
        <div className="dashboard-header mb-4">
          <h3>Welcome back, {currentUser.full_name}!</h3>
          <p>You have {resumes.length} saved resume{resumes.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="card p-4">
          <div className="dashboard-container">
            <div className="dashboard-sidebar">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i> Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'resumes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resumes')}
                  >
                    <i className="fas fa-file-alt me-2"></i> My Resumes
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                  >
                    <i className="fas fa-history me-2"></i> Recent Activity
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="dashboard-content">
              {activeTab === 'overview' && (
                <>
                  <h3 className="mb-4">Dashboard Overview</h3>
                  
                  <div className="dashboard-cards">
                    <div className="dashboard-card card p-3 text-center">
                      <div className="feature-icon">
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <h4>Total Resumes</h4>
                      <p className="display-4">{resumes.length}</p>
                    </div>
                    
                    <div className="dashboard-card card p-3 text-center">
                      <div className="feature-icon">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <h4>Most Complete Resume</h4>
                      {resumes.length > 0 ? (
                        <>
                          <div className="progress mb-3">
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{width: `${calculateCompleteness(resumes[0])}%`}}
                            ></div>
                          </div>
                          <p className="text-muted">{resumes[0].version_name} ({calculateCompleteness(resumes[0])}% complete)</p>
                        </>
                      ) : (
                        <p className="text-muted">No resumes yet</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="card p-3 mt-4">
                    <h4 className="mb-3">Quick Actions</h4>
                    <div className="d-grid gap-2 d-md-flex">
                      <a href="/" className="btn btn-primary me-md-2">
                        <i className="fas fa-plus me-2"></i>Create New Resume
                      </a>
                      <button className="btn btn-outline-primary" onClick={loadDashboardData}>
                        <i className="fas fa-sync-alt me-2"></i>Refresh Data
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {activeTab === 'resumes' && (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0">My Resumes</h3>
                    <a href="/" className="btn btn-primary">
                      <i className="fas fa-plus me-2"></i>Create New
                    </a>
                  </div>
                  
                  {resumes.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                      <h4>No resumes yet</h4>
                      <p className="text-muted">Create your first resume to get started</p>
                      <a href="/" className="btn btn-primary">Create Resume</a>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Last Updated</th>
                            <th>Completeness</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resumes.map(resume => (
                            <tr key={resume.id}>
                              <td>
                                <div className="fw-bold">{resume.version_name}</div>
                                <div className="small text-muted">
                                  {resume.personal_info.name}
                                </div>
                              </td>
                              <td>
                                {new Date(resume.updated_at).toLocaleDateString()}
                                <div className="small text-muted">
                                  {new Date(resume.updated_at).toLocaleTimeString()}
                                </div>
                              </td>
                              <td>
                                <div className="progress" style={{height: '8px'}}>
                                  <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{width: `${calculateCompleteness(resume)}%`}}
                                  ></div>
                                </div>
                                <div className="small text-muted mt-1">
                                  {calculateCompleteness(resume)}% complete
                                </div>
                              </td>
                              <td>
                                <div className="btn-group">
                                  <a 
                                    href={`/?resume=${resume.id}`} 
                                    className="btn btn-sm btn-outline-primary"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </a>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => {
                                      // Download functionality would go here
                                      alert('Download functionality would be implemented here');
                                    }}
                                  >
                                    <i className="fas fa-download"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteResume(resume.id)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
              
              {activeTab === 'activity' && (
                <>
                  <h3 className="mb-4">Recent Activity</h3>
                  
                  {activities.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-history fa-3x text-muted mb-3"></i>
                      <h4>No activity yet</h4>
                      <p className="text-muted">Your activity will appear here</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Activity</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activities.map(activity => (
                            <tr key={activity.id}>
                              <td>
                                {new Date(activity.created_at).toLocaleDateString()}
                                <div className="small text-muted">
                                  {new Date(activity.created_at).toLocaleTimeString()}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  activity.activity_type === 'created' ? 'bg-success' :
                                  activity.activity_type === 'updated' ? 'bg-primary' :
                                  activity.activity_type === 'downloaded' ? 'bg-info' :
                                  'bg-secondary'
                                }`}>
                                  {activity.activity_type}
                                </span>
                              </td>
                              <td>{activity.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;