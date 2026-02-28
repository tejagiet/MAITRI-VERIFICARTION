import React from 'react';
import { Share, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

const FeedbackCard = ({ data, onNext, isComplaint = false }) => {
  if (!data) return null;

  const isSuccess = data.status === 'success';
  const isVip = data.isVip;
  const blockName = data.blockName;

  if (isSuccess && isComplaint) {
    return (
      <div className="bg-red-900 rounded-lg shadow-xl shadow-red-900/50 p-6 w-full max-w-sm mx-auto text-center border-2 border-red-500 transform transition-all animate-pulse">
        <ShieldAlert className="w-16 h-16 text-white mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2 uppercase break-words">{data.message || 'PASS SUSPENDED'}</h2>

        <div className="bg-black/50 rounded p-4 mb-4 text-left border border-red-700">
          <p className="text-gray-300 text-sm"><strong>Name:</strong> {data.full_name}</p>
          <p className="text-gray-300 text-sm"><strong>PIN:</strong> {data.pin_number || data.vip_code || data.fac_code || 'N/A'}</p>
          <p className="text-gray-300 text-sm"><strong>Phone:</strong> {data.mobile_number || data.phone || 'N/A'}</p>
          <p className="text-gray-300 text-sm"><strong>Block:</strong> {data.blockName}</p>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded uppercase border border-red-500 shadow-inner"
        >
          Acknowledge & Next
        </button>
      </div>
    );
  }

  return (
    <div className={`relative p-8 rounded-[2rem] w-full h-full md:h-auto max-w-sm flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 animate-in fade-in zoom-in-95 overflow-hidden border ${!isSuccess
      ? 'bg-red-950/90 border-red-500 shadow-red-900/50'
      : isVip
        ? 'bg-gradient-to-b from-amber-950/90 via-yellow-900/40 to-slate-950 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.25)]'
        : 'bg-gradient-to-b from-green-950/90 to-slate-950 border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.15)]'
      } backdrop-blur-2xl`}>

      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-48 blur-[80px] rounded-[100%] pointer-events-none opacity-50 ${!isSuccess ? 'bg-red-600' : isVip ? 'bg-yellow-500' : 'bg-green-600'}`}></div>

      {isVip && isSuccess && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-300 to-yellow-600 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)] border border-yellow-200">
          <span className="text-[10px] font-black text-yellow-950 tracking-widest uppercase">VIP PASS</span>
        </div>
      )}

      <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 ${!isSuccess ? 'bg-red-500/20 border-red-500 shadow-red-500/50' : isVip ? 'bg-yellow-500/20 border-yellow-500 shadow-yellow-500/50' : 'bg-green-500/20 border-green-500 shadow-green-500/50'}`}>
        {isSuccess ? (
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isVip ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'text-green-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      <h2 className={`relative z-10 text-3xl font-black mb-2 uppercase tracking-tight ${!isSuccess ? 'text-red-400' : isVip ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 drop-shadow-sm' : 'text-green-400'}`}>
        {isSuccess ? 'ENTRY GRANTED' : 'ACCESS DENIED'}
      </h2>

      {isSuccess && studentData.full_name && (
        <div className={`relative z-10 mt-6 bg-slate-900/50 border ${isVip ? 'border-yellow-500/30 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]' : 'border-slate-700/50 shadow-inner'} w-full rounded-2xl py-5 px-4 backdrop-blur-md`}>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Passholder</p>
          <p className={`text-2xl font-bold ${isVip ? 'text-yellow-100' : 'bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent'}`}>{studentData.full_name}</p>

          {blockName && (
            <div className={`mt-3 py-2 border-y ${isVip ? 'border-yellow-500/20 bg-yellow-950/20' : 'border-slate-700/50 bg-slate-800/20'}`}>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Assigned Block</p>
              <p className={`text-sm font-black tracking-wider ${isVip ? 'text-yellow-400' : 'text-indigo-400'}`}>{blockName}</p>
            </div>
          )}

          {studentData.entered_at && (
            <div className="mt-3 pt-2 flex flex-col items-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Entry Logged At</p>
              <p className="text-lg font-mono font-medium text-emerald-400 tracking-widest">{new Date(studentData.entered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
          )}
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
        className={`relative z-10 mt-10 text-white font-bold py-5 rounded-2xl text-sm w-full transition-all shadow-xl active:scale-[0.98] uppercase tracking-[0.2em] border ${!isSuccess
          ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
          : isVip
            ? 'bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)] text-yellow-950'
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
          }`}
      >
        Scan Next
      </button>
    </div>
  );
};

export default FeedbackCard;
