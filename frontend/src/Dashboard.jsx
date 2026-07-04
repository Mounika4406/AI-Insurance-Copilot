import React, { useEffect, useState } from 'react';

export default function Dashboard({ setView, user, onLogout }) {
  const [stats, setStats] = useState({
    total_claims: 0,
    eligible_claims: 0,
    pending_claims: 0,
    ineligible_claims: 0,
    total_amount_claimed: 0
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [currentBill, setCurrentBill] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/report?user_id=1');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setHistory(data.history || []);
        setCurrentPolicy(data.current_policy);
        setCurrentBill(data.current_bill);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-900 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Welcome back!</h1>
          <p className="text-slate-300 text-base">AI Insurance Copilot Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-purple-400 font-mono">
            {user?.email || 'admin@copilot.com'}
          </span>
          <button
            onClick={onLogout}
            className="text-xs px-3 py-1.5 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg hover:bg-red-900/30 transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Counter Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full translate-x-8 -translate-y-8"></div>
          <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Total Claims</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{stats.total_claims}</span>
            <span className="text-sm text-slate-400">submitted</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-l-4 border-l-emerald-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-8 -translate-y-8"></div>
          <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Eligible Claims</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-emerald-400">{stats.eligible_claims}</span>
            <span className="text-sm text-emerald-500/80">approved</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full translate-x-8 -translate-y-8"></div>
          <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Pending Documents</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-amber-400">{stats.pending_claims}</span>
            <span className="text-sm text-amber-500/80">awaiting docs</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border-l-4 border-l-orange-500">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full translate-x-8 -translate-y-8"></div>
          <span className="text-sm text-slate-400 uppercase tracking-wider font-bold block mb-2">Rejected Claims</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-red-400">{stats.ineligible_claims}</span>
            <span className="text-sm text-red-500/80">rejected</span>
          </div>
        </div>
      </div>

      {/* Current Uploads Status Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Active Policy status Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-950/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-400 font-bold uppercase tracking-wider block mb-1.5">Active Insurance Policy</span>
            {currentPolicy ? (
              <div>
                <h4 className="text-base font-extrabold text-white truncate max-w-[280px]">📄 {currentPolicy.filename}</h4>
                <span className="text-xs text-slate-500 font-medium">Uploaded: {currentPolicy.uploaded_at}</span>
              </div>
            ) : (
              <div>
                <h4 className="text-base font-bold text-slate-500">No policy uploaded</h4>
                <span className="text-xs text-slate-500">Upload a policy PDF to configure FAISS vector search</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setView('upload', { activeTab: 'policy' })}
            className="text-xs font-bold px-4 py-2 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/25 hover:border-purple-500 rounded-lg cursor-pointer transition-all duration-300"
          >
            {currentPolicy ? 'Replace 🔄' : 'Upload Policy ➕'}
          </button>
        </div>

        {/* Active Bill status Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-950/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider block mb-1.5">Active Medical Bill</span>
            {currentBill ? (
              <div>
                <h4 className="text-base font-extrabold text-white truncate max-w-[280px]">🧾 {currentBill.filename}</h4>
                <span className="text-xs text-slate-500 font-medium">Uploaded: {currentBill.uploaded_at}</span>
              </div>
            ) : (
              <div>
                <h4 className="text-base font-bold text-slate-500">No medical bill uploaded</h4>
                <span className="text-xs text-slate-500">Upload a medical bill to analyze details</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setView('upload', { activeTab: 'bill' })}
            className="text-xs font-bold px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/25 hover:border-indigo-500 rounded-lg cursor-pointer transition-all duration-300"
          >
            {currentBill ? 'Replace 🔄' : 'Upload Bill ➕'}
          </button>
        </div>
      </div>

      {/* Main Options Grid */}
      <h2 className="text-2xl font-bold text-white mb-6">Quick Copilot Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Upload Policy Card */}
        <div 
          onClick={() => setView('upload', { activeTab: 'policy' })}
          className="glass-panel p-6 rounded-2xl hover:border-purple-500/40 cursor-pointer hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:bg-purple-500 group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-white mb-3">Upload Policy 📄</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Upload insurance policies to extract coverage details and update vector indexes.
          </p>
        </div>

        {/* Upload Bill Card */}
        <div 
          onClick={() => setView('upload', { activeTab: 'bill' })}
          className="glass-panel p-6 rounded-2xl hover:border-indigo-500/40 cursor-pointer hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-500 group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-white mb-3">Upload Medical Bill 🧾</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Upload receipts, invoices, or scanned documents to perform OCR text extraction.
          </p>
        </div>

        {/* Ask Questions Card */}
        <div 
          onClick={() => setView('chat')}
          className="glass-panel p-6 rounded-2xl hover:border-pink-500/40 cursor-pointer hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-5 group-hover:bg-pink-500 group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-white mb-3">Ask Questions 🤖</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Query policy coverages, deductibles, exclusions and terms via AI RAG search.
          </p>
        </div>

        {/* Claim Analysis Card */}
        <div 
          onClick={() => setView('report')}
          className="glass-panel p-6 rounded-2xl hover:border-cyan-500/40 cursor-pointer hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 group-hover:bg-cyan-500 group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-white mb-3">Claim Analysis 📊</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Run RandomForest prediction to calculate approval odds and compile missing files.
          </p>
        </div>
      </div>

      {/* Claim History List */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Recent Claims History</h3>
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">No claims have been analyzed yet.</p>
            <button 
              onClick={() => setView('upload', { activeTab: 'bill' })}
              className="mt-4 text-xs font-semibold px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-all"
            >
              Analyze Your First Claim
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 text-sm uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Hospital</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Claimed Amount</th>
                  <th className="py-3 px-4">Probability</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-sm">
                {history.map((claim) => (
                  <tr key={claim.id} className="text-slate-300 hover:bg-slate-950/20 transition-all text-base">
                    <td className="py-4 px-4 font-mono text-sm">{claim.date}</td>
                    <td className="py-4 px-4">{claim.hospital_name}</td>
                    <td className="py-4 px-4">{claim.diagnosis}</td>
                    <td className="py-4 px-4 font-bold text-white">{formatCurrency(claim.amount)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full" 
                            style={{ width: `${claim.approval_probability}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-sm text-white">{claim.approval_probability}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-sm font-bold ${
                        claim.status === 'Eligible' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                        claim.status === 'Eligible (Partial)' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/25' :
                        claim.status === 'Pending Documents' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                        'bg-red-500/10 text-red-400 border border-red-500/25'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Claim Summary Card */}
      {history.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl mt-8 bg-gradient-to-tr from-purple-950/10 to-indigo-950/10 border-l-4 border-l-purple-500">
          <h3 className="text-base font-bold text-white mb-4">Latest Claim Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Coverage</span>
              <span className="text-sm font-semibold text-emerald-400">✔ Covered</span>
            </div>
            <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Hospital</span>
              <span className="text-sm font-semibold text-white">✔ {history[0].hospital_name.replace("Hospital", "").trim()}</span>
            </div>
            <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Diagnosis</span>
              <span className="text-sm font-semibold text-white">✔ {history[0].diagnosis}</span>
            </div>
            <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Required Documents</span>
              <span className={`text-sm font-semibold ${
                history[0].status === 'Eligible' ? 'text-emerald-400' : 
                history[0].status === 'Eligible (Partial)' ? 'text-orange-400' : 
                'text-amber-400'
              }`}>
                {history[0].status === 'Eligible' ? '✔ All Verified' : 
                 history[0].status === 'Eligible (Partial)' ? '⚠ Partial Reimbursement' : 
                 '⚠ Missing Docs'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block mb-1">Approval Probability</span>
              <span className="text-sm font-extrabold text-purple-400">{history[0].approval_probability}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
