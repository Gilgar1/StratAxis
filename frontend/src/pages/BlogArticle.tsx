import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { Calendar, ArrowLeft } from 'lucide-react';

const BlogArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data: any = await api.get(`/blogs/${slug}`);
        setBlog(data);
      } catch (err: any) {
        setError('Article not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-primary-50 dark:bg-primary-950">
          <div className="animate-pulse text-2xl font-bold text-primary-900 dark:text-white">Loading Intelligence...</div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !blog) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-primary-50 dark:bg-primary-950 px-4 text-center">
          <h1 className="text-3xl font-bold text-semantic-error mb-4">Error</h1>
          <p className="text-primary-600 dark:text-primary-400 mb-8">{error}</p>
          <Link to="/blog" className="btn btn-primary">
            Back to Articles
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="bg-primary-50 dark:bg-primary-950 min-h-screen py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center text-accent-gold font-bold mb-8 hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Market Insights
          </Link>

          <div className="bg-white dark:bg-primary-900 rounded-3xl overflow-hidden shadow-xl border border-primary-200 dark:border-primary-800">
            {blog.cover_image && (
              <div className="w-full h-64 md:h-96">
                <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-8 md:p-12">
              <h1 className="text-3xl md:text-5xl font-extrabold text-primary-900 dark:text-white mb-6 leading-tight">
                {blog.title}
              </h1>
              <div className="flex items-center text-sm font-semibold text-primary-500 mb-10 pb-6 border-b border-primary-100 dark:border-primary-800">
                <Calendar className="w-5 h-5 mr-2" />
                {new Date(blog.published_at || blog.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              <div className="prose prose-lg dark:prose-invert prose-primary max-w-none text-primary-800 dark:text-primary-200">
                <ReactMarkdown>
                  {blog.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
};

export default BlogArticle;
