import { useState, useEffect } from 'react';
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
import { Plus, Edit, Trash2, Users, Briefcase, FileText } from 'lucide-react';
import { jobsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobForm from '../components/JobForm';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll();
      // Jobs may be seeded without EmployerId; fall back to matching employerName so older jobs are visible to the creator
      const myJobs = response.data.filter((job) => {
        try {
          return (job.employerId && job.employerId === user.id) || job.employerName === user.name;
        } catch (e) {
          return job.employerName === user.name;
        }
      });
      setJobs(myJobs);
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      setLoadingApplicants(true);
      const response = await applicationsAPI.getByJob(jobId);
      setApplicants(response.data);
      setSelectedJobId(jobId);
    } catch (err) {
      console.error('Failed to load applicants', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      const res = await jobsAPI.create(jobData);
      setShowJobForm(false);
      await fetchJobs();
      // return the created job response so JobForm can post questions
      return res;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateJob = async (jobData) => {
    try {
      const res = await jobsAPI.update(editingJob.id, jobData);
      setEditingJob(null);
      setShowJobForm(false);
      await fetchJobs();
      return res;
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await jobsAPI.delete(jobId);
      fetchJobs();
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
        setApplicants([]);
      }
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleCancelForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Employer Dashboard</h1>
          <p className="text-blue-100 text-lg">Manage your job postings and applications</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">My Job Postings</h2>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setShowJobForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Post New Job
              </button>
            </div>

            {showJobForm && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">
                  {editingJob ? 'Edit Job' : 'Post New Job'}
                </h3>
                <JobForm
                  initialData={editingJob}
                  onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
                  onCancel={handleCancelForm}
                />
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs posted yet</h3>
                <p className="text-slate-600">Create your first job posting to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className={`bg-white rounded-xl border p-6 transition ${
                      selectedJobId === job.id
                        ? 'border-blue-400 shadow-md'
                        : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{job.title}</h3>
                        <p className="text-sm text-slate-600">{job.location}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Posted {formatDate(job.postedDate)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => fetchApplicants(job.id)}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                    >
                      <Users className="w-4 h-4" />
                      View Applicants ({job.applicantCount || 0})
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Applicants</h2>

            {!selectedJobId ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Select a job to view applicants</p>
              </div>
            ) : loadingApplicants ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : applicants.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No applicants yet</h3>
                <p className="text-slate-600">Applications will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{applicant.candidateName}</h3>
                        <p className="text-sm text-slate-600">{applicant.candidateEmail}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        New
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <FileText className="w-4 h-4" />
                      <span>Applied {formatDate(applicant.appliedDate)}</span>
                    </div>

                    {applicant.resumePath && (
                      <a
                        href={(applicant.resumePath || '').startsWith('http') ? applicant.resumePath : `${API_ORIGIN}/uploads/${applicant.resumePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        View Resume
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
