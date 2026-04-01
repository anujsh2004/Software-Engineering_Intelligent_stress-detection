"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ContextLog } from '@/components/log/ContextLog';
import { NotificationHistory } from '@/components/history/NotificationHistory'; 
import { AlertSettings } from '@/components/settings/AlertSettings';
import { useWearable } from '@/hooks/useWearable';
import { Toast } from '@/components/ui/Toast';
import { Activity } from 'lucide-react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'log' | 'history' | 'settings'>('dashboard');

  const { isConnected, dataHistory, currentMetrics, alerts, newAlert, setNewAlert, clearAllNotifications, simulationMode, setSimulationMode } = useWearable(authToken);

  // Check for existing token on mount and load user profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      // Verify token and load user profile
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      fetch(`${backendUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setLoggedInUser(data.user);
            setIsLoggedIn(true);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
            setAuthToken(null);
          }
        })
        .catch(() => {
          // Network error or backend not running
          localStorage.removeItem('token');
          setAuthToken(null);
        });
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    
    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, password })
      });
      const data = await response.json();

      if (!response.ok) {
        if (!isLoginMode && data.error === 'Username already exists, please login instead') {
          setErrorMsg(data.error);
          setIsLoginMode(true);
        } else {
          setErrorMsg(data.error || 'Authentication failed');
        }
      } else {
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
        setLoggedInUser(data.user);
        setIsLoggedIn(true);
      }
    } catch (err) {
      setErrorMsg('Network error, make sure backend is running on ' + backendUrl);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setLoggedInUser(null);
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Activity className="text-white h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">ZenStudent</h1>  
            <p className="text-indigo-100">Intelligent Stress & Anxiety Detection</p>
          </div>
          
          {/* Tab Selector */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(true);
                setErrorMsg('');
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                isLoginMode 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Registered User Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(false);
                setErrorMsg('');
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                !isLoginMode 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              New User Registration
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
              {isLoginMode ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="text-sm text-gray-500 text-center mb-6">
              {isLoginMode 
                ? 'Enter your credentials to access your dashboard' 
                : 'Register to start monitoring your stress levels'}
            </p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={isLoginMode ? undefined : 6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder="••••••••"
                />
                {!isLoginMode && (
                  <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
                )}
              </div>

              {errorMsg && (
                <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-100">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className={`w-full font-bold py-3 rounded-lg transition-colors mt-4 ${
                  isLoginMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {isLoginMode ? 'Login to Dashboard' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div className="ml-64 min-h-screen flex flex-col">
        <Header studentName={loggedInUser?.name || "Student"} isConnected={isConnected} />

        <main className="p-8 flex-1">
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-500">Welcome, {loggedInUser?.name || "Student"}! Real-time monitoring of your physiological stress markers.</p>
              </div>
              <Dashboard 
                dataHistory={dataHistory} 
                currentMetrics={currentMetrics} 
                simulationMode={simulationMode}
                onSimulationModeChange={setSimulationMode}
              />
            </div>
          )}

          {activeTab === 'log' && (
            <div className="animate-in fade-in duration-500">
               <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Context Logging</h2>
              </div>
              <ContextLog />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in duration-500">
               <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Alert History</h2>
              </div>
              <NotificationHistory alerts={alerts} onClearAll={clearAllNotifications} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500">
               <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>  
              </div>
              <AlertSettings />
            </div>
          )}
        </main>
      </div>

      {newAlert && (
        <Toast
          message={newAlert.message}
          recommendation={newAlert.recommendation}
          onClose={() => setNewAlert(null)}
        />
      )}
    </div>
  );
}