import React, { useEffect, useState } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Calendar, FileText, ArrowRight } from 'lucide-react';

const BlogList: React.FC = () => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data: any = await api.get('/blogs?is_published=true');
                setBlogs(data || []);
            } catch (error) {
                console.error("Error fetching blogs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    return (
        <PublicLayout>
            <div className="bg-primary-50 dark:bg-primary-950 py-16 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-6">
                            Market Insights & Strategy
                        </h1>
                        <p className="text-xl text-primary-600 dark:text-primary-300 max-w-3xl mx-auto">
                            Read the latest intelligence, strategies, and real estate market updates for Yaoundé and Douala.
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 animate-pulse text-xl font-bold">Loading Insights...</div>
                    ) : (
                        blogs.length === 0 ? (
                            <div className="text-center py-20 text-primary-500">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-2xl font-bold mb-2">No Articles Found</h3>
                                <p>Check back later for new market intelligence updates.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {blogs.map(blog => (
                                    <div key={blog.id} className="bg-white dark:bg-primary-900 rounded-2xl border border-primary-200 dark:border-primary-800 shadow-lg overflow-hidden flex flex-col hover:border-accent-gold transition-colors">
                                        {blog.cover_image && (
                                            <div className="h-48 w-full bg-primary-100 dark:bg-primary-800 overflow-hidden">
                                                <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center text-xs text-primary-500 mb-3">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                                            </div>
                                            <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-3 hover:text-accent-gold transition-colors line-clamp-2">
                                                <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                                            </h2>
                                            <p className="text-primary-600 dark:text-primary-300 mb-6 line-clamp-3">
                                                {blog.content.substring(0, 150)}...
                                            </p>
                                            <div className="mt-auto">
                                                <Link to={`/blog/${blog.slug}`} className="text-accent-gold font-bold flex items-center group">
                                                    Read Article <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </PublicLayout>
    );
};

export default BlogList;
