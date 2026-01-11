import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Globe, Briefcase, DollarSign } from 'lucide-react';
import MandateCard from '../components/MandateCard';

const InvestorPublicProfile = () => {
    const { id } = useParams();
    const { api } = useAuth();
    const [investor, setInvestor] = useState(null);
    const [mandates, setMandates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, mandatesRes] = await Promise.all([
                    api.get(`/users/investor/${id}`),
                    api.get(`/mandates?investorId=${id}`)
                ]);
                setInvestor(userRes.data);
                setMandates(mandatesRes.data);
            } catch (error) {
                console.error("Failed to fetch investor profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, api]);

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;
    if (!investor) return <div className="p-8 text-center">Investor not found.</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{investor.email}</h1>
                        <p className="text-slate-500 mb-4">Investor Profile</p>

                        <div className="flex flex-wrap gap-4 text-slate-600">
                            <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Ticket Size: ${investor.minTicketSize?.toLocaleString()} - ${investor.maxTicketSize?.toLocaleString()}
                            </div>
                        </div>

                        {investor.interestedIndustries && investor.interestedIndustries.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">Interested Industries:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {investor.interestedIndustries.map((industry, index) => (
                                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                                            {industry}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mandates */}
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Investment Mandates</h2>
            {mandates.length === 0 ? (
                <p className="text-slate-500 italic">No mandates found for this investor.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mandates.map(mandate => (
                        <MandateCard
                            key={mandate.id}
                            mandate={{
                                ...mandate,
                                industryPreference: mandate.targetIndustry,
                                minInvestment: mandate.minTicketSize,
                                maxInvestment: mandate.maxTicketSize,
                                stagePreference: mandate.stagePreference
                            }}
                            isSaved={false}
                            onToggleSave={() => { }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvestorPublicProfile;
