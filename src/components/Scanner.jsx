import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import FeedbackCard from './FeedbackCard';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [manualPin, setManualPin] = useState('');
  const [totalAttended, setTotalAttended] = useState(0);

  const TABLES = [
    'ggu_students',
    'giet_degree',
    'giet_engineering',
    'giet_pharmacy',
    'giet_polytechnic',
    'maitri_vip_registrations'
  ];

  useEffect(() => {
    const fetchCount = async () => {
      try {
        let total = 0;
        // Fetch count from all tables concurrently
        const countPromises = TABLES.map(table =>
          supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
            .eq('attended_fest', true)
        );

        const results = await Promise.all(countPromises);

        results.forEach(({ count, error }) => {
          if (!error && count !== null) {
            total += count;
          }
        });

        setTotalAttended(total);
      } catch (err) {
        console.error("Error fetching count:", err);
      }
    };
    fetchCount();
  }, []);

  useEffect(() => {
    let html5Qrcode = null;
    let isMounted = true;

    // Small timeout to ensure the DOM element actually exists before html5Qrcode tries to mount to it
    const initScanner = setTimeout(() => {
      const readerElement = document.getElementById("reader");

      if (isScanning && !scanResult && readerElement && isMounted) {
        try {
          html5Qrcode = new Html5Qrcode("reader");

          const config = { fps: 10, qrbox: { width: 250, height: 250 } };

          // Use the back camera (environment facing)
          html5Qrcode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure
          ).catch(err => {
            if (isMounted) {
              console.warn("Camera start failed or permission denied:", err);
              setCameraError(true);
            }
          });
        } catch (err) {
          console.error("html5qrcode INIT error:", err);
        }
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(initScanner);
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().then(() => {
          // Successfully stopped
        }).catch(error => {
          console.warn("Failed to stop html5Qrcode (may already be stopped). ", error);
        });
      }
    };
  }, [isScanning, scanResult]);

  const onScanSuccess = async (decodedText) => {
    const cleanPin = decodedText.trim();
    setScanResult(cleanPin);
    setIsScanning(false);

    try {
      let matchData = null;
      let matchTable = null;
      let hasNetworkError = false;

      // 1. Fetch user data across all tables sequentially
      for (const table of TABLES) {
        let pinColumn = 'pin_number';
        if (table === 'maitri_vip_registrations') {
          pinColumn = 'vip_code';
        }

        console.log(`[SCANNER START] Verifying PIN: "${cleanPin}" against ${table}.${pinColumn}`);

        // Use .ilike for case-insensitive matching (fixes "ai" != "AI" input problems)
        const { data, error } = await supabase
          .from(table)
          .select(`full_name, ${pinColumn}, is_vip, entered_at, attended_fest`)
          .ilike(pinColumn, cleanPin)
          .maybeSingle();

        if (error && error.code !== 'PGRST116' && error.code !== '400') {
          hasNetworkError = true;
          console.warn(`Error on table ${table}:`, error);
        }

        if (data) {
          matchData = data;
          matchTable = table;
          break; // Found the pass, stop checking other tables
        }
      }

      if (matchData) {
        // Determine VIP Status and Block Name
        let blockName = matchTable.replace(/_/g, ' ').toUpperCase();
        if (matchTable === 'maitri_vip_registrations') {
          blockName = 'VIP RESERVED';
        }

        // Check if the user is from the VIP table, or uses the fallback VIP indicators
        const isVip = matchTable === 'maitri_vip_registrations' || matchData.is_vip || cleanPin.toUpperCase().includes('VIP') || cleanPin.toUpperCase().startsWith('V');

        // 2. Mark Attendance immediately after validating
        const now = new Date().toISOString();
        let updatePinColumn = matchTable === 'maitri_vip_registrations' ? 'vip_code' : 'pin_number';

        const { error: updateError } = await supabase
          .from(matchTable)
          .update({ attended_fest: true, entered_at: now })
          .ilike(updatePinColumn, cleanPin);

        if (updateError) {
          console.warn("Failed to mark attendance:", updateError);
          setStudentData({
            status: 'success',
            ...matchData,
            entered_at: now,
            message: 'Warning: Failed to log attendance in DB',
            blockName: blockName,
            isVip: isVip
          });
        } else {
          setTotalAttended(prev => prev + 1);
          setStudentData({
            status: 'success',
            ...matchData,
            entered_at: now,
            blockName: blockName,
            isVip: isVip
          });
        }
      } else {
        if (hasNetworkError) {
          setStudentData({ status: 'error', message: `DB Connection Error. Check console.` });
        } else {
          setStudentData({ status: 'error', message: 'Invalid Pass or Not Registered' });
        }
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
    <div className="flex flex-col p-4 md:p-6 bg-slate-950 h-[100dvh] w-full text-slate-50 relative overflow-hidden md:justify-center">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[40%] bg-purple-900/20 rounded-[100%] blur-[120px] pointer-events-none"></div>

      {/* Header section */}
      <div className="w-full max-w-md md:max-w-5xl flex items-center justify-between mb-4 md:mb-12 mt-2 relative z-10 bg-slate-900/40 backdrop-blur-md p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-800/50 mx-auto shrink-0">
        <div>
          <h1 className="text-xl md:text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">MAITRI GATE</h1>
          <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-[0.2em] uppercase mt-0.5 md:mt-1">Verification System</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 bg-purple-900/30 py-1.5 px-3 md:py-2 md:px-4 rounded-full border border-purple-500/30 backdrop-blur-md">
            <span className="text-[10px] md:text-sm font-bold text-slate-300 tracking-wider">ENTRIES: </span>
            <span className="text-[10px] md:text-sm font-black text-white">{totalAttended}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/50 py-1.5 px-3 md:py-2 md:px-4 rounded-full border border-slate-800">
            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
            <span className="text-[10px] md:text-sm font-bold text-slate-300 tracking-wider uppercase hidden sm:inline-block">Online</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md md:max-w-5xl flex-1 flex flex-col relative z-10 mx-auto overflow-y-auto overflow-x-hidden md:overflow-visible pb-4 md:pb-0 hide-scrollbar">
        <div className="flex flex-col flex-1 md:grid md:grid-cols-2 md:gap-10 md:items-center">

          {/* CAMERA SECTION */}
          <div className={`flex flex-col flex-1 bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-4 md:p-10 border border-slate-800/60 shadow-2xl transition-all duration-500 ${studentData ? 'md:col-span-1 opacity-50 grayscale pointer-events-none scale-[0.98] hidden md:flex' : 'md:col-span-1'}`}>
            <div className="flex items-center justify-center gap-2 mb-4 shrink-0 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-[0.15em]">Scan Ticket</p>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-slate-700/50 bg-black relative shadow-inner w-full flex-1 md:aspect-square md:flex-none flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-6 flex flex-col items-center justify-center h-full space-y-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-rose-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-rose-400 font-bold uppercase tracking-widest text-sm">Camera Blocked</p>
                  <p className="text-slate-400 text-xs px-4">Please allow camera permissions in your browser to scan passes, or use the manual entry.</p>
                </div>
              ) : (
                <>
                  <div id="reader" className="w-full h-full absolute inset-0 [&>video]:object-cover [&>video]:w-full [&>video]:h-full opacity-90 mix-blend-screen"></div>
                  <div className="absolute inset-0 border-2 border-purple-500/30 rounded-2xl pointer-events-none md:border-4"></div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: MANUAL ENTRY OR FEEDBACK CARD */}
          <div className="mt-4 md:mt-0 md:col-span-1 flex flex-col shrink-0 md:h-full justify-center">
            {!studentData ? (
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 md:p-10 border border-slate-800/60 shadow-2xl">
                <div className="flex items-center gap-3 py-1 mb-3">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-slate-700"></div>
                  <span className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap">Manual Entry</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-slate-700"></div>
                </div>

                <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="e.g. 12345-AI-01"
                    value={manualPin}
                    onChange={(e) => setManualPin(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl py-3 md:py-5 px-4 text-center text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all font-mono tracking-wider text-sm md:text-lg"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 md:py-5 px-6 rounded-xl transition-all border border-slate-700 hover:border-slate-600 active:scale-[0.98] text-sm uppercase tracking-widest shadow-lg"
                  >
                    Verify PIN
                  </button>
                </form>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center animate-in zoom-in-95 md:slide-in-from-right-8 duration-300">
                <FeedbackCard
                  studentData={studentData}
                  scanResult={scanResult}
                  onReset={resetScanner}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
