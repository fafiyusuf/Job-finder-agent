import { Brain, CheckCircle, FileText, Sparkles, Upload, User } from 'lucide-react';
import { useState } from 'react';
import JobChat from './JobChat';
import ResumeForm from './ResumeForm';
import ResumeUpload from './ResumeUpload';

function MainUI() {
  const [parsedData, setParsedData] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const skillsForChat = parsedData?.skills || [];

  const handleParsed = (data) => {
    setParsedData(data);
    setUploadSuccess(true);
    // Auto-hide success message after 3 seconds
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight flex items-center justify-center gap-3">
            <Brain className="w-10 h-10" />
            AI Resume Parser
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Upload your resume, extract key information, and discover matching job opportunities
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center mb-4">
            <Upload className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Upload Your Resume</h2>
          </div>
          <ResumeUpload onParsed={handleParsed} />
          
          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg animate-pulse">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700 font-medium">
                  Resume parsed successfully! Review and edit the extracted information below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Section - Always visible after upload */}
        {parsedData && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Extracted Resume Data</h2>
            </div>
            <ResumeForm data={parsedData} />
          </div>
        )}

        {/* Job Search Section */}
        {parsedData && (
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-7 h-7 text-purple-600" />
                Find Your Next Opportunity
              </h3>
              <p className="text-gray-600 text-lg">
                Our AI agent will search for jobs that match your skills and experience
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">
                  {skillsForChat.length} skills detected
                </span>
              </div>
              <JobChat skills={skillsForChat} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainUI;