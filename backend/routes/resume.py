from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List
from datetime import datetime
import os, tempfile, pdfkit
from models.resume import (
    ResumeCreate, 
    ResumeUpdate, 
    ResumeResponse, 
    ActivityLog,
    ResumeVersion,
    ActivityResponse
)
from models.user import UserInDB
from utils.auth import get_current_active_user
from utils.database import get_resume_collection, get_activity_collection
from bson import ObjectId
import json
from bson.errors import InvalidId

router = APIRouter()

async def log_activity(user_id: str, activity_type: str, details: str, resume_id: str = None):
    activity_collection = get_activity_collection()
    activity = ActivityLog(
        user_id=ObjectId(user_id),
        activity_type=activity_type,
        resume_id=ObjectId(resume_id) if resume_id else None,
        details=details
    )
    await activity_collection.insert_one(activity.dict(by_alias=True))

@router.get("/", response_model=List[ResumeResponse])
async def get_user_resumes(current_user: UserInDB = Depends(get_current_active_user)):
    resume_collection = get_resume_collection()
    resumes = await resume_collection.find({"user_id": current_user.id}).to_list(100)
    
    # Ensure proper serialization by using the response model
    return [ResumeResponse(**resume) for resume in resumes]

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str, 
    current_user: UserInDB = Depends(get_current_active_user)
):
    resume_collection = get_resume_collection()
    resume = await resume_collection.find_one({
        "_id": ObjectId(resume_id),
        "user_id": current_user.id
    })
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    return ResumeResponse(**resume)

@router.post("/", response_model=ResumeResponse)
async def create_resume(
    resume: ResumeCreate,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_active_user)
):
    resume_collection = get_resume_collection()
    
    # Check if version name already exists for this user
    existing_resume = await resume_collection.find_one({
        "user_id": current_user.id,
        "version_name": resume.version_name
    })
    
    if existing_resume:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Version name already exists for this user"
        )
    
    # Create new resume
    resume_dict = resume.dict()
    resume_dict["user_id"] = current_user.id
    resume_dict["created_at"] = datetime.utcnow()
    resume_dict["updated_at"] = datetime.utcnow()
    
    result = await resume_collection.insert_one(resume_dict)
    new_resume = await resume_collection.find_one({"_id": result.inserted_id})
    
    # Log activity
    background_tasks.add_task(
        log_activity, 
        str(current_user.id), 
        "created", 
        f"Created resume version: {resume.version_name}",
        str(result.inserted_id)
    )
    
    return ResumeResponse(**new_resume)

