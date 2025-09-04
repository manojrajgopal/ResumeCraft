import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { useAuth } from '../contexts/AuthContext';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';
import { resumeAPI } from '../services/api';
import './ResumeBuilder.css';

const ResumeBuilder = ({ onAuthRequired }) => {
  const { currentUser } = useAuth();
  const resumePreviewRef = useRef(null);
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
      title: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certificates: [],
    achievements: [],
    links: []
  });

  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [savedResumes, setSavedResumes] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'saved'

  useEffect(() => {
    if (currentUser) {
      loadUserResumes();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentResumeId) {
      localStorage.setItem('currentResumeId', currentResumeId);
      console.log('Current Resume ID saved to localStorage:', currentResumeId);
    } else {
      console.log('No current resume ID to save');
    }
  }, [currentResumeId]);

  useEffect(() => {
    const savedResumeId = localStorage.getItem('currentResumeId');
    console.log('Loaded resume ID from localStorage:', savedResumeId);
    
    // Handle all falsy values and string representations
    if (savedResumeId && savedResumeId !== 'null' && savedResumeId !== 'undefined' && savedResumeId !== '') {
      console.log('Setting current resume ID from localStorage:', savedResumeId);
      setCurrentResumeId(savedResumeId);
    }
  }, []);

  useEffect(() => {
    if (currentUser && !resumeData.personalInfo.name) {
      // Use a timeout to avoid state updates during render
      setTimeout(() => {
        setResumeData(prevData => ({
          ...prevData,
          personalInfo: {
            ...prevData.personalInfo,
            name: currentUser.full_name || '',
            email: currentUser.email || ''
          }
        }));
      }, 0);
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('Current resume ID changed:', currentResumeId);
    console.log('Saved resumes count:', savedResumes.length);
  }, [currentResumeId, savedResumes.length]);

  // ResumeBuilder.js - Update the loadUserResumes function
  const loadUserResumes = async () => {
    try {
      const resumes = await resumeAPI.getAll();
      setSavedResumes(resumes);

      console.log('Loaded resumes:', resumes);

      if (resumes.length > 0) {
        const lastResume = resumes[resumes.length - 1]; // nth (last) resume
        console.log('Setting resumeId to localStorage:', lastResume._id);

        // Save in state
        setCurrentResumeId(lastResume._id);

        // Save in localStorage
        localStorage.setItem('resumeId', lastResume._id);

        // Load into form
        setResumeData({
          personalInfo: lastResume.personal_info,
          experience: lastResume.experience,
          education: lastResume.education,
          skills: lastResume.skills,
          projects: lastResume.projects || [],
          certificates: lastResume.certificates || [],
          achievements: lastResume.achievements || [],
          links: lastResume.links || []
        });
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  const handleFormChange = (newData) => {
    setResumeData(newData);
  };

  const handleSave = async () => {
    if (!currentUser) {
      onAuthRequired();
      return null;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      let versionName;
      
      if (currentResumeId && currentResumeId !== 'undefined' && currentResumeId !== 'null') {
        const existingResume = savedResumes.find(r => r.id === currentResumeId);
        versionName = existingResume ? existingResume.version_name : `Resume ${new Date().toLocaleDateString()}`;
      } else {
        versionName = `Resume ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      }

      const resumeDataToSave = {
        version_name: versionName,
        personal_info: {
          ...resumeData.personalInfo,
          title: resumeData.personalInfo.title || '' // Ensure title is included
        },
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        skills: resumeData.skills || [],
        projects: resumeData.projects || [],
        certificates: resumeData.certificates || [],
        achievements: resumeData.achievements || [],
        links: resumeData.links || []
      };

      let savedResume;
      
      if (currentResumeId) {
        savedResume = await resumeAPI.update(currentResumeId, resumeDataToSave);
        setSaveMessage('Resume updated successfully!');
      } else {
        savedResume = await resumeAPI.create(resumeDataToSave);
        // IMMEDIATELY set the currentResumeId after creation
        setCurrentResumeId(savedResume.id);
        localStorage.setItem('currentResumeId', savedResume.id);
        setSaveMessage('Resume saved successfully!');
      }

      // Reload the list of resumes
      await loadUserResumes();
      
      // Return the saved resume ID so we can use it for download
      return savedResume.id;
      
    } catch (error) {
      console.error('Error saving resume:', error);
      setSaveMessage('Error saving resume. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleNewResume = () => {
    setResumeData({
      personalInfo: {
        name: currentUser?.full_name || '',
        email: currentUser?.email || '',
        phone: '',
        address: '',
        summary: ''
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certificates: [],
      achievements: [],
      links: []
    });
    setCurrentResumeId(null);
    localStorage.removeItem('currentResumeId');
  };

  // ResumeBuilder.js - Update the handleLoadResume function
  const handleLoadResume = (resume) => {
    console.log('Loading resume:', resume.id, resume.version_name);
    setCurrentResumeId(resume.id);
    localStorage.setItem('currentResumeId', resume.id);
    setResumeData({
      personalInfo: resume.personal_info,
      experience: resume.experience,
      education: resume.education,
      skills: resume.skills,
      projects: resume.projects || [],
      certificates: resume.certificates || [],
      achievements: resume.achievements || [],
      links: resume.links || []
    });
    setActiveTab('editor');
  };

  const handleDownload = async () => {
    if (!resumePreviewRef.current) {
      console.error('Resume preview reference not found');
      return;
    }

    // Check if there's any content to download
    if (!resumeData.personalInfo.name && resumeData.experience.length === 0 && 
        resumeData.education.length === 0) {
      alert('Please add some content to your resume before downloading.');
      return;
    }

    try {
      // Get the resume preview element
      const element = resumePreviewRef.current;
      
      // Set options for the PDF
      const opt = {
        margin: 0,
        filename: `${resumeData.personalInfo.name || 'resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#FFFFFF',
          logging: false,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();
      
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Separate download function
  const downloadResumeFile = async (resumeId) => {
    try {
      if (!resumeId) {
        alert('No resume selected. Please save your resume first.');
        return;
      }

      // use your centralized API wrapper
      const response = await resumeAPI.download(resumeId);

      // Convert to blob
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Pick filename from resume data
      const resume = savedResumes.find(r => r.id === resumeId || r._id === resumeId);
      const filename = resume 
        ? `${resume.version_name.replace(/\s+/g, '_')}.pdf`
        : 'resume.pdf';

      // Trigger download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);

      console.log('Download successful');
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert(`Error downloading resume: ${error.message}`);
    }
  };

  const getDownloadUrl = () => {
    if (!currentResumeId) return null;
    return `http://localhost:8000/api/resumes/${currentResumeId}/download`;
  };

  return (
    <section className="section">
      <div className="container">
        <div className="resume-builder-header">
          <h2 className="section-title">Build Your Professional Resume</h2>
          <p className="section-subtitle">Create, customize, and download your resume in minutes</p>
        </div>
        
        {saveMessage && (
          <div className={`alert ${saveMessage.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            <i className={`fas ${saveMessage.includes('Error') ? 'fa-exclamation-circle' : 'fa-check-circle'} me-2`}></i>
            {saveMessage}
          </div>
        )}
        
        <div className="resume-builder-container">
          <div className="resume-form-container">
            <div className="form-tabs">
              <button 
                className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
                onClick={() => setActiveTab('editor')}
              >
                <i className="fas fa-edit me-2"></i>Resume Editor
              </button>
              {currentUser && (
                <button 
                  className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                >
                  <i className="fas fa-folder me-2"></i>Saved Resumes ({savedResumes.length})
                </button>
              )}
            </div>
            
            {activeTab === 'editor' ? (
              <>
                <ResumeForm 
                  data={resumeData} 
                  onChange={handleFormChange}
                  currentUser={currentUser}
                />
                
                <div className="resume-actions">
                  <button 
                    className="btn btn-primary w-100 save-btn" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Saving...
                      </>
                    ) : (
                      <>
                        <i className={`fas ${currentResumeId ? 'fa-sync' : 'fa-save'} me-2`}></i>
                        {currentResumeId ? 'Update Resume' : 'Save Resume'}
                      </>
                    )}
                  </button>
                  
                  {currentUser && (
                    <button 
                      className="btn btn-outline-primary w-100 mt-2 new-resume-btn" 
                      onClick={handleNewResume}
                    >
                      <i className="fas fa-plus me-2"></i>Create New Resume
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="saved-resumes-tab">
                <div className="saved-resumes-header">
                  <h4>Your Saved Resumes</h4>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleNewResume}
                  >
                    <i className="fas fa-plus me-1"></i>New
                  </button>
                </div>
                
                {savedResumes.length > 0 ? (
                  <div className="resume-list">
                    {savedResumes.map(resume => (
                      <div 
                        key={resume.id} 
                        className={`resume-item ${resume.id === currentResumeId ? 'active' : ''}`}
                        onClick={() => handleLoadResume(resume)}
                      >
                        <div className="resume-item-header">
                          <div className="resume-name">{resume.version_name}</div>
                          <i className="fas fa-file-alt resume-icon"></i>
                        </div>
                        <div className="resume-date">
                          <i className="fas fa-clock me-1"></i>
                          Updated {new Date(resume.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-file-alt empty-icon"></i>
                    <p>No saved resumes yet</p>
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={handleNewResume}
                    >
                      Create Your First Resume
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="resume-preview-container">
            <div className="preview-card">
              <div className="preview-header">
                <h3>Live Preview</h3>
                <button 
                  className="btn btn-primary download-btn" 
                  onClick={handleDownload}
                  disabled={!resumeData.personalInfo.name && resumeData.experience.length === 0}
                  title={!resumeData.personalInfo.name && resumeData.experience.length === 0 ? "Please add some content first" : ""}
                >
                  <i className="fas fa-download me-2"></i>Download PDF
                </button>
              </div>
              {/* Add ref to the ResumePreview component */}
              <div ref={resumePreviewRef}>
                <ResumePreview data={resumeData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeBuilder;