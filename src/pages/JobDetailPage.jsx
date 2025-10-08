import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Building2, ArrowLeft, Send } from 'lucide-react';
import { jobsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ResumeUpload from '../components/ResumeUpload';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobsAPI.getById(id);
      setJob(response.data);
      // questions feature removed
    } catch (err) {
      setError('Failed to load job details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      alert('Please upload your resume');
      return;
    }

    try {
      setApplying(true);
      const formData = new FormData();
      formData.append('jobId', id);
      formData.append('resume', resumeFile);

      // collect answers into an array and append as JSON string
      const answersArray = Object.keys(answers).map((qId) => ({ questionId: qId, response: answers[qId] }));
      if (answersArray.length > 0) {
        formData.append('answersJson', JSON.stringify(answersArray));
      }

      await applicationsAPI.apply(id, formData);
      setApplicationSuccess(true);
      setResumeFile(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Not Found</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{job.title}</h1>

              <div className="flex flex-wrap gap-4 text-slate-600 mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span>{job.employerName || 'Company'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Posted on {formatDate(job.postedDate)}</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {isCandidate && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                {applicationSuccess ? (
                  <div className="text-center py-8">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Application Submitted!
                    </h3>
                    <p className="text-slate-600 mb-6">
                      Your application has been sent to the employer.
                    </p>
                    <button
                      onClick={() => navigate('/jobs')}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Browse More Jobs
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply}>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Apply for this job</h3>

                    <ResumeUpload onFileSelect={setResumeFile} selectedFile={resumeFile} />

                    {/* questions feature removed */}

                    <button
                      type="submit"
                      disabled={applying || !resumeFile}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {!isCandidate && user && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-sm text-blue-900">
                  You are viewing this as an employer. Only candidates can apply for jobs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
