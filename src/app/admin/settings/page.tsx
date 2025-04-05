'use client';

import { useEffect, useState } from 'react';
import { web3Integration } from '../../lib/web3-integration';
import { motion } from 'framer-motion';
import { 
  WrenchIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function AdminSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [adminAddress, setAdminAddress] = useState<string>('');
  const [devMode, setDevMode] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [apiTesting, setApiTesting] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      const connected = await web3Integration.initialize();
      setIsConnected(connected);
      
      if (connected) {
        setBlockchainStatus('connected');
        setIsAdmin(web3Integration.isAdmin());
        setCurrentAddress(web3Integration.getCurrentAddress());
        setAdminAddress(web3Integration.getAdminAddress());
        setDevMode(web3Integration.isDevMode());
        
        // Check API connectivity
        try {
          const healthResult = await fetch('/api/health');
          if (healthResult.ok) {
            setApiStatus('connected');
          }
        } catch (error) {
          console.error('API health check failed:', error);
          setApiStatus('disconnected');
        }
        
        // Get API URL from environment
        setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
      }
      
      setLoading(false);
    };
    
    setTimeout(() => {
      initWeb3();
    }, 800);
  }, []);

  const testApiConnection = async () => {
    setApiTesting(true);
    setApiTestResult(null);
    
    try {
      const response = await fetch(`${apiUrl}/health`);
      
      if (response.ok) {
        const data = await response.json();
        setApiStatus('connected');
        setApiTestResult(`API connection successful: ${JSON.stringify(data)}`);
      } else {
        setApiStatus('disconnected');
        setApiTestResult(`API connection failed with status: ${response.status}`);
      }
    } catch (error) {
      setApiStatus('disconnected');
      setApiTestResult(`API connection error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setApiTesting(false);
    }
  };

  const reconnectWallet = async () => {
    setLoading(true);
    const connected = await web3Integration.initialize();
    setIsConnected(connected);
    
    if (connected) {
      setBlockchainStatus('connected');
      setIsAdmin(web3Integration.isAdmin());
      setCurrentAddress(web3Integration.getCurrentAddress());
      setAdminAddress(web3Integration.getAdminAddress());
    }
    
    setLoading(false);
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
            Admin Settings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-sm text-gray-700"
          >
            Configure application settings and connections
          </motion.p>
        </div>
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
                Your current wallet address is not the admin wallet. Admin address: {adminAddress}
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
            <p className="mt-4 text-gray-600 animate-pulse">Loading settings...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white shadow-card rounded-lg overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 bg-blue-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
                Blockchain Connection
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Ethereum blockchain connection settings
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Connection Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    {blockchainStatus === 'connected' ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        Disconnected
                      </>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Current Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono overflow-hidden text-ellipsis">
                    {currentAddress || 'Not connected'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Admin Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono overflow-hidden text-ellipsis">
                    {adminAddress || 'Not configured'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Admin Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    {isAdmin ? (
                      <>
                        <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                        Admin Rights Active
                      </>
                    ) : (
                      <>
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        Not Admin
                      </>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="button"
                    onClick={reconnectWallet}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Reconnect Wallet
                  </button>
                </div>
              </dl>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white shadow-card rounded-lg overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 bg-green-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <WrenchIcon className="h-5 w-5 mr-2 text-green-500" />
                API Configuration
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Backend API connection settings
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">API Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    {apiStatus === 'connected' ? (
                      <>
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                        Disconnected
                      </>
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">API URL</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono overflow-hidden text-ellipsis">
                    {apiUrl}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Development Mode</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {devMode ? 'Enabled' : 'Disabled'}
                  </dd>
                </div>
                <div className="sm:col-span-2 pt-2">
                  <button
                    type="button"
                    onClick={testApiConnection}
                    disabled={apiTesting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {apiTesting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Test API Connection
                      </>
                    )}
                  </button>
                </div>
                {apiTestResult && (
                  <div className="sm:col-span-2 bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-mono whitespace-pre-wrap">{apiTestResult}</p>
                  </div>
                )}
              </dl>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white shadow-card rounded-lg overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 bg-purple-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-purple-500" />
                Environment Variables
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Current environment configuration
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-700 mb-2">
                  The following environment variables are configured:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>
                    <span className="font-mono font-medium">NEXT_PUBLIC_API_URL</span>: 
                    <span className="ml-2 font-mono">{process.env.NEXT_PUBLIC_API_URL || '(not set)'}</span>
                  </li>
                  <li>
                    <span className="font-mono font-medium">NEXT_PUBLIC_ADMIN_ADDRESS</span>: 
                    <span className="ml-2 font-mono">{process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '(not set)'}</span>
                  </li>
                  <li>
                    <span className="font-mono font-medium">NEXT_PUBLIC_DEV_MODE</span>: 
                    <span className="ml-2 font-mono">{process.env.NEXT_PUBLIC_DEV_MODE || '(not set)'}</span>
                  </li>
                  <li>
                    <span className="font-mono font-medium">NEXT_PUBLIC_DUMMY_CONTRACT</span>: 
                    <span className="ml-2 font-mono">{process.env.NEXT_PUBLIC_DUMMY_CONTRACT || '(not set)'}</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-700 mt-4">
                  To change these values, update your <span className="font-mono">.env.local</span> file in the project root.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-gray-50 rounded-lg p-6"
          >
            <p className="text-sm text-gray-600">
              These settings can be configured by updating environment variables in your <code>.env.local</code> file. After changing environment variables, you need to restart the application.
            </p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
} 