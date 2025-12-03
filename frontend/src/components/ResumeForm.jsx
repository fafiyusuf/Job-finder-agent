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
    <div className="form-section">
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "2rem"
      }}>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
          <ClipboardList className="w-5 h-5" />
          Extracted Resume Data
        </h3>
        <div className="flex gap-2">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              editMode 
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                : 'bg-primary-500 text-white hover:bg-primary-600'
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            onClick={resetForm}
          >
            <Trash2 className="w-4 h-4" />
            Reset
          </button>
          <button 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
            onClick={downloadJSON}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <div className="form-grid">
        {/* Personal Information Section */}
        <div className="form-section">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input 
                className="form-control"
                disabled={!editMode} 
                value={form.name} 
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                className="form-control"
                type="email"
                disabled={!editMode} 
                value={form.email} 
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="john.doe@email.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                className="form-control"
                disabled={!editMode} 
                value={form.phone} 
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                className="form-control"
                disabled={!editMode} 
                value={form.location} 
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="New York, NY"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>LinkedIn Profile</label>
              <input 
                className="form-control"
                disabled={!editMode} 
                value={form.linkedin} 
                onChange={(e) => updateField("linkedin", e.target.value)}
                placeholder="linkedin.com/in/johndoe"
              />
            </div>
            <div className="form-group">
              <label>Portfolio/Website</label>
              <input 
                className="form-control"
                disabled={!editMode} 
                value={form.website} 
                onChange={(e) => updateField("website", e.target.value)}
                placeholder="johndoe.dev"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="form-section">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FileText className="w-5 h-5" />
            Professional Summary
          </h3>
          <div className="form-group">
            <textarea 
              className="form-control"
              disabled={!editMode} 
              value={form.summary} 
              onChange={(e) => updateField("summary", e.target.value)}
              placeholder="Brief professional summary highlighting key achievements and career goals..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Skills Section */}
        <div className="form-section">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Rocket className="w-5 h-5" />
            Skills & Technologies
          </h3>
          
          {editMode && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input 
                className="form-control"
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={addSkill}>
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          )}
          
          {form.skills.length === 0 ? (
            <p style={{ color: "#718096", fontStyle: 'italic' }}>No skills detected. Add some skills above.</p>
          ) : (
            <div className="skills-container">
              {form.skills.map((skill, i) => (
                <div key={i} className={`skill-tag ${editMode ? 'editable' : ''}`}>
                  {skill}
                  {editMode && (
                      <X 
                        className="w-3 h-3"
                        onClick={() => removeSkill(i)}
                        style={{
                          cursor: 'pointer',
                          marginLeft: '0.5rem'
                        }}
                      />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experience Section */}
        <div className="form-section">
          <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Briefcase className="w-5 h-5" />
              Work Experience
            </span>
            {editMode && (
              <button className="btn btn-primary flex items-center gap-2" onClick={addExperience} style={{ fontSize: '0.9rem' }}>
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            )}
          </h3>
          
          {form.experience.length === 0 ? (
            <p style={{ color: "#718096", fontStyle: 'italic' }}>No work experience found.</p>
          ) : (
            <div>
              {form.experience.map((exp, i) => (
                <div key={i} className="experience-item">
                  <div className="experience-header">
                    <div style={{ flex: 1 }}>
                      {editMode ? (
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          <input 
                            className="form-control"
                            value={typeof exp === 'string' ? exp : exp.title || ''}
                            onChange={(e) => updateExperience(i, 'title', e.target.value)}
                            placeholder="Job Title"
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input 
                              className="form-control"
                              value={typeof exp === 'string' ? '' : exp.company || ''}
                              onChange={(e) => updateExperience(i, 'company', e.target.value)}
                              placeholder="Company Name"
                            />
                            <input 
                              className="form-control"
                              value={typeof exp === 'string' ? '' : exp.duration || ''}
                              onChange={(e) => updateExperience(i, 'duration', e.target.value)}
                              placeholder="Duration (e.g., Jan 2020 - Present)"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="experience-title">
                            {typeof exp === 'string' ? exp : exp.title || 'Position Title'}
                          </h4>
                          {typeof exp !== 'string' && (
                            <>
                              <p className="experience-company">{exp.company || 'Company Name'}</p>
                              <p className="experience-duration">{exp.duration || exp.dates || 'Duration'}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editMode && (
                      <button 
                        onClick={() => removeExperience(i)}
                        style={{
                          background: '#fed7d7',
                          color: '#e53e3e',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer'
                        }}
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
        <div className="form-section">
          <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <GraduationCap className="w-5 h-5" />
              Education
            </span>
            {editMode && (
              <button className="btn btn-primary flex items-center gap-2" onClick={addEducation} style={{ fontSize: '0.9rem' }}>
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            )}
          </h3>
          
          {form.education.length === 0 ? (
            <p style={{ color: "#718096", fontStyle: 'italic' }}>No education information found.</p>
          ) : (
            <div>
              {form.education.map((edu, i) => (
                <div key={i} className="education-item">
                  <div className="education-header">
                    <div style={{ flex: 1 }}>
                      {editMode ? (
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          <input 
                            className="form-control"
                            value={typeof edu === 'string' ? edu : edu.degree || ''}
                            onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                            placeholder="Degree"
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input 
                              className="form-control"
                              value={typeof edu === 'string' ? '' : edu.institution || ''}
                              onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                              placeholder="Institution"
                            />
                            <input 
                              className="form-control"
                              value={typeof edu === 'string' ? '' : edu.year || edu.dates || ''}
                              onChange={(e) => updateEducation(i, 'year', e.target.value)}
                              placeholder="Graduation Year"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="education-title">
                            {typeof edu === 'string' ? edu : edu.degree || 'Degree'}
                          </h4>
                          {typeof edu !== 'string' && (
                            <>
                              <p className="education-institution">{edu.institution || 'Institution'}</p>
                              <p className="education-duration">{edu.year || edu.dates || 'Year'}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editMode && (
                      <button 
                        onClick={() => removeEducation(i)}
                        style={{
                          background: '#fed7d7',
                          color: '#e53e3e',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer'
                        }}
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
