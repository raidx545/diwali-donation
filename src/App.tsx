import React, { useState, useEffect } from 'react';
import { Heart, Trophy, TrendingUp, Users, CheckCircle, XCircle, Loader, RefreshCw, Flame } from 'lucide-react';
import './App.css';

interface Donation {
  id: number;
  name: string;
  amount: number;
  date: string;
  location: string;
  paymentId?: string;
  email?: string;
}

interface FormData {
  name: string;
  email: string;
  amount: string;
}

interface PaymentStatus {
  loading: boolean;
  success: boolean;
  error: boolean;
  message: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

function App() {
  const API_URL = process.env.REACT_APP_API_URL || 'https://backend-server-r89y.onrender.com/api';
  const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RSUvywvrB0tDud';
  
  const [donations, setDonations] = useState<Donation[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    amount: ''
  });
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    loading: false,
    success: false,
    error: false,
    message: ''
  });

  const loadDonationsFromAPI = async () => {
    try {
      const response = await fetch(`${API_URL}/donations`);
      const data = await response.json();
      
      if (data.success) {
        setDonations(data.donations);
        console.log('Loaded donations from API:', data.donations);
      } else {
        console.error('Failed to load donations:', data.error);
      }
    } catch (error) {
      console.error('Error loading donations:', error);
      setDonations([]);
    }
  };

  useEffect(() => {
    loadDonationsFromAPI();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setPaymentStatus({
        loading: false,
        success: false,
        error: true,
        message: 'Failed to load payment system. Please refresh the page.'
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const donorCount = donations.length;

  const saveDonationToBackend = async (donation: Donation) => {
    try {
      const response = await fetch(`${API_URL}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donation)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Donation saved successfully:', donation);
        await loadDonationsFromAPI();
      } else {
        console.error('Failed to save donation:', data.error);
      }
    } catch (error) {
      console.error('Error saving donation:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || parseFloat(formData.amount) <= 0) {
      setPaymentStatus({
        loading: false,
        success: false,
        error: true,
        message: 'Please fill in all required fields with valid amounts.'
      });
      return;
    }

    setPaymentStatus({
      loading: true,
      success: false,
      error: false,
      message: 'Processing payment...'
    });

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay not loaded');
      }

      const amount = parseFloat(formData.amount) * 100;
      
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Light For All',
        description: 'Donation for Diwali Charity',
        image: 'https://via.placeholder.com/150x150/DC2626/FFFFFF?text=LFA',
        prefill: {
          name: formData.name,
          email: formData.email,
        },
        theme: {
          color: '#DC2626'
        },
        handler: async function (response: RazorpayResponse) {
          console.log('Payment successful:', response);
          
          const newId = donations.length > 0 ? Math.max(...donations.map(d => d.id)) + 1 : 1;
          const newDonation: Donation = {
            id: newId,
            name: formData.name,
            amount: parseFloat(formData.amount),
            date: new Date().toISOString().split('T')[0],
            location: 'India',
            paymentId: response.razorpay_payment_id,
            email: formData.email
          };
          
          await saveDonationToBackend(newDonation);
          
          setFormData({ name: '', email: '', amount: '' });
          
          setPaymentStatus({
            loading: false,
            success: true,
            error: false,
            message: 'Payment successful! Thank you for your donation.'
          });

          setTimeout(() => {
            setPaymentStatus({
              loading: false,
              success: false,
              error: false,
              message: ''
            });
          }, 3000);
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setPaymentStatus({
              loading: false,
              success: false,
              error: true,
              message: 'Payment cancelled by user.'
            });
            
            setTimeout(() => {
              setPaymentStatus({
                loading: false,
                success: false,
                error: false,
                message: ''
              });
            }, 3000);
          }
        },
        notes: {
          name: formData.name,
          email: formData.email,
          donation_type: 'diwali_charity'
        }
      };

      console.log('Opening Razorpay with options:', options);
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message === 'Razorpay not loaded') {
          errorMessage = 'Payment system not ready. Please refresh the page and try again.';
        } else {
          errorMessage = `Payment error: ${error.message}`;
        }
      }
      
      setPaymentStatus({
        loading: false,
        success: false,
        error: true,
        message: errorMessage
      });
      
      setTimeout(() => {
        setPaymentStatus({
          loading: false,
          success: false,
          error: false,
          message: ''
        });
      }, 5000);
    }
  };

  const sortedDonations = [...donations].sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-warm">
      <header className="site-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="logo-box"><Flame className="w-6 h-6 text-amber-700" /></div>
            <span className="brand">Light For All</span>
          </div>
          <button className="cta-header">Donate</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <section>
            <h1 className="page-title">Why donate?</h1>
            <div className="prose-wrap">
              <h2 className="section-title">Light For All wishes you a Happy Diwali!</h2>
              <p>
                As we embrace the joy and light of the festive season, let’s extend that brightness to the lives of children who need it most. This Diwali, your generous donation can help children continue their education and build a brighter future.
              </p>

              <h3 className="sub-title">This Diwali, let your gift glow beyond the festival.</h3>
              <p>
                When you give the gift of education, you’re passing on the same joy, excitement, and sense of wonder we all felt as children during Diwali.
              </p>

              <h3 className="sub-title">Why your contribution matters</h3>
              <ul className="bullet-list">
                <li>Interactive support classes that keep children engaged and prevent dropouts.</li>
                <li>Creative activities that build motivation, confidence, and self-expression.</li>
                <li>Awareness drives that empower parents and communities.</li>
                <li>Preventive actions addressing risks like early marriage and unsafe labor.</li>
                <li>Children’s collectives that build confidence and leadership.</li>
              </ul>
            </div>
          </section>

          <aside className="donation-card sticky top-6">
            <div className="card-inner">
              <div className="card-header">Yes! I’d like to gift</div>

              

              <div className="field-group">
                <div className="segmented">
                  <button
                    type="button"
                    className={`seg-btn ${frequency === 'once' ? 'active' : ''}`}
                    onClick={() => setFrequency('once')}
                  >
                    Give Once
                  </button>
                  <button
                    type="button"
                    className={`seg-btn ${frequency === 'monthly' ? 'active' : ''}`}
                    onClick={() => setFrequency('monthly')}
                  >
                    Give Monthly
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="field-group">
                  <label className="field-label">Choose an amount to donate</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[5000, 10000, 20000, 25000].map(v => (
                      <button
                        key={v}
                        type="button"
                        className={`amount-btn ${formData.amount === String(v) ? 'picked' : ''}`}
                        onClick={() => setFormData({ ...formData, amount: String(v) })}
                      >₹{v.toLocaleString()}</button>
                    ))}
                    <button
                      type="button"
                      className="amount-btn col-span-2"
                      onClick={() => setFormData({ ...formData, amount: '' })}
                    >Other Amount</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="field-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-input"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="text-input"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label">Donation Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="text-input"
                    placeholder="5000"
                    min="1"
                    required
                  />
                </div>

                {paymentStatus.message && (
                  <div className={`note ${
                    paymentStatus.success ? 'note-success' : paymentStatus.error ? 'note-error' : 'note-info'
                  }`}>
                    {paymentStatus.loading && <Loader className="w-4 h-4 animate-spin" />}
                    {paymentStatus.success && <CheckCircle className="w-4 h-4" />}
                    {paymentStatus.error && <XCircle className="w-4 h-4" />}
                    <span>{paymentStatus.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paymentStatus.loading}
                  className={`btn-primary w-full ${paymentStatus.loading ? 'btn-disabled' : ''}`}
                >
                  {paymentStatus.loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      <span>Donate with Razorpay</span>
                    </>
                  )}
                </button>
                <p className="disclaimer">By donating, you agree to our terms and acknowledge this is a charitable contribution.</p>
              </form>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <div className="card neutral">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-700" />
                <h2 className="sub-title m-0">Top Donors</h2>
              </div>
              <button onClick={loadDonationsFromAPI} className="btn-ghost"><RefreshCw className="w-4 h-4" /> Refresh</button>
            </div>
            <div className="space-y-3">
              {sortedDonations.map((donation, index) => (
                <div key={donation.id} className="donor-row">
                  <div className="flex items-center gap-3">
                    <div className={`rank rank-${index}`}>{index + 1}</div>
                    <div>
                      <p className="donor-name">{donation.name}</p>
                      <p className="donor-meta">{donation.location} • {donation.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="donor-amt">₹{donation.amount.toLocaleString()}</p>
                    {donation.paymentId && <p className="verified">✓ Verified</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-center text-sm text-neutral-600">
          © 2025 Light For All
        </div>
      </footer>
    </div>
  );
}

export default App;