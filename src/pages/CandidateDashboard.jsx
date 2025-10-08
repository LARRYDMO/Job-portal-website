import { useState, useEffect } from 'react';
import { FileText, Calendar, Building2, MapPin } from 'lucide-react';
import { applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CandidateDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getMyApplications();
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">My Applications</h1>
          <p className="text-blue-100 text-lg">
            Track your job applications and their status
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications yet</h3>
            <p className="text-slate-600 mb-6">Start applying to jobs to see them here</p>
            <a
              href="/jobs"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Browse Jobs
            </a>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
              </h2>
            </div>

            <div className="grid gap-6">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {application.jobTitle}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          <span>{application.employerName || 'Company'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{application.jobLocation}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Applied {formatDate(application.appliedDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">Resume submitted</span>
                    </div>
                    {(() => {
                      const raw = (application.status || 'InReview') + '';
                      const st = raw.toString().trim().toLowerCase();
                      const text = st === 'accepted' ? 'Accepted' : st === 'rejected' ? 'Rejected' : (st === 'inreview' || st === 'applied' ? 'Under Review' : application.status);
                      const bg = st === 'accepted' ? 'bg-emerald-100 text-emerald-700' : st === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700';
                      return (
                        <span className={`px-3 py-1 ${bg} text-sm font-medium rounded-full`}>
                          {text}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
