import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Link, NavLink, Route, Routes, useParams, useLocation } from 'react-router-dom';
import GitHubProject from './components/GitHubProject';
import GameBlog, { BlogPost } from './components/GameBlog';
import { fetchBlogPostsByGame } from './services/blogPosts';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const games = [
  {
    slug: 'singleplayer-roguelite',
    name: 'SingleplayerRoguelite',
    mainDescription: 'A run-based roguelite about choosing your path, growing stronger, and hunting three lost gems.',
    teaser: 'Choose a path, survive the run, defeat bosses, and collect the three lost gems.',
    secondaryDescription:
      'Each run is a new attempt to push deeper, make better choices, and prepare for the next boss. Between fights, the player builds momentum through upgrades, items, and outpost stops before taking another step toward collecting all three gems.',
    imageWideSrc: '/singleplayer-roguelite-wide-placeholder.svg',
    imagePortraitSrc: '/singleplayer-roguelite-portrait-placeholder.svg',
    imageScale: 1.04,
    githubRepo: 'OL3s/SinglePlayerRogueliteV2',
    githubUrl: 'https://github.com/OL3s/SinglePlayerRogueliteV2.git',
  },
  {
    slug: 'multiplayer-arena',
    name: 'MultiplayerArena',
    mainDescription: 'A fast 2D arena fighter where movement, aim, and destructible maps shape every round.',
    teaser: 'Fast 2D PvP arena fights where bullets, movement, and destruction decide the round.',
    secondaryDescription:
      'MultiplayerArena is built around short, tense PvP matches where players fight for position while the arena breaks apart around them. The goal is quick rounds with clear skill expression: dodge, aim, use the map, and turn destruction into an advantage.',
    imageWideSrc: '/multiplayer-arena-wide-placeholder.svg',
    imagePortraitSrc: '/multiplayer-arena-portrait-placeholder.svg',
    imageScale: 1.04,
    githubRepo: 'OL3s/MultiplayerArenaV2',
    githubUrl: 'https://github.com/OL3s/MultiplayerArenaV2.git',
  },
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="App">
      <ScrollToTop />
      <header className="site-header">
        <div className="site-header-brand-container">
          <Link className="brand" to="/" onClick={() => setIsMenuOpen(false)}>
            Wigum Gaming
          </Link>
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>

        <div className={`site-header-menu ${isMenuOpen ? 'is-open' : ''}`}>
          <div className="site-nav-group site-nav-group-primary">
            <nav className="site-nav" aria-label="Site pages">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
              <NavLink to="/updates" onClick={() => setIsMenuOpen(false)}>Updates</NavLink>
              <NavLink to="/about" onClick={() => setIsMenuOpen(false)}>About Us</NavLink>
            </nav>
          </div>

          <div className="games-nav-container">
            <div className="games-nav-label" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                <path d="M6 12h4"></path>
                <path d="M8 10v4"></path>
                <path d="M15 13h.01"></path>
                <path d="M18 11h.01"></path>
              </svg>
              <span>Games</span>
            </div>
            <nav className="site-nav site-nav-games" aria-label="Games navigation">
              {games.map((game) => (
                <NavLink key={game.slug} to={`/games/${game.slug}`} onClick={() => setIsMenuOpen(false)}>
                  {game.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:slug" element={<GamePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <div className="home-stack">
      <section className="games-section" id="games">
        <GamesGrid />
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

function GamesPage() {
  return (
    <section className="section page-shell">
      <h1>Current projects.</h1>
      <p className="page-lead">
        Each game has its own page so the homepage stays clean while the projects get
        room to grow.
      </p>
      <GamesGrid />
    </section>
  );
}

function UpdatesPage() {
  const [blogPostsByGame, setBlogPostsByGame] = useState({});
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

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
  }, []);

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
          <p className="game-blog-empty">Loading updates...</p>
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

function GamesGrid() {
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
          <div className="game-image-overlay" />
        </Link>
      </div>
      <div className="game-card-copy">
        <Link to={`/games/${game.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          <h3>{game.name}</h3>
          <p>{game.teaser}</p>
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
  return (
    <div className="game-detail-hero">
      <picture className="game-detail-hero-media">
        <source media="(orientation: portrait)" srcSet={game.imagePortraitSrc} />
        <img className="game-detail-hero-image" src={game.imageWideSrc} alt="" />
      </picture>
      <div className="game-detail-hero-overlay" />
      <div className="game-detail-hero-copy">
        <div className="game-detail-copy-panel">
          <h1>{game.name}</h1>
          <p className="page-lead">{game.mainDescription}</p>
          <p>{game.secondaryDescription}</p>
        </div>
      </div>
    </div>
  );
}

function GamePage() {
  const { slug } = useParams();
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
  return (
    <section className="section about-page">
      <div className="about-hero">
        <h1>About Us.</h1>
        <p className="page-lead">
          Wigum Gaming is a small independent game development project focused on
          clear systems, transparent progress, and practical workflows that can scale
          from experiments into polished releases.
        </p>
      </div>

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

      <p className="about-release-note">
        While this is currently a hobby project, we are gearing up to release polished,
        finished products starting in 2027.
      </p>

      <h2 className="about-section-title">Team</h2>
      <article className="about-founder-card">
        <img
          className="about-founder-image"
          src="https://placehold.co/900x900/333333/cccccc?text=Ole+Kristian+Wigum"
          alt="Ole Kristian Wigum"
        />
        <div>
          <p className="eyebrow">Founder and coder</p>
          <h2>Ole Kristian Wigum</h2>
          <p>
            My name is Ole Kristian Wigum, and I am a Computer Engineering student at
            NTNU. Over the years, I have developed projects across GameMaker, Roblox,
            and Godot, refining skills in object-oriented programming and system
            architecture.
          </p>
          <p>
            Today, my main focus is transitioning all projects to Godot Engine, using C#
            for scalable and modular design. All code and dev logs are maintained
            through GitHub, ensuring transparency and structure in every build.
          </p>
          <p>
            Thank you for following Wigum Gaming. Stay tuned for our first polished
            releases coming from 2027 onward.
          </p>
        </div>
      </article>

      <Link className="text-link" to="/">
        Back to homepage
      </Link>
    </section>
  );
}

export default App;
