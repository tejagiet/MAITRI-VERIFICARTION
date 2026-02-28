import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import FeedbackCard from './FeedbackCard';

const TABLES = [
  'ggu_students',
  'giet_degree',
  'giet_engineering',
  'giet_pharmacy',
  'giet_polytechnic',
  'maitri_vip_registrations',
  'maitri_faculty_registrations'
];

// Re-using the same Google Sheets URL, but we will send a type="suspension"
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby8j51iAALq_3pW0o6t0aIKtT6M-x4g0eP2dZ9lZqcw6G64tLQv97qU_P1i91Z5Kx8q/exec'; 

const ComplaintScanner = ({ onExit }) => {
  const [studentData, setStudentData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualPin, setManualPin] = useState('');
  const [cameraError, setCameraError] = useState(false);

  const syncSuspensionToGoogleSheets = async (data, reason) => {
    if (!GOOGLE_SHEETS_URL) return;

    try {
      const now = new Date();
      const istTime = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });

      const payload = {
        type: 'suspension',
        id: data.id || data.pin_number || data.vip_code || 'N/A',
        full_name: data.full_name,
        pin_number: data.pin_number || data.vip_code || 'N/A',
        mobile_number: data.mobile_number || data.phone || 'N/A',
        block: data.blockName || 'UNKNOWN',
        entered_at_ist: istTime,
        reason: reason
      };

      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      console.log("[SYNC] Suspension sent to Google Sheets for:", data.full_name);
    } catch (err) {
      console.error("[SYNC_ERROR] Suspension sync failed:", err);
    }
  };

  const verifyAndSuspend = async (pinNumber) => {
    if (!pinNumber) return;
    
    // Stop scanner while processing
    if (window.html5QrcodeScanner) {
      try {
        await window.html5QrcodeScanner.clear();
      } catch (e) {
        console.warn("Scanner clear error", e);
      }
    }
    setIsScanning(false);
    setStudentData({ status: 'loading' });

    try {
      const cleanPin = pinNumber.trim();
      let matchData = null;
      let matchTable = null;
      let matchPinColumn = 'pin_number';

      // 1. Fetch user data across all tables sequentially
      for (const table of TABLES) {
        let pinColumn = 'pin_number';
        if (table === 'maitri_vip_registrations') pinColumn = 'vip_code';
        else if (table === 'maitri_faculty_registrations') pinColumn = 'fac_code';

        const { data, error } = await supabase
          .from(table)
          .select(`id, full_name, ${pinColumn}, is_vip, is_suspended, mobile_number`)
          .ilike(pinColumn, cleanPin)
          .maybeSingle();

        if (error && error.message?.includes('mobile_number')) {
          const { data: retryData } = await supabase
            .from(table)
            .select(`id, full_name, ${pinColumn}, is_vip, is_suspended, phone`)
            .ilike(pinColumn, cleanPin)
            .maybeSingle();

          if (retryData) {
            matchData = { ...retryData, mobile_number: retryData.phone };
            matchTable = table;
            matchPinColumn = pinColumn;
            break;
          }
        }

        if (data) {
          matchData = data;
          matchTable = table;
          matchPinColumn = pinColumn;
          break;
        }
      }

      if (matchData) {
        if (matchData.is_suspended) {
          setStudentData({ status: 'error', message: 'ERROR: PASS IS ALREADY SUSPENDED' });
          return;
        }

        const tableToBlock = {
          'ggu_students': 'GGU COLLEGE',
          'giet_degree': 'GIET DEGREE',
          'giet_engineering': 'GIET ENGINEERING',
          'giet_pharmacy': 'GIET PHARMACY',
          'giet_polytechnic': 'GIET POLY',
          'maitri_vip_registrations': 'VIP GUESTS',
          'maitri_faculty_registrations': 'FACULTY & STAFF'
        };

        const blockName = tableToBlock[matchTable] || matchTable.replace(/_/g, ' ').toUpperCase();

        // 2. Suspend the pass
        const { error: updateError } = await supabase
          .from(matchTable)
          .update({ is_suspended: true })
          .ilike(matchPinColumn, cleanPin);

        if (updateError) {
          console.warn("Failed to suspend:", updateError);
          setStudentData({ status: 'error', message: 'Failed to update database' });
        } else {
          const completeData = {
            status: 'success',
            ...matchData,
            blockName: blockName,
            message: 'PASS HAS BEEN SUSPENDED',
            isVip: matchData.is_vip || matchTable === 'maitri_vip_registrations'
          };
          setStudentData(completeData);
          syncSuspensionToGoogleSheets(completeData, "Observer Report");
        }
      } else {
        setStudentData({ status: 'error', message: 'Pass Not Found' });
      }
    } catch (err) {
      console.error("Database connection error:", err);
      setStudentData({ status: 'error', message: `DB Error: ${err.message}` });
    }
  };

  const startScanner = () => {
    setStudentData(null);
    setCameraError(false);
    setIsScanning(true);

    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner("reader", {
          qrbox: { width: 250, height: 250 },
          fps: 10,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        });

        window.html5QrcodeScanner = scanner;

        scanner.render(
          (decodedText) => verifyAndSuspend(decodedText),
          (error) => { /* ignore normal scan errors */ }
        );
      } catch (err) {
        console.error("Camera start failed:", err);
        setCameraError(true);
      }
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (window.html5QrcodeScanner) {
        window.html5QrcodeScanner.clear().catch(e => console.error(e));
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-red-900 flex flex-col items-center py-8">
      <div className="w-full max-w-4xl px-4 flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white tracking-widest text-shadow">
           🚨 REPORT & SUSPEND PORTAL 🚨
        </h1>
        <button 
          onClick={onExit}
          className="bg-gray-800 text-white px-6 py-2 rounded font-bold border border-gray-600 hover:bg-gray-700 transition"
        >
          BACK TO DASHBOARD
        </button>
      </div>

      <div className="w-full max-w-4xl bg-black rounded-lg shadow-2xl overflow-hidden border border-red-500">
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 text-center border-b border-red-500">
          <h2 className="text-xl font-bold text-white tracking-widest">
            SCAN PASS TO SUSPEND
          </h2>
          <p className="text-red-200 text-sm mt-1">WARNING: THIS ACTION IS PERMANENT FOR THE DAY</p>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8">
          {/* LEFT: SCANNER */}
          <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-800 pr-0 md:pr-8">
            {!isScanning && !studentData && (
              <button 
                onClick={startScanner}
                className="w-full max-w-xs bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-red-500/30 border border-red-400 text-lg transition-transform active:scale-95"
              >
                START CAMERA
              </button>
            )}

            {isScanning && (
              <div className="w-full w-[300px]">
                <div id="reader" className="w-full rounded overflow-hidden shadow-inner bg-gray-900 border-2 border-red-500"></div>
                <button 
                  onClick={() => {
                    verifyAndSuspend(manualPin);
                  }}
                  className="mt-4 w-full text-gray-400 hover:text-white underline text-sm"
                >
                  Stop Camera
                </button>
              </div>
            )}
            
            {cameraError && (
               <div className="text-red-400 text-sm mt-4 text-center border border-red-500/30 p-3 rounded bg-red-950/20">
                 Camera access denied or blocked. Type PIN manually.
               </div>
            )}
          </div>

          {/* RIGHT: MANUAL ENTRY */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-inner">
              <h3 className="text-gray-400 text-sm mb-2 font-semibold">MANUAL ENTER PIN</h3>
              <input 
                type="text" 
                value={manualPin}
                onChange={(e) => setManualPin(e.target.value.toUpperCase())}
                placeholder="e.g. 24295-AI-01"
                className="w-full bg-black text-white px-4 py-3 rounded border border-gray-600 focus:border-red-500 focus:outline-none placeholder-gray-600 font-mono text-lg uppercase mb-4"
              />
              <button 
                onClick={() => verifyAndSuspend(manualPin)}
                disabled={!manualPin.trim()}
                className="w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 rounded shadow-lg transition-transform active:scale-95"
              >
                SUSPEND PIN INSTANTLY
              </button>
            </div>
          </div>
        </div>
      </div>

      {studentData && (
        <div className="w-full max-w-md mt-8 animate-fade-in-up">
           <FeedbackCard data={studentData} onNext={startScanner} isComplaint={true} />
        </div>
      )}
    </div>
  );
};

export default ComplaintScanner;
