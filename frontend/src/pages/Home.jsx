import React from 'react';

const Home = () => {
    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
                Unlock Real Estate Insights in <span className="text-primary-600">Cameroon</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                StratAxis provides advanced data analytics, price predictions, and market trends for the real estate market in Yaoundé and Douala.
            </p>
            <div className="flex justify-center space-x-4">
                <button className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 transition">
                    View Analytics
                </button>
                <button className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-primary-50 transition">
                    Book Consultation
                </button>
            </div>
        </div>
    );
};

export default Home;
