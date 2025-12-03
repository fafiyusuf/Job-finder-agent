import axios from "axios";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

function ResumeUpload({ onParsed }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    setError("");
    if (!file) return;
    
    // Support both PDF and DOCX
    if (!file.type.includes("pdf") && !file.type.includes("document")) {
      setError("Please upload a PDF or Word document.");
      return;
    }
    
    setFileName(file.name);
    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("/api/parse-resume", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const parsed = res.data?.parsed || res.data?.raw || {};
      onParsed(parsed);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    await handleFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    await handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const clearSelection = () => {
    setFileName("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center">
          {dragOver ? (
            <Upload className="w-12 h-12 text-blue-500 mb-3 animate-bounce" />
          ) : (
            <FileText className="w-12 h-12 text-gray-400 mb-3" />
          )}
          
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            {dragOver ? 'Drop your resume here' : 'Drag & drop your resume or click to browse'}
          </h4>
          
          <p className="text-gray-500 mb-6">
            Supports PDF and Word documents
          </p>
          
          {fileName && (
            <div className="w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium text-sm">{fileName}</span>
              </div>
              <button 
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Resume...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {fileName ? 'Parse Resume' : 'Choose File'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
