import { describe, it, expect } from 'vitest';
import { MerkleTree, hash } from './merkle';

describe('MerkleTree', () => {
    it('should create a valid tree with 2 leaves', () => {
        const leaves = ['a', 'b'];
        const tree = new MerkleTree(leaves);
        const layers = tree.getLayers();

        // Layer 0: [hash(a), hash(b)]
        // Layer 1: [hash(hash(a) + hash(b))]
        expect(layers.length).toBe(2);
        expect(layers[0].length).toBe(2);
        expect(layers[1].length).toBe(1);

        const leafHashes = leaves.map(hash);
        expect(layers[0]).toEqual(leafHashes);
        expect(layers[1][0]).toBe(hash(leafHashes[0] + leafHashes[1]));
    });

    it('should handle odd number of leaves (3) by duplicating the last one', () => {
        const leaves = ['a', 'b', 'c'];
        const tree = new MerkleTree(leaves);
        const layers = tree.getLayers();

        // Layer 0: [h(a), h(b), h(c)]
        // Layer 1: [h(h(a)+h(b)), h(h(c)+h(c))]  <-- duplicated h(c)
        // Layer 2: [h(L1[0] + L1[1])]

        expect(layers.length).toBe(3);
        const leafHashes = leaves.map(hash);

        // Check Layer 1
        const l1_0 = hash(leafHashes[0] + leafHashes[1]);
        const l1_1 = hash(leafHashes[2] + leafHashes[2]); // Duplicated
        expect(layers[1][0]).toBe(l1_0);
        expect(layers[1][1]).toBe(l1_1);

        // Check Root
        const root = hash(l1_0 + l1_1);
        expect(tree.getRoot()).toBe(root);
    });

    it('should generate and verify a valid proof', () => {
        const leaves = ['tx1', 'tx2', 'tx3', 'tx4'];
        const tree = new MerkleTree(leaves);
        const root = tree.getRoot();

        // Proof for tx2 (index 1)
        // Sibling is tx1 (left)
        // Parent sibling is hash(tx3+tx4) (right)
        const proof = tree.getProof(1);
        const leafHash = hash('tx2');

        expect(MerkleTree.verify(proof, leafHash, root)).toBe(true);
    });

    it('should fail verification for tampered data', () => {
        const leaves = ['tx1', 'tx2', 'tx3', 'tx4'];
        const tree = new MerkleTree(leaves);
        const root = tree.getRoot();

        // Valid proof for tx2
        const proof = tree.getProof(1);

        // Verify with wrong leaf
        const wrongLeaf = hash('tx2-tampered');
        expect(MerkleTree.verify(proof, wrongLeaf, root)).toBe(false);
    });

    it('should fail verification for wrong proof', () => {
        const leaves = ['tx1', 'tx2', 'tx3', 'tx4'];
        const tree = new MerkleTree(leaves);
        const root = tree.getRoot();

        const proof = tree.getProof(1);
        // Tamper with proof step
        proof[0].data = hash('malicious');

        const leafHash = hash('tx2');
        expect(MerkleTree.verify(proof, leafHash, root)).toBe(false);
    });
});
