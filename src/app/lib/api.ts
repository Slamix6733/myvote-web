import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const API_LOG = process.env.NEXT_PUBLIC_API_LOG === 'true';

/**
 * Helper function to log API requests and responses if enabled
 */
function logAPI(method: string, url: string, data?: any, response?: any, error?: any) {
  if (!API_LOG) return;
  
  const timestamp = new Date().toISOString();
  const logStyle = error ? 'color: red' : 'color: green';
  
  console.group(`%c[${timestamp}] ${method} ${url}`, logStyle);
  
  if (data) {
    console.log('Request:', data);
  }
  
  if (response) {
    console.log('Response:', response);
  }
  
  if (error) {
    console.error('Error:', error);
  }
  
  console.groupEnd();
}

/**
 * Types for API requests and responses
 */
export type Voter = {
  blockchainAddress: string;
  name: string;
  gender: string;
  dob: string;
  city: string;
  state: string;
  aadharNumber: string;
  phoneNumber: string;
  email: string;
  isVerified: boolean;
  verificationDate?: string;
};

export type AdminStats = {
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
  ageDistribution: {
    below18: number;
    age18to25: number;
    age26to35: number;
    age36to45: number;
    age46to60: number;
    above60: number;
  };
};

/**
 * API service for making HTTP requests to the backend
 */
class ApiService {
  private adminAddress: string | null = null;
  
  /**
   * Set the admin address for making administrative API calls
   * This address will be included in the headers for admin endpoints
   */
  setAdminAddress(address: string): void {
    this.adminAddress = address;
  }
  
  /**
   * Get the headers for an API request
   * If an admin request, includes the admin address
   */
  private getHeaders(isAdminRequest: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (isAdminRequest && this.adminAddress) {
      // Use the correct header format as specified in the API docs
      headers['x-admin-address'] = this.adminAddress;
    }
    
    return headers;
  }
  
  /**
   * Get axios config for API requests
   */
  private getRequestConfig(isAdminRequest: boolean = false) {
    return {
      headers: this.getHeaders(isAdminRequest),
      withCredentials: false, // Set to true if your API requires cookies
    };
  }
  
  /**
   * Health check to ensure the API is running
   */
  async healthCheck() {
    try {
      const url = `${API_URL}/health`;
      logAPI('GET', url);
      
      const response = await axios.get(url, this.getRequestConfig());
      logAPI('GET', url, null, response.data);
      
      return response.data;
    } catch (error) {
      logAPI('GET', `${API_URL}/health`, null, null, error);
      console.error('Health check failed:', error);
      return { status: 'error', services: { blockchain: false, database: false } };
    }
  }
  
