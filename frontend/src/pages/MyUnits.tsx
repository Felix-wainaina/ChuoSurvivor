// src/pages/MyUnits.tsx
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import UnitCard from '../components/features/UnitCard';
import type { Unit } from '../types/unit';

export default function MyUnits() {
  // BACKEND DEV NOTE: This state currently uses mock data for the UI. 
  // Swap this out with your database fetching logic (e.g., using useEffect or a custom hook like useUnits).
  
  // To test the "Empty State" (Image 1), just change this array to be completely empty: `useState<Unit[]>([])`
  const [units, setUnits] = useState<Unit[]>([
    { 
      id: '1', 
      name: 'Web Development', 
      materialCount: 6, 
      theme: { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-900', icon: '💻' } 
    },
    { 
      id: '2', 
      name: 'Linear Algebra', 
      materialCount: 3, 
      theme: { bg: 'bg-purple-100', border: 'border-purple-200', text: 'text-purple-900', icon: '📐' } 
    },
  ]);

  return (
    <div className="min-h-screen w-full flex flex-col font-dmsans bg-white text-slate-900">
      <Navbar />

      <main className="flex-1 px-8 md:px-16 max-w-5xl mx-auto w-full pt-12 pb-20">
        <h1 className="text-3xl font-bold mb-8">My units</h1>

        {/* LOGIC: If there are no units, show the Empty State. Otherwise, show the Dashboard. */}
        {units.length === 0 ? (
          
          /* --- EMPTY STATE (New User) --- */
          <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-gray-50/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl font-bold text-slate-900 mb-2">You haven't added a unit yet.</h2>
            <p className="text-slate-500 mb-8 max-w-md">
              A unit is a course — like Calculus or Biology. Everything you upload lives inside one.
            </p>
            <button className="bg-slate-900 text-white font-medium px-6 py-3 rounded-full hover:bg-slate-800 transition-colors shadow-sm">
              Add your first unit
            </button>
          </div>

        ) : (
          
          /* --- POPULATED STATE (Returning User) --- */
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-medium text-slate-600">Welcome back.</h2>
            
            {/* Motivational Banner */}
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 italic text-slate-600 font-medium">
              "One unit at a time."
            </div>

            {/* Reminder Banner */}
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Web Development: you're behind pace — 12 pages left before Thursday
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              
              {/* Loop through the dynamic units */}
              {units.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}

              {/* Add Unit Button Card */}
              <button className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-slate-900 hover:border-slate-400 transition-colors h-full min-h-[160px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold">Add a unit</span>
              </button>
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}