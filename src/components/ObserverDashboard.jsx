import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TABLES = [
    'ggu_students',
    'giet_degree',
    'giet_engineering',
    'giet_pharmacy',
    'giet_polytechnic',
    'maitri_vip_registrations',
    'maitri_faculty_registrations'
];

const ObserverDashboard = ({ onExit }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [stats, setStats] = useState({ total: 0, vip: 0, student: 0, today: 0 });
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'observer123') { // Simple password matching user requirements
            setIsAuthenticated(true);
            fetchDashboardData();
        } else {
            alert("Invalid Observer Password");
        }
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        let totalCount = 0;
        let vipCount = 0;
        let studentCount = 0;
        let todayCount = 0;
        let allRecentLogs = [];

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        try {
            const fetchPromises = TABLES.map(async (table) => {
                // Fetch counts for attended guests
                const { data, error } = await supabase
                    .from(table)
                    .select('full_name, is_vip, entered_at')
                    .eq('attended_fest', true);

                if (!error && data) {
                    totalCount += data.length;

                    data.forEach(row => {
                        if (row.is_vip || table === 'maitri_vip_registrations') {
                            vipCount++;
                        } else {
                            studentCount++;
                        }

                        if (row.entered_at && new Date(row.entered_at) >= todayStart) {
                            todayCount++;
                        }

                        // Push to logs if it has an entry time
                        if (row.entered_at) {
                            const tableToBlock = {
                                'ggu_students': 'GGU COLLEGE',
                                'giet_degree': 'GIET DEGREE',
                                'giet_engineering': 'GIET ENGINEERING',
                                'giet_pharmacy': 'GIET PHARMACY',
                                'giet_polytechnic': 'GIET POLY',
                                'maitri_vip_registrations': 'VIP GUESTS',
                                'maitri_faculty_registrations': 'FACULTY & STAFF'
                            };

                            allRecentLogs.push({
                                ...row,
                                table: table,
                                blockName: tableToBlock[table] || table.replace(/_/g, ' ').toUpperCase()
                            });
                        }
                    });
                }
            });

            await Promise.all(fetchPromises);

            // Sort logs by newest first, take top 50
            allRecentLogs.sort((a, b) => new Date(b.entered_at) - new Date(a.entered_at));
            setLogs(allRecentLogs.slice(0, 50));

            setStats({
                total: totalCount,
                vip: vipCount,
                student: studentCount,
                today: todayCount
            });

        } catch (err) {
            console.error("Failed to fetch observer data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            // Refresh data every 10 seconds automatically
            const interval = setInterval(fetchDashboardData, 10000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 p-6">
                <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[40%] bg-blue-900/20 rounded-[100%] blur-[120px] pointer-events-none"></div>

                <div className="bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-sm border border-blue-500/30 relative z-10 transition-transform hover:scale-[1.01] duration-300">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase">Observer Panel</h2>
                    </div>
                    <p className="text-slate-400 text-sm font-medium mb-8">Enter observer password to view live registration data</p>

                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Observer Password</label>
                            <input
                                type="password"
                                className="w-full bg-slate-950/80 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono tracking-widest placeholder:tracking-normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                            <p className="text-slate-600 text-[10px] mt-2 font-mono"></p>
                        </div>

                        <button
                            type="submit"
                            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-[0.98] uppercase tracking-widest text-sm border border-blue-500 hover:border-blue-400"
                        >
                            View Dashboard
                        </button>
                    </form>

                    <button onClick={onExit} className="mt-6 w-full text-slate-500 font-bold text-xs uppercase hover:text-white transition-colors">
                        ← Back to Scanner Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-white p-4 md:p-8 relative">
            <div className="absolute top-4 md:top-8 left-4 md:left-8 flex gap-4 z-20">
                <button onClick={onExit} className="bg-slate-800 hover:bg-slate-700 py-2 px-4 rounded-lg font-bold text-xs md:text-sm uppercase tracking-wider transition-colors border border-slate-700">
                    ← Exit Dashboard
                </button>
            </div>

            <div className="max-w-6xl mx-auto w-full pt-20 md:pt-16 z-10 relative">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">LIVE DASHBOARD</h1>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold tracking-[0.2em] uppercase mt-1">Real-time Check-in Analytics</p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-slate-900 py-2 px-4 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Refresh</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
                    {/* Stat Cards */}
                    <div className="bg-slate-900/60 p-6 rounded-2xl border border-blue-500/20 shadow-[0_4px_20px_rgba(59,130,246,0.1)] backdrop-blur-sm flex flex-col items-center justify-center text-center">
                        <span className="text-4xl md:text-5xl font-black text-white bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent drop-shadow-md">{stats.total}</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-blue-400 mt-2">Total Passes</span>
                    </div>
                    <div className="bg-slate-900/60 p-6 rounded-2xl border border-yellow-500/20 shadow-[0_4px_20px_rgba(234,179,8,0.1)] backdrop-blur-sm flex flex-col items-center justify-center text-center">
                        <span className="text-4xl md:text-5xl font-black text-white bg-gradient-to-br from-white to-yellow-200 bg-clip-text text-transparent drop-shadow-md">{stats.vip}</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-yellow-400 mt-2">VIP Passes</span>
                    </div>
                    <div className="bg-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 shadow-[0_4px_20px_rgba(99,102,241,0.1)] backdrop-blur-sm flex flex-col items-center justify-center text-center">
                        <span className="text-4xl md:text-5xl font-black text-white bg-gradient-to-br from-white to-indigo-200 bg-clip-text text-transparent drop-shadow-md">{stats.student}</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-indigo-400 mt-2">Student Passes</span>
                    </div>
                    <div className="bg-slate-900/60 p-6 rounded-2xl border border-green-500/20 shadow-[0_4px_20px_rgba(34,197,94,0.1)] backdrop-blur-sm flex flex-col items-center justify-center text-center">
                        <span className="text-4xl md:text-5xl font-black text-white bg-gradient-to-br from-white to-green-200 bg-clip-text text-transparent drop-shadow-md">{stats.today}</span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-green-400 mt-2">Entries Today</span>
                    </div>
                </div>

                <div className="bg-slate-900/40 rounded-3xl border border-slate-800/60 backdrop-blur-xl overflow-hidden flex flex-col h-[60dvh] md:h-auto md:max-h-[600px] shadow-2xl">
                    <div className="bg-slate-900 py-4 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </div>
                            <h3 className="font-bold uppercase tracking-widest text-sm text-slate-200">Live Entry Log</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 pb-10">
                                <p className="font-mono text-sm tracking-widest uppercase">NO PASSES YET</p>
                            </div>
                        ) : (
                            logs.map((log, index) => (
                                <div key={index} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-start md:items-center gap-4">
                                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-900 border ${log.is_vip ? 'border-yellow-500/50 text-yellow-400' : 'border-indigo-500/50 text-indigo-400'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-base leading-tight">{log.full_name}</p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${log.is_vip ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                    {log.blockName}
                                                </span>
                                                {log.is_vip && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-sm">
                                                        VIP
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t border-slate-800 md:border-t-0 pt-3 md:pt-0">
                                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Entered At</p>
                                        <p className="font-mono text-emerald-400 text-sm">
                                            {new Date(log.entered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ObserverDashboard;
