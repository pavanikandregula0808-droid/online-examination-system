import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'ADMIN' && role !== 'FACULTY') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const response = await fetch(`http://localhost:8080/api/admin/broadcast?subject=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`, {
        method: 'POST',
      });
      const data = await response.text();

      if (response.ok) {
        setStatus(data);
        setSubject('');
        setMessage('');
      } else {
        setStatus('Failed to send broadcast emails.');
      }
    } catch (err) {
      setStatus('Server error during broadcast.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.navLogo}>🛠️</div>
          <div>
            <h1 style={styles.navTitle}>UniExam Faculty Portal</h1>
            <p style={styles.navSubtitle}>Administration & Assessment Controls</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </nav>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
            Broadcast Portal Email
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '25px' }}>
            Send an instant email notification or announcement to all registered student accounts.
          </p>

          {status && <div style={styles.statusBox}>{status}</div>}

          <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={styles.label}>Email Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Important: Upcoming Final Examination Schedule"
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>Announcement Message</label>
              <textarea
                required
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dear students, please check your respective portals for the latest examination guidelines..."
                style={{ ...styles.input, resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Broadcasting Emails...' : 'Send Broadcast to All Users'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLogo: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  navTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
  },
  navSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  statusBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e40af',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#475569',
    display: 'block',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};