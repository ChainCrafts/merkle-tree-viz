import { useMemo } from 'react';
import { useTreeStore } from '../../store/useTreeStore';
import { type Node, type Edge, Position } from '@xyflow/react';

const X_SPACING = 200;
const Y_SPACING = 150;

export function useTreeNodes() {
    const { treeLayers, proofPath, selectedLeafIndex } = useTreeStore();

    const { nodes, edges } = useMemo(() => {
        if (!treeLayers || treeLayers.length === 0) return { nodes: [], edges: [] };

        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const layerCount = treeLayers.length;

        // Helper map to store x-coordinates for parent calculation
        const nodePositions: Record<string, number> = {};

        // 1. Calculate positions for leaves (Layer 0)
        // Center the whole tree?
        // Let's start from x=0

        // We iterate from leaves up to root to calculate positions based on children
        // Actually, binary tree layout usually works better bottom-up for x-coordinates.

        // Wait, layer 0 is leaves.
        // If we space leaves evenly, parents will be centered above them.

        const leaves = treeLayers[0];
        const totalWidth = (leaves.length - 1) * X_SPACING;
        const startX = -totalWidth / 2; // Center around 0

        // Build nodes layer by layer
        for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
            const currentLayer = treeLayers[layerIndex];
            const isLeaves = layerIndex === 0;

            for (let i = 0; i < currentLayer.length; i++) {
                const id = `L${layerIndex}-N${i}`;
                const hashVal = currentLayer[i];

                let x = 0;
                if (isLeaves) {
                    x = startX + i * X_SPACING;
                } else {
                    // Parent position is average of children
                    // Left child: L(layer-1)-N(2*i)
                    // Right child: L(layer-1)-N(2*i+1)
                    // If right child doesn't exist (odd duplication handled in logic but layout?),
                    // In my MerkleTree implementation, buildTree ensures even pairs or duplicates.
                    // So every parent has 2 children in the previous layer (except maybe last one if logic differs, but my logic pushes pairs).
                    // Wait, my logic: if odd, duplicate last one. So previous layer always has even number? 
                    // No. Layer 0 has 3 items. Layer 1 has 2 items (0+1, 2+2dup).
                    // Parent 0 connects to L0-N0, L0-N1.
                    // Parent 1 connects to L0-N2, L0-N2(duplicate logic implicit).
                    // Actually, the 'duplicate' logic in buildTree creates a hash from (last + last).
                    // But visually, does it connect to the ONE node twice? or is there a valid ghost node?
                    // Standard spec: "duplicate last node". Visually, typically show the last node connecting to the parent, 
                    // effectively being its own sibling.

                    const child1Id = `L${layerIndex - 1}-N${i * 2}`;
                    const child2Id = `L${layerIndex - 1}-N${i * 2 + 1}`; // This might be out of bounds if not duplicated in layer array?
                    // Wait, the layer array contains the hashes. L0 has 3 items. L1 has 2 items.
                    // L1[0] from L0[0]+L0[1].
                    // L1[1] from L0[2]+L0[2].
                    // So visual parent at i=1 needs to be above L0[2].
                    // x = (child1.x + child2.x) / 2.
                    // If child2 doesn't exist in the layer array (index out of bounds), we use child1.x (vertical line).

                    const child1X = nodePositions[child1Id];
                    let child2X = nodePositions[child2Id];

                    if (child2X === undefined) {
                        // This means we are at the odd one out.
                        // In the hashing logic, we used the node itself.
                        // So visually, we can just place it above the single child?
                        // Or ideally, show it effectively branching?
                        child2X = child1X;
                    }

                    x = (child1X + child2X) / 2;
                }

                nodePositions[id] = x;

                // Y position: Root at top (y=0). Leaves at bottom.
                // LayerIndex 0 (leaves) -> y = (layerCount - 1) * Y_SPACING
                // LayerIndex N-1 (root) -> y = 0
                const y = (layerCount - 1 - layerIndex) * Y_SPACING;

                // Is this node part of the proof?
                // ProofPath contains 'data' and 'position'.
                // It's hard to match by data exactly if duplicates exist, but usually fine.
                // Highlight logic:
                // 1. Selected leaf is highlighted.
                // 2. Nodes in proof path (siblings) are highlighted.
                // 3. Path to root is highlighted?

                // Highlight logic

                let onPath = false;
                let isProofNode = false;

                if (selectedLeafIndex !== null) {
                    // Check if this node is on the path from selected leaf to root
                    // Path at layer L is index = floor(selectedLeafIndex / 2^L)
                    const pathIndexAtLayer = Math.floor(selectedLeafIndex / Math.pow(2, layerIndex));
                    if (i === pathIndexAtLayer) {
                        onPath = true;
                    }

                    // Check if this node is a sibling (proof node)
                    // Sibling logic:
                    // At layer L, the path node is P.
                    // Sibling is P^1 (xor 1).
                    // But we must check if P is relevant to the selected leaf?
                    // Yes, calculate path node for this layer.
                    const p = pathIndexAtLayer;
                    const sibling = (p % 2 === 0) ? p + 1 : p - 1;
                    if (i === sibling) {
                        isProofNode = true;
                    }
                }

                // Pass style classes via data or type?
                // We can use data.variant or similar if we update MerkleNode to support it.
                // Actually, MerkleNode checks isLeaf and isRoot.
                // Let's add isPath and isProof to data.

                nodes.push({
                    id,
                    position: { x, y },
                    data: {
                        hash: hashVal,
                        layer: layerIndex,
                        index: i,
                        isLeaf: isLeaves,
                        isRoot: layerIndex === layerCount - 1,
                        isOnPath: onPath,
                        isProofNode: isProofNode
                    },
                    type: 'merkleNode',
                    sourcePosition: Position.Bottom,
                    targetPosition: Position.Top,
                });

                // Add edges
                if (!isLeaves) {
                    // Edges to children
                    const child1Id = `L${layerIndex - 1}-N${i * 2}`;
                    const child2Id = `L${layerIndex - 1}-N${i * 2 + 1}`;

                    // Edge 1
                    edges.push({
                        id: `e-${child1Id}-${id}`,
                        source: id,
                        target: child1Id,
                        type: 'smoothstep'
                    });

                    // Edge 2
                    if (child2Id in nodePositions) {
                        // Normal pair
                        edges.push({
                            id: `e-${child2Id}-${id}`,
                            source: id,
                            target: child2Id,
                            type: 'smoothstep'
                        });
                    } else {
                        // Odd case: Duplicate edge from the single child?
                        // L1[1] connects to L0[2].
                        // L1[1] is hash(L0[2]+L0[2]).
                        // So we usually show one line or two lines?
                        // Let's show one line + dotted line? Or just one line.
                        // Code simplified: one edge if it points to same visual child?
                        // ReactFlow supports multiple edges between nodes if handles differ?
                        // Or we can just leave it as one edge.
                    }
                }
            }
        }

        // Highlight edges logic later

        return { nodes, edges };
    }, [treeLayers, proofPath, selectedLeafIndex]);

    return { nodes, edges };
}
