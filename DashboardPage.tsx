import { useEffect, useState } from 'react';
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
import { MetricCard, PageHeader } from '../../components/shared/Common';

export default function DashboardPage() {
  const [data, setData] = useState<{
    m: DashboardMetrics;
    a: Activity[];
    c: ChartPoint[];
  } | null>(null);

  useEffect(() => {
    Promise.all([dashboardApi.metrics(), dashboardApi.activity(), dashboardApi.logins()]).then(
      ([m, a, c]) => setData({ m, a, c })
    );
  }, []);

  if (!data) return <Loader />;

  const { m, a, c } = data;

  return (
    <>
      <PageHeader
        title="Good morning, Melvin"
        description="Here's a real-time overview of your internship management system."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Total Mentors"
          value={m.totalMentors}
          icon={<FiUserCheck />}
          trend="+6 this month"
        />
        <MetricCard
          label="Total Students"
          value={m.totalStudents}
          icon={<FiUsers />}
          trend="+12% this month"
        />
        <MetricCard
          label="Active Mentors"
          value={m.activeMentors}
          icon={<FiCheckCircle />}
          trend="87.5% active rate"
        />
        <MetricCard
          label="Today's Mentor Logins"
          value={m.todayLogins}
          icon={<FiLogIn />}
          trend="+8.4% from yesterday"
        />
        <MetricCard
          label="Pending Approvals"
          value={m.pendingApprovals}
          icon={<FiClock />}
          trend="Action required"
        />
        <MetricCard
          label="Average Internship Progress"
          value={`${m.averageProgress}%`}
          icon={<FiTrendingUp />}
          trend="+4.2% this week"
        />
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
              <div key={x.id} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
                <div className="min-w-0">
                  <p className="text-sm">
                    <b>{x.actor}</b> {x.action.toLowerCase()}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {x.detail} · {x.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-bold">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/admin/mentors" className="btn-primary">
            <FiPlus /> Add mentor
          </a>
          <a href="/admin/notifications" className="btn-secondary">
            <FiSend /> Broadcast notification
          </a>
          <a href="/admin/audit-logs" className="btn-secondary">
            Review audit logs
          </a>
        </div>
      </div>
    </>
  );
}
