import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Link, Route, Routes, useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import GitHubProject from './components/GitHubProject';
import GameBlog, { BlogPost } from './components/GameBlog';
import SiteHeader from './components/SiteHeader';
import { fetchBlogPostsByGame } from './services/blogPosts';
import { fetchGames } from './services/games';
import { fetchAboutUs } from './services/aboutUs';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [games, setGames] = useState([]);
  const [gamesStatus, setGamesStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setGamesStatus('loading');
    fetchGames()
      .then((nextGames) => {
        if (isMounted) {
          setGames(nextGames);
          setGamesStatus('ready');
        }
      })
      .catch((error) => {
        console.error('Failed to load games', error);
        if (isMounted) {
          setGames([]);
          setGamesStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="App">
      <ScrollToTop />
      <SiteHeader games={games} gamesStatus={gamesStatus} />

      <main>
        <Routes>
          <Route path="/" element={<HomePage games={games} gamesStatus={gamesStatus} />} />
          <Route path="/updates" element={<UpdatesPage games={games} gamesStatus={gamesStatus} />} />
          <Route path="/games" element={<GamesPage games={games} gamesStatus={gamesStatus} />} />
          <Route path="/games/:slug" element={<GamePage games={games} gamesStatus={gamesStatus} />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage({ games, gamesStatus }) {
  return (
    <div className="home-stack">
      <section className="games-section" id="games">
        <GamesGrid games={games} gamesStatus={gamesStatus} />
      </section>

      <section className="home-footer-prompt">
        <p>Want to learn about the team?</p>
        <Link className="text-link" to="/about">
          About us
        </Link>
      </section>
    </div>
  );
}

function GamesPage({ games, gamesStatus }) {
  return (
    <section className="section page-shell">
      <h1>Current projects.</h1>
      <p className="page-lead">
        Each game has its own page so the homepage stays clean while the projects get
        room to grow.
      </p>
      <GamesGrid games={games} gamesStatus={gamesStatus} />
    </section>
  );
}

function UpdatesPage({ games, gamesStatus }) {
  const [blogPostsByGame, setBlogPostsByGame] = useState({});
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    if (gamesStatus !== 'ready') {
      return undefined;
    }

    setStatus('loading');
    fetchBlogPostsByGame(games.map((game) => game.slug))
      .then((nextBlogPostsByGame) => {
        if (isMounted) {
          setBlogPostsByGame(nextBlogPostsByGame);
          setStatus('ready');
        }
      })
      .catch((error) => {
        console.error('Failed to load blog posts', error);
        if (isMounted) {
          setBlogPostsByGame({});
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [games, gamesStatus]);

  const posts = games
    .flatMap((game) => (blogPostsByGame[game.slug] || []).map((post) => ({ post, game })))
    .sort((first, second) => (second.post.date || '').localeCompare(first.post.date || ''));

  return (
    <section className="section updates-page">
      <div className="updates-hero">
        <p className="eyebrow">Development blog</p>
        <p className="page-lead">
          All project posts in one place, sorted by newest update first.
        </p>
        <hr className="updates-divider" />
      </div>

      <section className="game-blog updates-blog" aria-label="All development updates">
        {status === 'loading' ? (
          <p className="game-blog-empty">Fetching content from blog git repo...</p>
        ) : status === 'error' ? (
          <p className="game-blog-empty">Could not load updates.</p>
        ) : posts.length === 0 ? (
          <p className="game-blog-empty">No updates found.</p>
        ) : (
          <div className="blog-posts">
            {posts.map(({ post, game }, index) => (
              <div key={`${game.slug}-${post.slug}`}>
                {index > 0 && <hr className="blog-post-separator" />}
                <BlogPost post={post} game={game} />
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function GamesGrid({ games, gamesStatus }) {
  if (gamesStatus === 'loading') {
    return <p className="games-list-status">Fetching games from blog git repo...</p>;
  }

  if (gamesStatus === 'error') {
    return <p className="games-list-status">Could not load games.</p>;
  }

  if (games.length === 0) {
    return <p className="games-list-status">No games found.</p>;
  }

  return (
    <ul className="games-list" aria-label="Games list">
      {games.map((game) => (
        <GameCard key={game.slug} game={game} />
      ))}
    </ul>
  );
}

function GameCard({ game }) {
  const cardRef = useRef(null);
  const [imageMotion, setImageMotion] = useState({ offset: 0, scale: game.imageScale });
  const hasPreviewImages = game.imageWideSrc && game.imagePortraitSrc;

  useEffect(() => {
    const updateOffset = () => {
      if (!cardRef.current) {
        return;
      }

      const rect = cardRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 0;
      const distanceFromCenter = rect.top + rect.height / 2 - viewportHeight / 2;
      const normalizedDistance = Math.min(1, Math.abs(distanceFromCenter) / Math.max(viewportHeight * 0.75, 1));
      const nextOffset = Math.max(-80, Math.min(80, distanceFromCenter * -0.08));
      const nextScale = game.imageScale + normalizedDistance * 0.04;

      setImageMotion({ offset: nextOffset, scale: nextScale });
    };

    updateOffset();
    window.addEventListener('scroll', updateOffset, { passive: true });
    window.addEventListener('resize', updateOffset);

    return () => {
      window.removeEventListener('scroll', updateOffset);
      window.removeEventListener('resize', updateOffset);
    };
  }, [game.imageScale]);

  return (
    <li ref={cardRef} className="game-card">
      <div className="game-image-frame">
        <Link className="game-panel" to={`/games/${game.slug}`}>
          {hasPreviewImages ? (
            <picture>
              <source media="(orientation: portrait)" srcSet={game.imagePortraitSrc} />
              <img
                className="game-image"
                src={game.imageWideSrc}
                alt=""
                style={{
                  '--parallax-offset': `${imageMotion.offset}px`,
                  '--image-scale': imageMotion.scale,
                }}
              />
            </picture>
          ) : (
            <p className="game-image-missing">Failed to fetch game preview image.</p>
          )}
          <div className="game-image-overlay" />
        </Link>
      </div>
      <div className="game-card-copy">
        <Link to={`/games/${game.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          <h3>{game.name}</h3>
          <p>{game.teaser || 'Failed to fetch game description.'}</p>
        </Link>
      </div>
      <div className="game-card-actions">
        <Link className="game-link" to={`/games/${game.slug}`}>
          View game page
        </Link>
        {game.githubRepo && (
          <a
            className="game-github-link"
            href={game.githubUrl || `https://github.com/${game.githubRepo}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`${game.name} GitHub repository`}
          >
            <img
              className="game-github-logo"
              src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
              alt=""
            />
            GitHub
          </a>
        )}
      </div>
    </li>
  );
}

function GameDetailContainer({ game }) {
  const hasPreviewImages = game.imageWideSrc && game.imagePortraitSrc;

  return (
    <div className="game-detail-hero">
      {hasPreviewImages ? (
        <picture className="game-detail-hero-media">
          <source media="(orientation: portrait)" srcSet={game.imagePortraitSrc} />
          <img className="game-detail-hero-image" src={game.imageWideSrc} alt="" />
        </picture>
      ) : (
        <div className="game-detail-hero-media game-detail-hero-missing">
          <p>Failed to fetch game preview image.</p>
        </div>
      )}
      <div className="game-detail-hero-overlay" />
      <div className="game-detail-hero-copy">
        <div className="game-detail-copy-panel">
          <h1>{game.name}</h1>
          <p className="page-lead">{game.mainDescription || 'Failed to fetch game description.'}</p>
          {game.secondaryDescription && <p>{game.secondaryDescription}</p>}
        </div>
      </div>
    </div>
  );
}

function GamePage({ games, gamesStatus }) {
  const { slug } = useParams();

  if (gamesStatus === 'loading') {
    return (
      <section className="section page-shell">
        <h1>Loading game.</h1>
        <p>Fetching the game folder from the blog git repo...</p>
      </section>
    );
  }

  if (gamesStatus === 'error') {
    return (
      <section className="section page-shell">
        <h1>Could not load games.</h1>
        <p>The game folder list is unavailable right now.</p>
        <Link className="text-link" to="/">
          Back to homepage
        </Link>
      </section>
    );
  }

  const game = games.find((entry) => entry.slug === slug);

  if (!game) {
    return (
      <section className="section page-shell">
        <h1>Game not found.</h1>
        <p>This page does not exist yet.</p>
        <Link className="text-link" to="/">
          Back to homepage
        </Link>
      </section>
    );
  }

  return (
    <section className="section game-detail-page">
      <GameDetailContainer game={game} />
      <GameBlog game={game} />
      <GitHubProject game={game} />
      <Link className="text-link" to="/">
        Back to homepage
      </Link>
    </section>
  );
}

function AboutPage() {
  const [aboutUs, setAboutUs] = useState({ page: null, members: [] });
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    setErrorMessage('');
    fetchAboutUs()
      .then((nextAboutUs) => {
        if (isMounted) {
          setAboutUs(nextAboutUs);
          setErrorMessage('');
          setStatus('ready');
        }
      })
      .catch((error) => {
        console.error('Failed to load about-us content', error);
        if (isMounted) {
          setAboutUs({ page: null, members: [] });
          setErrorMessage(formatAboutUsError(error));
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const page = aboutUs.page || {};
  const aboutMarkdown = status === 'loading'
    ? 'Fetching about-us content from blog git repo...'
    : status === 'error'
      ? errorMessage
      : page.body || 'Failed to fetch about-us page text.';

  return (
    <section className="section about-page">
      <div className="about-hero">
        <h1>{status === 'ready' ? page.title : 'About Us.'}</h1>
        <div className="about-markdown page-lead">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {aboutMarkdown}
          </ReactMarkdown>
        </div>
      </div>

      <figure className="about-roadmap">
        <img src="/roadmapImage.png" alt="Wigum Gaming roadmap" />
      </figure>

      <section className="about-roadmap-summary" aria-labelledby="roadmap-title">
        <div className="about-roadmap-intro">
          <h2 id="roadmap-title">Wigum Gaming Roadmap</h2>
          <p>
            A simple company-level direction for the projects. The current focus is
            Mob Gladiator, while the next games reuse the systems and lessons learned.
          </p>
        </div>

        <div className="about-roadmap-steps">
          <article className="about-roadmap-step">
            <span className="about-roadmap-number">01</span>
            <div>
              <h3>Mob Gladiator</h3>
              <p>
                Active main focus. Build one small complete loop for managing fighters,
                entering arena contracts, earning rewards, and returning to town.
              </p>
            </div>
          </article>

          <article className="about-roadmap-step">
            <span className="about-roadmap-number">02</span>
            <div>
              <h3>Multiplayer Arena</h3>
              <p>
                Early foundation exists. A fast 2D PvP arena shooter that should benefit
                from stronger scene organization, UI, input, and planning patterns.
              </p>
            </div>
          </article>

          <article className="about-roadmap-step">
            <span className="about-roadmap-number">03</span>
            <div>
              <h3>Roguelite Project</h3>
              <p>
                Early foundation exists. Planned around runs, upgrades, bosses, rewards,
                and progression, with reusable save data and UI-heavy flow lessons.
              </p>
            </div>
          </article>

          <article className="about-roadmap-step">
            <span className="about-roadmap-number">04</span>
            <div>
              <h3>Choose The Next Path</h3>
              <p>
                Decide after the prototypes are clearer: polish one game, test a smaller
                system, explore 3D, improve tooling, or rework the public presence.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="about-workflow-section" aria-labelledby="workflow-title">
        <h2 id="workflow-title" className="about-section-title">Workflow</h2>
        <div className="about-feature-grid" aria-label="Workflow">
          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://godotengine.org/assets/press/icon_color.svg"
                  alt="Godot logo"
                />
                <h2>Godot Engine</h2>
              </div>
              <p>
                Focused on cross-platform 2D and 3D game development using C#.
                Godot is now our main engine, chosen for its open-source flexibility,
                lightweight performance, modular workflow, and strong Linux support.
              </p>
              <a className="about-feature-link" href="https://godotengine.org/" target="_blank" rel="noreferrer">
                Visit Godot
              </a>
            </div>
          </article>

          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  alt="GitHub logo"
                />
                <h2>GitHub</h2>
              </div>
              <p>
                All development is version-controlled and publicly documented through
                GitHub. You can follow updates, source code, and progress logs across
                multiple projects, from experimental systems to playable demos.
              </p>
              <a className="about-feature-link" href="https://github.com/OL3s" target="_blank" rel="noreferrer">
                Visit GitHub
              </a>
            </div>
          </article>
        </div>
      </section>

      {status === 'ready' && page.releaseNote && <p className="about-release-note">{page.releaseNote}</p>}

      <h2 className="about-section-title">Team</h2>
      {status === 'loading' ? (
        <p className="about-members-status">Fetching team members from blog git repo...</p>
      ) : status === 'error' ? (
        <p className="about-members-status">{errorMessage}</p>
      ) : aboutUs.members.length === 0 ? (
        <p className="about-members-status">Failed to fetch team members.</p>
      ) : (
        <div className="about-members-list">
          {aboutUs.members.map((member) => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </div>
      )}

      <Link className="text-link" to="/">
        Back to homepage
      </Link>
    </section>
  );
}

function formatAboutUsError(error) {
  const status = error?.status;
  const statusText = error?.statusText ? ` ${error.statusText}` : '';

  if (status === 403 || status === 429) {
    return `GitHub refused the about-us content request${status ? ` (${status}${statusText})` : ''}. This is usually a rate limit or temporary access issue.`;
  }

  if (status === 404) {
    return 'About-us content was not found in the GitHub blog storage repository.';
  }

  if (status >= 500) {
    return `GitHub or the content fetch service is temporarily unavailable${status ? ` (${status}${statusText})` : ''}.`;
  }

  if (error instanceof TypeError) {
    return 'Could not reach GitHub right now. The network or content fetch service may be down.';
  }

  return status
    ? `Failed to fetch about-us content from GitHub (${status}${statusText}).`
    : 'Failed to fetch about-us content from GitHub.';
}

function TeamMemberCard({ member }) {
  return (
    <article className="about-founder-card">
      {member.imageSrc ? (
        <img className="about-founder-image" src={member.imageSrc} alt={member.name} />
      ) : (
        <div className="about-founder-image about-founder-image-missing">Failed to fetch member image.</div>
      )}
      <div>
        {member.role && <p className="eyebrow">{member.role}</p>}
        <h2>{member.name || 'Failed to fetch member name.'}</h2>
        <div className="about-member-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {member.body || 'Failed to fetch member text.'}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}

export default App;
