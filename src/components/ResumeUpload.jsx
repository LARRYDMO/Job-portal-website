import { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

export default function ResumeUpload({ onFileSelect, selectedFile }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelect(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Upload Resume (PDF) *
      </label>

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 transition ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 bg-slate-50 hover:border-blue-400'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Drop your resume here or click to browse
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF files only, max 5MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-slate-300 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 hover:bg-slate-100 rounded transition"
              >
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
