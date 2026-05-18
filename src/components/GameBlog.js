import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { fetchGameBlogPosts } from '../services/blogPosts';

export function BlogPost({ post, game, t }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const postContentId = `${post.slug}-content`;

  return (
    <article className="blog-post">
      {game && (
        <Link className="blog-post-game-link" to={`/games/${game.slug}`}>
          {game.name}
        </Link>
      )}
      <button
        className="blog-post-toggle"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={postContentId}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span className="blog-post-header">
          {post.date && <time dateTime={post.date}>{post.date}</time>}
          <span className="blog-post-title">{post.title}</span>
          {post.excerpt && <span className="blog-post-excerpt">{post.excerpt}</span>}
        </span>
        <span className="blog-post-toggle-action">{isExpanded ? t('collapse') : t('readPost')}</span>
      </button>
      {isExpanded && (
        <div id={postContentId} className="blog-post-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}

function GameBlog({ game, t }) {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    fetchGameBlogPosts(game.slug)
      .then((nextPosts) => {
        if (isMounted) {
          setPosts(nextPosts);
          setStatus('ready');
        }
      })
      .catch((error) => {
        console.error('Failed to load blog posts', error);
        if (isMounted) {
          setPosts([]);
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [game.slug]);

  return (
    <section className="game-blog" aria-label={t('developmentBlog')}>
      <div className="game-blog-header">
        <div className="game-blog-heading">
          <p className="eyebrow">{t('developmentBlog')}</p>
        </div>
      </div>

      {status === 'loading' ? (
        <p className="game-blog-empty">{t('fetchingBlogContent')}</p>
      ) : status === 'error' ? (
        <p className="game-blog-empty">{t('blogCouldNotLoadPosts')}</p>
      ) : posts.length === 0 ? (
        <p className="game-blog-empty">{t('blogNoBlogFound')}</p>
      ) : (
        <div className="blog-posts">
          {posts.map((post, index) => (
            <div key={post.slug}>
              {index > 0 && <hr className="blog-post-separator" />}
              <BlogPost post={post} t={t} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default GameBlog;
