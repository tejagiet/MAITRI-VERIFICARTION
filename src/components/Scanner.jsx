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
    <div className="flex flex-col items-center p-4 bg-slate-900 min-h-[100dvh] w-full text-white">
      <div className="w-full max-w-sm flex items-center justify-between mb-8 mt-4">
        <h1 className="text-2xl font-black text-purple-400 tracking-tight">VERIFIER</h1>
        <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)] animate-pulse"></div>
      </div>
      
      {!studentData ? (
        <div className="w-full max-w-sm flex-1 flex flex-col justify-center">
          <p className="text-slate-400 text-center mb-4 text-sm font-medium uppercase tracking-widest">Point Camera at QR Code</p>
          <div className="rounded-xl overflow-hidden border-2 border-purple-500/50 bg-slate-800 shadow-xl shadow-purple-900/20 relative">
            <div id="reader" className="w-full scanner-container"></div>
            {/* Custom overlay styling for the scanner area can be added via CSS if needed */}
          </div>
          
          <div className="mt-8">
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">OR ENTER PIN</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>
            
            <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. 12345-AI-001" 
                value={manualPin}
                onChange={(e) => setManualPin(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors font-mono"
              />
              <button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 flex flex-col justify-center mt-[-4rem]">
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
