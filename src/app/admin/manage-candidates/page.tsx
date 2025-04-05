'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { web3Service, Election, Candidate } from '../../lib/web3';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { UserPlusIcon, ArrowLeftIcon, CalendarIcon, IdentificationIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

type CandidateFormData = {
  name: string;
  info: string;
};

export default function ManageCandidates() {
  const searchParams = useSearchParams();
  const electionIdParam = searchParams.get('electionId');
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(
    electionIdParam ? parseInt(electionIdParam) : null
  );
  
  const [isConnected, setIsConnected] = useState(false);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CandidateFormData>();
  
  useEffect(() => {
    const initWeb3 = async () => {
      const connected = await web3Service.initialize();
      setIsConnected(connected);
      
      if (connected) {
        await loadElections();
      } else {
        setLoading(false);
      }
    };
    
    // Add a small delay to show the loading animation
    setTimeout(() => {
      initWeb3();
    }, 800);
  }, []);
  
  useEffect(() => {
    if (elections.length > 0 && selectedElectionId) {
      const election = elections.find(e => e.id === selectedElectionId);
      if (election) {
        setSelectedElection(election);
        loadCandidates(selectedElectionId);
      }
    }
  }, [elections, selectedElectionId]);
  
  const loadElections = async () => {
    setLoading(true);
    const electionsData = await web3Service.getElections();
    setElections(electionsData);
    
    if (electionsData.length > 0) {
      if (!selectedElectionId) {
        setSelectedElectionId(electionsData[0].id);
      }
    } else {
      setLoading(false);
    }
  };
  
  const loadCandidates = async (electionId: number) => {
    setLoading(true);
    const candidatesData = await web3Service.getCandidates(electionId);
    setCandidates(candidatesData);
    setLoading(false);
  };
  
  const onSubmit = async (data: CandidateFormData) => {
    if (!selectedElectionId) return;
    
    try {
      setSubmitting(true);
      
      // Call blockchain method
      const result = await web3Service.addCandidate(
        selectedElectionId,
        data.name,
        data.info
      );
      
      if (result) {
        setSuccess(true);
        reset(); // Reset form
        loadCandidates(selectedElectionId); // Reload candidates
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (loading && candidates.length === 0 && elections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin-slow">
            <svg className="w-16 h-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-600 animate-pulse">Loading data...</p>
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
          <h1 className="text-2xl font-semibold text-gray-900">Manage Candidates</h1>
          <p className="mt-2 text-sm text-gray-700">
            Add and view candidates for elections
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
                Candidate added successfully!
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Election Selector */}
      {elections.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-card sm:rounded-lg p-6 hover:shadow-card-hover transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
            <label htmlFor="election" className="block text-sm font-medium text-gray-700">
              Select Election
            </label>
          </div>
          <select
            id="election"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedElectionId || ''}
            onChange={(e) => setSelectedElectionId(Number(e.target.value))}
            disabled={!isConnected || loading}
          >
            {elections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.name} ({formatDate(election.startTime)} - {formatDate(election.endTime)})
              </option>
            ))}
          </select>
          
          {selectedElection && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-sm text-gray-500 p-3 bg-gray-50 rounded-md"
            >
              <p className="flex items-center">
                <span className="font-bold mr-2">Election Status:</span> 
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedElection.startTime > (Date.now() / 1000)
                    ? 'bg-yellow-100 text-yellow-800'
                    : selectedElection.endTime < (Date.now() / 1000)
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedElection.startTime > (Date.now() / 1000)
                    ? 'Upcoming'
                    : selectedElection.endTime < (Date.now() / 1000)
                    ? 'Ended'
                    : 'Active'
                  }
                </motion.span>
              </p>
              <p className="mt-2"><span className="font-bold">Start Date:</span> {formatDate(selectedElection.startTime)}</p>
              <p className="mt-1"><span className="font-bold">End Date:</span> {formatDate(selectedElection.endTime)}</p>
            </motion.div>
          )}
        </motion.div>
      ) : !loading && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white shadow-card sm:rounded-lg p-6 hover:shadow-card-hover transition-all duration-300"
        >
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No elections available</h3>
            <p className="mt-1 text-sm text-gray-500">Please schedule an election first.</p>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Link
                href="/admin/schedule-elections"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CalendarIcon className="h-4 w-4 mr-2" /> Schedule Elections
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
      
      {/* Candidates Management */}
      {selectedElectionId && (
        <>
          {/* Add Candidate Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white shadow-card overflow-hidden sm:rounded-lg p-6 hover:shadow-card-hover transition-all duration-300"
          >
            <div className="flex items-center mb-6">
              <UserPlusIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Add New Candidate</h2>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center">
                  <IdentificationIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Candidate Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="e.g. John Doe"
                    {...register('name', { required: 'Candidate name is required' })}
                    disabled={!isConnected || submitting}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="info" className="block text-sm font-medium text-gray-700 flex items-center">
                  <InformationCircleIcon className="h-4 w-4 mr-1 text-blue-500" />
                  Candidate Information
                </label>
                <div className="mt-1">
                  <textarea
                    id="info"
                    rows={3}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.info ? 'border-red-500' : ''}`}
                    placeholder="e.g. Party affiliation, background, etc."
                    {...register('info', { required: 'Candidate information is required' })}
                    disabled={!isConnected || submitting}
                  />
                  {errors.info && (
                    <p className="mt-2 text-sm text-red-600">{errors.info.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={!isConnected || submitting || Boolean(selectedElection && selectedElection.endTime < (Date.now() / 1000))}
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
                      <UserPlusIcon className="h-4 w-4 mr-2" />
                      Add Candidate
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
          
          {/* Candidates List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white shadow-card overflow-hidden sm:rounded-lg transition-all duration-300 hover:shadow-card-hover"
          >
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex items-center">
              <UserPlusIcon className="h-5 w-5 mr-2 text-blue-500" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Candidates List
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
                  <p className="mt-4 text-gray-600 animate-pulse">Loading candidates...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden">
                {candidates.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No candidates have been added to this election yet.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {candidates.map((candidate, index) => (
                      <motion.li 
                        key={candidate.id} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.2, delay: 0.1 * index }}
                        className="px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <motion.div 
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                              className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"
                            >
                              <span className="text-blue-600 font-medium">{candidate.name.charAt(0)}</span>
                            </motion.div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-blue-600">{candidate.name}</div>
                              <div className="text-sm text-gray-500 mt-1">{candidate.info}</div>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <motion.span
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                            >
                              Candidate #{candidate.id}
                            </motion.span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-6"
      >
        <Link
          href="/admin"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-150"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
} 