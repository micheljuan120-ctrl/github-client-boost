import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmailPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false); // Novo estado para controlar o reenvio
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate('/register'); // Redireciona se não houver e-mail
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Verification successful!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Verification failed.');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      setMessage('Network error. Please try again later.');
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/resend-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'New code sent!');
      } else {
        setMessage(data.message || 'Failed to resend code.');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      setMessage('Network error. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center">Verify Your Email</h2>
        <p className="mb-6 text-center text-gray-600">A verification code has been sent to <strong>{email}</strong>.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Verification Code</label>
            <input
              type="text"
              id="code"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Verify
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
        <p className="mt-4 text-center text-sm text-gray-600">
          Didn't receive the code? <button onClick={handleResendCode} className="font-medium text-indigo-600 hover:text-indigo-500">Resend Code</button>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;