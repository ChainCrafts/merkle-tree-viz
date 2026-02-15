import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { cn } from '../../lib/utils';
import { useTreeStore } from '../../store/useTreeStore';
import { Hash, FileText, File } from 'lucide-react';

interface MerkleNodeData extends Record<string, unknown> {
    hash: string;
    isLeaf: boolean;
    isRoot: boolean;
    layer: number;
    index: number;
    isOnPath?: boolean;
    isProofNode?: boolean;
}

export function MerkleNode({ data }: NodeProps<Node<MerkleNodeData>>) {
    const { selectLeaf, selectedLeafIndex } = useTreeStore();

    // Custom selection logic via store
    const isSelected = data.isLeaf && data.index === selectedLeafIndex;
    const isHighlight = data.isOnPath || data.isProofNode;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent canvas click
        if (data.isLeaf) {
            selectLeaf(isSelected ? null : data.index);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "rounded-md border-2 bg-card p-3 shadow-sm min-w-[160px] transition-all cursor-pointer hover:shadow-md",
                isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
                isHighlight && !isSelected && "border-green-400 ring-2 ring-green-100 bg-green-50/50 dark:bg-green-900/20",
                data.isRoot && "border-purple-500 bg-purple-50 dark:bg-purple-900/10",
                data.isLeaf && !isSelected && !isHighlight && "bg-blue-50 dark:bg-blue-900/10",
                data.isProofNode && "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
            )}
        >
            <div className="flex items-center gap-2 mb-2 border-b pb-1 border-border/50">
                {data.isRoot ? (
                    <Hash className="w-3.5 h-3.5 text-purple-600" />
                ) : data.isLeaf ? (
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                    <File className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {data.isRoot ? 'Root' : data.isLeaf ? `Leaf ${data.index}` : `Node L${data.layer}`}
                </span>
            </div>

            <div className="font-mono text-[10px] text-muted-foreground w-full text-center truncate px-1" title={data.hash}>
                {data.hash}
            </div>

            {/* Handles */}
            <Handle type="target" position={Position.Bottom} className="!bg-muted-foreground/50 !w-2 !h-2" />
            <Handle type="source" position={Position.Top} className="!bg-muted-foreground/50 !w-2 !h-2" />
        </div>
    );
}
