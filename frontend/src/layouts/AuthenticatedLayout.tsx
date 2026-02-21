import React, { ReactNode } from 'react';
import Header from '../components/common/Header';
import Navigation from '../components/common/Navigation';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
    return (
        <div className="h-screen overflow-hidden flex flex-col">
            <Header />
            <div className="flex-1 flex overflow-hidden">
                <Navigation />
                <main className="flex-1 overflow-y-auto bg-cream-50 dark:bg-primary-950">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AuthenticatedLayout;
