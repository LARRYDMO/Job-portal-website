import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { savedJobsAPI } from '../services/api';
import JobCard from '../components/JobCard';

export default function SavedJobs() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSaved(); }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await savedJobsAPI.mine();
      // API returns list of { Id, job, savedAt }
      setSaved((res.data || []).map(s => ({ ...s.job, savedAt: s.savedAt })));
    } catch (err) {
      console.error('Failed to load saved jobs', err);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
      {loading ? (
        <div>Loading...</div>
      ) : saved.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">You haven't saved any jobs yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {saved.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
