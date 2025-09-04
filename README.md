# ResumeCraft - Professional Resume Builder Platform

## Overview
ResumeCraft is a full-stack web application that enables users to create, customize, and download professional resumes. Built with **React.js** for the frontend and **FastAPI** for the backend, it provides an intuitive interface for building resumes with real-time preview and PDF export capabilities.

---

## Features
- **User Authentication**: Secure registration and login system  
- **Resume Builder**: Interactive form with multiple sections (Personal, Experience, Education, Projects, etc.)  
- **Real-time Preview**: Live preview of your resume as you build it  
- **PDF Export**: Download your resume as a professional PDF document  
- **Multiple Templates**: Support for different resume layouts  
- **Version Management**: Save and manage multiple resume versions  
- **Dashboard**: User dashboard to manage all resumes and view activity  
- **Responsive Design**: Works seamlessly on desktop and mobile devices  

---

## Technology Stack

### Frontend
- React.js - Component-based UI library  
- React Router - Client-side routing  
- HTML2PDF.js - PDF generation from HTML  
- CSS3 - Custom styling with responsive design  
- Font Awesome - Icons  

### Backend
- FastAPI - Modern Python web framework  
- MongoDB - NoSQL database with Motor async driver  
- JWT - JSON Web Tokens for authentication  
- PDFKit - Server-side PDF generation  
- WKHTMLTOPDF - HTML to PDF conversion engine  

---

## Project Structure
```bash
resume-craft/
├── frontend/ # React.js application
│ ├── public/
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── contexts/ # React contexts (Auth)
│ │ ├── services/ # API services
│ │ └── App.js # Main application component
│ ├── package.json
│ └── README.md
├── backend/ # FastAPI application
│ ├── models/ # Pydantic models
│ ├── routes/ # API routes
│ ├── utils/ # Utility functions
│ ├── main.py # FastAPI application entry point
│ └── requirements.txt
└── README.md
```


---

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)  
- Python (v3.8 or higher)  
- MongoDB (local or Atlas)  
- WKHTMLTOPDF (for PDF generation)  

### Frontend Setup
```bash
cd frontend
npm install

Create a .env file:
REACT_APP_API_BASE_URL=http://localhost:8000

Start the development server:
npm start

Frontend available at: http://localhost:3000

Backend Setup
cd backend
python -m venv venv

Activate virtual environment:
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

Install dependencies:
pip install -r requirements.txt

Create a .env file:
MONGODB_URI=mongodb://localhost:27017/resume_platform
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

Install WKHTMLTOPDF:
# On Ubuntu/Debian
sudo apt-get install wkhtmltopdf

# On macOS
brew install wkhtmltopdf

# On Windows: Download from https://wkhtmltopdf.org/downloads.html

Start FastAPI server:
uvicorn main:app --reload --host 0.0.0.0 --port 8000

Backend available at: http://localhost:8000

Docs: http://localhost:8000/docs
```

---

# API Endpoints
## Authentication

POST /api/auth/register - Register user

POST /api/auth/login - Login user

GET /api/auth/me - Get current user

## Resumes

GET /api/resumes/ - Get all user resumes

POST /api/resumes/ - Create a new resume

GET /api/resumes/{resume_id} - Get specific resume

PUT /api/resumes/{resume_id} - Update resume

DELETE /api/resumes/{resume_id} - Delete resume

GET /api/resumes/{resume_id}/download - Download resume as PDF

GET /api/resumes/activities/recent - Get recent activities

## Users

GET /api/users/{user_id} - Get user profile

PUT /api/users/{user_id} - Update user profile

# Database Schema
## Users Collection

```bash
{
  "_id": ObjectId,
  "full_name": String,
  "email": String,
  "hashed_password": String,
  "created_at": DateTime,
  "updated_at": DateTime
}
```

## Resumes Collection
```bash
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "version_name": String,
  "personal_info": { ... },
  "experience": [ ... ],
  "education": [ ... ],
  "skills": [String],
  "projects": [ ... ],
  "certificates": [ ... ],
  "achievements": [ ... ],
  "links": [ ... ],
  "created_at": DateTime,
  "updated_at": DateTime
}
```

## Activities Collection
```bash
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "resume_id": ObjectId,
  "activity_type": String, // "created", "updated", "deleted", "downloaded"
  "details": String,
  "created_at": DateTime
}
```

## Key Components
### Frontend
App.js - Main application component
Navbar.js - Navigation bar
Hero.js - Landing page
ResumeBuilder.js - Resume builder interface
ResumeForm.js - Resume form
ResumePreview.js - Resume preview
AuthModal.js - Authentication modal
Dashboard.js - User dashboard
ProtectedRoute.js - Route protection
AuthContext.js - Authentication context

### Backend
auth.py - Authentication endpoints
resume.py - Resume management endpoints
user.py - User profile endpoints

## Usage
### Creating a Resume
Sign up/Login
Click Get Started
Fill resume sections
Preview in real-time
Save resume
Download PDF

### Managing Resumes
Dashboard to view resumes
Version control support
Activity tracking
Export as PDF

---

## Customization
### Adding New Resume Sections
Update ResumeForm
Modify ResumePreview
Update backend model
Adjust PDF template

### Styling Changes

Global: App.css
Component-specific: ResumeForm.css, ResumePreview.css

### PDF Template
Modify generate_resume_html in resume.py

---

## Deployment
### Frontend (Netlify/Vercel)
```bash
npm run build
```

Deploy the build/ folder.

### Backend (Heroku/Railway)
Set environment variables
Install WKHTMLTOPDF on server
Deploy backend code

### Database
Use MongoDB Atlas or local MongoDB

---

## Troubleshooting
### Common Issues

PDF Generation Fails → Ensure WKHTMLTOPDF installed

Auth Errors → Check JWT secret key

DB Issues → Verify MongoDB URI

CORS Errors → Allow frontend URL in backend

### Debugging

Frontend: React Dev Tools, browser console

Backend: FastAPI /docs, server logs

---

## Contributing

Fork the repo

Create branch (git checkout -b feature/amazing-feature)

Commit changes (git commit -m 'Add amazing feature')

Push (git push origin feature/amazing-feature)

Open Pull Request

---

## Support

Open an issue on GitHub

Contact the dev team

---

## Future Enhancements

More resume templates

AI-powered resume suggestions

Cover letter generator

Job application tracking

Job board integration

Multi-language support

Team collaboration

# ⚠️ Note: This project is for demo purposes. For production, implement proper security for authentication and data storage.


Would you like me to also include **badges (build status, license, tech stack)** at the top of the README so it looks more professional?
