import { useState } from 'react';
import { useTreeStore } from '../../store/useTreeStore';
import { FileCode, RefreshCw } from 'lucide-react';
// import { cn } from '../../lib/utils'; // Not used yet

export function InputSection() {
    const { setTransactions, buildTree } = useTreeStore();
    const [input, setInput] = useState('');

    const handleBuild = () => {
        const txs = input.split('\n').filter(t => t.trim() !== '');
        setTransactions(txs);
        buildTree();
    };

    const handleExample = () => {
        const example = "Transaction 1\nTransaction 2\nTransaction 3\nTransaction 4";
        setInput(example);
        const txs = example.split('\n');
        setTransactions(txs);
        // setTimeout to allow state update? No, zustand is sync usually. 
        // Actually setTransactions updates store, buildTree reads from store.
        // So we need to call setTransactions then buildTree.
        // However, if we want to ensure it uses the latest, we can pass it to buildTree? 
        // My store implementation of buildTree uses get(), so it should be fine if called synchronously after set.
        // But let's verify. Zustand updates are synchronous.
        // Wait, buildTree reads from store. 
        // Let's just call buildTree() immediately after.

        // Actually, calling setTransactions updates the store. 
        // Then buildTree reads the updated store.
        useTreeStore.getState().setTransactions(txs);
        useTreeStore.getState().buildTree();
    };

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                <button
                    onClick={handleExample}
                    className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                    <FileCode className="h-4 w-4" /> Load Example
                </button>
            </div>

            <div className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter transactions (one per line)..."
                    className="w-full min-h-[120px] p-4 rounded-lg border bg-card text-card-foreground shadow-sm focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                />
            </div>

            <button
                onClick={handleBuild}
                className="w-full sm:w-auto px-8 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
                <RefreshCw className="h-4 w-4" />
                Generate Merkle Tree
            </button>
        </div>
    );
}
