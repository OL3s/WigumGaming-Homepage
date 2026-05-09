import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import blogPostsByGame from '../generated/blogPosts';

function BlogPost({ post }) {
  return (
    <article className="blog-post">
      <div className="blog-post-header">
        {post.date && <time dateTime={post.date}>{post.date}</time>}
        <h3>{post.title}</h3>
        {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}
      </div>
      <div className="blog-post-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>
    </article>
  );
}

function GameBlog({ game }) {
  const posts = blogPostsByGame[game.slug] || [];

  return (
    <section className="game-blog" aria-labelledby={`${game.slug}-blog-title`}>
      <div className="game-blog-heading">
        <p className="eyebrow">Development log</p>
        <h2 id={`${game.slug}-blog-title`}>Blog</h2>
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
