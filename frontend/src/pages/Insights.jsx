import React from 'react';

const Insights = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Market Insights</h1>
            <p className="text-gray-700">This page is accessible to PAID_USER roles only.</p>
            <section>
                <h2 className="text-2xl font-bold mb-2">Investment Opportunities</h2>
                <p>Highlights of the best investment opportunities.</p>
            </section>
            <section>
                <h2 className="text-2xl font-bold mb-2">Price Prediction Tool</h2>
                <p>Form and results for price predictions.</p>
            </section>
        </div>
    );
};

export default Insights;
