import Navbar from '../components/layout/Navbar';

export default function Landing() {
    return (
        // h-screen and overflow-hidden strictly enforce the 100vh rule
        <div className="h-screen w-full flex flex-col font-dmsans bg-white text-slate-900 overflow-hidden">

            <Navbar />

            {/* flex-1 allows this section to perfectly fill the remaining space below the navbar */}
            <main className="flex-1 flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto w-full pb-12">

                {/* Badges - Adjusted for light background */}
                <div className="flex gap-4 mb-6">
                    <span className="bg-purple-100 text-purple-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Offline-first
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        Gemma 4 Hackathon
                    </span>
                </div>

                {/* Headline: font-light emulates the "Insights Hub" reference */}
                <h1 className="text-6xl md:text-7xl font-light tracking-tight leading-[1.1] mb-6 max-w-5xl">
                    Study <span className="text-green-600 font-normal">smarter</span>. Even when the <span className="text-orange-500 font-normal">wifi</span> doesn't.
                </h1>

                {/* Subheadline */}
                <p className="text-xl md:text-2xl text-slate-600 max-w-3xl leading-relaxed mb-16 font-light">
                    Upload your <span className="text-pink-600 font-normal">notes</span>, get simple <span className="text-blue-600 font-normal">explanations</span> in English or Kiswahili, and generate instant <span className="text-purple-600 font-normal">quizzes</span> — all processed on your <span className="text-amber-500 font-normal">device</span>.
                </p>

                {/* Stats Row: Using borders to separate the items */}
                <div className="flex items-center w-full max-w-4xl border-t-2 border-b-2 border-gray-100 py-3 mb-auto">

                    <div className="flex flex-col flex-1 border-r-3 border-gray-200">
                        <span className="text-5xl font-light text-slate-900 mb-2">100%</span>
                        <span className="text-sm text-slate-500 font-medium">Offline</span>
                    </div>

                    <div className="flex flex-col flex-1 pl-12 border-r-3 border-gray-200">
                        <span className="text-5xl font-light text-slate-900 mb-2">2</span>
                        <span className="text-sm text-slate-500 font-medium">Languages</span>
                    </div>

                    <div className="flex flex-col flex-1 pl-12 border-r-3 border-gray-200">
                        <span className="text-5xl font-light text-slate-900 mb-2">0</span>
                        <span className="text-sm text-slate-500 font-medium">Data leaves device</span>
                    </div>

                    <div className="flex flex-col flex-1 pl-12">
                        <span className="text-5xl font-light text-slate-900 mb-2">3</span>
                        <span className="text-sm text-slate-500 font-medium">Steps to a quiz</span>
                    </div>

                </div>

                {/* Footer Text - Sits perfectly at the bottom of the viewport */}
                <div className="text-center text-slate-500 text-base mt-8">
                    New to ChuoSurvivor? Tap <span className="text-orange-500 font-bold">My units</span> above to get started — or pick up where you left off.
                </div>

            </main>
        </div>
    );
}