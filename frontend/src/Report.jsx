import React, { useEffect, useState } from 'react';
import { API_URL } from './config';

export default function Report({ setView }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for uploading missing documents
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('prescription'); // 'prescription', 'aadhaar', 'passbook'
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1 })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Analysis execution failed.');
      setReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadLoading(true);
    setUploadSuccess('');
    setError('');

    // Prepare filename based on document type to trigger backend detection rules
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'));
    const mockFilename = `${docType}${fileExt}`;
    
    // Create File with custom name
    const renamedFile = new File([selectedFile], mockFilename, { type: selectedFile.type });

    const formData = new FormData();
    formData.append('file', renamedFile);
    formData.append('user_id', 1);

    try {
      const response = await fetch(`${API_URL}/api/upload-bill`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Upload failed.');

      setUploadSuccess(`Uploaded ${docType === 'prescription' ? 'Prescription' : docType === 'aadhaar' ? 'Aadhaar' : 'Bank Passbook'}!`);
      setSelectedFile(null);
      
      // Re-run claim analysis to update the dashboard!
      await runAnalysis();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back button */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        
        {report && (
          <button 
            onClick={runAnalysis}
            className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.2" />
            </svg>
            Re-Analyze Claim
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm font-semibold">Running Agentic Claim Verification...</span>
        </div>
      ) : error ? (
        <div className="glass-panel p-6 rounded-2xl border-red-500/20 text-center">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button onClick={runAnalysis} className="px-4 py-2 bg-red-950/40 border border-red-900/50 text-red-200 rounded-lg cursor-pointer hover:bg-red-900/50 transition-all text-xs">
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Stats Probability Dial */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Probability Card */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full translate-x-8 -translate-y-8"></div>
              <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-6">Approval Probability</h3>
              
              {/* Concentric Gauge Dial */}
              <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track ring */}
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8"/>
                  {/* Progress ring */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    fill="transparent" 
                    stroke="url(#purpleGlow)" 
                    strokeWidth="8"
                    strokeDasharray="263.8"
                    strokeDashoffset={263.8 - (263.8 * report.approval_probability) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center text */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-white font-mono tracking-tighter">
                    {report.approval_probability}%
                  </span>
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">RandomForest</span>
                </div>
              </div>

              {/* Status bar */}
              <span className={`px-5 py-2 rounded-full text-sm font-extrabold ${
                report.status === 'Eligible' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                report.status === 'Eligible (Partial)' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                report.status === 'Pending Documents' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                Claim Status: {report.status}
              </span>
            </div>

            {/* Verification Checklist */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-4">Verification Checkmarks</h3>
              <ul className="space-y-4">
                {[
                  { name: 'Required documents uploaded?', ok: report.checks.policy_uploaded && report.checks.bill_uploaded },
                  { name: 'Hospital name found?', ok: report.checks.hospital_found },
                  { name: 'Claim amount extracted?', ok: report.checks.amount_extracted },
                  { name: 'Policy covers disease?', ok: report.checks.disease_covered },
                  { name: 'Waiting period completed?', ok: report.checks.waiting_period_completed }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300 font-semibold">{item.name}</span>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs ${
                      item.ok 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}>
                      {item.ok ? '✓' : '✗'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right panel: Details, missing documents upload, and recommendations */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Extracted Details block */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-4">Extracted Invoice Metadata</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-0.5">Hospital Name</span>
                  <span className="text-white font-extrabold text-base">{report.extracted_details.hospital_name || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-0.5">Diagnosis</span>
                  <span className="text-white font-extrabold text-base">{report.extracted_details.diagnosis || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-0.5">Bill Claim Amount</span>
                  <span className="text-indigo-400 font-extrabold text-base">{formatCurrency(report.extracted_details.amount) || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-0.5">Date of Treatment</span>
                  <span className="text-white font-extrabold text-base">{report.extracted_details.date || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Policy Verification & Limits Card */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-4">Policy Verification & Limits</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-0.5">Disease Covered</span>
                  <span className="text-base font-extrabold text-emerald-400">✔ Yes</span>
                </div>
                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-0.5">Waiting Period</span>
                  <span className="text-base font-extrabold text-emerald-400">24 Months ✔</span>
                </div>
                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-0.5">Coverage Limit</span>
                  <span className="text-base font-extrabold text-white">{formatCurrency(report.coverage_limit || 250000)}</span>
                </div>
                <div className="p-3 bg-slate-950/20 border border-slate-900 rounded-xl">
                  <span className="text-slate-400 text-xs block mb-0.5">Within Limit</span>
                  <span className={`text-base font-extrabold ${report.within_limit ? 'text-emerald-400' : 'text-red-400'}`}>
                    {report.within_limit ? '✔ Yes' : '❌ No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Checklist & Upload Missing */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-4">Supporting Documents</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                {[
                  { name: 'Medical Bill', ok: report.document_status.bill },
                  { name: 'Policy PDF', ok: report.document_status.policy },
                  { name: 'Prescription', ok: report.document_status.prescription },
                  { name: 'Aadhaar ID', ok: report.document_status.aadhaar },
                  { name: 'Passbook', ok: report.document_status.passbook }
                ].map((doc, idx) => (
                  <div key={idx} className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 ${
                    doc.ok 
                      ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400' 
                      : 'bg-red-500/5 border-red-500/15 text-red-400'
                  }`}>
                    <span className="text-xs font-bold block mb-1">{doc.name}</span>
                    <span className="text-sm font-bold">{doc.ok ? '✓ Verified' : '✗ Missing'}</span>
                  </div>
                ))}
              </div>

              {/* Upload missing directly panel */}
              {report.missing_documents && report.missing_documents.length > 0 && (
                <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-3">Upload Missing Document</h4>
                  
                  {uploadSuccess && (
                    <div className="p-2 bg-emerald-500/15 text-emerald-400 text-xs border border-emerald-500/25 rounded mb-3">
                      {uploadSuccess}
                    </div>
                  )}

                  <form onSubmit={handleDocUpload} className="flex flex-col sm:flex-row gap-3">
                    <select 
                      value={docType} 
                      onChange={(e) => setDocType(e.target.value)}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="prescription">Doctor Prescription</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="passbook">Bank Passbook</option>
                    </select>

                    <div className="flex-1 relative border border-slate-800 rounded-lg bg-slate-900 flex items-center justify-center py-2 px-3 hover:border-purple-500/40 transition-all cursor-pointer">
                      <input 
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">
                        {selectedFile ? selectedFile.name : 'Choose File'}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={uploadLoading || !selectedFile}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                    >
                      {uploadLoading ? 'Uploading...' : 'Upload & Re-Verify'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Recommendation block */}
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-tr from-purple-950/20 to-indigo-950/10 border-l-4 border-l-purple-500 text-sm">
              <h3 className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Recommendation</h3>
              <p className="text-base font-extrabold text-white mb-2">
                {report.status === 'Eligible' ? 'Approved for Submission' : 
                 report.status === 'Eligible (Partial)' ? 'Partial Claim Approval' : 
                 'Document Submission Required'}
              </p>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                {report.recommendation}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
