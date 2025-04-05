'use client';

import { useEffect, useState } from 'react';
import { web3Integration } from '../../lib/web3-integration';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  CheckBadgeIcon, 
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Types for the statistics
type AdminStats = {
  totalVoters: number;
  verifiedVoters: number;
  pendingVerification: number;
  verificationRate: string;
  todayRegistrations: number;
  todayVerifications: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  stateDistribution: Array<{
    _id: string;
    total: number;
    verified: number;
    unverified: number;
  }>;
};

export default function AdminDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWeb3 = async () => {
      const connected = await web3Integration.initialize();
      setIsConnected(connected);
      
      if (connected) {
        setIsAdmin(web3Integration.isAdmin());
        loadStats();
      } else {
        setLoading(false);
      }
    };
    
    setTimeout(() => {
      initWeb3();
    }, 800);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await web3Integration.getAdminStats();
      setStats(response);
      setError(null);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate percentage with one decimal place
  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0.0';
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl font-semibold text-gray-900"
          >
            Admin Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-sm text-gray-700"
          >
            Overview of the voting platform statistics
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            onClick={loadStats}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </motion.div>
      </div>

      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r shadow-sm"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Blockchain connection not established. Please install MetaMask or another web3 provider.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {!isAdmin && isConnected && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r shadow-sm"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Your current wallet address is not the admin wallet. Admin address: {web3Integration.getAdminAddress()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r shadow-sm"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin-slow">
              <svg className="w-16 h-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-gray-600 animate-pulse">Loading statistics...</p>
          </div>
        </div>
      ) : (
        <>
          {stats && (
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
              {/* Card 1 - Total Voters */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center p-4 bg-white rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full">
                  <UserGroupIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Total Voters</p>
                  <p className="text-lg font-semibold text-gray-700">{stats.totalVoters}</p>
                </div>
              </motion.div>
              
              {/* Card 2 - Verified Voters */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center p-4 bg-white rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="p-3 mr-4 text-green-500 bg-green-100 rounded-full">
                  <CheckBadgeIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Verified Voters</p>
                  <p className="text-lg font-semibold text-gray-700">
                    {stats.verifiedVoters} 
                    <span className="ml-2 text-sm font-normal text-green-500">
                      ({stats.verificationRate}%)
                    </span>
                  </p>
                </div>
              </motion.div>
              
              {/* Card 3 - Pending Verification */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-center p-4 bg-white rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="p-3 mr-4 text-amber-500 bg-amber-100 rounded-full">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Pending Verification</p>
                  <p className="text-lg font-semibold text-gray-700">{stats.pendingVerification}</p>
                </div>
              </motion.div>
              
              {/* Card 4 - Today's Activity */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="flex items-center p-4 bg-white rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="p-3 mr-4 text-purple-500 bg-purple-100 rounded-full">
                  <CalendarDaysIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-600">Today's Activity</p>
                  <p className="text-lg font-semibold text-gray-700">
                    <span className="text-blue-500">+{stats.todayRegistrations}</span> / 
                    <span className="text-green-500 ml-1">+{stats.todayVerifications}</span>
                  </p>
                  <p className="text-xs text-gray-500">Registrations / Verifications</p>
                </div>
              </motion.div>
            </div>
          )}

          {stats && (
            <div className="grid gap-6 mb-8 md:grid-cols-2">
              {/* Gender Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white p-5 rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Gender Distribution
                  </h2>
                </div>
                
                <div className="flex flex-col">
                  {/* Male */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600">Male</span>
                      <span className="text-sm font-medium text-gray-800">
                        {stats.genderDistribution.male} 
                        <span className="text-gray-500 ml-1">
                          ({calculatePercentage(stats.genderDistribution.male, stats.totalVoters)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${calculatePercentage(stats.genderDistribution.male, stats.totalVoters)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Female */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600">Female</span>
                      <span className="text-sm font-medium text-gray-800">
                        {stats.genderDistribution.female}
                        <span className="text-gray-500 ml-1">
                          ({calculatePercentage(stats.genderDistribution.female, stats.totalVoters)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-pink-500 h-2.5 rounded-full"
                        style={{ width: `${calculatePercentage(stats.genderDistribution.female, stats.totalVoters)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Other */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-600">Other</span>
                      <span className="text-sm font-medium text-gray-800">
                        {stats.genderDistribution.other}
                        <span className="text-gray-500 ml-1">
                          ({calculatePercentage(stats.genderDistribution.other, stats.totalVoters)}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{ width: `${calculatePercentage(stats.genderDistribution.other, stats.totalVoters)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* State Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white p-5 rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2 text-green-500" />
                    State Distribution
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.stateDistribution.map((state, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800">{state._id}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{state.total}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{state.verified}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              state.verified / state.total >= 0.7 
                                ? 'bg-green-100 text-green-800' 
                                : state.verified / state.total >= 0.3 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {((state.verified / state.total) * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <Link href="/admin/verify-users" className="bg-white p-4 rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover flex items-center">
              <div className="rounded-full p-3 bg-blue-100 text-blue-600 mr-4">
                <CheckBadgeIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-gray-800 font-medium">Verify Users</h3>
                <p className="text-gray-500 text-sm">Approve new voter registrations</p>
              </div>
            </Link>
            
            <Link href="/admin/schedule-elections" className="bg-white p-4 rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover flex items-center">
              <div className="rounded-full p-3 bg-purple-100 text-purple-600 mr-4">
                <CalendarDaysIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-gray-800 font-medium">Schedule Elections</h3>
                <p className="text-gray-500 text-sm">Create and manage elections</p>
              </div>
            </Link>
            
            <Link href="/admin/logs" className="bg-white p-4 rounded-lg shadow-card transition-all duration-300 hover:shadow-card-hover flex items-center">
              <div className="rounded-full p-3 bg-amber-100 text-amber-600 mr-4">
                <ChartBarIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-gray-800 font-medium">Activity Logs</h3>
                <p className="text-gray-500 text-sm">View recent admin activities</p>
              </div>
            </Link>
          </motion.div>
        </>
      )}
    </motion.div>
  );
} 