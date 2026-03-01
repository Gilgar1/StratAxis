import React, { useState, useEffect } from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Search, TrendingUp, MapPin, Building } from 'lucide-react';
import { api } from '../services/api';

const Blog: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Dynamic blog posts data
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data: any = await api.get('/blogs?is_published=true');
        setBlogPosts(data || []);
      } catch (error) {
        console.error("Error fetching blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = ['All', 'Market Report', 'Investment', 'Market Analysis', 'Comparison'];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    // For now ignoring category match since our backend model doesn't have categories yet
    return matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Market Report':
        return <TrendingUp className="w-4 h-4" />;
      case 'Investment':
        return <Building className="w-4 h-4" />;
      case 'Comparison':
        return <MapPin className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  return (
    <PublicLayout>
      <div className="bg-primary-50 dark:bg-primary-950 min-h-screen py-20 px-4">
        <div className="container-custom max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 dark:text-white mb-4">
              Market Insights & Analysis
            </h1>
            <p className="text-xl text-primary-600 dark:text-primary-400">
              Data-driven intelligence to help you make smarter real estate decisions in Cameroon.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <div className="mb-12 space-y-6">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-gold"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${selectedCategory === category
                    ? 'bg-accent-gold text-primary-950 shadow-md'
                    : 'bg-white dark:bg-primary-900 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700 hover:border-accent-gold'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-20 text-xl font-bold animate-pulse">Loading Insights...</div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group flex flex-col bg-white dark:bg-primary-900 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-primary-100 dark:border-primary-800"
                >
                  {/* Featured Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-accent-gold to-primary-700 relative overflow-hidden">
                    {post.cover_image && <img src={post.cover_image} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-primary-900/20 group-hover:bg-primary-900/10 transition-colors" />
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-white/90 dark:bg-primary-950/90 px-3 py-1.5 rounded-full">
                      {getCategoryIcon("Market Report")}
                      <span className="text-xs font-bold text-primary-900 dark:text-white uppercase tracking-wide">
                        MARKET INSIGHT
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 text-xs text-primary-500 mb-3">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-3 group-hover:text-accent-gold transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-4 line-clamp-3">
                      {post.content.substring(0, 120)}...
                    </p>

                    {/* Author and Read More */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-primary-100 dark:border-primary-800">
                      <div className="flex items-center text-xs text-primary-500">
                        <User className="w-3.5 h-3.5 mr-1" />
                        Admin
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="flex items-center space-x-1 text-sm font-bold text-accent-gold hover:text-accent-gold-light transition-colors group/link"
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-primary-500 dark:text-primary-400">
                No articles found matching your criteria.
              </p>
            </div>
          )}

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-gradient-to-r from-primary-900 to-primary-800 dark:from-primary-800 dark:to-primary-900 rounded-2xl p-8 md:p-12 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Get Market Intelligence Delivered
            </h3>
            <p className="text-primary-200 mb-6 max-w-2xl mx-auto">
              Subscribe to receive monthly market reports, price alerts, and investment insights directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-primary-950 text-primary-900 dark:text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-gold"
              />
              <button className="px-6 py-3 bg-accent-gold text-primary-950 font-bold rounded-lg hover:bg-accent-gold-light transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Blog;
