import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, Globe, Linkedin, Save, DollarSign, FileText } from 'lucide-react';

const Profile = () => {
    const { user, api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                const data = res.data;

                if (user.role === 'INNOVATOR') {
                    setFormData({
                        companyName: data.companyName || '',
                        industry: data.industry || '',
                        fundingStage: data.fundingStage || '',
                        linkedinUrl: data.linkedinUrl || ''
                    });
                } else if (user.role === 'INVESTOR') {
                    setFormData({
                        minTicketSize: data.minTicketSize || '',
                        maxTicketSize: data.maxTicketSize || '',
                        interestedIndustries: data.interestedIndustries ? data.interestedIndustries.join(', ') : '',
                        accreditationDocUrl: data.accreditationDocUrl || ''
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [api, user.role]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...formData };
            // Convert comma-separated industries back to array for investor
            if (user.role === 'INVESTOR' && payload.interestedIndustries) {
                payload.interestedIndustries = payload.interestedIndustries.split(',').map(i => i.trim());
            }

            await api.put('/users/profile', payload);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-emerald-600 h-32"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="flex items-end">
                            <div className="h-24 w-24 rounded-full bg-white p-1 shadow-md">
                                <div className="h-full w-full rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="h-12 w-12 text-slate-400" />
                                </div>
                            </div>
                            <div className="ml-4 mb-1">
                                <h1 className="text-2xl font-bold text-slate-900">{user.email}</h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {user.role === 'INNOVATOR' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        <span className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            Company Name
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Acme Corp"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                                        <input
                                            type="text"
                                            name="industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="Fintech"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Funding Stage</label>
                                        <select
                                            name="fundingStage"
                                            value={formData.fundingStage}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                        >
                                            <option value="">Select Stage</option>
                                            <option value="Pre-Seed">Pre-Seed</option>
                                            <option value="Seed">Seed</option>
                                            <option value="Series A">Series A</option>
                                            <option value="Series B+">Series B+</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        <span className="flex items-center gap-2">
                                            <Linkedin className="w-4 h-4" />
                                            LinkedIn URL
                                        </span>
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        value={formData.linkedinUrl}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </>
                        )}

                        {user.role === 'INVESTOR' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            <span className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                Min Ticket Size ($)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="minTicketSize"
                                            value={formData.minTicketSize}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="10000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            <span className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                Max Ticket Size ($)
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="maxTicketSize"
                                            value={formData.maxTicketSize}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                            placeholder="500000"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Interested Industries (comma separated)</label>
                                    <input
                                        type="text"
                                        name="interestedIndustries"
                                        value={formData.interestedIndustries}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Fintech, Healthtech, AI"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        <span className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Accreditation Document URL
                                        </span>
                                    </label>
                                    <input
                                        type="url"
                                        name="accreditationDocUrl"
                                        value={formData.accreditationDocUrl}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="https://s3.amazonaws.com/..."
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
