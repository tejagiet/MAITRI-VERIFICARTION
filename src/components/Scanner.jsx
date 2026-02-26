import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import FeedbackCard from './FeedbackCard';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [manualPin, setManualPin] = useState('');

  useEffect(() => {
    let html5Qrcode = null;

    if (isScanning && !scanResult) {
      html5Qrcode = new Html5Qrcode("reader");
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      // Use the back camera (environment facing)
      html5Qrcode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      ).catch(err => {
        console.error("Camera start failed:", err);
      });
    }

    return () => {
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch(error => {
          console.error("Failed to stop html5Qrcode. ", error);
        });
      }
    };
  }, [isScanning, scanResult]);

  const onScanSuccess = async (decodedText) => {
    const cleanPin = decodedText.trim();
    setScanResult(cleanPin);
    setIsScanning(false);
    
    try {
      // 1. Fetch user data
      const { data, error } = await supabase
        .from('maitri_registrations')
        .select('full_name, pin_number')
        .ilike('pin_number', cleanPin)
        .maybeSingle();
        
      if (error) {
         console.warn("Supabase lookup error:", error);
         setStudentData({ status: 'error', message: `DB Error: ${error.message}` });
         return;
      }

      if (data) {
        // 2. Mark Attendance immediately after validating
        const { error: updateError } = await supabase
          .from('maitri_registrations')
          .update({ attended_fest: true })
          .ilike('pin_number', cleanPin);

        if (updateError) {
           console.warn("Failed to mark attendance:", updateError);
           // We might still want to grant entry if the update fails, but warn the admin.
           setStudentData({ status: 'success', ...data, message: 'Warning: Failed to log attendance in DB' });
        } else {
           setStudentData({ status: 'success', ...data });
        }
      } else {
        setStudentData({ status: 'error', message: 'Invalid Pass or Not Registered' });
      }
    } catch (err) {
      console.error("Database connection error:", err);
      setStudentData({ status: 'error', message: `Connection Error: ${err.message}` });
    }
  };

  const onScanFailure = (error) => {
    // handle scan failure, usually better to ignore and keep scanning
    // console.warn(`Code scan error = ${error}`);
  };

  const resetScanner = () => {
    setStudentData(null);
    setScanResult(null);
    setIsScanning(true);
    setManualPin('');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualPin.trim()) {
      onScanSuccess(manualPin);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-slate-950 min-h-[100dvh] w-full text-slate-50 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[40%] bg-purple-900/20 rounded-[100%] blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md flex items-center justify-between mb-8 mt-2 relative z-10 bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-slate-800/50">
        <div>
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">MAITRI GATE</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase mt-0.5">Verification System</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/50 py-1.5 px-3 rounded-full border border-slate-800">
          <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-300 tracking-wider uppercase">Online</span>
        </div>
      </div>
      
      {!studentData ? (
        <div className="w-full max-w-md flex-1 flex flex-col justify-center relative z-10">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/60 shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-slate-300 text-xs font-bold uppercase tracking-[0.15em]">Scan QR Code</p>
            </div>
            
            <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950 relative aspect-square shadow-inner">
              <div id="reader" className="w-full h-full scanner-container absolute inset-0 mix-blend-screen opacity-90"></div>
              {/* Optional overlay styling */}
              <div className="absolute inset-0 border-2 border-purple-500/30 rounded-2xl pointer-events-none"></div>
            </div>
           
            <div className="mt-8">
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-slate-700"></div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Manual Entry</span>
                <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-slate-700"></div>
              </div>
              
              <form onSubmit={handleManualSubmit} className="mt-5 flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Enter PIN (e.g. 12345-AI-01)" 
                  value={manualPin}
                  onChange={(e) => setManualPin(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl py-4 px-4 text-center text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono tracking-wider text-sm"
                />
                <button 
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-all border border-slate-700 hover:border-slate-600 active:scale-[0.98] text-sm uppercase tracking-widest"
                >
                  Verify Manually
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col justify-center relative z-10 z-[20] items-center">
          <FeedbackCard 
            studentData={studentData} 
            scanResult={scanResult} 
            onReset={resetScanner} 
          />
        </div>
      )}
    </div>
  );
};

export default Scanner;
