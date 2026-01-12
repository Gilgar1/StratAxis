import React from 'react';

const Analytics = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Market Analytics</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border h-80 flex items-center justify-center">
                    <p className="text-gray-400">Price Trend Chart Placeholder</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border h-80 flex items-center justify-center">
                    <p className="text-gray-400">Neighborhood Distribution Chart Placeholder</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
