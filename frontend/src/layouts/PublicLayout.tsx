import React, { ReactNode } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

interface PublicLayoutProps {
    children: ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
