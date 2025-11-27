import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navigation Bar */}
            <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-slate-900">
                    Innolink
                </div>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                    Login
                </Link>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center p-4">
                <div className="text-center max-w-2xl">
                    <h1 className="text-5xl font-bold text-slate-900 mb-6">
                        Connect with <span className="text-emerald-600">Innovation</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-8">
                        Innolink bridges the gap between visionary innovators and strategic investors.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register?role=INNOVATOR" className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
                            Register as Innovator
                        </Link>
                        <Link to="/register?role=INVESTOR" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                            Register as Investor
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Landing;
