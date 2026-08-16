import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [username, setUsername] = useState('Student');
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <div style={styles.navLogo}>🎓</div>
          <div>
            <h1 style={styles.navTitle}>UniExam Pro</h1>
            <p style={styles.navSubtitle}>Student Assessment Portal</p>
          </div>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </nav>

      <main style={styles.main}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
            Welcome back!
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Here are your active assessments and performance metrics.
          </p>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Active Exams</p>
            <h3 style={styles.statValue}>2</h3>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Completed Assessments</p>
            <h3 style={styles.statValue}>5</h3>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Average Score</p>
            <h3 style={{ ...styles.statValue, color: '#059669' }}>88%</h3>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>
            Scheduled Assessments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.examRow}>
              <div>
                <h4 style={styles.examTitle}>Data Structures & Algorithms Midterm</h4>
                <p style={styles.examMeta}>Duration: 60 Mins • Total Marks: 50</p>
              </div>
              <button onClick={() => navigate('/exam')} style={styles.actionBtn}>
                Start Exam
              </button>
            </div>
            <div style={styles.examRow}>
              <div>
                <h4 style={styles.examTitle}>Database Management Systems Quiz</h4>
                <p style={styles.examMeta}>Duration: 30 Mins • Total Marks: 25</p>
              </div>
              <button onClick={() => navigate('/exam')} style={styles.actionBtn}>
                Start Exam
              </button>
            </div>
          </div>
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
    backgroundColor: '#2563eb',
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
    maxWidth: '1000px',
    margin: '40px auto',
    padding: '0 20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    margin: '0 0 8px 0',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  examRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
  },
  examTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  examMeta: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  actionBtn: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};