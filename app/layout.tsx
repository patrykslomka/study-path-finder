import React, { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header style={{ background: '#282c34', padding: '1rem', color: 'white' }}>
                <h1>Study Path Finder</h1>
            </header>
            <main style={{ flex: 1, padding: '1rem' }}>
                {children} {/* This will correctly render content */}
            </main>
            <footer style={{ background: '#282c34', padding: '1rem', color: 'white', textAlign: 'center' }}>
                <p>&copy; 2025 Study Path Finder</p>
            </footer>
        </div>
    );
};

export default Layout;
