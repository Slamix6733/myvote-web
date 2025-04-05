'use client';

import { useEffect, useState } from 'react';
import { web3Integration } from '../lib/web3-integration';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UsersIcon, CalendarIcon, ClockIcon, ChartBarIcon, LockClosedIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Election } from '../lib/web3';
import { Voter } from '../lib/api';

type User = {
  id: string;
  name: string;
  isVerified: boolean;
};

export default function AdminDashboard() {
  const [isConnected, setIsConnected] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  
  useEffect(() => {
    const initWeb3 = async () => {
      const connected = await web3Integration.initialize();
      setIsConnected(connected);
      
      if (connected) {
        setIsAdmin(web3Integration.isAdmin());
        setCurrentAddress(web3Integration.getCurrentAddress());
        loadDashboardData();
      } else {
        setLoading(false);
      }
    };
    
    setTimeout(() => {
      initWeb3();
    }, 800);
  }, []);
  
  const loadDashboardData = async () => {
    // Load elections
    const electionsData = await web3Integration.getElections();
    setElections(electionsData);
    
    // Load users
    const usersData = await web3Integration.listVoters({
      page: 1,
      limit: 5
    });
    
    if (usersData?.data) {
      setPendingUsers(usersData.data.map(voter => ({
        id: voter.blockchainAddress,
        name: voter.name,
        isVerified: voter.isVerified
      })));
    }
    
    setLoading(false);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const adminModules = [
    {
      title: 'Verify Voters',
      description: 'Approve voter registrations and verify identity documents',
      icon: <UsersIcon className="h-8 w-8 text-blue-500" />,
      href: '/admin/verify-users',
      color: 'bg-blue-100 hover:bg-blue-200'
    },
    {
      title: 'Schedule Elections',
      description: 'Create and manage elections, schedule dates and times',
      icon: <CalendarIcon className="h-8 w-8 text-indigo-500" />,
      href: '/admin/schedule-elections',
      color: 'bg-indigo-100 hover:bg-indigo-200'
    },
    {
      title: 'Statistics',
      description: 'View detailed voter demographics and platform statistics',
      icon: <ChartBarIcon className="h-8 w-8 text-green-500" />,
      href: '/admin/statistics',
      color: 'bg-green-100 hover:bg-green-200'
    },
    {
      title: 'Activity Logs',
      description: 'Review all admin actions and system activity',
      icon: <DocumentTextIcon className="h-8 w-8 text-amber-500" />,
      href: '/admin/logs',
      color: 'bg-amber-100 hover:bg-amber-200'
    },
    {
      title: 'Pending Verification',
      description: 'Manage queue of unverified voter registrations',
      icon: <ClockIcon className="h-8 w-8 text-rose-500" />,
      href: '/admin/verify-users',
      color: 'bg-rose-100 hover:bg-rose-200'
    },
    {
      title: 'Admin Settings',
      description: 'Manage blockchain connection and environment settings',
      icon: <ShieldCheckIcon className="h-8 w-8 text-purple-500" />,
      href: '/admin/settings',
      color: 'bg-purple-100 hover:bg-purple-200'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your blockchain voting platform
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin-slow">
              <svg className="w-16 h-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-gray-600 animate-pulse">Connecting to blockchain...</p>
          </div>
        </div>
      ) : (
        <>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r shadow-sm"
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
          
          {isConnected && !isAdmin && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r shadow-sm"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Your current wallet address ({currentAddress?.substring(0, 8)}...{currentAddress?.substring(currentAddress.length - 6)}) is not the admin wallet.
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Admin address: {web3Integration.getAdminAddress()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {isConnected && isAdmin && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r shadow-sm"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Connected as admin. You have full access to all admin features.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {adminModules.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={module.href}>
                  <div className={`h-full p-6 rounded-lg shadow-sm ${module.color} transition-transform duration-300 transform hover:scale-105 cursor-pointer`}>
                    <div className="mb-4">{module.icon}</div>
                    <h3 className="text-xl font-medium text-gray-900">{module.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{module.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {web3Integration.isDevMode() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 p-4 bg-gray-100 rounded-lg"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM6.293 6.293a1 1 0 011.414 0L9 7.586l1.293-1.293a1 1 0 111.414 1.414L10.414 9l1.293 1.293a1 1 0 01-1.414 1.414L9 10.414l-1.293 1.293a1 1 0 01-1.414-1.414L7.586 9 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 font-medium">
                    Development Mode Active
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Your application is running in development mode. Admin checks are bypassed and blockchain integration is simulated.
              </p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

// Animation components
function CountAnimation({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (value === 0) return;
    
    let start = 0;
    const end = value;
    const duration = 1000;
    const increment = Math.ceil(end / (duration / 16));
    
    const timer = setInterval(() => {
      start += increment;
      if (start > end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <>{count}</>;
}

import { UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline'; 