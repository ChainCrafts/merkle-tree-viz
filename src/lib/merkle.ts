import CryptoJS from 'crypto-js';

export interface ProofStep {
    position: 'left' | 'right';
    data: string;
}

export interface MerkleProof {
    proof: ProofStep[];
    leaf: string;
    root: string;
}

export const hash = (data: string): string => {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
};

export class MerkleTree {
    private leaves: string[];
    private layers: string[][];

    constructor(leaves: string[]) {
        this.leaves = leaves.map(hash);
        this.layers = this.buildTree(this.leaves);
    }

    private buildTree(leaves: string[]): string[][] {
        if (leaves.length === 0) return [];

        const layers: string[][] = [leaves];
        let currentLayer = leaves;

        while (currentLayer.length > 1) {
            const nextLayer: string[] = [];

            for (let i = 0; i < currentLayer.length; i += 2) {
                if (i + 1 < currentLayer.length) {
                    // Pair exists
                    const combined = currentLayer[i] + currentLayer[i + 1];
                    nextLayer.push(hash(combined));
                } else {
                    // Odd node, duplicate last one
                    // Standard Merkle Tree implementations often duplicate the last node
                    // if the count is odd.
                    const combined = currentLayer[i] + currentLayer[i];
                    nextLayer.push(hash(combined));
                }
            }

            layers.push(nextLayer);
            currentLayer = nextLayer;
        }

        return layers;
    }

    public getRoot(): string {
        if (this.layers.length === 0) return '';
        return this.layers[this.layers.length - 1][0];
    }

    public getLayers(): string[][] {
        return this.layers;
    }

    public getProof(index: number): ProofStep[] {
        if (index < 0 || index >= this.leaves.length) return [];

        const proof: ProofStep[] = [];
        let currentLayerIndex = 0;
        let currentIndex = index;

        // Iterate through layers until the root (exclusive)
        while (currentLayerIndex < this.layers.length - 1) {
            const layer = this.layers[currentLayerIndex];
            const isRightNode = currentIndex % 2 === 1;

            if (isRightNode) {
                // Sibling is to the left
                proof.push({
                    position: 'left',
                    data: layer[currentIndex - 1]
                });
            } else {
                // Sibling is to the right
                if (currentIndex + 1 < layer.length) {
                    proof.push({
                        position: 'right',
                        data: layer[currentIndex + 1]
                    });
                } else {
                    // Odd node case, sibling is itself (duplicated)
                    proof.push({
                        position: 'right',
                        data: layer[currentIndex]
                    });
                }
            }

            currentIndex = Math.floor(currentIndex / 2);
            currentLayerIndex++;
        }

        return proof;
    }

    public static verify(proof: ProofStep[], leaf: string, root: string): boolean {
        let currentHash = leaf;

        for (const step of proof) {
            if (step.position === 'left') {
                currentHash = hash(step.data + currentHash);
            } else {
                currentHash = hash(currentHash + step.data);
            }
        }

        return currentHash === root;
    }
}
