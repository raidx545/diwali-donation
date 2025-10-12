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
  const API_URL = 'http://localhost:3001/api';
  const RAZORPAY_KEY_ID = 'rzp_test_RSUvywvrB0tDud';
  
  const [donations, setDonations] = useState<Donation[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    amount: ''
  });
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="diwali-header shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg shadow-lg transform hover:scale-110 transition">
                <Flame className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h1 className="heading-festive drop-shadow-lg">
                  Light For All
                </h1>
                <p className="text-yellow-50 text-sm font-bold">💡 Light up someone's life this Diwali 💡</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="diwali-hero rounded-3xl m-8 p-12 shadow-2xl">
        <div className="diya-decoration diya-decoration-1">🪔</div>
        <div className="diya-decoration diya-decoration-2">✨</div>
        <div className="diya-decoration diya-decoration-3">🪔</div>
        <div className="diya-decoration diya-decoration-4">🌟</div>
        
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h2 className="heading-festive-lg text-white mb-4">
            Celebrate Together
          </h2>
          <p className="text-yellow-50 text-xl font-bold mb-8 drop-shadow-md">
            Light up someone's life this Diwali. Your generous donation brings hope and happiness to those in need.
          </p>
          <button className="bg-white text-red-600 font-bold py-4 px-8 rounded-xl text-lg hover:bg-yellow-50 transform hover:scale-105 transition shadow-xl border-2 border-red-600">
            ✨ Donate Now ✨
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="stat-card-gold rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-200 p-3 rounded-xl text-2xl">💰</div>
              <div>
                <p className="text-gray-700 text-sm font-bold">
                  Total Raised
                </p>
                <p className="text-4xl font-bold text-orange-600">₹{totalRaised.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card-red rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-red-200 p-3 rounded-xl text-2xl">👥</div>
              <div>
                <p className="text-gray-700 text-sm font-bold">
                  Total Donors
                </p>
                <p className="text-4xl font-bold text-red-600">{donorCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div className="donation-form rounded-2xl shadow-xl p-8">
            <h2 className="heading-festive text-2xl text-red-600 mb-6">
              🎁 Make a Donation
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full px-4 py-3 rounded-lg transition"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field w-full px-4 py-3 rounded-lg transition"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Donation Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="input-field w-full px-4 py-3 rounded-lg transition"
                  placeholder="500"
                  min="1"
                  required
                />
              </div>
              <div className="flex gap-3">
                {[100, 250, 500, 1000].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                    className="quick-amount-btn flex-1 py-2 px-4 rounded-lg transition"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
              {paymentStatus.message && (
                <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                  paymentStatus.success ? 'bg-green-100 text-green-800 border-2 border-green-400' :
                  paymentStatus.error ? 'bg-red-100 text-red-800 border-2 border-red-400' :
                  'bg-blue-100 text-blue-800 border-2 border-blue-400'
                }`}>
                  {paymentStatus.loading && <Loader className="w-5 h-5 animate-spin" />}
                  {paymentStatus.success && <CheckCircle className="w-5 h-5" />}
                  {paymentStatus.error && <XCircle className="w-5 h-5" />}
                  <span className="font-bold">{paymentStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={paymentStatus.loading}
                className={`donate-button w-full py-4 rounded-lg flex items-center justify-center space-x-2 ${
                  paymentStatus.loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed border-gray-500' 
                    : 'text-white'
                }`}
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
            </form>
          </div>

          {/* Leaderboard */}
          <div className="leaderboard-card rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🏆</span>
                <h2 className="heading-festive text-2xl text-red-600">
                  Top Donors
                </h2>
              </div>
              <button
                onClick={loadDonationsFromAPI}
                className="refresh-button flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            <div className="space-y-4">
              {sortedDonations.map((donation, index) => (
                <div
                  key={donation.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition hover:shadow-lg ${
                    index === 0
                      ? 'donor-rank-1'
                      : index === 1
                      ? 'donor-rank-2'
                      : index === 2
                      ? 'donor-rank-3'
                      : 'donor-rank-other'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center medal-badge ${
                        index === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : index === 1
                          ? 'bg-gray-400 text-gray-900'
                          : index === 2
                          ? 'bg-orange-400 text-orange-900'
                          : 'bg-yellow-300 text-yellow-800'
                      }`}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{donation.name}</p>
                      <p className="text-sm text-gray-600">{donation.location} • {donation.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">₹{donation.amount.toLocaleString()}</p>
                    {donation.paymentId && (
                      <p className="text-xs text-green-700 font-bold">✓ Verified</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-white text-lg font-bold drop-shadow-md">
            🪔 © 2025 Light For All. Every donation brings light and hope this Diwali. 🪔
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;