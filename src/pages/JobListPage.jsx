import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase } from 'lucide-react';
import JobCard from '../components/JobCard';
import { jobsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    workMode: '',
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    // Fetch on mount and whenever the current page changes
    fetchJobs();
  }, [filters.page]);

  const fetchJobs = async (overrideFilters = null) => {
    const activeFilters = overrideFilters || filters;
    try {
      setLoading(true);
      setError('');
      const response = await jobsAPI.getAll(activeFilters);
      // API returns { total, page, pageSize, data }
      setJobs(response.data.data || response.data);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when performing a new search
    const reset = { ...filters, page: 1 };
    setFilters(reset);
    fetchJobs(reset);
  };

  const handleFilterChange = (e) => {
    const updated = {
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    };
    setFilters(updated);
    fetchJobs(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Find Your Dream Job</h1>
          </div>
          <p className="text-blue-100 text-lg">
            {user?.name ? `Welcome back, ${user.name}` : 'Discover opportunities that match your skills'}
          </p>

          <form onSubmit={handleSearch} className="mt-8 bg-white rounded-xl p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Job title or keyword"
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-500"
                />
              </div>

              <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                <MapPin className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Location"
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-500"
                />
              </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg">
                  <select name="jobType" value={filters.jobType} onChange={handleFilterChange} className="px-3 py-2 bg-transparent border-none outline-none text-slate-900">
                    <option value="">All types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                  <select name="workMode" value={filters.workMode} onChange={handleFilterChange} className="px-3 py-2 bg-transparent border-none outline-none text-slate-900">
                    <option value="">All modes</option>
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition"
              >
                Search Jobs
              </button>
            </div>
          </form>
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
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Available
              </h2>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {total > filters.pageSize && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <button disabled={filters.page === 1} onClick={() => setFilters(f => ({...f, page: f.page - 1}))} className="px-4 py-2 bg-slate-100 rounded">Previous</button>
                <span className="text-sm text-slate-600">Page {filters.page}</span>
                <button disabled={filters.page * filters.pageSize >= total} onClick={() => setFilters(f => ({...f, page: f.page + 1}))} className="px-4 py-2 bg-slate-100 rounded">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
