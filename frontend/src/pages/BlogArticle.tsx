import React from 'react';
import PublicLayout from '../layouts/PublicLayout';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// Minimal markdown renderer (supports **bold**, ## headings, bullet lists, blockquotes)
const renderContent = (content: string): React.ReactNode[] => {
  return content.split('\n').map((line, i) => {
    const key = i;
    // ## Heading
    if (line.startsWith('## ')) {
      return <h2 key={key} className="text-2xl font-bold text-primary-900 dark:text-white mt-8 mb-3">{line.slice(3)}</h2>;
    }
    // ### Heading
    if (line.startsWith('### ')) {
      return <h3 key={key} className="text-xl font-bold text-primary-900 dark:text-white mt-6 mb-2">{line.slice(4)}</h3>;
    }
    // Blockquote
    if (line.startsWith('> ')) {
      return (
        <blockquote key={key} className="border-l-4 border-accent-gold pl-4 py-1 my-4 bg-accent-gold/5 rounded-r-lg">
          <p className="text-primary-600 dark:text-primary-300 italic">{line.slice(2)}</p>
        </blockquote>
      );
    }
    // Bullet list
    if (line.startsWith('- ')) {
      const text = line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return <li key={key} className="ml-6 text-primary-700 dark:text-primary-300 mb-1 list-disc"
        dangerouslySetInnerHTML={{ __html: text }} />;
    }
    // Empty line → spacer
    if (line.trim() === '') {
      return <div key={key} className="h-3" />;
    }
    // Normal paragraph with **bold** support
    const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <p key={key} className="text-primary-700 dark:text-primary-300 leading-relaxed mb-3"
      dangerouslySetInnerHTML={{ __html: html }} />;
  });
};

const BlogArticle: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getBlogBySlug } = useApp();

  const post = slug ? getBlogBySlug(slug) : undefined;

  // Fallback for old hardcoded articles
  if (!post) {
    return (
      <PublicLayout>
        <article className="bg-white dark:bg-primary-950 pb-20">
          <div className="bg-primary-50 dark:bg-primary-900 py-16 md:py-24">
            <div className="container-custom max-w-4xl mx-auto">
              <Link to="/blog" className="inline-flex items-center text-sm font-bold text-accent-gold mb-8 hover:underline">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
              </Link>
              <h1 className="text-3xl md:text-5xl font-bold text-primary-900 dark:text-white leading-tight mb-6">
                Article Not Found
              </h1>
              <p className="text-xl text-primary-500">This article may have been removed or the link is incorrect.</p>
            </div>
          </div>
        </article>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="bg-white dark:bg-primary-950 pb-20">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary-900 to-primary-800 py-16 md:py-24">
          <div className="container-custom max-w-4xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-sm font-bold text-accent-gold mb-8 hover:underline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Insights
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm text-primary-300 mb-6">
              <span className="bg-accent-gold/20 text-accent-gold px-3 py-1 rounded-full font-bold uppercase text-xs tracking-wider">
                {post.category}
              </span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{post.date}</span>
              <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">{post.title}</h1>
            <p className="text-xl text-primary-200 leading-relaxed">{post.excerpt}</p>
          </div>
        </div>

        {/* Body */}
        <div className="container-custom max-w-3xl mx-auto mt-12 px-4">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {renderContent(post.content)}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-primary-200 dark:border-primary-800 flex justify-between items-center">
            <div className="text-sm text-primary-500">
              Category: <span className="font-medium text-primary-900 dark:text-white">{post.category}</span>
            </div>
            <button
              onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
              className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-accent-gold transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          <div className="mt-8">
            <Link to="/blog" className="inline-flex items-center gap-2 text-accent-gold font-bold hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to all articles
            </Link>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
};

export default BlogArticle;
