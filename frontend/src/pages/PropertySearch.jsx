import React from 'react';
import SearchInterface from '../components/property/SearchInterface';
import TableView from '../components/property/TableView';
import MapView from '../components/property/MapView';

const PropertySearch = () => {
  return (
    <div className="container mx-auto p-4">
      <SearchInterface />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <TableView />
        <MapView />
      </div>
    </div>
  );
};

export default PropertySearch;