  /**
   * Register a new voter
   */
  async registerVoter(data: {
    name: string;
    gender: string;
    dob: string;
    city: string;
    state: string;
    aadharNumber: string;
    phoneNumber: string;
    email: string;
    address: string;
    aadharImageUrl?: string;
  }) {
    try {
      const response = await axios.post(
        `${API_URL}/voters/register`, 
        data,
        this.getRequestConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Error registering voter:', error);
      throw new Error('Failed to register voter');
    }
  }
  
  /**
   * Verify a voter (admin only)
   */
  async verifyVoter(voterAddress: string, verificationNotes: string = '') {
    try {
      // Direct URL like in Postman
      const url = 'http://localhost:5000/api/voters/verify';
      
      console.log("Making verify request to:", url);
      console.log("With admin address:", this.adminAddress);
      
      if (!this.adminAddress) {
        throw new Error("Admin address not set. Cannot verify voter.");
      }
      
      // Match the exact JSON structure from Postman
      const data = {
        adminAddress: this.adminAddress,
        voterAddress: voterAddress,
        verificationNotes: verificationNotes || "Verified manually after document check"
      };
      
      console.log("Request data:", data);
      
      // Include admin address in headers as well
      const headers = {
        'x-admin-address': this.adminAddress,
        'Content-Type': 'application/json'
      };
      
      console.log("Using headers:", headers);
      
      const response = await axios.post(url, data, { headers });
      
      console.log("Verification response:", response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  }
  
  /**
   * Check voter status
   */
  async checkVoterStatus(address: string) {
    try {
      const response = await axios.get(`${API_URL}/voters/status/${address}`, this.getRequestConfig());
      return response.data;
    } catch (error) {
      console.error('Error checking voter status:', error);
      throw new Error('Failed to check voter status');
    }
  }
  
  /**
   * Get voter details
   */
  async getVoterDetails(address: string) {
    try {
      const response = await axios.get(`${API_URL}/voters/${address}`, this.getRequestConfig());
      return response.data;
    } catch (error) {
      console.error('Error getting voter details:', error);
      throw new Error('Failed to get voter details');
    }
  }
  
  /**
   * List all voters (admin only)
   */
  async listVoters(options = {}) {
    try {
      // Convert options to query params
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      // Use direct URL access like in Postman
      const url = `http://localhost:5000/api/admin/voters${queryString}`;
      
      console.log("Making API request to:", url);
      console.log("With admin address:", this.adminAddress);
      
      const headers = {
        'x-admin-address': this.adminAddress || ''
      };
      
      console.log("Using headers:", headers);
      
      const response = await axios.get(url, { headers });
      
      console.log("Received response:", response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("API Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  }
  
  /**
   * Get admin dashboard stats (admin only)
   */
  async getAdminStats() {
    try {
      // Use direct URL like in Postman
      const url = 'http://localhost:5000/api/admin/stats';
      
      console.log("Making API request to:", url);
      console.log("With admin address:", this.adminAddress);
      
      if (!this.adminAddress) {
        throw new Error("Admin address not set. Cannot fetch admin stats.");
      }
      
      // Include admin address in headers
      const headers = {
        'x-admin-address': this.adminAddress,
        'Content-Type': 'application/json'
      };
      
      console.log("Using headers:", headers);
      
      const response = await axios.get(url, { headers });
      
      console.log("Stats response:", response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error getting admin stats:', error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  }
  
  /**
   * Get admin logs (admin only)
   */
  async getAdminLogs(options = {}) {
    try {
      // Convert options to query params
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      // Use direct URL like in Postman
      const url = `http://localhost:5000/api/admin/logs${queryString}`;
      
      console.log("Making API request to:", url);
      console.log("With admin address:", this.adminAddress);
      
      if (!this.adminAddress) {
        throw new Error("Admin address not set. Cannot fetch admin logs.");
      }
      
      // Include admin address in headers
      const headers = {
        'x-admin-address': this.adminAddress,
        'Content-Type': 'application/json'
      };
      
      console.log("Using headers:", headers);
      
      const response = await axios.get(url, { headers });
      
      console.log("Logs response:", response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error getting admin logs:', error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  }
  
  /**
   * Get state-wise voter distribution (admin only)
   */
  async getStateDistribution() {
    try {
      const response = await axios.get(
        `${API_URL}/admin/stats/states`,
        this.getRequestConfig(true)
      );
      return response.data;
    } catch (error) {
      console.error('Error getting state distribution:', error);
      throw error;
    }
  }
  
  /**
   * Get historical statistics (admin only)
   */
  async getHistoricalStats(days = 30) {
    try {
      const response = await axios.get(
        `${API_URL}/admin/stats/historical?days=${days}`,
        this.getRequestConfig(true)
      );
      return response.data;
    } catch (error) {
      console.error('Error getting historical stats:', error);
      throw error;
    }
  }
  
  /**
   * Upload Aadhar image
   */
  async uploadAadharImage(file: File, address: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('address', address);
      
      // For file uploads we need to modify the content type header
      const config = {
        ...this.getRequestConfig(),
        headers: {
          ...this.getRequestConfig().headers,
          'Content-Type': 'multipart/form-data',
        }
      };
      
      const response = await axios.post(
        `${API_URL}/upload/aadhar`,
        formData,
        config
      );
      
      return response.data;
    } catch (error) {
      console.error('Error uploading Aadhar image:', error);
      throw error;
    }
  }
}

// Singleton instance
export const apiService = new ApiService(); 