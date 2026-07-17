import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full bg-white text-slate-900 px-8 py-6 flex items-center justify-between font-touchme">
      
      {/* LEFT SIDE: Logo & My Units Pill */}
      <div className="flex items-center gap-10">
        
        {/* The Brand - Now wrapped in a Link to go back to Home (/) */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
          <span className="text-2xl font-black uppercase tracking-widest">
            ChuoSurvivor
          </span>
        </Link>

        {/* My Units Pill - Now a Link that routes to /my-units */}
        <Link 
          to="/my-units" 
          className="border-2 border-[#b6feb5] text-slate-900 rounded-full px-8 py-2.5 text-base font-bold transition-all hover:bg-[#b6feb5] inline-block"
        >
          My units
        </Link>

      </div>

      {/* RIGHT SIDE: Language & Offline Badge */}
      <div className="flex items-center gap-4">
        <span className="border-2 border-gray-200 rounded-full px-6 py-2.5 text-base font-medium">
          EN | SW
        </span>
        
        <span className="border-2 border-[#b6feb5] bg-[#b6feb5]/10 text-slate-900 rounded-full px-6 py-2.5 text-base font-bold tracking-wide">
          Offline ready
        </span>
      </div>
      
    </nav>
  )
}