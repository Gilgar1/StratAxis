import React from 'react';
import AuthenticatedLayout from '../layouts/AuthenticatedLayout';
import { ClipboardList, CheckCircle2, Clock, FileCheck } from 'lucide-react';

const ProjectProcess: React.FC = () => {
    const processSteps = [
        {
            phase: 'Phase 1: Discovery & Planning',
            duration: '2-4 weeks',
            steps: [
                'Initial market research using StratAxis data',
                'Define investment goals and budget',
                'Identify target neighborhoods',
                'Preliminary financial modeling'
            ]
        },
        {
            phase: 'Phase 2: Property Selection',
            duration: '4-8 weeks',
            steps: [
                'Review available properties',
                'Site visits and inspections',
                'Comparative market analysis',
                'Due diligence and verification'
            ]
        },
        {
            phase: 'Phase 3: Financing',
            duration: '4-6 weeks',
            steps: [
                'Secure pre-approval',
                'Finalize financing terms',
                'Prepare required documentation',
                'Complete loan application process'
            ]
        },
        {
            phase: 'Phase 4: Legal & Acquisition',
            duration: '6-10 weeks',
            steps: [
                'Legal review and title search',
                'Negotiate purchase agreement',
                'Complete legal documentation',
                'Property transfer and registration'
            ]
        },
        {
            phase: 'Phase 5: Development/Management',
            duration: 'Ongoing',
            steps: [
                'Property improvements (if needed)',
                'Marketing and tenant acquisition',
                'Property management setup',
                'Regular performance monitoring'
            ]
        }
    ];

    return (
        <AuthenticatedLayout>
            <div className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2 flex items-center">
                        <ClipboardList className="w-8 h-8 mr-3 text-accent-gold" />
                        Project Process
                    </h1>
                    <p className="text-primary-600 dark:text-primary-300">
                        Comprehensive guide to the real estate investment process
                    </p>
                </div>

                <div className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm mb-8">
                    <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-4">Typical Timeline: 16-28 Weeks</h2>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        The complete process from initial research to property ownership typically takes 4-7 months,
                        depending on financing complexity, legal requirements, and market conditions.
                    </p>
                </div>

                <div className="space-y-6 mb-8">
                    {processSteps.map((item, index) => (
                        <div key={index} className="bg-white dark:bg-primary-900 p-6 rounded-xl border border-primary-200 dark:border-primary-800 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold mr-3">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-primary-900 dark:text-white">{item.phase}</h3>
                                        <div className="flex items-center text-sm text-primary-500 dark:text-primary-400 mt-1">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {item.duration}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <ul className="space-y-2 ml-13">
                                {item.steps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex items-start">
                                        <CheckCircle2 className="w-5 h-5 text-semantic-success mr-2 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-primary-700 dark:text-primary-200">{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="bg-accent-gold/10 border border-accent-gold/30 p-6 rounded-xl mb-6">
                    <div className="flex items-start">
                        <FileCheck className="w-6 h-6 text-accent-gold mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-primary-900 dark:text-white mb-2">Pro Tip: Use StratAxis Data</h3>
                            <p className="text-sm text-primary-700 dark:text-primary-200">
                                Leverage our comprehensive property intelligence throughout your investment journey.
                                Premium members get access to detailed neighborhood analytics, rental yield calculators,
                                and comparative market analysis tools to make informed decisions at every stage.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                    <h3 className="font-semibold text-primary-900 dark:text-white mb-2">Need Guidance?</h3>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                        Our expert team can help you navigate each phase of the project process, from initial
                        planning through to successful completion. Book a consultation to discuss your specific needs.
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ProjectProcess;
