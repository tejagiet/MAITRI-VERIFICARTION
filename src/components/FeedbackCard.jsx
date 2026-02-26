const FeedbackCard = ({ studentData, scanResult, onReset }) => {
  const isSuccess = studentData.status === 'success';

  return (
    <div className={`relative p-8 rounded-[2rem] w-full max-w-sm flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95 overflow-hidden border ${
      isSuccess 
        ? 'bg-gradient-to-b from-green-950/90 to-slate-950 border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.15)]' 
        : 'bg-gradient-to-b from-red-950/90 to-slate-950 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)]'
    } backdrop-blur-2xl`}>
      
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-48 blur-[80px] rounded-[100%] pointer-events-none opacity-50 ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}></div>

      <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 ${isSuccess ? 'bg-green-500/20 border-green-500 shadow-green-500/50' : 'bg-red-500/20 border-red-500 shadow-red-500/50'}`}>
        {isSuccess ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <h2 className={`relative z-10 text-3xl font-black mb-2 uppercase tracking-tight ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
        {isSuccess ? 'ENTRY GRANTED' : 'ACCESS DENIED'}
      </h2>
      
      {isSuccess && studentData.full_name && (
        <div className="relative z-10 mt-6 bg-slate-900/50 border border-slate-700/50 w-full rounded-2xl py-5 px-4 backdrop-blur-md shadow-inner">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Passholder</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{studentData.full_name}</p>
        </div>
      )}
      
      {!isSuccess && studentData.message && (
        <div className="relative z-10 mt-4 mb-2 bg-red-950/30 border border-red-500/20 w-full rounded-xl py-3 px-4">
            <p className="text-sm font-medium text-red-200">{studentData.message}</p>
        </div>
      )}

      <div className="relative z-10 mt-8 w-full border-t border-slate-800 pt-6">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Scanned Ticket ID</p>
        <p className="font-mono font-medium text-slate-300 bg-slate-950/80 border border-slate-800 py-3 rounded-xl break-all px-4 text-sm tracking-widest">{scanResult}</p>
      </div>
      
      <button 
        onClick={onReset}
        className={`relative z-10 mt-10 text-white font-bold py-5 rounded-2xl text-sm w-full transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] border ${
          isSuccess 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
            : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
        }`}
      >
        Scan Next
      </button>
    </div>
  );
};

export default FeedbackCard;
