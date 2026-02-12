import React, { useState } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Plus, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Comparison: React.FC = () => {
    const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(['Bonapriso', 'Bastos']);

    // Mock data for comparison
    const neighborhoodData: any = {
        'Bonapriso': { city: 'Douala', price: 97632, growth: 12, listings: 16, volatility: 0.8, type: 'Prime' },
        'Bastos': { city: 'Yaoundé', price: 124229, growth: 4, listings: 12, volatility: 0.5, type: 'Prime' },
        'Makepe': { city: 'Douala', price: 52932, growth: 15, listings: 15, volatility: 1.2, type: 'Developing' },
        'Omnisport': { city: 'Yaoundé', price: 66500, growth: 8, listings: 28, volatility: 0.9, type: 'Mid-Market' },
    };

    const addNeighborhood = (name: string) => {
        if (selectedNeighborhoods.length < 3 && !selectedNeighborhoods.includes(name)) {
            setSelectedNeighborhoods([...selectedNeighborhoods, name]);
        }
    };

    const removeNeighborhood = (name: string) => {
        setSelectedNeighborhoods(selectedNeighborhoods.filter(n => n !== name));
    };

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Neighborhood Comparison</h1>
                    <p className="text-primary-600 dark:text-primary-400">Head-to-head analysis of up to 3 zones.</p>
                </div>

                {/* Selection Area */}
                <div className="mb-10 flex gap-4">
                    {['Makepe', 'Omnisport'].map(name => (
                        !selectedNeighborhoods.includes(name) && (
                            <button
                                key={name}
                                onClick={() => addNeighborhood(name)}
                                className="btn btn-outline btn-sm flex items-center"
                                disabled={selectedNeighborhoods.length >= 3}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add {name}
                            </button>
                        )
                    ))}
                </div>

                <div className="grid grid-cols-4 gap-0 border border-primary-200 dark:border-primary-800 rounded-xl overflow-hidden bg-white dark:bg-primary-900 shadow-sm">
                    {/* Labels Column */}
                    <div className="col-span-1 bg-primary-50 dark:bg-primary-950/50 p-6 space-y-8 border-r border-primary-200 dark:border-primary-800">
                        <div className="h-20 flex items-center font-bold text-primary-400 uppercase tracking-wider text-sm">Overview</div>
                        <div className="h-10 flex items-center font-medium text-primary-600 dark:text-primary-300">City</div>
                        <div className="h-10 flex items-center font-medium text-primary-600 dark:text-primary-300">Market Segment</div>
                        <div className="h-10 flex items-center font-medium text-primary-600 dark:text-primary-300">Median Land Price</div>
                        <div className="h-10 flex items-center font-medium text-primary-600 dark:text-primary-300">YoY Growth</div>
                        <div className="h-10 flex items-center font-medium text-primary-600 dark:text-primary-300">Availability</div>
                        <div className="h-10 flex items-center font-medium text-primary-600 dark:text-primary-300">Volatility Risk</div>
                    </div>

                    {/* Neighborhood Columns */}
                    {selectedNeighborhoods.map((name, idx) => {
                        const data = neighborhoodData[name];
                        return (
                            <div key={idx} className="col-span-1 p-6 space-y-8 border-r border-primary-200 dark:border-primary-800 last:border-r-0 relative group">
                                <button
                                    onClick={() => removeNeighborhood(name)}
                                    className="absolute top-2 right-2 p-1 text-primary-300 hover:text-semantic-error opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="h-20 flex flex-col justify-center">
                                    <h3 className="text-xl font-bold text-primary-900 dark:text-white">{name}</h3>
                                </div>
                                <div className="h-10 flex items-center text-primary-900 dark:text-white">{data.city}</div>
                                <div className="h-10 flex items-center text-primary-900 dark:text-white">{data.type}</div>
                                <div className="h-10 flex items-center font-bold text-accent-gold-dark dark:text-accent-gold font-mono">
                                    {formatCurrency(data.price)}/m²
                                </div>
                                <div className="h-10 flex items-center">
                                    <span className="px-2 py-1 rounded bg-semantic-success/10 text-semantic-success font-bold text-sm">+{data.growth}%</span>
                                </div>
                                <div className="h-10 flex items-center text-primary-900 dark:text-white">{data.listings} listings</div>
                                <div className="h-10 flex items-center">
                                    <div className="w-full h-2 bg-primary-100 dark:bg-primary-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${data.volatility > 1 ? 'bg-semantic-warning' : 'bg-semantic-success'}`}
                                            style={{ width: `${Math.min(data.volatility * 50, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty slots if less than 3 */}
                    {[...Array(3 - selectedNeighborhoods.length)].map((_, i) => (
                        <div key={`empty-${i}`} className="col-span-1 p-6 flex items-center justify-center bg-primary-50/50 dark:bg-primary-900/50 border-r border-primary-200 dark:border-primary-800 last:border-r-0">
                            <p className="text-primary-400 text-sm">Select to compare</p>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Comparison;
