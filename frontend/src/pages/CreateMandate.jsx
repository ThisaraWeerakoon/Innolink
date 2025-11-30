import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Target, Globe, DollarSign, Briefcase, Users, X, Check, Eye } from 'lucide-react';

const CreateMandate = () => {
    const { user, api } = useAuth();
    const [mandates, setMandates] = useState([]);
    const [selectedMandateId, setSelectedMandateId] = useState(null);
    const [interests, setInterests] = useState([]);
    const [loadingInterests, setLoadingInterests] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetIndustry: '',
        stagePreference: '',
        minTicketSize: '',
        maxTicketSize: '',
        geography: '',
        currency: 'USD'
    });

    useEffect(() => {
        if (user) {
            fetchMandates();
        }
    }, [user]);

    const fetchMandates = async () => {
        try {
            const response = await api.get(`/mandates?investorId=${user.id}`);
            setMandates(response.data);
        } catch (error) {
            console.error("Failed to fetch mandates", error);
        }
    };

    const fetchInterests = async (mandateId) => {
        setLoadingInterests(true);
        setSelectedMandateId(mandateId);
        try {
            const response = await api.get(`/mandates/${mandateId}/interests`);
            setInterests(response.data);
        } catch (error) {
            console.error("Failed to fetch interests", error);
            setInterests([]);
        } finally {
            setLoadingInterests(false);
        }
    };

    const updateInterestStatus = async (interestId, status) => {
        try {
            await api.put(`/mandates/interests/${interestId}/status?status=${status}`);
            setInterests(prev => prev.map(i => i.id === interestId ? { ...i, status } : i));
        } catch (error) {
            console.error("Failed to update interest status", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/mandates', formData);
            alert('Mandate created successfully!');
            setFormData({
                title: '',
                description: '',
                targetIndustry: '',
                stagePreference: '',
                minTicketSize: '',
                maxTicketSize: '',
                geography: '',
                currency: 'USD'
            });
            fetchMandates();
        } catch (error) {
            console.error("Failed to create mandate", error);
            alert('Failed to create mandate');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Mandate</h1>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mandate Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="e.g., Series A Fintech in SEA"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Industry</label>
                            <input
                                type="text"
                                name="targetIndustry"
                                value={formData.targetIndustry}
                                onChange={handleChange}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Fintech"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stage Preference</label>
                            <select
                                name="stagePreference"
                                value={formData.stagePreference}
                                onChange={handleChange}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                            >
                                <option value="">Select Stage</option>
                                <option value="Pre-Seed">Pre-Seed</option>
                                <option value="Seed">Seed</option>
                                <option value="Series A">Series A</option>
                                <option value="Series B+">Series B+</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Min Ticket Size</label>
                            <input
                                type="number"
                                name="minTicketSize"
                                value={formData.minTicketSize}
                                onChange={handleChange}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="10000"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Max Ticket Size</label>
                            <input
                                type="number"
                                name="maxTicketSize"
                                value={formData.maxTicketSize}
                                onChange={handleChange}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="500000"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Geography</label>
                        <input
                            type="text"
                            name="geography"
                            value={formData.geography}
                            onChange={handleChange}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="e.g., Southeast Asia, Global"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Describe your investment thesis..."
                            required
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="flex items-center bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Mandate
                        </button>
                    </div>
                </form>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">My Mandates</h2>
            <div className="space-y-4">
                {mandates.length === 0 ? (
                    <p className="text-slate-500 italic">No mandates created yet.</p>
                ) : (
                    mandates.map(mandate => (
                        <div key={mandate.id} className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{mandate.title}</h3>
                                    <p className="text-sm text-slate-500">{new Date(mandate.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => fetchInterests(mandate.id)}
                                        className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                                    >
                                        <Users className="w-4 h-4 mr-1" />
                                        View Interests
                                    </button>
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                                        {mandate.stagePreference}
                                    </span>
                                </div>
                            </div>
                            <p className="text-slate-600 mb-4">{mandate.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <div className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1" />
                                    {mandate.targetIndustry}
                                </div>
                                <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    {mandate.minTicketSize?.toLocaleString()} - {mandate.maxTicketSize?.toLocaleString()} {mandate.currency}
                                </div>
                                <div className="flex items-center">
                                    <Globe className="w-4 h-4 mr-1" />
                                    {mandate.geography}
                                </div>
                            </div>

                            {/* Interests Section */}
                            {selectedMandateId === mandate.id && (
                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-slate-900">Interested Innovators</h4>
                                        <button onClick={() => setSelectedMandateId(null)} className="text-slate-400 hover:text-slate-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {loadingInterests ? (
                                        <div className="text-center py-4 text-slate-500">Loading interests...</div>
                                    ) : interests.length === 0 ? (
                                        <div className="text-center py-4 text-slate-500 italic">No interests expressed yet.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {interests.map(interest => (
                                                <div key={interest.id} className="flex items-center justify-between bg-slate-50 p-3 rounded">
                                                    <div>
                                                        <Link to={`/innovator/${interest.innovatorId}`} className="font-medium text-slate-900 hover:text-emerald-600 hover:underline">
                                                            {interest.innovatorName}
                                                        </Link>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            Status: <span className={`font-medium ${interest.status === 'CONTACTED' ? 'text-blue-600' :
                                                                    interest.status === 'REJECTED' ? 'text-red-600' : 'text-slate-600'
                                                                }`}>{interest.status}</span>
                                                            <span className="mx-2">•</span>
                                                            {new Date(interest.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {interest.status !== 'CONTACTED' && interest.status !== 'REJECTED' && (
                                                            <>
                                                                <button
                                                                    onClick={() => updateInterestStatus(interest.id, 'CONTACTED')}
                                                                    className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                                                    title="Mark as Contacted"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => updateInterestStatus(interest.id, 'REJECTED')}
                                                                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                                    title="Reject"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <Link
                                                            to={`/innovator/${interest.innovatorId}`}
                                                            className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                                            title="View Profile"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CreateMandate;
