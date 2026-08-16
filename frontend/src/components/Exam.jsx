import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Exam() {
  const [timeLeft, setTimeLeft] = useState(1800);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmitExam = () => {
    alert('Exam submitted successfully!');
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
          Data Structures Midterm Examination
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={styles.timerBox}>
            ⏱️ Time Left: {formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmitExam} style={styles.submitBtn}>
            Submit Exam
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>
              Question 1 of 10
            </span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
              Marks: 5.0
            </span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '25px', lineHeight: '1.5' }}>
            Which of the following data structures is best suited for implementing a priority queue?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['A) Array', 'B) Stack', 'C) Binary Heap', 'D) Singly Linked List'].map((option, idx) => (
              <label key={idx} style={styles.optionLabel}>
                <input type="radio" name="answer" style={{ accentColor: '#2563eb' }} />
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{option}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button style={styles.secondaryBtn}>Previous</button>
            <button style={styles.actionBtn}>Next Question</button>
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
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerBox: {
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    color: '#92400e',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '14px',
    borderRadius: '8px',
  },
  submitBtn: {
    padding: '8px 16px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '800px',
    width: '100%',
    margin: '40px auto',
    padding: '0 20px',
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    cursor: 'pointer',
    backgroundColor: '#f8fafc',
  },
  secondaryBtn: {
    padding: '10px 20px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    color: '#475569',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  actionBtn: {
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};