import { useAuth } from '../context/AuthContext';
import InvestorDashboard from './InvestorDashboard';
import InnovatorDashboard from './InnovatorDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }

    if (user.role === 'INVESTOR') {
        return <InvestorDashboard />;
    } else {
        return <InnovatorDashboard />;
    }
};

export default Dashboard;
