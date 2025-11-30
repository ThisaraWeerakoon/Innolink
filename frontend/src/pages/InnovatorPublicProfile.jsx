import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Globe, Briefcase, Linkedin } from 'lucide-react';
import DealCard from '../components/DealCard';

const InnovatorPublicProfile = () => {
    const { id } = useParams();
    const { api } = useAuth();
    const [innovator, setInnovator] = useState(null);
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, dealsRes] = await Promise.all([
                    api.get(`/users/innovator/${id}`),
                    api.get(`/deals?innovatorId=${id}`) // Assuming this filter works or we filter client side
                ]);
                setInnovator(userRes.data);
                // Filter for active deals only
                const activeDeals = dealsRes.data.filter(d => d.status === 'ACTIVE');
                setDeals(activeDeals);
            } catch (error) {
                console.error("Failed to fetch innovator profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, api]);

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;
    if (!innovator) return <div className="p-8 text-center">Innovator not found.</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{innovator.companyName || 'Company Name'}</h1>
                        <div className="flex flex-wrap gap-4 text-slate-600">
                            <div className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-2" />
                                {innovator.industry}
                            </div>
                            <div className="flex items-center">
                                <Building2 className="w-4 h-4 mr-2" />
                                {innovator.fundingStage}
                            </div>
                        </div>
                    </div>
                    {innovator.linkedinUrl && (
                        <a
                            href={innovator.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            <Linkedin className="w-5 h-5 mr-2" />
                            View on LinkedIn
                        </a>
                    )}
                </div>
            </div>

            {/* Active Deals */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Deals</h2>
            {deals.length === 0 ? (
                <p className="text-slate-500 italic">No active deals found for this innovator.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deals.map(deal => (
                        <DealCard key={deal.id} deal={deal} isSaved={false} onToggleSave={() => { }} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default InnovatorPublicProfile;
