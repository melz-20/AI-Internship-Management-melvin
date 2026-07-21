import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiDownload } from 'react-icons/fi';
import { studentsApi } from '../../services/api/students.api';
import type { Student } from '../../types/student';
import { Avatar, Badge, Loader } from '../../components/ui/Primitives';
import { DataTable, Pagination } from '../../components/shared/DataTable';
import { PageHeader, SearchFilters } from '../../components/shared/Common';
import { exportToCSV } from '../../utils/exportUtils';

export default function StudentOverviewPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Student[] | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    studentsApi.list().then(setItems);
  }, []);

  const rows = useMemo(() => {
    if (!items) return [];

    let filtered = items.filter(
      (x) =>
        (status === 'ALL' || x.internshipStatus === status) &&
        `${x.name} ${x.email} ${x.department} ${x.mentor}`
          .toLowerCase()
          .includes(search.toLowerCase())
    );

    // Sort
    filtered = filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof Student];
      const bVal = b[sortBy as keyof Student];
      return aVal > bVal ? 1 : -1;
    });

    // Paginate
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [items, search, status, sortBy, page]);

  const handleExport = () => {
    if (!items) return;
    exportToCSV(
      items,
      [
        { key: 'name', label: 'Student Name' },
        { key: 'email', label: 'Email' },
        { key: 'department', label: 'Department' },
        { key: 'mentor', label: 'Mentor' },
        { key: 'internshipStatus', label: 'Status' },
        { key: 'progress', label: 'Progress (%)' },
        { key: 'attendance', label: 'Attendance (%)' },
        { key: 'performance', label: 'Performance (%)' },
      ],
      'students-export.csv'
    );
  };

  if (!items) return <Loader />;

  const totalPages = Math.ceil(
    items.filter(
      (x) =>
        (status === 'ALL' || x.internshipStatus === status) &&
        `${x.name} ${x.email} ${x.department} ${x.mentor}`
          .toLowerCase()
          .includes(search.toLowerCase())
    ).length / pageSize
  );

  return (
    <>
      <PageHeader
        title="Student Overview"
        description="Read-only oversight of internship progress, attendance, and performance."
        action={
          <button onClick={handleExport} className="btn-secondary">
            <FiDownload /> Export CSV
          </button>
        }
      />
      <SearchFilters search={search} setSearch={setSearch}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
          <option value="ALL">All progress</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="At Risk">At Risk</option>
          <option value="Not Started">Not Started</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input w-auto"
        >
          <option value="name">Sort by Name</option>
          <option value="progress">Sort by Progress</option>
          <option value="attendance">Sort by Attendance</option>
          <option value="performance">Sort by Performance</option>
        </select>
      </SearchFilters>
      <DataTable
        headers={[
          'Student',
          'Department',
          'Assigned Mentor',
          'Internship Status',
          'Attendance',
          'Performance',
          'Reports',
          '',
        ]}
      >
        {rows.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50/70">
            <td className="px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={s.avatar} />
                <div>
                  <b className="block text-slate-800">{s.name}</b>
                  <small className="text-slate-500">{s.email}</small>
                </div>
              </div>
            </td>
            <td className="px-5 py-4">{s.department}</td>
            <td className="px-5 py-4">
              <b className="text-slate-700">{s.mentor}</b>
            </td>
            <td className="px-5 py-4">
              <Badge value={s.internshipStatus} />
              <small className="ml-2 text-slate-500">{s.progress}%</small>
            </td>
            <td className="px-5 py-4">{s.attendance}%</td>
            <td className="px-5 py-4">{s.performance || '—'}{s.performance ? '%' : ''}</td>
            <td className="px-5 py-4">
              <Badge value={s.reportStatus} />
            </td>
            <td className="px-5 py-4">
              <button
                onClick={() => navigate(`/admin/students/${s.id}`)}
                className="rounded-lg p-2 text-violet-600 hover:bg-violet-50"
              >
                <FiChevronRight />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
      <Pagination page={page} total={totalPages} onChange={setPage} />
    </>
  );
}
