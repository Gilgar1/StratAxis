import React from 'react';

const Analytics = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Market Analytics</h1>
            <section>
                <h2 className="text-2xl font-bold mb-4">Price Trends</h2>
                <div className="bg-white p-6 rounded-xl shadow-sm border h-80 flex items-center justify-center">
                    <p className="text-gray-400">Price Trend Chart Placeholder</p>
                </div>
            </section>
            <section>
                <h2 className="text-2xl font-bold mb-4">Trend Forecasting</h2>
                <div className="bg-white p-6 rounded-xl shadow-sm border h-80 flex items-center justify-center">
                    <p className="text-gray-400">Trend Forecasting Chart Placeholder</p>
                </div>
            </section>
        </div>
    );
};

export default Analytics;
