import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import blogPostsByGame from '../generated/blogPosts';

export function BlogPost({ post, game }) {
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
        <span className="blog-post-toggle-action">{isExpanded ? 'Collapse' : 'Read post'}</span>
      </button>
      {isExpanded && (
        <div id={postContentId} className="blog-post-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}

function GameBlog({ game }) {
  const posts = blogPostsByGame[game.slug] || [];

  return (
    <section className="game-blog" aria-label="Development blog">
      <div className="game-blog-header">
        <div className="game-blog-heading">
          <p className="eyebrow">Development blog</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="game-blog-empty">Blog: No blog found</p>
      ) : (
        <div className="blog-posts">
          {posts.map((post, index) => (
            <div key={post.slug}>
              {index > 0 && <hr className="blog-post-separator" />}
              <BlogPost post={post} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default GameBlog;
