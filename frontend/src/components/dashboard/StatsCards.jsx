import React from 'react';

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-lg font-bold">Total Properties</h3>
        <p className="text-2xl">1,234</p>
      </div>
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-lg font-bold">Average Price per m²</h3>
        <p className="text-2xl">$1,200</p>
      </div>
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-lg font-bold">Cities Covered</h3>
        <p className="text-2xl">2</p>
      </div>
      <div className="bg-white p-4 shadow rounded">
        <h3 className="text-lg font-bold">Last Updated</h3>
        <p className="text-2xl">Jan 28, 2026</p>
      </div>
    </div>
  );
};

export default StatsCards;
