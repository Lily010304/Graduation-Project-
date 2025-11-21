// src/components/ManagerDashboard.jsx
import React, { useEffect, useState } from 'react';
import '../index.css';
import { BarChart3, Bell, BookOpen, FileText, LayoutDashboard, MessageSquare, Settings, UserPlus, Users } from 'lucide-react';

const Sider = ({ children, ...rest }) => <aside {...rest}>{children}</aside>;
const Content = ({ children, ...rest }) => <main {...rest}>{children}</main>;

// Match the main page background
const unifiedBackground = 'linear-gradient(to bottom right, #034242 0%, #ffffff 100%)';

const ManagerDashboard = () => {
  const [selectedKey, setSelectedKey] = useState('overview');
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('recruitmentOpen');
    if (saved === 'true' || saved === 'false') {
      setIsRecruitmentOpen(saved === 'true');
    }
  }, []);

  const toggleRecruitment = () => {
    const next = !isRecruitmentOpen;
    setIsRecruitmentOpen(next);
    try { localStorage.setItem('recruitmentOpen', String(next)); } catch (e) { void e }
  };

  // Mock data
  const dashboardStats = {
    totalStudents: 1247,
    totalInstructors: 42,
    activeCourses: 28,
    pendingApplications: 15,
    pendingDropouts: 8,
    revenue: 45890
  };

  const recentApplications = [
    { id: 1, name: 'Ahmed Hassan', email: 'ahmed@email.com', appliedDate: '2024-01-15', status: 'pending' },
    { id: 2, name: 'Sarah Mohammed', email: 'sarah@email.com', appliedDate: '2024-01-14', status: 'pending' },
    { id: 3, name: 'Omar Ali', email: 'omar@email.com', appliedDate: '2024-01-13', status: 'reviewed' }
  ];

  const menuItems = [
    { key: 'overview', icon: <LayoutDashboard size={16} />, label: 'Dashboard Overview' },
    { key: 'users', icon: <Users size={16} />, label: 'User Management' },
    { key: 'courses', icon: <BookOpen size={16} />, label: 'Course Management' },
    { key: 'recruitment', icon: <UserPlus size={16} />, label: 'Instructor Recruitment' },
    { key: 'applications', icon: <FileText size={16} />, label: 'Job Applications' },
    { key: 'announcements', icon: <Bell size={16} />, label: 'Announcements' },
    { key: 'community', icon: <MessageSquare size={16} />, label: 'Community Moderation' },
    { key: 'reports', icon: <BarChart3 size={16} />, label: 'Reports & Analytics' },
    { key: 'settings', icon: <Settings size={16} />, label: 'System Settings' }
  ];

  const StatCard = ({ title, value }) => (
    <div className="rounded-2xl bg-white/90 text-[#0f5a56] p-4 border border-white/30">
      <div className="text-xs uppercase tracking-wide text-[#0f5a56]/70">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );

  const DashboardOverview = () => (
    <div className="p-5">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Students" value={dashboardStats.totalStudents} />
        <StatCard title="Total Instructors" value={dashboardStats.totalInstructors} />
        <StatCard title="Active Courses" value={dashboardStats.activeCourses} />
        <StatCard title="Pending Apps" value={dashboardStats.pendingApplications} />
        <StatCard title="Pending Drop-outs" value={dashboardStats.pendingDropouts} />
        <StatCard title="Revenue ($)" value={dashboardStats.revenue.toLocaleString()} />
      </div>

      {/* Recruitment Status */}
      <div className="rounded-2xl bg-white/90 text-[#0f5a56] p-5 border border-white/30 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Instructor Recruitment Status</h3>
          <div className="flex items-center gap-3">
            <button onClick={toggleRecruitment} className={`w-12 h-6 rounded-full transition relative ${isRecruitmentOpen ? 'bg-[#58ACA9]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 ${isRecruitmentOpen ? 'right-1' : 'left-1'} w-5 h-5 rounded-full bg-white transition`} />
            </button>
            <span className={`text-sm px-3 py-1 rounded-full ${isRecruitmentOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isRecruitmentOpen ? 'Applications OPEN' : 'Applications CLOSED'}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#0f5a56]/80 text-center">
          {isRecruitmentOpen ? 'Instructor application form is visible to guests' : 'Instructor applications are hidden from guests'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-white/90 text-[#0f5a56] p-5 border border-white/30 mb-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 rounded-full bg-[#58ACA9] text-white font-semibold" onClick={() => { setIsRecruitmentOpen(true); try { localStorage.setItem('recruitmentOpen', 'true'); } catch (e) { void e } }}>Open Recruitment</button>
          <button className="px-4 py-2 rounded-full border border-[#0f5a56]/30">Add New Course</button>
          <button className="px-4 py-2 rounded-full border border-[#0f5a56]/30">Post Announcement</button>
          <button className="px-4 py-2 rounded-full border border-[#0f5a56]/30">View Reports</button>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="rounded-2xl bg-white/90 text-[#0f5a56] p-5 border border-white/30">
        <h3 className="font-semibold mb-4">Recent Instructor Applications</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[#0f5a56]/70 border-b">
                <th className="py-2 pr-6">Name</th>
                <th className="py-2 pr-6">Email</th>
                <th className="py-2 pr-6">Applied Date</th>
                <th className="py-2 pr-6">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2 pr-6">{r.name}</td>
                  <td className="py-2 pr-6">{r.email}</td>
                  <td className="py-2 pr-6">{r.appliedDate}</td>
                  <td className="py-2 pr-6">
                    <span className={`px-2 py-1 rounded-full text-xs ${r.status==='pending' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{r.status.toUpperCase()}</span>
                  </td>
                  <td className="py-2">
                    <button className="text-[#58ACA9] font-semibold">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedKey) {
      case 'overview':
        return <DashboardOverview />;
      case 'recruitment':
        return (
          <div className="p-5">
            <div className="rounded-2xl bg-white/90 text-[#0f5a56] p-6 border border-white/30">
              <h3 className="font-semibold mb-2">Instructor Recruitment Control</h3>
              <p className="text-sm mb-4">Manager can control when instructor applications are visible to guests.</p>
              <div className="text-center py-10">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${isRecruitmentOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isRecruitmentOpen ? '🟢 RECRUITMENT ACTIVE' : '🔴 RECRUITMENT INACTIVE'}
                </div>
                <div className="mt-6">
                  <button
                    className="px-6 py-3 rounded-full bg-[#58ACA9] text-white font-semibold"
                    onClick={() => setIsRecruitmentOpen(!isRecruitmentOpen)}
                  >
                    {isRecruitmentOpen ? 'Close Recruitment' : 'Open Recruitment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-5">
            <div className="rounded-2xl bg-white/90 text-[#0f5a56] p-6 border border-white/30">
              <h3 className="font-semibold mb-3">{menuItems.find(item => item.key === selectedKey)?.label}</h3>
              <p className="text-sm">This section is under development. In the full system, you would manage:</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>User accounts and permissions</li>
                <li>Course creation and assignment</li>
                <li>System announcements</li>
                <li>Community moderation</li>
                <li>Analytics and reports</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white" style={{ backgroundImage: unifiedBackground, backgroundColor: '#034242' }}>
      {/* Utility top bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-end px-6 text-[11px] tracking-wide bg-black/30 backdrop-blur z-50 gap-4 text-white/80">
        <select className="bg-transparent focus:outline-none">
          <option>USD</option>
        </select>
        <select className="bg-transparent focus:outline-none">
          <option>English</option>
        </select>
        <div className="hidden md:flex gap-3">
          <a href="mailto:info@sconcelms.com" className="hover:text-white">info@sconce.com</a>
          <span className="text-white/40">|</span>
          <a href="tel:+972597111111" className="hover:text-white">+972 597 111 111</a>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="absolute top-8 left-0 right-0 z-40 flex items-center justify-between px-10 h-16 bg-white/5 backdrop-blur border-b border-white/10">
        <div className="flex items-center gap-4">
          <img src="/sconceLogo-removebg-preview.svg" alt="logo" className="w-12 h-12 drop-shadow" />
          <span className="font-display font-semibold tracking-[0.4rem] text-sm md:text-base">S C O N C E</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs">
          <button
            className="px-5 py-2 rounded-full bg-[#58ACA9] text-dark font-semibold tracking-wide transition-all duration-300 hover:bg-[#034242] hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#034242]/60 active:scale-95"
            onClick={() => { window.location.hash = '#/'; }}
          >
            Go to Site
          </button>
          <button
            className="text-white/70 hover:text-white tracking-wide"
            onClick={() => { /* clear session placeholder */ window.location.hash = '#/login'; }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Dashboard layout under the same chrome */}
      <div className="pt-28 flex">
        <Sider className="hidden md:block w-[280px] bg-[#034141] border-r border-white/20 min-h-[calc(100vh-7rem)]">
          <div className="p-4 text-center font-bold">Manager Console</div>
          <ul className="px-2 space-y-1 text-sm">
            {menuItems.map(mi => (
              <li key={mi.key}>
                <button onClick={()=>setSelectedKey(mi.key)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left ${selectedKey===mi.key? 'bg-white/10':'hover:bg-white/5'}`}>
                  {mi.icon}
                  <span>{mi.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </Sider>
        <Content className="flex-1 bg-transparent">
          <div className="px-6 md:px-8 py-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-semibold">{menuItems.find(item => item.key === selectedKey)?.label || 'Manager Dashboard'}</h1>
              <span className="text-white/80 hidden md:inline">Welcome, Manager</span>
            </div>
            <div className="bg-white/10 rounded-2xl">
              {renderContent()}
            </div>
          </div>
        </Content>
      </div>
    </div>
  );
};

export default ManagerDashboard;