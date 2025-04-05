import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

// Mock ABI for voting contract
const VOTING_CONTRACT_ABI = [
  {
    "inputs": [{ "name": "userId", "type": "string" }],
    "name": "verifyUser",
    "outputs": [{ "name": "success", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "electionId", "type": "uint256" },
      { "name": "electionName", "type": "string" },
      { "name": "startTime", "type": "uint256" },
      { "name": "endTime", "type": "uint256" }
    ],
    "name": "scheduleElection",
    "outputs": [{ "name": "success", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "electionId", "type": "uint256" },
      { "name": "candidateName", "type": "string" },
      { "name": "candidateInfo", "type": "string" }
    ],
    "name": "addCandidate",
    "outputs": [{ "name": "success", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getElections",
    "outputs": [{ "name": "elections", "type": "tuple[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "electionId", "type": "uint256" }],
    "name": "getCandidates",
    "outputs": [{ "name": "candidates", "type": "tuple[]" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// This would be replaced with actual contract address
const VOTING_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

// Get environment variables
const DUMMY_MODE = process.env.NEXT_PUBLIC_DUMMY_CONTRACT === 'true';

export type Election = {
  id: number;
  name: string;
  startTime: number;
  endTime: number;
};

export type Candidate = {
  id: number;
  name: string;
  info: string;
  electionId: number;
};

export type User = {
  id: string;
  name: string;
  isVerified: boolean;
};

class Web3Service {
  provider: any;
  signer: ethers.JsonRpcSigner | null = null;
  contract: ethers.Contract | null = null;
  dummyMode: boolean = DUMMY_MODE;
  
  async initialize() {
    try {
      if (this.dummyMode) {
        console.log("Using DUMMY mode for blockchain operations - no actual contract calls will be made");
        return true;
      }
      
      this.provider = await detectEthereumProvider();
      
      if (this.provider) {
        // Connect to the provider
        const ethersProvider = new ethers.BrowserProvider(this.provider);
        
        // Request account access
        await this.provider.request({ method: 'eth_requestAccounts' });
        
        // Get signer
        this.signer = await ethersProvider.getSigner();
        
        // Initialize contract
        this.contract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VOTING_CONTRACT_ABI,
          this.signer
        );
        
        return true;
      } else {
        console.error('Please install MetaMask or another Web3 provider');
        return false;
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
      return false;
    }
  }
  
  async verifyUser(userId: string): Promise<boolean> {
    try {
      if (this.dummyMode) {
        console.log(`DUMMY MODE: Pretending to verify user ${userId} on blockchain`);
        return true;
      }
      
      if (!this.contract) throw new Error('Contract not initialized');
      const tx = await this.contract.verifyUser(userId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error verifying user:', error);
      return false;
    }
  }
  
  async scheduleElection(
    name: string,
    startTime: number,
    endTime: number
  ): Promise<boolean> {
    try {
      if (this.dummyMode) {
        console.log(`DUMMY MODE: Pretending to schedule election "${name}" from ${startTime} to ${endTime}`);
        return true;
      }
      
      if (!this.contract) throw new Error('Contract not initialized');
      const electionId = Date.now(); // Using timestamp as a simple ID
      const tx = await this.contract.scheduleElection(electionId, name, startTime, endTime);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error scheduling election:', error);
      return false;
    }
  }
  
  async addCandidate(
    electionId: number,
    name: string,
    info: string
  ): Promise<boolean> {
    try {
      if (this.dummyMode) {
        console.log(`DUMMY MODE: Pretending to add candidate "${name}" to election ${electionId}`);
        return true;
      }
      
      if (!this.contract) throw new Error('Contract not initialized');
      const tx = await this.contract.addCandidate(electionId, name, info);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error adding candidate:', error);
      return false;
    }
  }
  
  async getElections(): Promise<Election[]> {
    try {
      if (this.dummyMode) {
        console.log('DUMMY MODE: Returning mock election data');
        return [
          { id: 1, name: 'Presidential Election 2025', startTime: 1735689600, endTime: 1738368000 },
          { id: 2, name: 'Local Municipal Election', startTime: 1719792000, endTime: 1722470400 }
        ];
      }
      
      if (!this.contract) throw new Error('Contract not initialized');
      // In a real application, this would call the contract method
      // For demo purposes, return mock data
      return [
        { id: 1, name: 'Presidential Election 2025', startTime: 1735689600, endTime: 1738368000 },
        { id: 2, name: 'Local Municipal Election', startTime: 1719792000, endTime: 1722470400 }
      ];
    } catch (error) {
      console.error('Error getting elections:', error);
      return [];
    }
  }
  
  async getCandidates(electionId: number): Promise<Candidate[]> {
    try {
      if (this.dummyMode) {
        console.log(`DUMMY MODE: Returning mock candidates for election ${electionId}`);
        return [
          { id: 1, name: 'John Doe', info: 'Party A', electionId },
          { id: 2, name: 'Jane Smith', info: 'Party B', electionId },
          { id: 3, name: 'Robert Johnson', info: 'Party C', electionId }
        ];
      }
      
      if (!this.contract) throw new Error('Contract not initialized');
      // In a real application, this would call the contract method
      // For demo purposes, return mock data
      return [
        { id: 1, name: 'John Doe', info: 'Party A', electionId },
        { id: 2, name: 'Jane Smith', info: 'Party B', electionId },
        { id: 3, name: 'Robert Johnson', info: 'Party C', electionId }
      ];
    } catch (error) {
      console.error('Error getting candidates:', error);
      return [];
    }
  }
  
  async getUsers(): Promise<User[]> {
    // In a real app, this would call a backend API or contract method
    // For demo purposes, return mock data
    return [
      { id: '001', name: 'Alice Johnson', isVerified: false },
      { id: '002', name: 'Bob Williams', isVerified: true },
      { id: '003', name: 'Carol Davis', isVerified: false },
      { id: '004', name: 'Dave Miller', isVerified: true },
      { id: '005', name: 'Eve Brown', isVerified: false }
    ];
  }
}

// Singleton instance
export const web3Service = new Web3Service(); 