import { Layout } from './components/layout/Layout';
import { InputSection } from './components/merkle/InputSection';
import { TreeVisualizer } from './components/merkle/TreeVisualizer';
import { ProofPanel } from './components/merkle/ProofPanel';
import '@xyflow/react/dist/style.css';

function App() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="space-y-4">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Merkle Tree Visualizer</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Interactive demonstration of Merkle Trees, hashing, and cryptographic proofs.
              Enter data, build the tree, and generate proofs.
            </p>
          </div>

          <InputSection />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Tree Visualization</h2>
            <TreeVisualizer />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Proof & Verification</h2>
            <ProofPanel />
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default App;
