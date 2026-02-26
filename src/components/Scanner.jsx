import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import FeedbackCard from './FeedbackCard';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let html5QrcodeScanner = null;

    if (isScanning && !scanResult) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [isScanning, scanResult]);

  const onScanSuccess = async (decodedText) => {
    setScanResult(decodedText);
    setIsScanning(false);
    
    try {
      // Check against Supabase database
      const { data, error } = await supabase
        .from('maitri_registrations')
        .select('full_name, pin_number')
        .eq('pin_number', decodedText)
        .single();
        
      if (error) {
         console.warn("Supabase lookup error or not found:", error);
      }

      if (data) {
        setStudentData({ status: 'success', ...data });
      } else {
        setStudentData({ status: 'error', message: 'Invalid Pass or Not Registered' });
      }
    } catch (err) {
      console.error("Database connection error:", err);
      setStudentData({ status: 'error', message: 'Connection Error' });
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
  };

  return (
    <div className="flex flex-col items-center p-4 bg-slate-900 min-h-screen text-white">
      <div className="w-full max-w-sm flex items-center justify-between mb-8 mt-4">
        <h1 className="text-2xl font-black text-purple-400 tracking-tight">VERIFIER</h1>
        <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)] animate-pulse"></div>
      </div>
      
      {!studentData ? (
        <div className="w-full max-w-sm">
          <p className="text-slate-400 text-center mb-4 text-sm font-medium uppercase tracking-widest">Point Camera at QR Code</p>
          <div className="rounded-xl overflow-hidden border-2 border-purple-500/50 bg-slate-800 shadow-xl shadow-purple-900/20 relative">
            <div id="reader" className="w-full scanner-container"></div>
            {/* Custom overlay styling for the scanner area can be added via CSS if needed */}
          </div>
        </div>
      ) : (
        <FeedbackCard 
          studentData={studentData} 
          scanResult={scanResult} 
          onReset={resetScanner} 
        />
      )}
    </div>
  );
};

export default Scanner;
