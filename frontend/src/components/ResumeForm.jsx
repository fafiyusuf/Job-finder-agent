import {
  Briefcase,
  ClipboardList,
  Download,
  Edit,
  Eye,
  FileText,
  GraduationCap,
  Plus,
  Rocket,
  Trash2,
  User,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

function ResumeForm({ data }) {
  const [form, setForm] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    
    // Professional Summary
    summary: "",
    
    // Skills
    skills: [],
    
    // Experience
    experience: [],
    
    // Education
    education: [],
    
    // Additional sections
    certifications: [],
    languages: [],
    projects: []
  });

  const [editMode, setEditMode] = useState(true);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        linkedin: data.linkedin || "",
        website: data.website || "",
        summary: data.summary || "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        languages: Array.isArray(data.languages) ? data.languages : [],
        projects: Array.isArray(data.projects) ? data.projects : []
      });
    }
  }, [data]);

  const updateField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  
  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      updateField("skills", [...form.skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    const newSkills = form.skills.filter((_, i) => i !== index);
    updateField("skills", newSkills);
  };

  const addExperience = () => {
    const newExp = {
      title: "",
      company: "",
      duration: "",
      location: "",
      responsibilities: []
    };
    updateField("experience", [...form.experience, newExp]);
  };

  const updateExperience = (index, field, value) => {
    const newExperience = [...form.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    updateField("experience", newExperience);
  };

  const removeExperience = (index) => {
    const newExperience = form.experience.filter((_, i) => i !== index);
    updateField("experience", newExperience);
  };

  const addEducation = () => {
    const newEdu = {
      degree: "",
      institution: "",
      year: "",
      location: "",
      gpa: ""
    };
    updateField("education", [...form.education, newEdu]);
  };

  const updateEducation = (index, field, value) => {
    const newEducation = [...form.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    updateField("education", newEducation);
  };

  const removeEducation = (index) => {
    const newEducation = form.education.filter((_, i) => i !== index);
    updateField("education", newEducation);
  };

  const resetForm = () => {
    setForm({
      name: "", email: "", phone: "", location: "", linkedin: "", website: "",
      summary: "", skills: [], education: [], experience: [], 
      certifications: [], languages: [], projects: []
    });
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(form, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'resume_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <ClipboardList className="w-6 h-6 text-primary-500" />
          Extracted Resume Data
        </h3>
        <div className="flex flex-wrap gap-2">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
              editMode 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md'
            }`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <>
                <Eye className="w-4 h-4" />
                View Mode
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit Mode
              </>
            )}
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all transform hover:scale-105"
            onClick={resetForm}
          >
            <Trash2 className="w-4 h-4" />
            Reset
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-all transform hover:scale-105 shadow-md"
            onClick={downloadJSON}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input 
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!editMode} 
                value={form.name} 
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input 
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-500"
                type="email"
                disabled={!editMode} 
                value={form.email} 
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="john.doe@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!editMode} 
                value={form.phone} 
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input 
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!editMode} 
                value={form.location} 
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="New York, NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">LinkedIn Profile</label>
              <input 
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!editMode} 
                value={form.linkedin} 
                onChange={(e) => updateField("linkedin", e.target.value)}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Portfolio/Website</label>
              <input 
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-500"
                disabled={!editMode} 
                value={form.website} 
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="johndoe.dev"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            Professional Summary
          </h3>
          <div className="flex flex-col gap-2">
            <textarea 
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-50 disabled:text-gray-500 resize-y"
              disabled={!editMode} 
              value={form.summary} 
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Brief professional summary highlighting key achievements and career goals..."
              rows={4}
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <Rocket className="w-5 h-5 text-purple-600" />
            Skills & Technologies
          </h3>
          
          {editMode && (
            <div className="flex gap-2 mb-4">
              <input 
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <button 
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                onClick={addSkill}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
          
          {form.skills.length === 0 ? (
            <p className="text-gray-500 italic">No skills detected. Add some skills above.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {form.skills.map((skill, i) => (
                <div 
                  key={i} 
                  className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  {skill}
                  {editMode && (
                    <button
                      onClick={() => removeSkill(i)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experience Section */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Briefcase className="w-5 h-5 text-orange-600" />
              Work Experience
            </h3>
            {editMode && (
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                onClick={addExperience}
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            )}
          </div>
          
          {form.experience.length === 0 ? (
            <p className="text-gray-500 italic">No work experience found.</p>
          ) : (
            <div className="space-y-4">
              {form.experience.map((exp, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      {editMode ? (
                        <div className="space-y-3">
                          <input 
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            value={typeof exp === 'string' ? exp : exp.title || ''}
                            onChange={(e) => updateExperience(i, 'title', e.target.value)}
                            placeholder="Job Title"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                              value={typeof exp === 'string' ? '' : exp.company || ''}
                              onChange={(e) => updateExperience(i, 'company', e.target.value)}
                              placeholder="Company Name"
                            />
                            <input 
                              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                              value={typeof exp === 'string' ? '' : exp.duration || ''}
                              onChange={(e) => updateExperience(i, 'duration', e.target.value)}
                              placeholder="Duration (e.g., Jan 2020 - Present)"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-base font-semibold text-gray-800 mb-1">
                            {typeof exp === 'string' ? exp : exp.title || 'Position Title'}
                          </h4>
                          {typeof exp !== 'string' && (
                            <>
                              <p className="text-gray-600 mb-1">{exp.company || 'Company Name'}</p>
                              <p className="text-gray-500 text-sm">{exp.duration || exp.dates || 'Duration'}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editMode && (
                      <button 
                        onClick={() => removeExperience(i)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium h-fit"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 p-6 rounded-xl border border-cyan-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <GraduationCap className="w-5 h-5 text-cyan-600" />
              Education
            </h3>
            {editMode && (
              <button 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                onClick={addEducation}
              >
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            )}
          </div>
          
          {form.education.length === 0 ? (
            <p className="text-gray-500 italic">No education information found.</p>
          ) : (
            <div className="space-y-4">
              {form.education.map((edu, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      {editMode ? (
                        <div className="space-y-3">
                          <input 
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            value={typeof edu === 'string' ? edu : edu.degree || ''}
                            onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                            placeholder="Degree"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input 
                              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                              value={typeof edu === 'string' ? '' : edu.institution || ''}
                              onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                              placeholder="Institution"
                            />
                            <input 
                              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-base transition-all focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                              value={typeof edu === 'string' ? '' : edu.year || edu.dates || ''}
                              onChange={(e) => updateEducation(i, 'year', e.target.value)}
                              placeholder="Graduation Year"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-base font-semibold text-gray-800 mb-1">
                            {typeof edu === 'string' ? edu : edu.degree || 'Degree'}
                          </h4>
                          {typeof edu !== 'string' && (
                            <>
                              <p className="text-gray-600 mb-1">{edu.institution || 'Institution'}</p>
                              <p className="text-gray-500 text-sm">{edu.year || edu.dates || 'Year'}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editMode && (
                      <button 
                        onClick={() => removeEducation(i)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium h-fit"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeForm;
