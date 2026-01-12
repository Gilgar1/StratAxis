import React from 'react';

const Booking = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Book a Consultation</h1>
            <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border">
                <p className="text-gray-600 mb-6">Connect with our real estate experts for personalized advice.</p>
                {/* BookingForm will be integrated here */}
                <div className="p-4 bg-gray-50 border-dashed border-2 rounded-lg text-center text-gray-400">
                    Booking Form Component Placeholder
                </div>
            </div>
        </div>
    );
};

export default Booking;
