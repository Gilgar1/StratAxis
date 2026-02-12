import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '../utils/constants';
import landDataRaw from '../data/land_prices_intelligence.json';
import { LandPriceData } from '../types';
import { formatCurrency } from '../utils/formatters';

const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// Hardcoded coordinates for demo since GeoJSON wasn't provided for Phase 1.
// In Phase N we would use real polygons.
const NEIGHBORHOOD_COORDS: Record<string, [number, number]> = {
  // Douala
  'Bonanjo': [4.043, 9.691],
  'Bonapriso': [4.032, 9.699],
  'Akwa': [4.052, 9.706],
  'Deido': [4.061, 9.715],
  'Bali': [4.039, 9.698],
  'Makepe': [4.081, 9.740],
  'Logbaba': [4.045, 9.761],
  'Bonaberi': [4.075, 9.660],
  'Bepanda': [4.062, 9.728],
  'Ndokotti': [4.050, 9.742],
  // Yaounde
  'Bastos': [3.882, 11.514],
  'Ngoa-Ekelle': [3.856, 11.503],
  'Nlongkak': [3.885, 11.520],
  'Mvan': [3.820, 11.520],
  'Omnisport': [3.880, 11.530],
  'Essos': [3.870, 11.540],
  'Tsinga': [3.890, 11.505],
  'Odza': [3.795, 11.535],
  'Mimboman': [3.865, 11.555]
};

const InteractiveMaps: React.FC = () => {
  const data = landDataRaw as unknown as LandPriceData;
  const [selectedCity, setSelectedCity] = useState<'Douala' | 'Yaoundé'>('Douala');

  // Filter and map data to coordinates
  const markers = data.neighborhoods
    .filter(n => n.city === selectedCity)
    .map(n => ({
      ...n,
      coords: NEIGHBORHOOD_COORDS[n.neighborhood]
    }))
    .filter(n => n.coords); // Only show ones we have coords for

  const center = selectedCity === 'Douala'
    ? [MAP_CONFIG.doualaCenter.lat, MAP_CONFIG.doualaCenter.lng] as [number, number]
    : [MAP_CONFIG.yaoundeCenter.lat, MAP_CONFIG.yaoundeCenter.lng] as [number, number];

  // Helper to color code by price
  const getMarkerColor = (price: number, city: string) => {
    // Very simple scaling for demo
    const max = city === 'Douala' ? 100000 : 130000;
    const normalized = Math.min(price / max, 1);

    if (normalized > 0.8) return '#ef4444'; // Red (Expensive)
    if (normalized > 0.5) return '#f59e0b'; // Orange
    if (normalized > 0.3) return '#D4AF37'; // Gold
    return '#10b981'; // Green
  };

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col h-full bg-primary-950">
        {/* Map Controls Header */}
        <div className="bg-primary-900 border-b border-primary-800 p-4 flex justify-between items-center z-10 shadow-lg">
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedCity('Douala')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedCity === 'Douala' ? 'bg-accent-gold text-primary-950' : 'bg-primary-800 text-white hover:bg-primary-700'}`}
            >
              Douala
            </button>
            <button
              onClick={() => setSelectedCity('Yaoundé')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${selectedCity === 'Yaoundé' ? 'bg-accent-gold text-primary-950' : 'bg-primary-800 text-white hover:bg-primary-700'}`}
            >
              Yaoundé
            </button>
          </div>
          <div className="flex items-center space-x-4 text-xs text-white">
            <div className="flex items-center"><span className="w-3 h-3 bg-[#10b981] rounded-full mr-2"></span>Value</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-[#D4AF37] rounded-full mr-2"></span>Avg</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-[#f59e0b] rounded-full mr-2"></span>Premium</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-[#ef4444] rounded-full mr-2"></span>Prime</div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative z-0">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <ChangeView center={center} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {markers.map((marker, idx) => (
              <CircleMarker
                key={idx}
                center={marker.coords}
                radius={Math.max(10, Math.sqrt(marker.listing_count) * 4)} // Size by volume
                pathOptions={{
                  fillColor: getMarkerColor(marker.median_land_price_per_sqm_xaf, selectedCity),
                  color: '#fff',
                  weight: 1,
                  opacity: 0.8,
                  fillOpacity: 0.7
                }}
              >
                <Popup>
                  <div className="p-1">
                    <div className="text-lg font-bold mb-1">{marker.neighborhood}</div>
                    <div className="text-xl font-bold text-accent-gold-dark mb-2">
                      {formatCurrency(marker.median_land_price_per_sqm_xaf)}/m²
                    </div>
                    <div className="text-sm border-t pt-2 mt-2">
                      <div className="flex justify-between">
                        <span>Volume:</span>
                        <strong>{marker.listing_count} listings</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <strong>{marker.data_confidence_flag}</strong>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default InteractiveMaps;
