const FeedbackCard = ({ studentData, scanResult, onReset }) => {
  const isSuccess = studentData.status === 'success';

  return (
    <div className={`p-8 rounded-2xl w-full max-w-sm flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 ${
      isSuccess 
        ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-green-900/50' 
        : 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-900/50'
    }`}>
      
      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
        {isSuccess ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <h2 className="text-3xl font-black mb-1 text-white uppercase tracking-tight">
        {isSuccess ? 'ENTRY GRANTED' : 'ACCESS DENIED'}
      </h2>
      
      {isSuccess && studentData.full_name && (
        <div className="mt-6 bg-white/10 w-full rounded-xl py-4 px-2 backdrop-blur-sm">
          <p className="text-slate-100 text-sm font-medium uppercase tracking-wider mb-1">Student / Guest</p>
          <p className="text-2xl font-bold text-white">{studentData.full_name}</p>
        </div>
      )}
      
      {!isSuccess && studentData.message && (
        <div className="mt-4 mb-2">
            <p className="text-lg font-medium text-white/90">{studentData.message}</p>
        </div>
      )}

      <div className="mt-6 w-full">
        <p className="text-white/60 text-xs font-mono mb-1">SCANNED PIN</p>
        <p className="font-mono text-white/80 bg-black/20 py-2 rounded-lg break-all px-2 text-sm">{scanResult}</p>
      </div>
      
      <button 
        onClick={onReset}
        className="mt-8 bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold text-lg w-full transition-colors shadow-lg active:scale-95"
      >
        Scan Next
      </button>
    </div>
  );
};

export default FeedbackCard;
