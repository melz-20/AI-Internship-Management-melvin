import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiUserCheck,
  FiLogIn,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiPlus,
  FiSend,
} from 'react-icons/fi';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardApi } from '../../services/api/dashboard.api';
import type { DashboardMetrics, Activity, ChartPoint } from '../../types/admin';
import { Loader } from '../../components/ui/Primitives';
import { PageHeader } from '../../components/shared/Common';
import { adminProfile } from '../../services/mock/data/seed';
import { formatLongDate, getGreetingFromDate } from '../../utils/dateUtils';

type MetricKey = 'totalMentors' | 'totalStudents' | 'activeMentors' | 'todayLogins' | 'pendingApprovals' | 'averageProgress';

interface ClickableMetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  onClick?: () => void;
}

function ClickableMetricCard({ label, value, icon, trend, onClick }: ClickableMetricCardProps) {
  return (
    <button
      onClick={onClick}
      className="card p-5 text-left transition hover:shadow-md hover:ring-2 hover:ring-violet-500"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {trend && <p className="mt-2 text-xs font-semibold text-emerald-600">{trend}</p>}
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-xl text-violet-600">
          {icon}
        </span>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{
    m: DashboardMetrics;
    a: Activity[];
    c: ChartPoint[];
  } | null>(null);
  const [greeting, setGreeting] = useState(getGreetingFromDate());
  const [currentDate, setCurrentDate] = useState(formatLongDate());

  useEffect(() => {
    Promise.all([dashboardApi.metrics(), dashboardApi.activity(), dashboardApi.logins()]).then(
      ([m, a, c]) => setData({ m, a, c })
    );

    const updateTime = () => {
      const now = new Date();
      setGreeting(getGreetingFromDate(now));
      setCurrentDate(formatLongDate(now));
    };

    updateTime();
    const timer = window.setInterval(updateTime, 60000);

    return () => window.clearInterval(timer);
  }, []);

  if (!data) return <Loader />;

  const { m, a, c } = data;

  const metricCards: Array<{
    label: string;
    key: MetricKey;
    icon: React.ReactNode;
    trend: string;
    navigate: string;
  }> = [
    {
      label: 'Total Mentors',
      key: 'totalMentors',
      icon: <FiUserCheck />,
      trend: '+6 this month',
      navigate: '/admin/mentors',
    },
    {
      label: 'Total Students',
      key: 'totalStudents',
      icon: <FiUsers />,
      trend: '+12% this month',
      navigate: '/admin/students',
    },
    {
      label: 'Active Mentors',
      key: 'activeMentors',
      icon: <FiCheckCircle />,
      trend: '87.5% active rate',
      navigate: '/admin/mentors?status=ACTIVE',
    },
    {
      label: "Today's Mentor Logins",
      key: 'todayLogins',
      icon: <FiLogIn />,
      trend: '+8.4% from yesterday',
      navigate: '/admin/mentors/m1/login-history',
    },
    {
      label: 'Pending Approvals',
      key: 'pendingApprovals',
      icon: <FiClock />,
      trend: 'Action required',
      navigate: '/admin/mentors?status=PENDING',
    },
    {
      label: 'Average Internship Progress',
      key: 'averageProgress',
      icon: <FiTrendingUp />,
      trend: '+4.2% this week',
      navigate: '/admin/analytics',
    },
  ];

  const handleActivityClick = (activity: Activity) => {
    if (activity.type === 'mentor') {
      navigate('/admin/mentors');
    } else if (activity.type === 'admin') {
      navigate('/admin/audit-logs');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <>
      <PageHeader
        title={`${greeting}, ${adminProfile.name}`}
        description={currentDate}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <ClickableMetricCard
            key={card.key}
            label={card.label}
            value={m[card.key]}
            icon={card.icon}
            trend={card.trend}
            onClick={() => navigate(card.navigate)}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="card p-5 xl:col-span-3">
          <div className="mb-4">
            <h2 className="font-bold">Monthly mentor login activity</h2>
            <p className="text-sm text-slate-500">Authentication activity over the current year</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={c}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Recent activity</h2>
              <p className="text-sm text-slate-500">Latest system events</p>
            </div>
            <FiClock className="text-violet-600" />
          </div>
          <div className="space-y-4">
            {a.map((x) => (
              <button
                key={x.id}
                onClick={() => handleActivityClick(x)}
                className="flex gap-3 text-left transition hover:opacity-75"
              >
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
                <div className="min-w-0">
                  <p className="text-sm">
                    <b>{x.actor}</b> {x.action.toLowerCase()}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {x.detail} · {x.time}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-bold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin/mentors/add')}
            className="btn-primary"
          >
            <FiPlus /> Add mentor
          </button>
          <button
            onClick={() => navigate('/admin/notifications')}
            className="btn-secondary"
          >
            <FiSend /> Broadcast notification
          </button>
          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="btn-secondary"
          >
            Review audit logs
          </button>
        </div>
      </div>
    </>
  );
}
