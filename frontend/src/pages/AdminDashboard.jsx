import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ──────── tiny reusable metric card ──────── */
function MetricCard({ label, value, icon }) {
  return (
    <div className="glass-card p-5 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted mt-1">{label}</div>
    </div>
  );
}

/* ──────── Tabs ──────── */
const TABS = [
  { key: 'dashboard', label: '📊 Dashboard' },
  { key: 'classes', label: '🏫 Classes' },
  { key: 'students', label: '👩‍🎓 Students' },
  { key: 'reports', label: '📈 Reports' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`btn whitespace-nowrap text-sm ${
                tab === t.key ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'classes' && <ClassesTab />}
        {tab === 'students' && <StudentsTab />}
        {tab === 'reports' && <ReportsTab />}
      </main>
    </div>
  );
}

/* ────────────────────── Dashboard Tab ──────────────────────── */
function DashboardTab() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard').then((r) => setMetrics(r.data));
  }, []);

  if (!metrics) return <p className="text-text-muted text-center py-8">Loading metrics…</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard label="Avg Accuracy" value={`${metrics.average_accuracy}%`} icon="🎯" />
      <MetricCard label="Submissions" value={metrics.total_submissions} icon="📝" />
      <MetricCard label="Students" value={metrics.total_students} icon="👩‍🎓" />
      <MetricCard label="Stories" value={metrics.total_stories} icon="📖" />
    </div>
  );
}

/* ────────────────────── Classes Tab ──────────────────────── */
function ClassesTab() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/admin/classes').then((r) => setClasses(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.post('/admin/classes', { class_name: name.trim() });
      setName('');
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="glass-card p-5 flex gap-3">
        <input className="input flex-1" placeholder="Class name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-primary" disabled={loading}>Create</button>
      </form>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted border-b border-white/10">
              <th className="p-4">ID</th>
              <th className="p-4">Class Name</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="p-4 text-text-muted">{c.id}</td>
                <td className="p-4 font-medium">{c.class_name}</td>
                <td className="p-4 text-text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr><td colSpan={3} className="p-8 text-center text-text-muted">No classes yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────── Students Tab ──────────────────────── */
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [assignForm, setAssignForm] = useState({ class_id: '', student_id: '' });
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get('/admin/students').then((r) => setStudents(r.data));
    api.get('/admin/classes').then((r) => setClasses(r.data));
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/students', form);
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const assign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/class/assign', {
        class_id: parseInt(assignForm.class_id),
        student_id: assignForm.student_id,
      });
      alert('Student assigned!');
      setAssignForm({ class_id: '', student_id: '' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create student */}
      <form onSubmit={create} className="glass-card p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary" disabled={loading}>Add Student</button>
      </form>

      {/* Assign to class */}
      <form onSubmit={assign} className="glass-card p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <select className="input" value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} required>
          <option value="">Select Student</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
        </select>
        <select className="input" value={assignForm.class_id} onChange={(e) => setAssignForm({ ...assignForm, class_id: e.target.value })} required>
          <option value="">Select Class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>
        <button className="btn btn-success">Assign to Class</button>
      </form>

      {/* Student list */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-muted border-b border-white/10">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4 text-text-secondary">{s.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-text-muted">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-text-muted">No students yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────── Reports Tab ──────────────────────── */
function ReportsTab() {
  const [view, setView] = useState('progress');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [progressData, setProgressData] = useState([]);
  const [difficultWords, setDifficultWords] = useState([]);

  useEffect(() => {
    api.get('/admin/students').then((r) => setStudents(r.data));
    api.get('/reports/difficult-words').then((r) => setDifficultWords(r.data));
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      api.get(`/reports/progress/${selectedStudent}`).then((r) => setProgressData(r.data));
    }
  }, [selectedStudent]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setView('progress')} className={`btn text-sm ${view === 'progress' ? 'btn-primary' : 'btn-ghost'}`}>
          📈 Student Progress
        </button>
        <button onClick={() => setView('words')} className={`btn text-sm ${view === 'words' ? 'btn-primary' : 'btn-ghost'}`}>
          📝 Difficult Words
        </button>
      </div>

      {view === 'progress' && (
        <div className="glass-card p-6 space-y-4">
          <select
            className="input max-w-sm"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">Select a student…</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#a5b4fc' }}
                />
                <Legend />
                <Line type="monotone" dataKey="accuracy_score" name="Accuracy %" stroke="#818cf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm py-4 text-center">
              {selectedStudent ? 'No submissions yet for this student.' : 'Select a student to view progress.'}
            </p>
          )}
        </div>
      )}

      {view === 'words' && (
        <div className="glass-card p-6">
          {difficultWords.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={difficultWords.slice(0, 20)} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis type="category" dataKey="word" stroke="#6b7280" fontSize={12} width={70} />
                <Tooltip
                  contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}
                />
                <Bar dataKey="error_count" name="Errors" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-muted text-sm text-center py-4">No word error data yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
