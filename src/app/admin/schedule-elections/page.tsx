'use client';

import { useEffect, useState } from 'react';
import { web3Service, Election } from '../../lib/web3';
import { useForm } from 'react-hook-form';
import { CalendarIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

type ElectionFormData = {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export default function ScheduleElections() {
  const [isConnected, setIsConnected] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ElectionFormData>();
  
  useEffect(() => {
    const initWeb3 = async () => {
      const connected = await web3Service.initialize();
      setIsConnected(connected);
      
      if (connected) {
        loadElections();
      } else {
        setLoading(false);
      }
    };
    
    // Add a small delay to show the loading animation
    setTimeout(() => {
      initWeb3();
    }, 800);
  }, []);
  
  const loadElections = async () => {
    setLoading(true);
    const electionsData = await web3Service.getElections();
    setElections(electionsData);
    setLoading(false);
  };
  
  const onSubmit = async (data: ElectionFormData) => {
    try {
      setSubmitting(true);
      
      // Convert form data to timestamps
      const startTimestamp = new Date(`${data.startDate}T${data.startTime}`).getTime() / 1000;
      const endTimestamp = new Date(`${data.endDate}T${data.endTime}`).getTime() / 1000;
      
      // Call blockchain method
      const result = await web3Service.scheduleElection(
        data.name,
        startTimestamp,
        endTimestamp
      );
      
      if (result) {
        setSuccess(true);
        reset(); // Reset form
        loadElections(); // Reload elections
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error scheduling election:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  if (loading && elections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin-slow">
            <svg className="w-16 h-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">Loading elections data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:flex sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Schedule Elections</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage elections on the blockchain
          </p>
        </div>
      </motion.div>
      
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
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r shadow-sm"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Election scheduled successfully!
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white shadow-card overflow-hidden sm:rounded-lg p-6 hover:shadow-card-hover transition-all duration-300"
      >
        <div className="flex items-center mb-6">
          <PlusIcon className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Create New Election</h2>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Election Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="name"
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Presidential Election 2025"
                {...register('name', { required: 'Election name is required' })}
                disabled={!isConnected || submitting}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-blue-500" />
                Start Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="startDate"
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.startDate ? 'border-red-500' : ''}`}
                  {...register('startDate', { required: 'Start date is required' })}
                  disabled={!isConnected || submitting}
                />
                {errors.startDate && (
                  <p className="mt-2 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
                Start Time
              </label>
              <div className="mt-1">
                <input
                  type="time"
                  id="startTime"
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.startTime ? 'border-red-500' : ''}`}
                  {...register('startTime', { required: 'Start time is required' })}
                  disabled={!isConnected || submitting}
                />
                {errors.startTime && (
                  <p className="mt-2 text-sm text-red-600">{errors.startTime.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-blue-500" />
                End Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="endDate"
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.endDate ? 'border-red-500' : ''}`}
                  {...register('endDate', { required: 'End date is required' })}
                  disabled={!isConnected || submitting}
                />
                {errors.endDate && (
                  <p className="mt-2 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1 text-blue-500" />
                End Time
              </label>
              <div className="mt-1">
                <input
                  type="time"
                  id="endTime"
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.endTime ? 'border-red-500' : ''}`}
                  {...register('endTime', { required: 'End time is required' })}
                  disabled={!isConnected || submitting}
                />
                {errors.endTime && (
                  <p className="mt-2 text-sm text-red-600">{errors.endTime.message}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!isConnected || submitting}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Schedule Election
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white shadow-card overflow-hidden sm:rounded-lg transition-all duration-300 hover:shadow-card-hover"
      >
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Scheduled Elections
          </h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin-slow">
                <svg className="w-12 h-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600 animate-pulse">Loading elections...</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {elections.length === 0 ? (
              <li className="px-4 py-10 sm:px-6 text-center">
                <div className="flex flex-col items-center">
                  <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">No elections scheduled yet.</p>
                  <p className="text-sm text-gray-500 mt-1">Use the form above to schedule your first election.</p>
                </div>
              </li>
            ) : (
              elections.map((election, index) => (
                <motion.li 
                  key={election.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.2, delay: 0.1 * index }}
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-blue-600 truncate">{election.name}</p>
                      </div>
                      <p className="mt-2 flex items-center text-sm text-gray-500">
                        <ClockIcon className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                        <span className="truncate">
                          {formatDateTime(election.startTime)} - {formatDateTime(election.endTime)}
                        </span>
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <motion.span 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          election.startTime > (Date.now() / 1000)
                            ? 'bg-yellow-100 text-yellow-800'
                            : election.endTime < (Date.now() / 1000)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                        {election.startTime > (Date.now() / 1000)
                          ? 'Upcoming'
                          : election.endTime < (Date.now() / 1000)
                          ? 'Ended'
                          : 'Active'}
                      </motion.span>
                    </div>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        )}
      </motion.div>
    </div>
  );
} 