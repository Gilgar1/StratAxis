import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { TrendingUp, MapPin } from 'lucide-react';
import ExportBar from '../components/common/ExportBar';
import WatchlistButton from '../components/common/WatchlistButton';

const APPRECIATION_DATA = [
    { city: 'Douala', neighborhood: 'Douala (City Avg)', annual: 12.3, fiveYearAvg: 9.8, y2024: 11.2, y2023: 9.5, y2022: 8.7, y2021: 7.9 },
    { city: 'Yaoundé', neighborhood: 'Yaoundé (City Avg)', annual: 8.1, fiveYearAvg: 7.5, y2024: 7.9, y2023: 7.2, y2022: 6.8, y2021: 6.4 },
];

const AnnualAppreciation: React.FC = () => {
    const csvRows = APPRECIATION_DATA.map(r => ({
        City: r.city,
        'Annual Appreciation (%)': r.annual,
        '5-Year Average (%)': r.fiveYearAvg,
        '2024 (%)': r.y2024,
        '2023 (%)': r.y2023,
        '2022 (%)': r.y2022,
        '2021 (%)': r.y2021,
    }));

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                            <TrendingUp className="w-8 h-8 mr-3 text-accent-gold" />
                            Annual Appreciation
                        </h1>
                        <p className="text-primary-600 dark:text-primary-300">
                            City-level annual property appreciation rates
                        </p>
                    </div>
                    <ExportBar
                        csvRows={csvRows}
                        csvFilename={`StratAxis_Annual_Appreciation_${new Date().toISOString().slice(0, 10)}`}
                        pdfTitle="StratAxis – Annual Appreciation Report"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {APPRECIATION_DATA.map(row => (
                        <div key={row.city} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <MapPin className="w-6 h-6 text-accent-gold mr-2" />
                                    <h2 className="text-xl font-bold text-primary-900 dark:text-white">{row.city}</h2>
                                </div>
                                <WatchlistButton
                                    compact
                                    neighborhood={row.city}
                                    city={row.city}
                                    type="City Appreciation"
                                    currentPrice={0}
                                    change={`+${row.annual}%`}
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-primary-500 dark:text-primary-400">Annual Appreciation Rate</p>
                                    <p className="text-4xl font-bold text-semantic-success">+{row.annual}%</p>
                                </div>
                                <div>
                                    <p className="text-sm text-primary-500 dark:text-primary-400">5-Year Average</p>
                                    <p className="text-xl font-semibold text-primary-700 dark:text-primary-200">+{row.fiveYearAvg}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-6">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-4">Historical Trends (Douala)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {([2024, 2023, 2022, 2021] as const).map((year) => {
                            const key = `y${year}` as keyof typeof APPRECIATION_DATA[0];
                            return (
                                <div key={year} className="text-center p-3 bg-primary-50 dark:bg-primary-800 rounded-lg">
                                    <p className="text-xs text-primary-500 dark:text-primary-400">{year}</p>
                                    <p className="text-lg font-bold text-semantic-success">+{APPRECIATION_DATA[0][key]}%</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">About Appreciation Rates</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Annual appreciation represents the year-over-year percentage increase in property values.
                        These city-level rates provide a general overview. Upgrade to Premium for neighborhood-specific
                        appreciation data and predictive analytics.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AnnualAppreciation;
