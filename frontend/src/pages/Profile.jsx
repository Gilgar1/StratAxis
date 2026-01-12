import React from 'react';

const Profile = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">User Profile</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border max-w-md">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                        JD
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">John Doe</h2>
                        <p className="text-gray-500">john.doe@example.com</p>
                    </div>
                </div>
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

export default Profile;
