import { useMemo } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTreeNodes } from './useTreeNodes';
import { MerkleNode } from './MerkleNode'; // Need to export this
// Ensure MerkleNode component is exported correctly above!

// Outside component or useMemo
export function TreeVisualizer() {
    const { nodes, edges } = useTreeNodes();

    const nodeTypes = useMemo(() => ({
        merkleNode: MerkleNode,
    }), []);

    return (
        <div className="h-[600px] w-full border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/50">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={4}
                attributionPosition="bottom-right"
            >
                <Background gap={20} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
