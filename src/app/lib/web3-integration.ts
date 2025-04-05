import { web3Service } from './web3';
import { apiService } from './api';
import { toast } from 'react-hot-toast';

/**
 * This service integrates web3 blockchain operations with the API service
 * It handles the synchronization between on-chain data and off-chain data
 */
class Web3IntegrationService {
  private currentAddress: string | null = null;
  private readonly ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS || '0x6E5ceE75158A189939F6d945351dBD86370672AD';
  private readonly DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  
  /**
   * Initialize both web3 and API services
   * Set the current user address for blockchain interactions
   * Set the admin address for API interactions
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize web3 connection
      const connected = await web3Service.initialize();
      
      if (connected && web3Service.signer) {
        // Get the current address
        this.currentAddress = await web3Service.signer.getAddress();
        
        // Always use the admin address from environment variable for API calls
        apiService.setAdminAddress(this.ADMIN_ADDRESS);
        
        // Check health of the API
        await this.checkApiHealth();
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error initializing integration service:', error);
      toast.error('Failed to initialize blockchain connection');
      return false;
    }
  }
  
  /**
   * Check if the current address is an admin
   * In dev mode, any connected address is admin
   * Otherwise checks if the current wallet address matches the environment variable
   */
  isUserAdmin(): boolean {
    if (this.DEV_MODE && this.currentAddress) {
      return true;
    }
    return this.currentAddress?.toLowerCase() === this.ADMIN_ADDRESS.toLowerCase();
  }
  
  /**
   * Check the health of the API
   */
  private async checkApiHealth(): Promise<boolean> {
    try {
      const health = await apiService.healthCheck();
      return health.status === 'ok' && health.services.blockchain && health.services.database;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
  
  /**
   * Register a new voter
   * This function will handle both blockchain and API operations
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
    aadharImageUrl?: string;
  }): Promise<boolean> {
    try {
      if (!this.currentAddress) {
        toast.error('Wallet not connected');
        return false;
      }
      
      // Register voter through API
      const result = await apiService.registerVoter({
        ...data,
        address: this.currentAddress,
      });
      
      if (result.onBlockchain) {
        toast.success('Voter registered successfully on blockchain and database');
        return true;
      } else {
        toast.error('Voter registered in database but not on blockchain. Please try again later.');
        return false;
      }
    } catch (error) {
      console.error('Error registering voter:', error);
      toast.error('Failed to register voter');
      return false;
    }
  }
  
  /**
   * Verify a voter (admin only)
   */
  async verifyVoter(voterAddress: string, notes: string = ''): Promise<boolean> {
    try {
      // Always use the admin address from environment variable
      apiService.setAdminAddress(this.ADMIN_ADDRESS);
      
      // Check if web3 is initialized, if not, skip blockchain verification
      let blockchainResult = true;
      if (web3Service.contract) {
        // Try blockchain verification
        try {
          blockchainResult = await web3Service.verifyUser(voterAddress);
          
          if (!blockchainResult) {
            console.warn('Blockchain verification failed');
            // We'll continue and just update the API
          }
        } catch (error) {
          console.error('Error with blockchain verification:', error);
          // Continue to API verification
        }
      } else {
        console.warn('Blockchain contract not initialized, proceeding with API verification only');
      }
      
      // Then update the API with the proper admin address in headers
      const apiResult = await apiService.verifyVoter(voterAddress, notes);
      
      if (apiResult && apiResult.message) {
        toast.success(apiResult.message || 'Voter verified successfully');
        return true;
      } else {
        toast.error('API verification failed');
        return false;
      }
    } catch (error) {
      console.error('Error verifying voter:', error);
      toast.error('Failed to verify voter');
      return false;
    }
  }
  
  /**
   * Schedule an election (admin only)
   */
  async scheduleElection(name: string, startTime: number, endTime: number): Promise<boolean> {
    try {
      // Always use the admin address from environment variable
      apiService.setAdminAddress(this.ADMIN_ADDRESS);
      
      // Schedule on blockchain
      const result = await web3Service.scheduleElection(name, startTime, endTime);
      
      if (result) {
        toast.success('Election scheduled successfully');
        return true;
      } else {
        toast.error('Failed to schedule election');
        return false;
      }
    } catch (error) {
      console.error('Error scheduling election:', error);
      toast.error('Failed to schedule election');
      return false;
    }
  }
  
  /**
   * Add a candidate to an election (admin only)
   */
  async addCandidate(electionId: number, name: string, info: string): Promise<boolean> {
    try {
      // Always use the admin address from environment variable
      apiService.setAdminAddress(this.ADMIN_ADDRESS);
      
      // Add candidate on blockchain
      const result = await web3Service.addCandidate(electionId, name, info);
      
      if (result) {
        toast.success('Candidate added successfully');
        return true;
      } else {
        toast.error('Failed to add candidate');
        return false;
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
      return false;
    }
  }
  
  /**
   * Get all elections
   */
  async getElections() {
    return await web3Service.getElections();
  }
  
  /**
   * Get candidates for an election
   */
  async getCandidates(electionId: number) {
    return await web3Service.getCandidates(electionId);
  }
  
  /**
   * Get admin dashboard statistics
   */
  async getAdminStats() {
    try {
      // Remove the isUserAdmin check, as we want to use the admin address directly
      // Instead, ensure the admin address is set for this API call
      apiService.setAdminAddress(this.ADMIN_ADDRESS);
      
      return await apiService.getAdminStats();
    } catch (error) {
      console.error('Error getting admin stats:', error);
      toast.error('Failed to get admin statistics');
      throw error;
    }
  }
  
  /**
   * List all voters (admin only)
   */
  async listVoters(options = {}) {
    try {
      // Remove the isUserAdmin check, as we want to use the admin address directly
      // Instead, ensure the admin address is set for this API call
      apiService.setAdminAddress(this.ADMIN_ADDRESS);
      
      return await apiService.listVoters(options);
    } catch (error) {
      console.error('Error listing voters:', error);
      toast.error('Failed to list voters');
      throw error;
    }
  }
  
  /**
   * Get admin logs (admin only)
   */
  async getAdminLogs(options = {}) {
    try {
      // Ensure the admin address is set for API calls
      apiService.setAdminAddress(this.ADMIN_ADDRESS);
      
      return await apiService.getAdminLogs(options);
    } catch (error) {
      console.error('Error getting admin logs:', error);
      toast.error('Failed to get admin logs');
      throw error;
    }
  }
  
  /**
   * Get the current user's address
   */
  getCurrentAddress(): string | null {
    return this.currentAddress;
  }
  
  /**
   * Get the admin address
   */
  getAdminAddress(): string {
    return this.DEV_MODE && this.currentAddress ? this.currentAddress : this.ADMIN_ADDRESS;
  }
  
  /**
   * Check if the current user is an admin
   */
  isAdmin(): boolean {
    return this.isUserAdmin();
  }
  
  /**
   * Get development mode status
   */
  isDevMode(): boolean {
    return this.DEV_MODE;
  }
}

// Singleton instance
export const web3Integration = new Web3IntegrationService(); 