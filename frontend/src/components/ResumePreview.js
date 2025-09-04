// ResumePreview.js
import React from 'react';
import './ResumePreview.css';

const ResumePreview = ({ data }) => {
  return (
    <div className="resume-a4-template">
      <div className="resume-header">
        <div className="name-title">
          <h1>{data.personalInfo.name || 'Your Name'}</h1>
          {data.personalInfo.title && (
            <p className="professional-title">{data.personalInfo.title}</p>
          )}
        </div>
        
        <div className="contact-info">
          {data.personalInfo.email && (
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>{data.personalInfo.email}</span>
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>{data.personalInfo.phone}</span>
            </div>
          )}
          {data.personalInfo.address && (
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{data.personalInfo.address}</span>
            </div>
          )}
          {data.links && data.links.length > 0 && (
            <div className="contact-item links-inline">
              <i className="fas fa-link"></i>
              {data.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-platform"
                >
                  {link.platform}{index !== data.links.length - 1 ? ', ' : ''}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="resume-content">
        {data.personalInfo.summary && (
          <div className="resume-section">
            <div className="section-header">
              <h2>Professional Summary</h2>
            </div>
            <div className="section-content">
              <p>{data.personalInfo.summary}</p>
            </div>
          </div>
        )}
        
        {data.experience && data.experience.length > 0 && (
          <div className="resume-section">
            <div className="section-header">
              <h2>Work Experience</h2>
            </div>
            <div className="section-content">
              {data.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="item-header">
                    <h3>{exp.title}</h3>
                    <div className="date-location">
                      {exp.period && <span className="date">{exp.period}</span>}
                      {exp.company && <span className="company">{exp.company}</span>}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="item-description">
                      <p>{exp.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {data.education && data.education.length > 0 && (
          <div className="resume-section">
            <div className="section-header">
              <h2>Education</h2>
            </div>
            <div className="section-content">
              {data.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="item-header">
                    <h3>{edu.degree}</h3>
                    <div className="date-location">
                      {edu.period && <span className="date">{edu.period}</span>}
                      {edu.institution && <span className="institution">{edu.institution}</span>}
                    </div>
                  </div>
                  {edu.description && (
                    <div className="item-description">
                      <p>{edu.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {data.skills && data.skills.length > 0 && (
          <div className="resume-section">
            <div className="section-header">
              <h2>Skills</h2>
            </div>
            <div className="section-content">
              <div className="skills-container">
                {data.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">{skill}</div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {data.projects && data.projects.length > 0 && (
          <div className="resume-section">
            <div className="section-header">
              <h2>Projects</h2>
            </div>
            <div className="section-content">
              {data.projects.map((project, index) => (
                <div key={index} className="project-item">
                  <div className="item-header">
                    <h3>{project.name}</h3>
                    <div className="date-location">
                      {project.period && <span className="date">{project.period}</span>}
                      {project.technologies && <span className="technologies">{project.technologies}</span>}
                    </div>
                  </div>
                  {project.description && (
                    <div className="item-description">
                      <p>{project.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {data.certificates && data.certificates.length > 0 && (
          <div className="resume-section">
            <div className="section-header">
              <h2>Certifications</h2>
            </div>
            <div className="section-content">
              {data.certificates.map((cert, index) => (
                <div key={index} className="certificate-item">
                  <div className="item-header">
                    <h3>{cert.name}</h3>
                    <div className="date-location">
                      {cert.date && <span className="date">{cert.date}</span>}
                      {cert.issuer && <span className="issuer">{cert.issuer}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;