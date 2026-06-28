import React, { useState, useEffect } from 'react';
import { Shield, Users, Package, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import { getPendingReports, resolveReport, banUser, getAdminStats } from '../../modules/admin/adminService';
import { useAuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, pendingReports: 0, totalOrders: 0 });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [statsRes, reportsRes] = await Promise.all([getAdminStats(), getPendingReports()]);
    if (statsRes.success) setStats(statsRes.stats);
    if (reportsRes.success) setReports(reportsRes.reports);
    setLoading(false);
  };

  const handleResolve = async (reportId, action) => {
    const result = await resolveReport(reportId, action);
    if (result.success) { toast.success('রিপোর্ট রেজোলভ হয়েছে'); loadData(); }
  };

  const handleBan = async (userId) => {
    const result = await banUser(userId, 'Admin action');
    if (result.success) { toast.success('ইউজার ব্যান হয়েছে'); loadData(); }
  };

  const isAdmin = user?.email?.includes('admin') || user?.uid === 'ADMIN_UID';
  if (!isAdmin) return <div className="p-8 text-center">Access Denied</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <Shield size={28} className="text-primary-500" /> Admin Dashboard
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Users size={20} />} label="Users" value={stats.totalUsers} color="blue" />
        <StatCard icon={<Package size={20} />} label="Products" value={stats.totalProducts} color="green" />
        <StatCard icon={<AlertTriangle size={20} />} label="Reports" value={stats.pendingReports} color="red" />
        <StatCard icon={<CheckCircle size={20} />} label="Orders" value={stats.totalOrders} color="purple" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">Pending Reports</h2>
        </div>
        {reports.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No pending reports</p>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {reports.map(report => (
              <div key={report.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{report.reason}</p>
                  <p className="text-xs text-gray-500">{report.details}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleResolve(report.id, 'ignored')}>Ignore</Button>
                  <Button variant="danger" size="sm" leftIcon={<Ban size={14} />} onClick={() => handleBan(report.targetId)}>Ban</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-600', purple: 'bg-purple-50 text-purple-600' };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
};

export default AdminDashboard;
