import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { Calculator, DollarSign } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const Scenario: React.FC = () => {
    // Inputs
    const [landPrice, setLandPrice] = useState(50000000); // 50M
    const [constructionCost, setConstructionCost] = useState(150000000); // 150M
    const [monthlyRent, setMonthlyRent] = useState(1200000); // 1.2M
    const [occupancyRate, setOccupancyRate] = useState(90); // 90%
    const [expensesInfo] = useState(15); // 15%

    // Outputs
    const [grossYield, setGrossYield] = useState(0);
    const [netYield, setNetYield] = useState(0);
    const [roiYears, setRoiYears] = useState(0);

    useEffect(() => {
        // Calculate
        const totalInvestment = landPrice + constructionCost;
        const annualGrossIncome = monthlyRent * 12 * (occupancyRate / 100);
        const annualExpenses = annualGrossIncome * (expensesInfo / 100);
        const annualNetIncome = annualGrossIncome - annualExpenses;

        setGrossYield((annualGrossIncome / totalInvestment) * 100);
        setNetYield((annualNetIncome / totalInvestment) * 100);
        setRoiYears(totalInvestment / annualNetIncome);
    }, [landPrice, constructionCost, monthlyRent, occupancyRate, expensesInfo]);

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8 flex items-center space-x-3">
                    <div className="p-2 bg-primary-900 rounded-lg">
                        <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white">Yield Estimator</h1>
                        <p className="text-primary-600 dark:text-primary-400">Project your returns based on custom investment scenarios.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Inputs Panel */}
                    <div className="lg:col-span-2 bg-white dark:bg-primary-900 p-8 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                        <h3 className="font-bold text-xl mb-6 text-primary-900 dark:text-white">Investment Parameters</h3>

                        <div className="space-y-8">
                            <div>
                                <label className="flex justify-between mb-2">
                                    <span className="font-medium text-primary-700 dark:text-primary-300">Land Acquisition Cost</span>
                                    <span className="font-bold text-accent-gold">{formatCurrency(landPrice)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="10000000"
                                    max="500000000"
                                    step="1000000"
                                    value={landPrice}
                                    onChange={(e) => setLandPrice(Number(e.target.value))}
                                    className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between mb-2">
                                    <span className="font-medium text-primary-700 dark:text-primary-300">Construction/Dev Cost</span>
                                    <span className="font-bold text-accent-gold">{formatCurrency(constructionCost)}</span>
                                </label>
                                <input
                                    type="range"
                                    min="50000000"
                                    max="1000000000"
                                    step="5000000"
                                    value={constructionCost}
                                    onChange={(e) => setConstructionCost(Number(e.target.value))}
                                    className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-accent-gold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block font-medium text-primary-700 dark:text-primary-300 mb-2">Proj. Monthly Rent</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400">FCFA</div>
                                        <input
                                            type="number"
                                            value={monthlyRent}
                                            onChange={(e) => setMonthlyRent(Number(e.target.value))}
                                            className="input pl-14"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-medium text-primary-700 dark:text-primary-300 mb-2">Occupancy Rate (%)</label>
                                    <input
                                        type="number"
                                        value={occupancyRate}
                                        onChange={(e) => setOccupancyRate(Number(e.target.value))}
                                        className="input"
                                        max="100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="bg-primary-950 text-white p-8 rounded-xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                        <div>
                            <h3 className="text-xl font-bold mb-8 flex items-center">
                                <DollarSign className="w-5 h-5 text-accent-gold mr-2" />
                                Projected Returns
                            </h3>

                            <div className="space-y-6">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="text-sm text-primary-400 mb-1">Total Investment</div>
                                    <div className="text-2xl font-bold">{formatCurrency(landPrice + constructionCost)}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="text-sm text-primary-400 mb-1">Gross Yield</div>
                                        <div className="text-2xl font-bold text-accent-gold">{formatPercentage(grossYield)}</div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="text-sm text-primary-400 mb-1">Net Yield</div>
                                        <div className="text-2xl font-bold text-semantic-success">{formatPercentage(netYield)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <div className="flex justify-between items-end">
                                <span className="text-primary-400">Break-even Horizon</span>
                                <span className="text-3xl font-bold">{roiYears.toFixed(1)} <span className="text-base font-normal text-primary-400">years</span></span>
                            </div>
                            <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                                {/* Visual progress bar for ROI speed */}
                                <div className="bg-accent-gold h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, (15 / roiYears) * 100))}% ` }}></div>
                            </div>
                            <p className="text-xs text-primary-500 mt-2 text-right">Target &lt; 12 years</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Scenario;
