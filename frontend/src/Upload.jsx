import React, { useEffect, useState } from 'react';
import { API_URL } from './config';

export default function Upload({ setView, initialTab = 'policy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Existing state verification
  const [hasExistingPolicy, setHasExistingPolicy] = useState(false);
  const [hasExistingBill, setHasExistingBill] = useState(false);
  const [existingPolicyName, setExistingPolicyName] = useState('');
  const [existingBillName, setExistingBillName] = useState('');
  const [existingPolicyDate, setExistingPolicyDate] = useState('');
  const [existingBillDate, setExistingBillDate] = useState('');

  useEffect(() => {
    checkExisting();
  }, []);

  const checkExisting = async () => {
    try {
      const res = await fetch(`${API_URL}/api/report?user_id=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.current_policy) {
          setHasExistingPolicy(true);
          setExistingPolicyName(data.current_policy.filename);
          setExistingPolicyDate(data.current_policy.uploaded_at);
        }
        if (data.current_bill) {
          setHasExistingBill(true);
          setExistingBillName(data.current_bill.filename);
          setExistingBillDate(data.current_bill.uploaded_at);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  // Policy upload state
  const [policyFile, setPolicyFile] = useState(null);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policySuccess, setPolicySuccess] = useState(null);
  const [policyError, setPolicyError] = useState('');

  // Bill upload state
  const [billFile, setBillFile] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billResult, setBillResult] = useState(null);
  const [billError, setBillError] = useState('');

  // Handle Policy Upload
  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    if (!policyFile) return;
    
    setPolicyLoading(true);
    setPolicyError('');
    setPolicySuccess(null);

    const formData = new FormData();
    formData.append('file', policyFile);
    formData.append('user_id', 1);

    try {
      const response = await fetch(`${API_URL}/api/upload-policy`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload policy.');
      }

      setPolicySuccess(data.message);
      setHasExistingPolicy(true);
      setExistingPolicyName(policyFile.name);
    } catch (err) {
      setPolicyError(err.message);
    } finally {
      setPolicyLoading(false);
    }
  };

  // Handle Bill Upload
  const handleBillSubmit = async (e) => {
    e.preventDefault();
    if (!billFile) return;

    setBillLoading(true);
    setBillError('');
    setBillResult(null);

    const formData = new FormData();
    formData.append('file', billFile);
    formData.append('user_id', 1);

    try {
      const response = await fetch(`${API_URL}/api/upload-bill`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload medical bill.');
      }

      setBillResult(data);
      setHasExistingBill(true);
      setExistingBillName(billFile.name);
    } catch (err) {
      setBillError(err.message);
    } finally {
      setBillLoading(false);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button 
        onClick={() => setView('dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-all mb-6 text-sm cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </button>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-900 mb-8 gap-4">
        <button
          onClick={() => setActiveTab('policy')}
          className={`pb-4 px-2 font-bold text-base transition-all relative cursor-pointer ${
            activeTab === 'policy' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📄 Upload Insurance Policy
          {activeTab === 'policy' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('bill')}
          className={`pb-4 px-2 font-bold text-base transition-all relative cursor-pointer ${
            activeTab === 'bill' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🧾 Upload Medical Bill
          {activeTab === 'bill' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Content for Policy Tab */}
      {activeTab === 'policy' && (
        <div className="glass-panel p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Upload Policy PDF</h2>
          <p className="text-slate-400 text-sm mb-6">
            The policy PDF will be split into chunks, embedded, and saved to the vector database. This only needs to happen once per policy.
          </p>

          {hasExistingPolicy && !policySuccess && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-6 text-sm flex justify-between items-center">
              <div>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider block mb-1">Current Active Policy</span>
                <span className="text-white font-extrabold text-base block">📄 {existingPolicyName}</span>
                {existingPolicyDate && <span className="text-xs text-slate-500 block">Uploaded: {existingPolicyDate}</span>}
                <span className="text-xs text-slate-500 block">Status: <span className="text-emerald-400 font-bold">Indexed ✓</span></span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Active</span>
            </div>
          )}

          <form onSubmit={handlePolicySubmit} className="space-y-6">
            {policyError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-200 rounded-lg text-sm">
                {policyError}
              </div>
            )}

            {!policySuccess ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-8 bg-slate-950/20 hover:border-purple-500/40 transition-all duration-300 relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPolicyFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={policyLoading}
                />
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  {policyFile ? policyFile.name : 'Select Policy PDF File'}
                </span>
                <span className="text-xs text-slate-500 mt-1">PDF file format only (e.g. Health_Insurance_Policy.pdf)</span>
              </div>
            ) : (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/25">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-lg mb-1">Policy Uploaded Successfully!</h3>
                <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-4">{policySuccess}</p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => { setPolicyFile(null); setPolicySuccess(null); }}
                    className="px-4 py-2 border border-slate-800 text-slate-400 rounded-lg hover:text-white transition-all text-xs cursor-pointer"
                  >
                    Upload Another
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('chat')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-xs font-semibold cursor-pointer"
                  >
                    Ask Policy Questions
                  </button>
                </div>
              </div>
            )}

            {hasExistingPolicy && policyFile && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-sm text-amber-200">
                <p className="font-bold mb-1">⚠ Replace Existing Policy?</p>
                <p>A previous policy (<strong>{existingPolicyName}</strong>) already exists. Uploading a new one will completely delete the previous indexes, claims, and analysis reports. Proceed?</p>
              </div>
            )}

            {policyFile && !policySuccess && (
              <button
                type="submit"
                disabled={policyLoading}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2 text-base"
              >
                {policyLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Parsing & Indexing Policy...
                  </>
                ) : (
                  hasExistingPolicy ? 'Yes, Replace & Index Policy 🔄' : 'Process & Index Policy'
                )}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Content for Bill Tab */}
      {activeTab === 'bill' && (
        <div className="glass-panel p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Upload Medical Bill</h2>
          <p className="text-slate-400 text-sm mb-6">
            Upload the medical receipt (PDF, PNG, or JPG). The AI will perform OCR to extract the hospital name, diagnosis, claim amount, and date.
          </p>

          {hasExistingBill && !billResult && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mb-6 text-sm flex justify-between items-center">
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block mb-1">Current Active Medical Bill</span>
                <span className="text-white font-extrabold text-base block">🧾 {existingBillName}</span>
                {existingBillDate && <span className="text-xs text-slate-500 block">Uploaded: {existingBillDate}</span>}
                <span className="text-xs text-slate-500 block">Status: <span className="text-emerald-400 font-bold">Extracted ✓</span></span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">Active</span>
            </div>
          )}

          <form onSubmit={handleBillSubmit} className="space-y-6">
            {billError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-200 rounded-lg text-sm">
                {billError}
              </div>
            )}

            {!billResult ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-8 bg-slate-950/20 hover:border-indigo-500/40 transition-all duration-300 relative">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setBillFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={billLoading}
                />
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-200">
                  {billFile ? billFile.name : 'Select Medical Bill'}
                </span>
                <span className="text-xs text-slate-500 mt-1">PDF, PNG, or JPG format (e.g. Hospital_Bill.pdf)</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-md">OCR Extracted Details</h3>
                      <p className="text-xs text-slate-400">Structured data extracted from bill</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950/45 rounded-lg border border-slate-900">
                      <span className="text-xs text-slate-500 uppercase tracking-wider block mb-0.5">Hospital</span>
                      <span className="text-sm font-semibold text-white">{billResult.hospital_name}</span>
                    </div>
                    <div className="p-3 bg-slate-950/45 rounded-lg border border-slate-900">
                      <span className="text-xs text-slate-500 uppercase tracking-wider block mb-0.5">Diagnosis</span>
                      <span className="text-sm font-semibold text-white">{billResult.diagnosis}</span>
                    </div>
                    <div className="p-3 bg-slate-950/45 rounded-lg border border-slate-900">
                      <span className="text-xs text-slate-500 uppercase tracking-wider block mb-0.5">Claim Amount</span>
                      <span className="text-sm font-bold text-indigo-400">{formatCurrency(billResult.amount)}</span>
                    </div>
                    <div className="p-3 bg-slate-950/45 rounded-lg border border-slate-900">
                      <span className="text-xs text-slate-500 uppercase tracking-wider block mb-0.5">Date</span>
                      <span className="text-sm font-semibold text-white">{billResult.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => { setBillFile(null); setBillResult(null); }}
                    className="flex-1 py-3 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all text-center"
                  >
                    Re-upload Bill
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('report')}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Claim Analysis
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {hasExistingBill && billFile && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-sm text-amber-200">
                <p className="font-bold mb-1">⚠ Replace Existing Medical Bill?</p>
                <p>A previous medical bill (<strong>{existingBillName}</strong>) already exists. Uploading a new bill will overwrite existing metadata and clear current analysis reports. Proceed?</p>
              </div>
            )}

            {billFile && !billResult && (
              <button
                type="submit"
                disabled={billLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer flex items-center justify-center gap-2 text-base"
              >
                {billLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Extracting Text with OCR...
                  </>
                ) : (
                  hasExistingBill ? 'Yes, Replace & Extract Bill 🔄' : 'Upload & Extract Bill'
                )}
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
