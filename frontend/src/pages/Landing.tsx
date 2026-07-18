import Navbar from '../components/layout/Navbar';

export default function Landing() {
    return (
        // h-screen and overflow-hidden strictly enforce the 100vh rule
        <div className="min-h-screen w-full flex flex-col font-dmsans bg-white text-slate-900 overflow-x-hidden">

            <Navbar />

            {/* flex-1 allows this section to perfectly fill the remaining space below the navbar */}
            <main className="flex-1 flex flex-col justify-start md:justify-center px-4 max-[450px]:px-6 sm:px-8 md:px-16 max-w-7xl mx-auto w-full py-8 md:py-12">

                {/* Badges - Adjusted for light background */}
                <div className="flex flex-wrap gap-2 sm:gap-4 max-[450px]:justify-center mb-6">
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Offline-first
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Gemma 4 Hackathon
                    </span>
                </div>

                {/* Headline: font-light emulates the "Insights Hub" reference */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-light tracking-tight leading-[1.1] mb-6 max-w-5xl break-words max-[450px]:text-center">
                    Study <span className="text-green-600 font-normal">smarter</span>. Even when the <span className="text-orange-500 font-normal">wifi</span> doesn't.
                </h1>

                {/* Subheadline */}
                <p className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-3xl leading-relaxed mb-10 md:mb-16 font-light max-[450px]:text-center">
                    Upload your <span className="text-pink-600 font-normal">notes</span>, get simple <span className="text-blue-600 font-normal">explanations</span> in English or Kiswahili, and generate instant <span className="text-purple-600 font-normal">quizzes</span> — all processed on your <span className="text-amber-500 font-normal">device</span>.
                </p>

                {/* Stats Row: Using borders to separate the items */}
                <div className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-4xl border-t-2 border-b-2 border-gray-100 py-3">

                    <div className="flex flex-col items-center sm:items-start border-r-2 border-gray-200">
                        <span className="text-3xl sm:text-5xl font-light text-slate-900 mb-2">100%</span>
                        <span className="text-sm text-slate-500 font-medium">Offline</span>
                    </div>

                    <div className="flex flex-col items-center sm:items-start border-r-0 sm:border-r-2 sm:pl-8 border-gray-200">
                        <span className="text-3xl sm:text-5xl font-light text-slate-900 mb-2">2</span>
                        <span className="text-sm text-slate-500 font-medium">Languages</span>
                    </div>

                    <div className="flex flex-col items-center sm:items-start pt-4 sm:pt-0 sm:pl-8 border-r-2 border-gray-200">
                        <span className="text-3xl sm:text-5xl font-light text-slate-900 mb-2">0</span>
                        <span className="text-sm text-slate-500 font-medium">Data leaves device</span>
                    </div>

                    <div className="flex flex-col items-center sm:items-start pt-4 sm:pt-0 sm:pl-8">
                        <span className="text-3xl sm:text-5xl font-light text-slate-900 mb-2">3</span>
                        <span className="text-sm text-slate-500 font-medium">Steps to a quiz</span>
                    </div>

                </div>

                {/* Footer Text - Sits perfectly at the bottom of the viewport */}
                <div className="text-center text-slate-500 text-sm sm:text-base mt-6">
                    New to ChuoSurvivor? Tap <span className="text-orange-500 font-bold">My units</span> above to get started — or pick up where you left off.
                </div>

            </main>
        </div>
    );
}
