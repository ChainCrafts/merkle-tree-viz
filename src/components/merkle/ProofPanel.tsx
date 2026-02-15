import { useTreeStore } from '../../store/useTreeStore';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
import { hash } from '../../lib/merkle'; // For verification simulation if needed
import { useState } from 'react';

export function ProofPanel() {
    const { proofPath, selectedLeafIndex, transactions, merkleRoot } = useTreeStore();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

    if (selectedLeafIndex === null || !proofPath.length) {
        return (
            <div className="p-6 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                <ShieldCheck className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Select a leaf node to generate a Merkle Proof.</p>
            </div>
        );
    }

    const selectedTx = transactions[selectedLeafIndex];

    const handleVerify = () => {
        setIsVerifying(true);
        setVerificationResult(null);

        // Simulate delay for effect
        setTimeout(() => {
            // Recompute locally
            let currentHash = hash(selectedTx);
            for (const step of proofPath) {
                if (step.position === 'left') {
                    currentHash = hash(step.data + currentHash);
                } else {
                    currentHash = hash(currentHash + step.data);
                }
            }
            setVerificationResult(currentHash === merkleRoot);
            setIsVerifying(false);
        }, 800);
    };

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Merkle Proof for Leaf #{selectedLeafIndex}
                </h3>
                <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded mb-4 font-mono break-all">
                    {selectedTx}
                </div>

                <div className="space-y-3">
                    {proofPath.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-background border rounded text-sm group hover:border-primary/50 transition-colors">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-mono">
                                {idx + 1}
                            </span>
                            <div className="flex-1 font-mono text-xs break-all text-muted-foreground">
                                <span className="text-primary font-bold mr-2 uppercase">{step.position}</span>
                                {step.data.substring(0, 16)}...
                            </div>
                            {step.position === 'left' ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : <ArrowLeft className="h-4 w-4 text-muted-foreground" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div>
                    <div className="text-sm font-medium">Root Hash Validation</div>
                    <div className="text-xs text-muted-foreground mt-1">Verify if the proof leads to the current root.</div>
                </div>
                <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className={cn(
                        "px-4 py-2 rounded-md font-medium text-sm transition-all flex items-center gap-2",
                        verificationResult === true ? "bg-green-100 text-green-700 border border-green-200" :
                            verificationResult === false ? "bg-red-100 text-red-700 border border-red-200" :
                                "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                >
                    {isVerifying ? (
                        "Verifying..."
                    ) : verificationResult === true ? (
                        <><CheckCircle className="w-4 h-4" /> Verified</>
                    ) : verificationResult === false ? (
                        <><XCircle className="w-4 h-4" /> Invalid</>
                    ) : (
                        "Verify Proof"
                    )}
                </button>
            </div>
        </div>
    );
}
