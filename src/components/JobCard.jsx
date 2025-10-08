import { MapPin, Calendar, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JobCard({ job }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Building2 className="w-4 h-4" />
            <span>{job.employerName || 'Company'}</span>
          </div>
        </div>
      </div>

      <p className="text-slate-600 mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(job.postedDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            {job.salaryRange && <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{job.salaryRange}</span>}
            {job.jobType && <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{job.jobType}</span>}
            {job.workMode && <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{job.workMode}</span>}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/jobs/${job.id}`);
          }}
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}
