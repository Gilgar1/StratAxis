import React from 'react';
import StatsCards from '../components/dashboard/StatsCards';
import QuickFilters from '../components/dashboard/QuickFilters';

const Dashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <StatsCards />
      <QuickFilters />
    </div>
  );
};

export default Dashboard;