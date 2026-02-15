import { create } from 'zustand';
import { MerkleTree } from '../lib/merkle';
import type { ProofStep } from '../lib/merkle';

interface TreeState {
    transactions: string[];
    treeLayers: string[][];
    merkleRoot: string;
    proofPath: ProofStep[];
    selectedLeafIndex: number | null;
    config: {
        hashAlgo: 'SHA-256';
        duplicateOdd: boolean;
    };

    // Actions
    setTransactions: (transactions: string[]) => void;
    buildTree: () => void;
    selectLeaf: (index: number | null) => void;
    generateProof: (index: number) => void;
    clearProof: () => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
    transactions: [],
    treeLayers: [],
    merkleRoot: '',
    proofPath: [],
    selectedLeafIndex: null,
    config: {
        hashAlgo: 'SHA-256',
        duplicateOdd: true,
    },

    setTransactions: (transactions) => {
        set({ transactions });
    },

    buildTree: () => {
        const { transactions } = get();
        // Filter out empty lines? Or keep them as empty strings?
        // Let's filter empty lines for better UX, usually.
        const validTransactions = transactions.filter(t => t.trim() !== '');

        if (validTransactions.length === 0) {
            set({ treeLayers: [], merkleRoot: '', proofPath: [], selectedLeafIndex: null });
            return;
        }

        const tree = new MerkleTree(validTransactions);
        set({
            treeLayers: tree.getLayers(),
            merkleRoot: tree.getRoot(),
            proofPath: [], // Reset proof on rebuild
            selectedLeafIndex: null,
        });
    },

    selectLeaf: (index) => {
        set({ selectedLeafIndex: index });
        if (index !== null) {
            get().generateProof(index);
        } else {
            get().clearProof();
        }
    },

    generateProof: (index) => {
        const { transactions } = get();
        const validTransactions = transactions.filter(t => t.trim() !== '');
        if (validTransactions.length === 0) return;

        const tree = new MerkleTree(validTransactions);
        const proof = tree.getProof(index);
        set({ proofPath: proof });
    },

    clearProof: () => {
        set({ proofPath: [], selectedLeafIndex: null });
    }
}));
