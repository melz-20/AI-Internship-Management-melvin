import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { dashboardApi } from '../../services/api/dashboard.api';
import type { ChartPoint } from '../../types/admin';
import { Loader } from '../../components/ui/Primitives';
import { PageHeader } from '../../components/shared/Common';
import { FiAward, FiTrendingUp, FiUsers, FiFilter } from 'react-icons/fi';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  return (
    <div className="card p-5">
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
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<{ l: ChartPoint[]; d: ChartPoint[] } | null>(null);
  const [dateFilter, setDateFilter] = useState('month');
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.logins(), dashboardApi.departments()]).then(([l, d]) =>
      setData({ l, d })
    );
  }, []);

  if (!data) return <Loader />;

  const colors = ['#7c3aed', '#a855f7', '#c084fc', '#ddd6fe'];
  const filteredLogins =
    dateFilter === 'week'
      ? data.l.slice(-4)
      : dateFilter === 'month'
        ? data.l.slice(-6)
        : data.l;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Mentor activity, student distribution, and system performance insights."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Average mentor performance"
          value="89.6%"
          icon={<FiAward />}
          trend="+3.4% this month"
        />
        <MetricCard
          label="Students per mentor"
          value="8.0"
          icon={<FiUsers />}
          trend="Healthy distribution"
        />
        <MetricCard
          label="Average internship progress"
          value="68%"
          icon={<FiTrendingUp />}
          trend="+4.2% this week"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Monthly login activity</h2>
              <p className="text-sm text-slate-500">Mentor logins over time</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDateFilter('week')}
                className={`btn-sm ${dateFilter === 'week' ? 'bg-violet-600 text-white' : 'bg-slate-100'}`}
              >
                Week
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`btn-sm ${dateFilter === 'month' ? 'bg-violet-600 text-white' : 'bg-slate-100'}`}
              >
                Month
              </button>
              <button
                onClick={() => setDateFilter('year')}
                className={`btn-sm ${dateFilter === 'year' ? 'bg-violet-600 text-white' : 'bg-slate-100'}`}
              >
                Year
              </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={filteredLogins}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: '#f5f3ff' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-bold">Department statistics</h2>
              <p className="text-sm text-slate-500">Student distribution by department</p>
            </div>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="rounded-lg p-2 text-violet-600 hover:bg-violet-50"
            >
              <FiFilter />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.d} dataKey="value" nameKey="name" outerRadius={95} label>
                  {data.d.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Pie>
                <Tooltip />
                {showLegend && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-6 card p-5">
        <h2 className="font-bold">Students and mentors by department</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-3 font-semibold">Department</th>
                <th className="py-3 font-semibold">Students</th>
                <th className="py-3 font-semibold">Mentors</th>
                <th className="py-3 font-semibold">Students / Mentor</th>
                <th className="py-3 font-semibold">Avg. Performance</th>
              </tr>
            </thead>
            <tbody>
              {data.d.map((x, i) => (
                <tr key={x.name} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 font-medium">{x.name}</td>
                  <td className="py-3">{x.value}</td>
                  <td className="py-3">{x.secondary || 0}</td>
                  <td className="py-3">
                    {x.secondary ? (x.value / x.secondary).toFixed(1) : 0}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${85 + i * 2}%`,
                            backgroundColor: colors[i],
                          }}
                        />
                      </div>
                      <span>{85 + i * 2}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
