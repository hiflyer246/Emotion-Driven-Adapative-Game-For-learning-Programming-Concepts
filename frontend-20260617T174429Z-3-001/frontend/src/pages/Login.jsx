import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Code, Mail, Lock, User } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.username) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await register(formData.email, formData.password, formData.username);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Code className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">Code Runner</h1>
          <p className="text-blue-200">Save NeoCity with your coding skills</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant={isLogin ? 'default' : 'outline'}
                onClick={() => setIsLogin(true)}
                className="flex-1"
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? 'default' : 'outline'}
                onClick={() => setIsLogin(false)}
                className="flex-1"
              >
                Register
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <p className="text-sm">{error}</p>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Choose a username"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
              </Button>
            </form>
          </div>
        </Card>

        <div className="text-center text-sm text-blue-200">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:underline font-semibold"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};