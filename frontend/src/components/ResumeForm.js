import React, { useState } from 'react';
import './ResumeForm.css';

const ResumeForm = ({ data, onChange, currentUser }) => {
  const [activeSection, setActiveSection] = useState('personal');
  const [newSkill, setNewSkill] = useState('');
  const [newLink, setNewLink] = useState({ platform: '', url: '' });  

  const initializedData = {
    personalInfo: data.personalInfo || { name: '', email: '', phone: '', address: '', summary: '', title: '' },
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    projects: data.projects || [],
    certificates: data.certificates || [],
    achievements: data.achievements || [],
    links: data.links || []
  };

  const handlePersonalInfoChange = (field, value) => {
    const newData = {
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value
      }
    };
    onChange(newData);
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...data.experience];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    
    onChange({
      ...data,
      experience: newExperiences
    });
  };

  const addExperience = () => {
    const newExperience = {
      title: '',
      company: '',
      period: '',
      description: ''
    };
    
    onChange({
      ...data,
      experience: [...data.experience, newExperience]
    });
  };

  const removeExperience = (index) => {
    const newExperiences = data.experience.filter((_, i) => i !== index);
    onChange({
      ...data,
      experience: newExperiences
    });
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...data.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    
    onChange({
      ...data,
      education: newEducation
    });
  };

  const addEducation = () => {
    const newEducation = {
      degree: '',
      institution: '',
      period: '',
      description: ''
    };
    
    onChange({
      ...data,
      education: [...data.education, newEducation]
    });
  };

  const removeEducation = (index) => {
    const newEducation = data.education.filter((_, i) => i !== index);
    onChange({
      ...data,
      education: newEducation
    });
  };

  const handleProjectsChange = (index, field, value) => {
    const newProjects = [...data.projects];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value
    };
    
    onChange({
      ...data,
      projects: newProjects
    });
  };

  const addProject = () => {
    const newProject = {
      name: '',
      technologies: '',
      period: '',
      description: '',
      link: ''
    };
    
    onChange({
      ...data,
      projects: [...data.projects, newProject]
    });
  };

  const removeProject = (index) => {
    const newProjects = data.projects.filter((_, i) => i !== index);
    onChange({
      ...data,
      projects: newProjects
    });
  };

  const handleCertificatesChange = (index, field, value) => {
    const newCertificates = [...data.certificates];
    newCertificates[index] = {
      ...newCertificates[index],
      [field]: value
    };
    
    onChange({
      ...data,
      certificates: newCertificates
    });
  };

  const addCertificate = () => {
    const newCertificate = {
      name: '',
      issuer: '',
      date: '',
      credentialLink: ''
    };
    
    onChange({
      ...data,
      certificates: [...data.certificates, newCertificate]
    });
  };

  const removeCertificate = (index) => {
    const newCertificates = data.certificates.filter((_, i) => i !== index);
    onChange({
      ...data,
      certificates: newCertificates
    });
  };

  const handleAchievementsChange = (index, field, value) => {
    const newAchievements = [...data.achievements];
    newAchievements[index] = {
      ...newAchievements[index],
      [field]: value
    };
    
    onChange({
      ...data,
      achievements: newAchievements
    });
  };

  const addAchievement = () => {
    const newAchievement = {
      title: '',
      date: '',
      description: ''
    };
    
    onChange({
      ...data,
      achievements: [...data.achievements, newAchievement]
    });
  };

  const removeAchievement = (index) => {
    const newAchievements = data.achievements.filter((_, i) => i !== index);
    onChange({
      ...data,
      achievements: newAchievements
    });
  };

  const handleSkillsChange = (newSkills) => {
    onChange({
      ...data,
      skills: newSkills
    });
  };

  const handleLinksChange = (newLinks) => {
    onChange({
      ...data,
      links: newLinks
    });
  };

  const addSkill = () => {
    if (newSkill && newSkill.trim() !== '') {
      handleSkillsChange([...data.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const addLink = () => {
    if (newLink.platform && newLink.platform.trim() !== '' && newLink.url && newLink.url.trim() !== '') {
      handleLinksChange([...data.links, {
        platform: newLink.platform.trim(),
        url: newLink.url.trim()
      }]);
      setNewLink({ platform: '', url: '' });
    }
  };

  const removeSkill = (index) => {
    const newSkills = data.skills.filter((_, i) => i !== index);
    handleSkillsChange(newSkills);
  };

  const removeLink = (index) => {
    const newLinks = data.links.filter((_, i) => i !== index);
    handleLinksChange(newLinks);
  };

  // Initialize new sections if they don't exist
  // if (!data.projects) {
  //   onChange({...data, projects: []});
  // }
  // if (!data.certificates) {
  //   onChange({...data, certificates: []});
  // }
  // if (!data.achievements) {
  //   onChange({...data, achievements: []});
  // }
  // if (!data.links) {
  //   onChange({...data, links: []});
  // }

  // Pre-fill user data if available
  // if (currentUser && !data.personalInfo.name) {
  //   handlePersonalInfoChange('name', currentUser.full_name);
  //   handlePersonalInfoChange('email', currentUser.email);
  // }

  return (
    <div className="resume-form">
      <div className="form-sections">
        <button 
          className={`section-tab ${activeSection === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveSection('personal')}
        >
          <i className="fas fa-user me-2"></i>Personal
        </button>
        <button 
          className={`section-tab ${activeSection === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveSection('experience')}
        >
          <i className="fas fa-briefcase me-2"></i>Experience
        </button>
        <button 
          className={`section-tab ${activeSection === 'education' ? 'active' : ''}`}
          onClick={() => setActiveSection('education')}
        >
          <i className="fas fa-graduation-cap me-2"></i>Education
        </button>
        <button 
          className={`section-tab ${activeSection === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveSection('projects')}
        >
          <i className="fas fa-code me-2"></i>Projects
        </button>
        <button 
          className={`section-tab ${activeSection === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveSection('certificates')}
        >
          <i className="fas fa-certificate me-2"></i>Certificates
        </button>
        <button 
          className={`section-tab ${activeSection === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveSection('achievements')}
        >
          <i className="fas fa-trophy me-2"></i>Achievements
        </button>
        <button 
          className={`section-tab ${activeSection === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveSection('skills')}
        >
          <i className="fas fa-tools me-2"></i>Skills
        </button>
        <button 
          className={`section-tab ${activeSection === 'links' ? 'active' : ''}`}
          onClick={() => setActiveSection('links')}
        >
          <i className="fas fa-link me-2"></i>Links
        </button>
      </div>

      <div className="form-content">
        {activeSection === 'personal' && (
          <div className="form-section">
            <div className="section-header">
              <h3><i className="fas fa-user me-2"></i>Personal Information</h3>
              <div className="section-divider"></div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-signature me-1"></i>Full Name *
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="John Doe"
                  value={data.personalInfo.name}
                  onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-envelope me-1"></i>Email *
                </label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="john@example.com"
                  value={data.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-phone me-1"></i>Phone
                </label>
                <input 
                  type="tel" 
                  className="form-control" 
                  placeholder="(123) 456-7890"
                  value={data.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-map-marker-alt me-1"></i>Address
                </label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="New York, NY"
                  value={data.personalInfo.address}
                  onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-briefcase me-1"></i>Professional Title
              </label>
              <input 
                type="text"
                className="form-control" 
                placeholder="e.g., Senior Software Engineer"
                value={data.personalInfo.title}
                onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-file-alt me-1"></i>Professional Summary
              </label>
              <textarea 
                className="form-control" 
                rows="4" 
                placeholder="Experienced professional with..."
                value={data.personalInfo.summary}
                onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
              ></textarea>
            </div>
          </div>
        )}

        {activeSection === 'experience' && (
          <div className="form-section">
            <div className="section-header">
              <h3><i className="fas fa-briefcase me-2"></i>Work Experience</h3>
              <button type="button" className="btn btn-primary" onClick={addExperience}>
                <i className="fas fa-plus me-1"></i> Add Experience
              </button>
            </div>
            <div className="section-divider"></div>
            
            {data.experience.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-briefcase empty-icon"></i>
                <p>No experience added yet</p>
                <button type="button" className="btn btn-outline-primary" onClick={addExperience}>
                  Add Your First Experience
                </button>
              </div>
            ) : (
              <div className="items-list">
                {data.experience.map((exp, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <div className="item-number">#{index + 1}</div>
                      <button 
                        type="button" 
                        className="btn btn-icon btn-danger"
                        onClick={() => removeExperience(index)}
                        title="Remove experience"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Job Title *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Senior Developer"
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Company *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Tech Solutions Inc."
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Period *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Jan 2020 - Present"
                          value={exp.period}
                          onChange={(e) => handleExperienceChange(index, 'period', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        placeholder="Describe your responsibilities and achievements..."
                        value={exp.description}
                        onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'education' && (
          <div className="form-section">
            <div className="section-header">
              <h3><i className="fas fa-graduation-cap me-2"></i>Education</h3>
              <button type="button" className="btn btn-primary" onClick={addEducation}>
                <i className="fas fa-plus me-1"></i> Add Education
              </button>
            </div>
            <div className="section-divider"></div>
            
            {data.education.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-graduation-cap empty-icon"></i>
                <p>No education added yet</p>
                <button type="button" className="btn btn-outline-primary" onClick={addEducation}>
                  Add Your First Education
                </button>
              </div>
            ) : (
              <div className="items-list">
                {data.education.map((edu, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <div className="item-number">#{index + 1}</div>
                      <button 
                        type="button" 
                        className="btn btn-icon btn-danger"
                        onClick={() => removeEducation(index)}
                        title="Remove education"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Degree *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="BS in Computer Science"
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Institution *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="University of Technology"
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Period *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="2013 - 2017"
                          value={edu.period}
                          onChange={(e) => handleEducationChange(index, 'period', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        placeholder="Describe your studies and achievements..."
                        value={edu.description}
                        onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="form-section">
            <div className="section-header">
              <h3><i className="fas fa-code me-2"></i>Projects</h3>
              <button type="button" className="btn btn-primary" onClick={addProject}>
                <i className="fas fa-plus me-1"></i> Add Project
              </button>
            </div>
            <div className="section-divider"></div>
            
            {data.projects.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-code empty-icon"></i>
                <p>No projects added yet</p>
                <button type="button" className="btn btn-outline-primary" onClick={addProject}>
                  Add Your First Project
                </button>
              </div>
            ) : (
              <div className="items-list">
                {data.projects.map((project, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <div className="item-number">#{index + 1}</div>
                      <button 
                        type="button" 
                        className="btn btn-icon btn-danger"
                        onClick={() => removeProject(index)}
                        title="Remove project"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Project Name *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="E-commerce Website"
                          value={project.name}
                          onChange={(e) => handleProjectsChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Technologies Used</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="React, Node.js, MongoDB"
                          value={project.technologies}
                          onChange={(e) => handleProjectsChange(index, 'technologies', e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Project Period</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Jan 2023 - Mar 2023"
                          value={project.period}
                          onChange={(e) => handleProjectsChange(index, 'period', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Project Link</label>
                        <input 
                          type="url" 
                          className="form-control" 
                          placeholder="https://github.com/username/project"
                          value={project.link}
                          onChange={(e) => handleProjectsChange(index, 'link', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Project Description</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        placeholder="Describe the project, your role, and key achievements..."
                        value={project.description}
                        onChange={(e) => handleProjectsChange(index, 'description', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'certificates' && (
          <div className="form-section">
            <div className="section-header">
              <h3><i className="fas fa-certificate me-2"></i>Certifications</h3>
              <button type="button" className="btn btn-primary" onClick={addCertificate}>
                <i className="fas fa-plus me-1"></i> Add Certificate
              </button>
            </div>
            <div className="section-divider"></div>
            
            {data.certificates.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-certificate empty-icon"></i>
                <p>No certificates added yet</p>
                <button type="button" className="btn btn-outline-primary" onClick={addCertificate}>
                  Add Your First Certificate
                </button>
              </div>
            ) : (
              <div className="items-list">
                {data.certificates.map((cert, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <div className="item-number">#{index + 1}</div>
                      <button 
                        type="button" 
                        className="btn btn-icon btn-danger"
                        onClick={() => removeCertificate(index)}
                        title="Remove certificate"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Certificate Name *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="AWS Certified Solutions Architect"
                          value={cert.name}
                          onChange={(e) => handleCertificatesChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Issuing Organization *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Amazon Web Services"
                          value={cert.issuer}
                          onChange={(e) => handleCertificatesChange(index, 'issuer', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Issue Date</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="March 2023"
                          value={cert.date}
                          onChange={(e) => handleCertificatesChange(index, 'date', e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Credential Link</label>
                        <input 
                          type="url" 
                          className="form-control" 
                          placeholder="https://www.credly.com/users/username/badges"
                          value={cert.credentialLink}
                          onChange={(e) => handleCertificatesChange(index, 'credentialLink', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'achievements' && (
          <div className="form-section">
            <div className="section-header">
              <h3><i className="fas fa-trophy me-2"></i>Achievements</h3>
              <button type="button" className="btn btn-primary" onClick={addAchievement}>
                <i className="fas fa-plus me-1"></i> Add Achievement
              </button>
            </div>
            <div className="section-divider"></div>
            
            {data.achievements.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-trophy empty-icon"></i>
                <p>No achievements added yet</p>
                <button type="button" className="btn btn-outline-primary" onClick={addAchievement}>
                  Add Your First Achievement
                </button>
              </div>
            ) : (
              <div className="items-list">
                {data.achievements.map((achievement, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <div className="item-number">#{index + 1}</div>
                      <button 
                        type="button" 
                        className="btn btn-icon btn-danger"
                        onClick={() => removeAchievement(index)}
                        title="Remove achievement"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Achievement Title *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Best Employee of the Year"
                          value={achievement.title}
                          onChange={(e) => handleAchievementsChange(index, 'title', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">Date</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="December 2022"
                          value={achievement.date}
                          onChange={(e) => handleAchievementsChange(index, 'date', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        placeholder="Describe the achievement and its significance..."
                        value={achievement.description}
                        onChange={(e) => handleAchievementsChange(index, 'description', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="form-section">
            <div className="section-header">
              <h3><i className="fas fa-tools me-2"></i>Skills</h3>
            </div>
            <div className="section-divider"></div>
            
            <div className="form-group">
              <label className="form-label">Add New Skill</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter a skill (e.g., JavaScript)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={addSkill}
                >
                  <i className="fas fa-plus me-1"></i> Add
                </button>
              </div>
            </div>
            
            {data.skills.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-tools empty-icon"></i>
                <p>No skills added yet</p>
              </div>
            ) : (
              <div className="skills-grid">
                {data.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      className="btn btn-icon"
                      onClick={() => removeSkill(index)}
                      title="Remove skill"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'links' && (
          <div className="form-section">
            <div className="section-header">
              <h3><i className="fas fa-link me-2"></i>Social & Portfolio Links</h3>
            </div>
            <div className="section-divider"></div>
            
            <div className="form-group">
              <label className="form-label">Add New Link</label>
              <div className="form-grid">
                <div className="form-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Platform (e.g., LinkedIn)"
                    value={newLink.platform}
                    onChange={(e) => setNewLink({...newLink, platform: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <div className="input-group">
                    <input 
                      type="url" 
                      className="form-control" 
                      placeholder="URL (e.g., https://linkedin.com/in/username)"
                      value={newLink.url}
                      onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                    />
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={addLink}
                    >
                      <i className="fas fa-plus me-1"></i> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {data.links.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-link empty-icon"></i>
                <p>No links added yet</p>
              </div>
            ) : (
              <div className="items-list">
                {data.links.map((link, index) => (
                  <div key={index} className="item-card">
                    <div className="item-header">
                      <div className="item-number">#{index + 1}</div>
                      <button 
                        type="button" 
                        className="btn btn-icon btn-danger"
                        onClick={() => removeLink(index)}
                        title="Remove link"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Platform *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="LinkedIn"
                          value={link.platform}
                          onChange={(e) => {
                            const newLinks = [...data.links];
                            newLinks[index].platform = e.target.value;
                            handleLinksChange(newLinks);
                          }}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">URL *</label>
                        <input 
                          type="url" 
                          className="form-control" 
                          placeholder="https://linkedin.com/in/username"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...data.links];
                            newLinks[index].url = e.target.value;
                            handleLinksChange(newLinks);
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;