@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    resume_update: ResumeUpdate,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_active_user)
):
    try:
        # Validate if resume_id is a valid ObjectId
        object_id = ObjectId(resume_id)
    except InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resume ID format"
        )
    
    resume_collection = get_resume_collection()
    
    # Check if resume exists and belongs to user
    existing_resume = await resume_collection.find_one({
        "_id": object_id,
        "user_id": current_user.id
    })
    
    if not existing_resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check if version name is being changed and if it conflicts with other resumes
    update_data = resume_update.dict(exclude_unset=True)
    
    if 'version_name' in update_data and update_data['version_name'] != existing_resume.get('version_name'):
        # Check if new version name already exists for this user (excluding current resume)
        existing_with_same_name = await resume_collection.find_one({
            "user_id": current_user.id,
            "version_name": update_data['version_name'],
            "_id": {"$ne": object_id}  # Exclude current resume
        })
        
        if existing_with_same_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Version name already exists for this user"
            )
    
    update_data["updated_at"] = datetime.utcnow()
    
    # Update resume
    result = await resume_collection.update_one(
        {"_id": object_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes made or resume not found"
        )
    
    # Get updated resume
    updated_resume = await resume_collection.find_one({"_id": object_id})
    
    # Log activity
    background_tasks.add_task(
        log_activity, 
        str(current_user.id), 
        "updated", 
        f"Updated resume version: {existing_resume.get('version_name', 'Untitled')}",
        resume_id
    )
    
    return ResumeResponse(**updated_resume)

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_active_user)
):
    resume_collection = get_resume_collection()
    
    # Check if resume exists and belongs to user
    existing_resume = await resume_collection.find_one({
        "_id": ObjectId(resume_id),
        "user_id": current_user.id
    })
    
    if not existing_resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Delete resume
    result = await resume_collection.delete_one({"_id": ObjectId(resume_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Log activity
    background_tasks.add_task(
        log_activity, 
        str(current_user.id), 
        "deleted", 
        f"Deleted resume version: {existing_resume.get('version_name', 'Untitled')}",
        resume_id
    )
    
    return {"message": "Resume deleted successfully"}

# resume.py - Update the download_resume function
@router.get("/{resume_id}/download")
async def download_resume(
    resume_id: str,
    background_tasks: BackgroundTasks,
    current_user: UserInDB = Depends(get_current_active_user)
):
    resume_collection = get_resume_collection()
    
    # Get resume data
    resume = await resume_collection.find_one({
        "_id": ObjectId(resume_id),
        "user_id": current_user.id
    })
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Create a proper PDF using a template
    pdf_path = f"/tmp/resume_{resume_id}.pdf"
    
    # Generate HTML content for the resume
    html_content = generate_resume_html(resume)
    
    # Convert HTML to PDF using pdfkit
    config = pdfkit.configuration(wkhtmltopdf=os.getenv('wkhtmltopdf', '/usr/local/bin/wkhtmltopdf'))

    pdf_path = os.path.join(tempfile.gettempdir(), f"resume_{resume_id}.pdf")
    
    pdfkit.from_string(
        html_content,
        pdf_path,
        options={
            'enable-local-file-access': None,   # needed if you use local CSS/images
            'encoding': "UTF-8",
        },
        configuration=config
    )

    try:
        pdfkit.from_string(html_content, pdf_path, options={
            'page-size': 'A4',
            'margin-top': '0.5in',
            'margin-right': '0.5in',
            'margin-bottom': '0.5in',
            'margin-left': '0.5in',
            'encoding': "UTF-8",
            'no-outline': None
        }, configuration=config)
    except Exception as e:
        # Fallback to simple text if PDF generation fails
        with open(pdf_path, 'w') as f:
            f.write(f"Resume: {resume['version_name']}\n")
            f.write(f"Name: {resume['personal_info']['name']}\n")
            f.write(f"Email: {resume['personal_info']['email']}\n")
            f.write(f"Phone: {resume['personal_info']['phone']}\n")
            f.write(f"Address: {resume['personal_info']['address']}\n\n")
            f.write("Professional Summary:\n")
            f.write(f"{resume['personal_info']['summary']}\n\n")
            f.write("Experience:\n")
            for exp in resume['experience']:
                f.write(f"{exp['title']} at {exp['company']} ({exp['period']})\n")
                f.write(f"{exp['description']}\n\n")
            f.write("Education:\n")
            for edu in resume['education']:
                f.write(f"{edu['degree']} at {edu['institution']} ({edu['period']})\n")
                f.write(f"{edu['description']}\n\n")
            f.write("Skills:\n")
            f.write(f"{', '.join(resume['skills'])}\n")
    
    # Log activity
    background_tasks.add_task(
        log_activity, 
        str(current_user.id), 
        "downloaded", 
        f"Downloaded resume version: {resume['version_name']}",
        resume_id
    )
    
    return FileResponse(
        pdf_path, 
        media_type='application/pdf',
        filename=f"{resume['version_name']}.pdf"
    )

def generate_resume_html(resume):
    # Check if we need two-column layout (more than 4 sections with content)
    has_projects = resume.get('projects') and len(resume['projects']) > 0
    has_certificates = resume.get('certificates') and len(resume['certificates']) > 0
    has_achievements = resume.get('achievements') and len(resume['achievements']) > 0
    has_skills = resume.get('skills') and len(resume['skills']) > 0
    has_experience = resume.get('experience') and len(resume['experience']) > 0
    has_education = resume.get('education') and len(resume['education']) > 0
    has_links = resume.get('links') and len(resume['links']) > 0
    has_summary = resume.get('personal_info') and resume['personal_info'].get('summary')
    
    section_count = [
        has_projects, 
        has_certificates, 
        has_achievements, 
        has_skills, 
        has_experience, 
        has_education, 
        has_links, 
        has_summary
    ].count(True)
    
    use_two_columns = section_count > 4
    
    # Generate contact info HTML
    contact_info_html = ""
    if resume['personal_info'].get('email'):
        contact_info_html += f"""
            <div class="contact-item">
                <span>{resume['personal_info']['email']}</span>
            </div>
        """
    if resume['personal_info'].get('phone'):
        contact_info_html += f"""
            <div class="contact-item">
                <span>{resume['personal_info']['phone']}</span>
            </div>
        """
    if resume['personal_info'].get('address'):
        contact_info_html += f"""
            <div class="contact-item">
                <span>{resume['personal_info']['address']}</span>
            </div>
        """
    if has_links:
        links_html = ""
        for i, link in enumerate(resume['links']):
            links_html += f"""
                <a href="{link['url']}" target="_blank" rel="noopener noreferrer" class="link-platform">
                    {link['platform']}{', ' if i < len(resume['links']) - 1 else ''}
                </a>
            """
        contact_info_html += f"""
            <div class="contact-item links-inline">
                {links_html}
            </div>
        """
    
    # Generate left column HTML
    left_column_html = ""
    if has_summary:
        left_column_html += f"""
            <div class="resume-section">
                <div class="section-header">
                    <h2>Professional Summary</h2>
                </div>
                <div class="section-content">
                    <p>{resume['personal_info']['summary']}</p>
                </div>
            </div>
        """
    
    if has_experience:
        experience_html = ""
        for exp in resume['experience']:
            period_html = f"<span class='date'>{exp['period']}</span>" if exp.get('period') else ""
            company_html = f"<span class='company'>{exp['company']}</span>" if exp.get('company') else ""
            description_html = f"""
                <div class="item-description">
                    <p>{exp['description']}</p>
                </div>
            """ if exp.get('description') else ""
            
            experience_html += f"""
                <div class="experience-item">
                    <div class="item-header">
                        <h3>{exp['title']}</h3>
                        <div class="date-location">
                            {period_html}
                            {company_html}
                        </div>
                    </div>
                    {description_html}
                </div>
            """
        
        left_column_html += f"""
            <div class="resume-section">
                <div class="section-header">
                    <h2>Work Experience</h2>
                </div>
                <div class="section-content">
                    {experience_html}
                </div>
            </div>
        """
    
    if has_projects:
        projects_html = ""
        for project in resume['projects']:
            period_html = f"<span class='date'>{project['period']}</span>" if project.get('period') else ""
            tech_html = f"<span class='technologies'>{project['technologies']}</span>" if project.get('technologies') else ""
            description_html = f"""
                <div class="item-description">
                    <p>{project['description']}</p>
                </div>
            """ if project.get('description') else ""
            
            link_html = ""
            if project.get('link'):
                link_html = f"""
                    <div class="project-link">
                        <a href="{project['link']}" target="_blank" rel="noopener noreferrer">
                            View Project
                        </a>
                    </div>
                """
            
            projects_html += f"""
                <div class="project-item">
                    <div class="item-header">
                        <h3>{project['name']}</h3>
                        <div class="date-location">
                            {period_html}
                            {tech_html}
                        </div>
                    </div>
                    {description_html}
                    {link_html}
                </div>
            """
        
        left_column_html += f"""
            <div class="resume-section">
                <div class="section-header">
                    <h2>Projects</h2>
                </div>
                <div class="section-content">
                    {projects_html}
                </div>
            </div>
        """
    
    if has_skills:
        skills_html = "".join([f"<div class='skill-tag'>{skill}</div>" for skill in resume['skills']])
        left_column_html += f"""
            <div class="resume-section">
                <div class="section-header">
                    <h2>Skills</h2>
                </div>
                <div class="section-content">
                    <div class="skills-container">
                        {skills_html}
                    </div>
                </div>
            </div>
        """
    
    # Generate right column HTML
    right_column_html = ""
    if has_education:
        education_html = ""
        for edu in resume['education']:
            period_html = f"<span class='date'>{edu['period']}</span>" if edu.get('period') else ""
            institution_html = f"<span class='institution'>{edu['institution']}</span>" if edu.get('institution') else ""
            description_html = f"""
                <div class="item-description">
                    <p>{edu['description']}</p>
                </div>
            """ if edu.get('description') else ""
            
            education_html += f"""
                <div class="education-item">
                    <div class="item-header">
                        <h3>{edu['degree']}</h3>
                        <div class="date-location">
                            {period_html}
                            {institution_html}
                        </div>
                    </div>
                    {description_html}
                </div>
            """
        
        right_column_html += f"""
            <div class="resume-section">
                <div class="section-header">
                    <h2>Education</h2>
                </div>
                <div class="section-content">
                    {education_html}
                </div>
            </div>
        """
    
    if has_certificates:
        certificates_html = ""
        for cert in resume['certificates']:
            date_html = f"<span class='date'>{cert['date']}</span>" if cert.get('date') else ""
            issuer_html = f"<span class='issuer'>{cert['issuer']}</span>" if cert.get('issuer') else ""
            
            link_html = ""
            if cert.get('credentialLink'):
                link_html = f"""
                    <div class="certificate-link">
                        <a href="{cert['credentialLink']}" target="_blank" rel="noopener noreferrer">
                            Verify Credential
                        </a>
                    </div>
                """
            
            certificates_html += f"""
                <div class="certificate-item">
                    <div class="item-header">
                        <h3>{cert['name']}</h3>
                        <div class="date-location">
                            {date_html}
                            {issuer_html}
                        </div>
                    </div>
                    {link_html}
                </div>
            """
        
        right_column_html += f"""
            <div class="resume-section">
                <div class="section-header">
                    <h2>Certifications</h2>
                </div>
                <div class="section-content">
                    {certificates_html}
                </div>
            </div>
        """
    
    if has_achievements:
        achievements_html = ""
        for achievement in resume['achievements']:
            date_html = f"<span class='date'>{achievement['date']}</span>" if achievement.get('date') else ""
            description_html = f"""
                <div class="item-description">
                    <p>{achievement['description']}</p>
                </div>
            """ if achievement.get('description') else ""
            
            achievements_html += f"""
                <div class="achievement-item">
                    <div class="item-header">
                        <h3>{achievement['title']}</h3>
                        {date_html}
                    </div>
                    {description_html}
                </div>
            """
        
        right_column_html += f"""
            <div class="resume-section">
                <div class="section-header">
                    <h2>Achievements</h2>
                </div>
                <div class="section-content">
                    {achievements_html}
                </div>
            </div>
        """
    
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{resume.get('version_name', 'Resume')}</title>
    <style>
        /* components/ResumePreview.css */
        .resume-preview {{
        display: flex;
        justify-content: center;
        }}

        .resume-a4-template {{
        background: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #2d3748;
        }}

        /* Header Section */
        .resume-header {{
        border-bottom: 2px solid #4361ee;
        padding-bottom: 1rem;
        margin-bottom: 1.5rem;
        }}

        .name-title {{
        text-align: center;
        margin-bottom: 0.75rem;
        }}

        .name-title h1 {{
        font-size: 28px;
        font-weight: 700;
        color: #2d3748;
        margin: 0 0 0.25rem 0;
        text-transform: uppercase;
        letter-spacing: 1px;
        }}

        .professional-title {{
        font-size: 16px;
        color: #4361ee;
        font-weight: 500;
        margin: 0;
        font-style: italic;
        }}

        .contact-info {{
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 14px;
        }}

        .contact-item {{
        display: flex;
        align-items: center;
        gap: 0.5rem;
        }}

        .contact-item i {{
        color: #4361ee;
        width: 16px;
        }}

        /* Content Sections */
        .resume-content {{
        padding-top: 0.5rem;
        display: block;
        }}

        .resume-content.two-columns {{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        }}

        .content-column {{
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        }}

        .resume-section {{
        page-break-inside: avoid;
        }}

        .section-header {{
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 0.5rem;
        }}

        .section-icon {{
        color: #4361ee;
        margin-right: 0.75rem;
        font-size: 16px;
        }}

        .section-header h2 {{
        font-size: 18px;
        font-weight: 600;
        color: #2d3748;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        }}

        .section-content {{
        padding-left: 1.75rem;
        }}
        /* Experience & Education Items */
        .experience-item,
        .education-item,
        .project-item,
        .certificate-item,
        .achievement-item {{
        margin-bottom: 1rem;
        page-break-inside: avoid;
        }}

        .item-header {{
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.25rem;
        }}

        .item-header h3 {{
        font-size: 16px;
        font-weight: 600;
        color: #2d3748;
        margin: 0;
        flex: 2;
        }}

        .date-location {{
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex: 1;
        font-size: 14px;
        text-align: right;
        }}

        .date {{
        color: #4361ee;
        font-weight: 500;
        }}

        .company,
        .institution,
        .technologies,
        .issuer {{
        color: #4a5568;
        font-style: italic;
        font-size: 13px;
        }}

        .item-description {{
        margin-top: 0.25rem;
        }}

        .item-description p {{
        margin: 0;
        font-size: 14px;
        color: #4a5568;
        text-align: justify;
        }}

        /* Project Links */
        .project-link,
        .certificate-link {{
        margin-top: 0.5rem;
        font-size: 13px;
        }}

        .project-link a,
        .certificate-link a {{
        color: #4361ee;
        text-decoration: none;
        }}

        .project-link a:hover,
        .certificate-link a:hover {{
        text-decoration: underline;
        }}

        .project-link i,
        .certificate-link i {{
        margin-right: 0.25rem;
        font-size: 12px;
        }}

        /* Skills Section */
        .skills-container {{
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        }}

        .skill-tag {{
        background: #e0e7ff;
        color: #4338ca;
        padding: 0.35rem 0.75rem;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 500;
        }}

        /* Links Section */
        .links-container {{
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        }}

        .link-item {{
        display: flex;
        align-items: center;
        gap: 0.5rem;
        }}

        .link-item a {{
        color: #4361ee;
        text-decoration: none;
        font-size: 14px;
        }}

        .link-item a:hover {{
        text-decoration: underline;
        }}

        .link-item i {{
        font-size: 12px;
        color: #4361ee;
        }}

        .links-inline a {{
        margin-left: 5px;
        text-decoration: none;
        color: #0073e6;
        }}

        .links-inline a:hover {{
        text-decoration: underline;
        }}

        .resume-a4-template {{
            width: 100%;
            min-height: auto;
        }}
        
        .resume-content.two-columns {{
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }}
        
        .item-header {{
            flex-direction: column;
            align-items: flex-start;
        }}
        
        .date-location {{
            align-items: flex-start;
            text-align: left;
            margin-top: 0.25rem;
        }}
        
        .contact-info {{
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }}
        
        /* Print Styles for PDF Export */
        @media print {{
        .resume-preview {{
            padding: 0;
            background: white;
        }}
        
        .resume-a4-template {{
            width: 100%;
            height: 100%;
            box-shadow: none;
            padding: 15mm;
            margin: 0;
        }}
        
        body, html {{
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
        }}
        
        .resume-content.two-columns {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }}
        
        /* Ensure no page breaks inside important elements */
        .resume-section,
        .experience-item,
        .education-item,
        .project-item,
        .certificate-item,
        .achievement-item {{
            page-break-inside: avoid;
        }}
        
        /* Control page breaks */
        .resume-section:not(:first-child) {{
            page-break-before: avoid;
        }}
        }}

        /* Responsive adjustments for screen display */
        @media screen and (max-width: 992px) {{
        .resume-a4-template {{
            width: 100%;
            min-height: auto;
        }}
        
        .resume-content.two-columns {{
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }}
        
        .item-header {{
            flex-direction: column;
            align-items: flex-start;
        }}
        
        .date-location {{
            align-items: flex-start;
            text-align: left;
            margin-top: 0.25rem;
        }}
        
        .contact-info {{
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
        }}
        }}

        /* Fine-tuning for better PDF output */
        @page {{
        size: A4;
        margin: 15mm;
        }}

        /* Text formatting utilities */
        .text-justify {{
        text-align: justify;
        }}

        /* Ensure good contrast for printing */
        @media print {{
        .resume-a4-template {{
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}
        
        .section-header h2,
        .item-header h3 {{
            color: #000 !important;
        }}
        
        .skill-tag {{
            background: #f0f0f0 !important;
            color: #000 !important;
            border: 1px solid #ccc;
        }}
        
        .contact-item i,
        .section-icon,
        .project-link i,
        .certificate-link i,
        .link-item i {{
            color: #000 !important;
        }}
        
        .professional-title {{
            color: #000 !important;
        }}
        
        .date {{
            color: #000 !important;
        }}
        
        .company,
        .institution,
        .technologies,
        .issuer {{
            color: #666 !important;
        }}
        
        .project-link a,
        .certificate-link a,
        .link-item a {{
            color: #000 !important;
            text-decoration: underline;
        }}
        }}
    </style>
</head>
<body>
    <div class="resume-preview">
        <div class="resume-a4-template">
            <div class="resume-header">
                <div class="name-title">
                    <h1>{resume['personal_info']['name']}</h1>
                    {resume['personal_info'].get('title') and f'<p class="professional-title">{resume["personal_info"]["title"]}</p>' or ''}
                </div>
                
                <div class="contact-info">
                    {contact_info_html}
                </div>
            </div>
            
            <div class="resume-content {'two-columns' if use_two_columns else ''}">
                <div class="content-column">
                    {left_column_html}
                </div>

                <div class="content-column">
                    {right_column_html}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    """

@router.get("/activities/recent", response_model=List[ActivityResponse])
async def get_recent_activities(
    current_user: UserInDB = Depends(get_current_active_user),
    limit: int = 10
):
    activity_collection = get_activity_collection()
    
    activities = await activity_collection.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Convert to response model
    return [ActivityResponse(
        id=str(activity["_id"]),
        user_id=str(activity["user_id"]),
        activity_type=activity["activity_type"],
        resume_id=str(activity.get("resume_id")) if activity.get("resume_id") else None,
        details=activity["details"],
        created_at=activity["created_at"]
    ) for activity in activities]