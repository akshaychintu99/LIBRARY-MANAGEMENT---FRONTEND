import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, CreditCard, Smartphone, Building, CheckCircle, X } from 'lucide-react';

export const StudentFinesPage = () => {
  const { showToast } = useAuth();

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [payingFine, setPayingFine] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [simulatedAccount, setSimulatedAccount] = useState('student@okaxis');
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);

  const loadFines = () => {
    setLoading(true);
    api.fines.getMyFines({ size: 50 })
      .then(res => setFines(res.content || []))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFines();
  }, []);

  const handleOpenPayModal = (fine) => {
    setPayingFine(fine);
    setPaymentSuccessReceipt(null);
    setPaymentMethod('UPI');
    setSimulatedAccount('student@okaxis');
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    if (!payingFine) return;

    setSubmitting(true);
    try {
      const res = await api.payments.simulate({
        fineId: payingFine.id,
        amount: payingFine.amount,
        paymentMethod,
        notes: `Simulated settlement via ${paymentMethod} (${simulatedAccount})`,
      });

      setPaymentSuccessReceipt(res);
      showToast('Payment successfully processed! Fine cleared.');
      loadFines();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Fines & Payment Settlement">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Library Fine Invoices</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configured Fine Policy: <strong>₹10.00 per day overdue</strong>
          </div>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : fines.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={40} color="var(--accent-emerald)" style={{ marginBottom: '12px' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Your account is in good standing!</p>
              <p style={{ fontSize: '0.85rem' }}>No outstanding or historical fines on record.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Overdue Days</th>
                    <th>Daily Rate</th>
                    <th>Total Fine Amount</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600 }}>{f.bookTitle}</td>
                      <td>{f.overdueDays} days</td>
                      <td>₹{f.fineRate} / day</td>
                      <td style={{ fontWeight: 700, color: f.status === 'UNPAID' ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                        ₹{f.amount}
                      </td>
                      <td>
                        <span className={`badge ${
                          f.status === 'PAID' ? 'badge-paid' :
                          f.status === 'UNPAID' ? 'badge-unpaid' : 'badge-waived'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {f.status === 'UNPAID' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenPayModal(f)}
                          >
                            <DollarSign size={14} /> Pay Fine (Simulated)
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Settled on {new Date(f.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Gateway Simulator Modal */}
      {payingFine && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Simulated Payment Gateway</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setPayingFine(null)}>
                <X size={16} />
              </button>
            </div>

            {paymentSuccessReceipt ? (
              <div className="modal-body" style={{ textAlign: 'center' }}>
                <CheckCircle size={52} color="var(--accent-emerald)" style={{ margin: '0 auto 16px' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Payment Completed!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Your simulated transaction was processed and the fine record has been updated in MySQL.
                </p>

                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', textAlign: 'left', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                    <strong>₹{paymentSuccessReceipt.amount}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reference ID:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{paymentSuccessReceipt.transactionReference}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Method:</span>
                    <span>{paymentSuccessReceipt.paymentMethod}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                    <span className="badge badge-paid">SIMULATED COMPLETED</span>
                  </div>
                </div>

                <div className="modal-footer" style={{ marginTop: '20px', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={() => setPayingFine(null)}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment}>
                <div className="modal-body">
                  <div style={{ background: '#EEF2FF', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #E0E7FF' }}>
                    <div style={{ fontSize: '0.8rem', color: '#4338CA', textTransform: 'uppercase', fontWeight: 600 }}>Amount Due</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#312E81' }}>₹{payingFine.amount}</div>
                    <div style={{ fontSize: '0.85rem', color: '#4338CA' }}>for {payingFine.bookTitle} ({payingFine.overdueDays} days overdue)</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Channel (Simulation)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${paymentMethod === 'UPI' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => { setPaymentMethod('UPI'); setSimulatedAccount('student@okaxis'); }}
                      >
                        <Smartphone size={14} /> UPI (GPay/PhonePe)
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${paymentMethod === 'CREDIT_CARD' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => { setPaymentMethod('CREDIT_CARD'); setSimulatedAccount('•••• 4242'); }}
                      >
                        <CreditCard size={14} /> Credit Card
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${paymentMethod === 'DEBIT_CARD' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => { setPaymentMethod('DEBIT_CARD'); setSimulatedAccount('•••• 8891'); }}
                      >
                        <CreditCard size={14} /> Debit Card
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${paymentMethod === 'NET_BANKING' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => { setPaymentMethod('NET_BANKING'); setSimulatedAccount('SBI NetBanking'); }}
                      >
                        <Building size={14} /> Net Banking
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Simulated Account Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      value={simulatedAccount}
                      onChange={(e) => setSimulatedAccount(e.target.value)}
                      placeholder="e.g. mobile@upi or dummy bank account"
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '4px' }}>
                      🔒 Demonstration gateway: No real bank credentials or card CVVs are stored or transmitted.
                    </small>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setPayingFine(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? <span className="loading-spinner" /> : `Simulate Pay ₹${payingFine.amount}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};
