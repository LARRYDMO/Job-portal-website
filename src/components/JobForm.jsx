import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { jobsAPI } from '../services/api';

export default function JobForm({ initialData = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    salaryRange: initialData?.salaryRange || '',
    jobType: initialData?.jobType || 'Full-time',
    workMode: initialData?.workMode || 'Onsite',
    skills: initialData?.skills || '',
  });
  // questions feature removed
  const [savedJobId, setSavedJobId] = useState(initialData?.id || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setSavedJobId(initialData.id || null);
      setFormData((prev) => ({
        ...prev,
        title: initialData.title || prev.title,
        description: initialData.description || prev.description,
        location: initialData.location || prev.location,
      }));
    }
  }, [initialData]);

  // common questions removed

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const created = await onSubmit(formData);
      const jobId = created?.data?.id || created?.id;
      if (jobId) setSavedJobId(jobId);

      if (jobId && questions && questions.length > 0) {
        const failures = [];
        for (const q of questions) {
          if (q.id) continue;
          try {
            await jobsAPI.createQuestion(jobId, q);
          } catch (err) {
            failures.push({ q, error: err.response?.data || err.message });
          }
        }

        if (failures.length > 0) {
          setError(`Failed to save ${failures.length} question(s). Please check your permissions and try again.`);
          console.error('Question save failures', failures);
          throw new Error('Failed to save some questions');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  // question actions removed

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">Job Title *</label>
        <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="e.g. Senior Software Engineer" />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
        <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} required className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="e.g. New York, NY or Remote" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="salaryRange" className="block text-sm font-medium text-slate-700 mb-2">Salary Range</label>
          <input id="salaryRange" name="salaryRange" type="text" value={formData.salaryRange} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="e.g. $70k - $100k" />
        </div>

        <div>
          <label htmlFor="jobType" className="block text-sm font-medium text-slate-700 mb-2">Job Type</label>
          <select id="jobType" name="jobType" value={formData.jobType} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
        </div>

        <div>
          <label htmlFor="workMode" className="block text-sm font-medium text-slate-700 mb-2">Work Mode</label>
          <select id="workMode" name="workMode" value={formData.workMode} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg">
            <option>Onsite</option>
            <option>Remote</option>
            <option>Hybrid</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-2">Skills / Tags</label>
        <input id="skills" name="skills" type="text" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="e.g. React, Node.js, SQL (comma separated)" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Job Description *</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={8} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none" placeholder="Describe the role, responsibilities, requirements, and qualifications..." />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Save className="w-5 h-5" />{loading ? 'Saving...' : initialData ? 'Update Job' : 'Post Job'}</button>
        {onCancel && (<button type="button" onClick={onCancel} className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition flex items-center gap-2"><X className="w-5 h-5" />Cancel</button>)}
      </div>

      {/* questions feature removed */}
    </form>
  );
}
