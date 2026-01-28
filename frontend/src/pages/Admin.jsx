import React from 'react';

const Admin = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold mb-2">Users</h3>
                    <p className="text-3xl font-extrabold text-primary-600">128</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold mb-2">Sources</h3>
                    <p className="text-3xl font-extrabold text-green-600">12</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold mb-2">Models</h3>
                    <p className="text-3xl font-extrabold text-purple-600">4</p>
                </div>
            </div>
        </div>
    );
};

export default Admin;
