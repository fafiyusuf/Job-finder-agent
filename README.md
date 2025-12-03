# 🤖 AI Resume Parser & Job Hunter

An intelligent resume parsing and job recommendation system powered by AI. Upload your resume, extract key information automatically, and get personalized job recommendations using advanced search tools.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)

## ✨ Features

### 📄 Part 1: Resume Parser (Structured Output)
- **Smart PDF Parsing**: Upload PDF resumes with automatic text extraction
- **AI-Powered Extraction**: Uses Google Gemini AI to extract structured data:
  - Personal Information (Name, Email, Phone, Location, LinkedIn, Website)
  - Professional Summary
  - Skills & Technologies
  - Work Experience with dates and descriptions
  - Education details
- **Editable Forms**: Review and edit extracted information
- **Export Capability**: Download parsed data as JSON

### 🎯 Part 2: Job Hunter (Tool Use)
- **Auto Job Suggestions**: Automatically suggests jobs when chat opens based on resume
- **Intelligent Search**: Uses Tavily Search API with site-specific filters
  - LinkedIn Jobs
  - Indeed
  - Glassdoor
- **Skill Matching**: Ranks jobs based on your resume skills
- **Interactive Chat**: Refine search with preferences (location, remote, role)
- **Real-time Results**: Get instant job recommendations with match scores

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- API Keys:
  - [Google Gemini API Key](https://makersuite.google.com/app/apikey)
  - [Tavily API Key](https://tavily.com/)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/fafiyusuf/Job-finder-agent.git
cd Job-finder-agent
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Tavily Search API
TAVILY_API_KEY=your_tavily_api_key_here
TAVILY_API_URL=https://api.tavily.com/search
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start
```
Backend runs on `http://localhost:5000`

2. **Start the Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173` (or 5174 if 5173 is in use)

3. **Open in Browser**
Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📁 Project Structure

```
Job-finder-agent/
├── backend/
│   ├── agents/
│   │   └── jobAgent.js          # Job search agent with Tavily integration
│   ├── parser/
│   │   └── extractText.js       # PDF text extraction utilities
│   ├── server.js                # Express server & API endpoints
│   ├── package.json
│   └── .env                     # Environment variables (not in git)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── MainUI.jsx       # Main application layout
    │   │   ├── ResumeUpload.jsx # Drag & drop resume upload
    │   │   ├── ResumeForm.jsx   # Extracted data form
    │   │   └── JobChat.jsx      # Job hunter chatbot
    │   ├── App.jsx              # Root component
    │   ├── index.css            # Global styles
    │   └── main.jsx             # Entry point
    ├── package.json
    └── vite.config.js           # Vite configuration
```

## 🔧 API Endpoints

### POST `/parse-resume`
Upload and parse a resume file.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF)

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1-234-567-8900",
  "location": "New York, NY",
  "linkedin": "linkedin.com/in/johndoe",
  "website": "johndoe.dev",
  "summary": "Experienced software engineer...",
  "skills": ["Python", "React", "Node.js"],
  "experience": [...],
  "education": [...]
}
```

### POST `/chat`
Chat with the job hunter agent.

**Request:**
```json
{
  "message": "Find software engineer jobs",
  "skills": ["Python", "React", "Node.js"],
  "preferences": {
    "location": "Remote",
    "remote": true,
    "title": "Software Engineer"
  }
}
```

**Response:**
```json
{
  "reply": "I found 5 job opportunities that match your skills:\n\n..."
}
```

## 🛠️ Technologies Used

### Backend
- **Node.js & Express**: Server framework
- **Google Generative AI (Gemini)**: LLM for resume parsing
- **Tavily API**: Job search tool
- **pdf-parse**: PDF text extraction
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Axios**: HTTP client
- **Lucide React**: Icon library
- **CSS3**: Modern styling

## 🎨 Features in Detail

### Resume Parser
1. **Upload**: Drag & drop or click to browse PDF files
2. **Extract**: AI analyzes and extracts structured data
3. **Review**: Edit extracted information in comprehensive form
4. **Manage**: Add/remove skills, experience, education
5. **Export**: Download as JSON for other applications

### Job Hunter Agent
1. **Auto-Suggest**: Opens with immediate job recommendations
2. **Smart Search**: Finds jobs matching your skills
3. **Skill Ranking**: Shows how many skills match each job
4. **Preferences**: Filter by location, remote work, job title
5. **Interactive**: Ask for more specific roles or adjustments

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep API keys secure and rotate them regularly
- The backend `.gitignore` excludes sensitive files
- Validate all file uploads on the server side

## 🐛 Troubleshooting

### PDF Parsing Issues
- Ensure PDFs are text-based (not scanned images)
- Try resaving the PDF if extraction fails
- Check that file size is reasonable (< 10MB recommended)

### API Errors
- Verify API keys are correct in `.env`
- Check API key quotas and limits
- Ensure backend server is running before frontend

### Port Conflicts
- Backend uses port 5000 (configurable in `.env`)
- Frontend uses port 5173 or next available
- Update `vite.config.js` proxy if backend port changes

## 📝 TODO / Roadmap

- [ ] Add DOCX (Word document) support
- [ ] Implement file type validation
- [ ] Add success/error toast notifications
- [ ] Improve job result formatting with company logos
- [ ] Add job bookmarking feature
- [ ] Implement job application tracking
- [ ] Add resume template generation
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Fetiya Yusuf**
- GitHub: [@fafiyusuf](https://github.com/fafiyusuf)

## 🙏 Acknowledgments

- Google Gemini AI for structured data extraction
- Tavily for powerful job search capabilities
- React and Node.js communities for excellent tools

---

⭐ Star this repo if you find it helpful!
