import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, User, Search, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide navbar on auth pages and landing page
    if (['/login', '/register', '/'].includes(location.pathname)) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/dashboard" className="text-2xl font-bold text-emerald-600">Innolink</Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {user.role === 'INVESTOR' ? (
                                <>
                                    <Link to="/dashboard" className="border-transparent text-slate-500 hover:border-emerald-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Find Deals
                                    </Link>
                                    <Link to="/create-mandate" className="border-transparent text-slate-500 hover:border-emerald-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Create Mandates
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/dashboard" className="border-transparent text-slate-500 hover:border-emerald-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Find Mandates
                                    </Link>
                                    <Link to="/create-deal" className="border-transparent text-slate-500 hover:border-emerald-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Create Deals
                                    </Link>
                                </>
                            )}
                            <Link to="/messages" className="border-transparent text-slate-500 hover:border-emerald-500 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Messages
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="Search"
                            />
                        </div>
                        <button className="p-1 rounded-full text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" />
                        </button>
                        <div className="ml-3 relative flex items-center gap-2">
                            <div className="flex items-center">
                                <span className="text-sm font-medium text-slate-700 mr-2">{user.email}</span>
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-2 p-1 rounded-full text-slate-400 hover:text-red-500 focus:outline-none"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
