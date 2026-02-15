import { Network } from 'lucide-react';

export function Header() {
    return (
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Network className="h-6 w-6 text-primary" />
                    <span>MerkleViz</span>
                </div>
                <nav className="flex items-center gap-4">
                    <a
                        href="https://github.com/google-deepmind/merkle-tree-viz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline text-muted-foreground hover:text-foreground"
                    >
                        GitHub
                    </a>
                </nav>
            </div>
        </header>
    );
}
