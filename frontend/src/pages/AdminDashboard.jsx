import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/* ──────── Premium Metric card ──────── */
function MetricCard({ label, value, iconTemplate, colorClass = "bg-white", headerIconBg = "", children }) {
  return (
    <div className={`card-elevated p-6 flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg duration-300 rounded-[28px] ${colorClass} min-h-[240px] relative overflow-hidden group border-2 border-white/40 shadow-sm`}>
      <div className="flex items-start gap-4 z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md ${headerIconBg}`}>
          {iconTemplate}
        </div>
        <div className="pt-1">
          <div className="text-[13px] font-bold text-slate-600/80 uppercase tracking-wider mb-1">{label}</div>
          <div className="text-4xl font-extrabold text-slate-800 font-heading tracking-tight drop-shadow-sm">{value}</div>
        </div>
      </div>
      
      {/* Visual embellishment space at the bottom */}
      <div className="mt-8 flex-1 flex flex-col items-center justify-end z-10 w-full relative">
        {children}
      </div>
    </div>
  );
}

/* ──────── Tabs ──────── */
const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'classes', label: 'Classes', icon: '🏫' },
  { key: 'students', label: 'Students', icon: '👩‍🎓' },
  { key: 'reports', label: 'Reports', icon: '📈' },
];

/* ──────── Safe Date Formatter ──────── */
const formatDateSafe = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const s = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
    const d = new Date(s);
    return isNaN(d.getTime()) 
      ? '—' 
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'});
  } catch (err) {
    console.error('Error formatting date:', err);
    return '—';
  }
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-surface-dim pb-20 relative overflow-hidden flex flex-col">
      {/* Animated Floating Background (matching login) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] rounded-full bg-blue-300/10 blur-[120px] mix-blend-multiply animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50rem] h-[50rem] rounded-full bg-purple-300/10 blur-[150px] mix-blend-multiply animate-float" style={{ animationDelay: '2s', animationDuration: '20s' }}></div>
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <main className="max-w-full mx-auto px-4 py-8 relative z-10 w-full flex flex-col items-center">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-text-primary font-heading tracking-tight mb-2">Admin Dashboard</h2>
          <p className="text-text-secondary pb-4 font-medium">Manage students, classes, and view assessment reports.</p>
        </div>

        {/* Segmented Control Tab bar */}
        <div className="flex justify-center mb-8 sm:mb-10 animate-fade-in w-full px-2" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          <div className="inline-flex bg-white p-1.5 sm:p-2 rounded-2xl shadow-sm border border-outline-variant gap-1 overflow-x-auto w-full max-w-2xl justify-start sm:justify-between scrollbar-hide snap-x">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex justify-center items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap snap-center min-w-[100px] sm:min-w-[120px] ${
                  tab === t.key 
                    ? 'bg-primary-container text-primary shadow-sm scale-100' 
                    : 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-dim'
                }`}
              >
                <span className="text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'classes' && <ClassesTab />}
          {tab === 'students' && <StudentsTab />}
          {tab === 'reports' && <ReportsTab />}
        </div>
      </main>
    </div>
  );
}

/* ────────────────────── Dashboard Tab ──────────────────────── */
function DashboardTab() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard').then((r) => setMetrics(r.data)).catch(() => {
      // Setup mock data for UI demo purpose if backend is failing
      setMetrics({
        average_accuracy: 0,
        total_submissions: 0,
        total_students: 0,
        total_stories: 0
      });
    });
  }, []);

  if (!metrics) return (
    <div className="flex justify-center items-center h-40">
      <div className="w-10 h-10 border-4 border-outline border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 flex flex-col items-center w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 w-full">
        {/* Card 1: Accuracy Gauge */}
        <MetricCard
         
          label="Avg. Accuracy" 
          value={`${metrics.average_accuracy}%`} 
          iconTemplate="🎯" 
          colorClass="bg-green-500" 
          headerIconBg="bg-surface-dim/90 text-white"
        >
          <div className="flex-1 w-full flex items-center justify-center pt-4">
            <svg viewBox="0 0 100 50" className="w-28 h-14 overflow-visible">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" className="drop-shadow-md shadow-slate-300 shadow-inner group-hover:stroke-slate-300 transition-colors duration-500" />
            </svg>
          </div>
          <div className="text-[11px] font-bold text-slate-400 bg-slate-100/80 px-4 py-1.5 rounded-full mt-2 tracking-wide uppercase">
            Data pending
          </div>
        </MetricCard>

        {/* Card 2: Submissions Bars */}
        <MetricCard 
          label="Submissions" 
          value={metrics.total_submissions} 
          iconTemplate="📝" 
          colorClass="bg-[#d1f4e0]" 
          headerIconBg="bg-[#a7e4c2]/80"
        >
          <div className="flex-1 w-full flex items-end justify-center gap-2 pb-2 opacity-30 mt-4 group-hover:opacity-60 transition-opacity duration-500">
            <div className="w-5 bg-black rounded-t-md h-6"></div>
            <div className="w-5 bg-black rounded-t-md h-12"></div>
            <div className="w-5 bg-black rounded-t-md h-5"></div>
            <div className="w-5 bg-black rounded-t-md h-9"></div>
            <div className="w-5 bg-black rounded-t-md h-3"></div>
          </div>
          <div className="text-[11px] font-bold text-[#45a46c] mt-2 tracking-wide uppercase">
            Data pending
          </div>
        </MetricCard>

        {/* Card 3: Students Group */}
        <MetricCard 
          label="Students" 
          value={metrics.total_students} 
          iconTemplate="👨‍🎓" 
          colorClass="bg-[#ecd6fc] text-slate-800" 
          headerIconBg="bg-[#d2b1ed]/80"
        >
          <div className="flex-1 w-full flex items-center justify-center opacity-20 text-black mt-2 group-hover:opacity-40 transition-opacity duration-500">
            <svg viewBox="0 0 100 60" className="w-24 h-16">
              {/* Back row */}
              <circle cx="20" cy="20" r="7" fill="currentColor"/>
              <path d="M 5 45 Q 20 25 35 45" fill="currentColor"/>
              <circle cx="50" cy="15" r="7" fill="currentColor"/>
              <path d="M 35 40 Q 50 20 65 40" fill="currentColor"/>
              <circle cx="80" cy="20" r="7" fill="currentColor"/>
              <path d="M 65 45 Q 80 25 95 45" fill="currentColor"/>
              {/* Front row */}
              <circle cx="35" cy="30" r="8" fill="currentColor" stroke="#ecd6fc" strokeWidth="2"/>
              <path d="M 20 55 Q 35 35 50 55" fill="currentColor" stroke="#ecd6fc" strokeWidth="2"/>
              <circle cx="65" cy="30" r="8" fill="currentColor" stroke="#ecd6fc" strokeWidth="2"/>
              <path d="M 50 55 Q 65 35 80 55" fill="currentColor" stroke="#ecd6fc" strokeWidth="2"/>
              <circle cx="50" cy="40" r="9" fill="currentColor" stroke="#ecd6fc" strokeWidth="2"/>
              <path d="M 30 65 Q 50 45 70 65" fill="currentColor" stroke="#ecd6fc" strokeWidth="2"/>
            </svg>
          </div>
          <div className="text-[11px] font-bold text-[#8958b4] mt-2 tracking-wide uppercase">
            Data pending
          </div>
        </MetricCard>

        {/* Card 4: Stories Line Graph */}
        <MetricCard 
          label="Stories" 
          value={metrics.total_stories} 
          iconTemplate="📖" 
          colorClass="bg-[#fef0bd]" 
          headerIconBg="bg-[#f2d87a]/80"
        >
          <div className="flex-1 w-full flex items-center justify-center text-slate-400 mt-4 group-hover:scale-105 transition-transform duration-500">
            <svg viewBox="0 0 100 30" className="w-full h-8 px-4 opacity-40">
              <path d="M 0 15 L 20 15 L 40 10 L 60 15 L 80 15 L 100 15" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="0" cy="15" r="3" fill="currentColor"/>
              <circle cx="20" cy="15" r="3" fill="currentColor"/>
              <circle cx="40" cy="10" r="3" fill="currentColor"/>
              <circle cx="60" cy="15" r="3" fill="currentColor"/>
              <circle cx="80" cy="15" r="3" fill="currentColor"/>
              <circle cx="100" cy="15" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div className="text-[11px] font-bold text-[#b79d38] mt-2 tracking-wide uppercase">
            Data pending
          </div>
        </MetricCard>
      </div>

      {/* Quick Access List */}
      <div className="card-elevated bg-white p-0 overflow-hidden mt-8 w-full max-w-3xl border border-outline-variant mx-auto">
        <div className="p-5 border-b border-outline-variant">
          <h3 className="text-lg font-bold font-heading text-text-primary text-center">Quick Access</h3>
        </div>
        <div className="divide-y divide-outline-variant">
          {[
            { title: 'Student A added', time: 'Timestamp', action: 'View Student Profile' },
            { title: 'New story created', time: 'Timestamp', action: 'Edit Story' },
            { title: 'New story created', time: 'Timestamp', action: 'Edit Story' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 hover:bg-surface-dim transition-colors cursor-pointer">
              <div>
                <p className="font-semibold text-text-primary text-sm">{item.title}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.time}</p>
              </div>
              <button className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Keeping the rest of the tabs exactly the same layout inside the card container.
/* ────────────────────── Classes Tab ──────────────────────── */
function ClassesTab() {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/admin/classes').then((r) => setClasses(r.data)).catch(() => {});
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
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full px-2 sm:px-0">
      <div className="card-elevated p-5 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 items-end bg-white my-6 sm:my-10 w-full m-0">
        <div className="flex-1 w-full">
          <h3 className="text-lg font-bold font-heading text-text-primary mb-1">Create New Class</h3>
          <p className="text-sm text-text-muted mb-4">Add a new class to organize your students.</p>
          <form onSubmit={create} className="flex flex-col sm:flex-row gap-3">
            <input 
              className="input flex-1 shadow-sm font-medium" 
              placeholder="e.g. Grade 4 English" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <button className="btn btn-primary px-8" disabled={loading}>
              {loading ? 'Adding...' : 'Create Class'}
            </button>
          </form>
        </div>
      </div>

      <div className="card-elevated overflow-hidden border border-outline-variant bg-white w-full m-0">
        <div className="p-4 sm:p-6 border-b border-outline-variant bg-surface-dim/30 flex justify-between items-center">
          <h3 className="text-lg font-bold font-heading text-text-primary">All Classes</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-surface-dim rounded-full text-text-secondary border border-outline-variant">{classes.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface-dim/50">
                <th className="px-4 py-3.5 sm:p-5">ID</th>
                <th className="px-4 py-3.5 sm:p-5">Class Name</th>
                <th className="px-4 py-3.5 sm:p-5">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 sm:p-5 text-text-muted font-mono text-xs">#{c.id}</td>
                  <td className="px-4 py-3.5 sm:p-5 font-bold text-text-primary">{c.class_name}</td>
                  <td className="px-4 py-3.5 sm:p-5 font-medium text-text-secondary">{formatDateSafe(c.created_at)}</td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr><td colSpan={3} className="p-12 text-center text-text-muted font-medium">No classes created yet. Use the form above to add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
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
  const [editingStudent, setEditingStudent] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const load = () => {
    api.get('/admin/students').then((r) => setStudents(r.data)).catch(() => {});
    api.get('/admin/classes').then((r) => setClasses(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/admin/students/${editingStudent.id}/password`, {
        new_password: newPassword,
      });
      alert('Password updated successfully!');
      setEditingStudent(null);
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

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
      alert('Student successfully assigned to class!');
      setAssignForm({ class_id: '', student_id: '' });
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign class');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-5xl mx-auto px-2 sm:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full">
        {/* Create student */}
        <div className="card-elevated p-5 sm:p-6 bg-white w-full m-0">
          <h3 className="text-lg font-bold font-heading text-text-primary mb-1">Onboard Student</h3>
          <p className="text-sm text-text-muted mb-5">Create a new student credential.</p>
          <form onSubmit={create} className="space-y-4">
            <div className="input-group">
              <label className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Full Name</label>
              <input className="input" placeholder="e.g. Alex Johnson" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Email</label>
              <input className="input" type="email" placeholder="alex@school.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="input-group">
              <label className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn btn-primary w-full mt-3 sm:mt-4" disabled={loading}>Register Student</button>
          </form>
        </div>

        {/* Assign to class */}
        <div className="card-elevated p-5 sm:p-6 bg-white relative overflow-hidden w-full m-0">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-lg font-bold font-heading text-text-primary mb-1">Class Enrollment</h3>
          <p className="text-sm text-text-muted mb-5">Assign an existing student to a class.</p>
          <form onSubmit={assign} className="space-y-4">
            <div className="input-group mt-3">
              <label className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Select Student</label>
              <select className="input" value={assignForm.student_id} onChange={(e) => setAssignForm({ ...assignForm, student_id: e.target.value })} required>
                <option value="">Choose a student...</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>
            </div>
            <div className="input-group mt-3">
              <label className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Select Class</label>
              <select className="input" value={assignForm.class_id} onChange={(e) => setAssignForm({ ...assignForm, class_id: e.target.value })} required>
                <option value="">Choose a class...</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
              </select>
            </div>
            <button className="btn btn-accent w-full mt-3 sm:mt-4">Assign Enrollment</button>
          </form>
        </div>
      </div>

      {/* Student list */}
      <div className="card-elevated overflow-hidden border border-outline-variant bg-white">
        <div className="p-6 border-b border-outline-variant bg-surface-dim/30 flex justify-between items-center">
          <h3 className="text-lg font-bold font-heading text-text-primary">Student Roster</h3>
          <span className="text-xs font-semibold px-3 py-1 bg-surface-dim rounded-full text-text-secondary border border-outline-variant">{students.length} students</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface-dim/50">
                <th className="px-4 py-3 sm:p-5">Name & Email</th>
                <th className="px-4 py-3 sm:p-5">Class</th>
                <th className="px-4 py-3 sm:p-5">Status</th>
                <th className="px-4 py-3 sm:p-5 text-right">Joined Date</th>
                <th className="px-4 py-3 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 sm:p-5">
                    <div className="font-bold text-text-primary">{s.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">{s.email}</div>
                  </td>
                  <td className="px-4 py-3 sm:p-5 font-semibold text-text-secondary">
                    {s.class_names && s.class_names.length > 0 ? s.class_names.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3 sm:p-5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.is_active ? 'bg-success-container/50 text-success border-success/20' : 'bg-danger-container/50 text-danger border-danger/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-success' : 'bg-danger'}`}></span>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 sm:p-5 text-right font-medium text-text-secondary">{formatDateSafe(s.created_at)}</td>
                  <td className="px-4 py-3 sm:p-5 text-right">
                    <button 
                      onClick={() => {
                        setEditingStudent(s);
                        setNewPassword('');
                      }}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-outline hover:bg-surface-container text-text-secondary hover:text-text-primary transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      🔑 Reset Password
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-text-muted font-medium">No students registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="card-elevated p-6 bg-white max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-heading text-text-primary">Change Password</h3>
            <p className="text-sm text-text-secondary">
              Set a new password for <span className="font-semibold">{editingStudent.name}</span> ({editingStudent.email}).
            </p>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="input-group">
                <label className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Min 6 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingStudent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
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

  // New state variables for Class Report
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [rangeType, setRangeType] = useState('last_week');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [progressClassFilter, setProgressClassFilter] = useState('');

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Initial load: classes and difficult words
  useEffect(() => {
    api.get('/admin/classes').then((r) => setClasses(r.data)).catch(() => {});
    api.get('/reports/difficult-words').then((r) => setDifficultWords(r.data)).catch(() => {});
  }, []);

  // Reload students when class filter is changed
  useEffect(() => {
    const params = progressClassFilter ? { class_id: progressClassFilter } : {};
    api.get('/admin/students', { params })
      .then((r) => {
        setStudents(r.data);
        // Reset selected student if they are no longer in the loaded list
        if (selectedStudent && !r.data.some((s) => s.id === selectedStudent)) {
          setSelectedStudent('');
          setProgressData([]);
        }
      })
      .catch(() => {});
  }, [progressClassFilter]);

  useEffect(() => {
    if (selectedStudent) {
      api.get(`/reports/progress/${selectedStudent}`).then((r) => setProgressData(r.data)).catch(() => {});
    }
  }, [selectedStudent]);

  const generateClassReport = async () => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }
    setReportLoading(true);
    try {
      const { data } = await api.get('/reports/class-report', {
        params: {
          class_id: selectedClass,
          range_type: rangeType,
          download: false
        }
      });
      setReportData(data);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate class report');
    } finally {
      setReportLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }
    const url = `/reports/class-report?class_id=${selectedClass}&range_type=${rangeType}&download=true`;
    api.get(url, { responseType: 'blob' })
      .then(async (res) => {
        const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `class_${selectedClass}_report_${rangeType}.xlsx`;
        
        if (Capacitor.isNativePlatform()) {
          try {
            // Lazy load Capacitor Filesystem and Share
            const { Filesystem, Directory } = await import('@capacitor/filesystem');
            const { Share } = await import('@capacitor/share');
            
            const base64 = await blobToBase64(blob);
            const writeResult = await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.Cache
            });
            
            await Share.share({
              title: 'Class Attendance Report',
              url: writeResult.uri,
              dialogTitle: 'Open or Share Report'
            });
          } catch (err) {
            console.error('Capacitor native download error:', err);
            alert('Failed to save Excel report on mobile device');
          }
        } else {
          // Web fallback
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      })
      .catch((err) => {
        alert('Failed to download Excel report');
      });
  };

  return (
    <div className="space-y-6 w-full px-2 sm:px-0">
      <div className="flex justify-center mb-6 w-full px-2">
        <div className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 p-1.5 bg-white border border-outline-variant rounded-xl shadow-sm mt-3 w-full max-w-lg sm:w-auto justify-center">
          <button 
            onClick={() => setView('progress')} 
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${view === 'progress' ? 'bg-primary-container text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Student Progress
          </button>
          <button 
            onClick={() => setView('class_report')} 
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${view === 'class_report' ? 'bg-primary-container text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Class Attendance
          </button>
          <button 
            onClick={() => setView('words')} 
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${view === 'words' ? 'bg-primary-container text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Difficult Words
          </button>
        </div>
      </div>

      <div className="animate-fade-in relative w-full">
        {view === 'progress' && (
          <div className="card-elevated p-5 sm:p-8 bg-white min-h-[400px] max-w-4xl mx-auto w-full m-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold font-heading text-text-primary">Accuracy Tracking</h3>
                <p className="text-sm text-text-muted">Monitor individual student reading improvement over time.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <select
                  className="input w-full sm:w-[180px] shadow-sm font-medium border-outline-variant"
                  value={progressClassFilter}
                  onChange={(e) => setProgressClassFilter(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>

                <select
                  className="input w-full sm:w-[200px] shadow-sm font-medium border-outline-variant"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select a student…</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {progressData.length > 0 ? (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      stroke="#94a3b8" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '13px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#fff', fontWeight: 600 }}
                      formatter={(value) => [`${value}%`, 'Accuracy']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy_score" 
                      name="Accuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#3b82f6' }} 
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} 
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-dim">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <span className="text-2xl text-text-muted">📉</span>
                </div>
                <p className="text-text-primary font-semibold text-lg">
                  {selectedStudent ? 'No Submissions Yet' : 'No Student Selected'}
                </p>
                <p className="text-text-muted text-sm mt-1">
                  {selectedStudent ? 'This student has not completed any reading assessments.' : 'Please select a student from the dropdown to view their progress.'}
                </p>
              </div>
            )}
          </div>
        )}

        {view === 'class_report' && (
          <div className="card-elevated p-5 sm:p-8 bg-white min-h-[400px] max-w-5xl mx-auto w-full m-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold font-heading text-text-primary">Class Attendance & Performance</h3>
                <p className="text-sm text-text-muted">Generate attendance records and track reading assignments.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto">
                <select
                  className="input w-full md:w-[180px] shadow-sm font-medium border-outline-variant"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select a class…</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
                </select>

                <select
                  className="input w-full md:w-[140px] shadow-sm font-medium border-outline-variant"
                  value={rangeType}
                  onChange={(e) => setRangeType(e.target.value)}
                >
                  <option value="last_week">Last Week</option>
                  <option value="last_month">Last Month</option>
                </select>

                <button 
                  onClick={generateClassReport} 
                  className="btn btn-primary w-full md:w-auto shadow-sm cursor-pointer"
                  disabled={reportLoading}
                >
                  Generate
                </button>

                {reportData && (
                  <button 
                    onClick={downloadExcel} 
                    className="btn btn-success w-full md:w-auto shadow-sm cursor-pointer"
                  >
                    📥 Excel
                  </button>
                )}
              </div>
            </div>

            {reportLoading ? (
              <div className="h-[300px] flex flex-col items-center justify-center">
                <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-text-secondary font-medium">Analyzing records...</p>
              </div>
            ) : reportData ? (
              <div className="space-y-6">
                {/* Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="border border-outline rounded-2xl p-5 bg-surface-dim/40 text-center">
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Attendance Rate</div>
                    <div className="text-3xl font-extrabold text-primary">{reportData.attendance_rate}%</div>
                  </div>
                  <div className="border border-outline rounded-2xl p-5 bg-surface-dim/40 text-center">
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Students</div>
                    <div className="text-3xl font-extrabold text-primary">{reportData.total_students}</div>
                    <div className="text-xs text-text-muted mt-1">active in roster</div>
                  </div>
                  <div className="border border-outline rounded-2xl p-5 bg-surface-dim/40 text-center">
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Assigned Stories</div>
                    <div className="text-3xl font-extrabold text-primary">{reportData.total_stories}</div>
                    <div className="text-xs text-text-muted mt-1">in date range</div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden border border-outline rounded-2xl bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface-dim/50 border-b border-outline">
                          <th className="p-4">Student</th>
                          <th className="p-4">Assigned Date</th>
                          <th className="p-4">Story Title</th>
                          <th className="p-4 text-center">Attempts</th>
                          <th className="p-4 text-right">Best Score</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {reportData.records.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-text-primary">{r.student_name}</div>
                              <div className="text-xs text-text-muted">{r.student_email}</div>
                            </td>
                            <td className="p-4 text-text-secondary font-medium">{r.date}</td>
                            <td className="p-4 text-text-primary font-medium">{r.story_title}</td>
                            <td className="p-4 text-center text-text-secondary font-semibold">{r.attempts}</td>
                            <td className="p-4 text-right text-text-secondary font-bold">{r.max_score}%</td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${r.status === 'Present' ? 'bg-success-container/50 text-success border-success/20' : 'bg-danger-container/50 text-danger border-danger/20'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'Present' ? 'bg-success' : 'bg-danger'}`}></span>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {reportData.records.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-text-muted font-medium">
                              No assessment records found for this period.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-dim">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <span className="text-2xl text-text-muted">📊</span>
                </div>
                <p className="text-text-primary font-semibold text-lg">No Report Generated</p>
                <p className="text-text-muted text-sm mt-1">
                  Select a class and date range from the dropdowns above to compile the report.
                </p>
              </div>
            )}
          </div>
        )}

        {view === 'words' && (
          <div className="card-elevated p-5 sm:p-8 bg-white max-w-4xl mx-auto w-full m-0">
            <div className="mb-8">
              <h3 className="text-xl font-bold font-heading text-text-primary">Most Mispronounced Words</h3>
              <p className="text-sm text-text-muted">An aggregated view of terms students struggle with globally.</p>
            </div>

            {difficultWords.length > 0 ? (
              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultWords.slice(0, 20)} layout="vertical" margin={{ left: 80, right: 30, top: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      type="category" 
                      dataKey="word" 
                      stroke="#475569" 
                      fontSize={13} 
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '13px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#fff', fontWeight: 600 }}
                    />
                    <Bar 
                      dataKey="error_count" 
                      name="Error Count" 
                      fill="#ef4444" 
                      radius={[0, 6, 6, 0]} 
                      barSize={20}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-dim">
                <p className="text-text-primary font-semibold text-lg">No Error Data</p>
                <p className="text-text-muted text-sm mt-1">Students have not made any recorded word errors yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
