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
import { fetchAboutUs, fetchRoadmap } from './services/aboutUs';
import { createTranslator, readInitialLanguage, writeLanguage } from './services/i18n';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const [language, setLanguageState] = useState(() => readInitialLanguage(location.search));
  const [games, setGames] = useState([]);
  const [gamesStatus, setGamesStatus] = useState('loading');
  const t = createTranslator(language);

  const setLanguage = (nextLanguage) => {
    setLanguageState(nextLanguage);
    writeLanguage(nextLanguage);
  };

  useEffect(() => {
    let isMounted = true;

    setGamesStatus('loading');
    fetchGames(language)
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
  }, [language]);

  return (
    <div className="App">
      <ScrollToTop />
      <SiteHeader games={games} gamesStatus={gamesStatus} language={language} onLanguageChange={setLanguage} t={t} />

      <main>
        <Routes>
          <Route path="/" element={<HomePage games={games} gamesStatus={gamesStatus} t={t} />} />
          <Route path="/updates" element={<UpdatesPage games={games} gamesStatus={gamesStatus} t={t} />} />
          <Route path="/games" element={<GamesPage games={games} gamesStatus={gamesStatus} t={t} />} />
          <Route path="/games/:slug" element={<GamePage games={games} gamesStatus={gamesStatus} t={t} />} />
          <Route path="/about" element={<AboutPage language={language} t={t} />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage({ games, gamesStatus, t }) {
  return (
    <div className="home-stack">
      <section className="games-section" id="games">
        <GamesGrid games={games} gamesStatus={gamesStatus} t={t} />
      </section>

      <section className="home-footer-prompt">
        <p>{t('aboutTeamPrompt')}</p>
        <Link className="text-link" to="/about">
          {t('aboutUs')}
        </Link>
      </section>
    </div>
  );
}

function RoadmapSection({ className = 'roadmap-section', language = 'en', t }) {
  const [roadmap, setRoadmap] = useState({ page: null, items: [] });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    fetchRoadmap(language)
      .then((nextRoadmap) => {
        if (isMounted) {
          setRoadmap(nextRoadmap);
          setStatus('ready');
        }
      })
      .catch((error) => {
        console.error('Failed to load roadmap', error);
        if (isMounted) {
          setRoadmap({ page: null, items: [] });
          setStatus('error');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const page = roadmap.page || {};
  const roadmapIntro = status === 'loading'
    ? t('fetchingRoadmap')
    : status === 'error'
      ? t('couldNotLoadRoadmap')
      : page.body || '';
  const roadmapTitle = status === 'ready' ? page.title : t('roadmap');

  if (className === 'about-roadmap-summary') {
    return (
      <section className={className} aria-labelledby="roadmap-title">
        <div className="about-roadmap-intro">
          <p id="roadmap-title" className="eyebrow">{roadmapTitle}</p>
          {roadmapIntro && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {roadmapIntro}
            </ReactMarkdown>
          )}
        </div>

        {status === 'ready' && roadmap.items.length > 0 ? (
          <div className="about-roadmap-steps">
            {roadmap.items.map((item) => (
              <article key={item.slug} className="about-roadmap-step">
                <span className="about-roadmap-number">{String(item.number).padStart(2, '0')}</span>
                <div>
                  <h3>{item.title || t('untitledRoadmapItem')}</h3>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {item.body || t('noRoadmapTextFound')}
                  </ReactMarkdown>
                </div>
              </article>
            ))}
          </div>
        ) : status === 'ready' ? (
          <p className="about-members-status">{t('noRoadmapStepsFound')}</p>
        ) : null}
      </section>
    );
  }

  return (
    <section className={className} aria-labelledby="roadmap-title">
      <div className="roadmap-panel">
        <p id="roadmap-title" className="eyebrow">{roadmapTitle}</p>
        {roadmapIntro && (
          <div className="roadmap-intro">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {roadmapIntro}
            </ReactMarkdown>
          </div>
        )}
        {status === 'ready' && roadmap.items.length > 0 && (
          <ul className="roadmap-list">
            {roadmap.items.map((item) => (
              <li key={item.slug}>
                <article className="roadmap-item">
                  <span className="roadmap-item-number">#{item.number}</span>
                  <div>
                    <h3>{item.title || t('untitledRoadmapItem')}</h3>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {item.body || t('noRoadmapTextFound')}
                    </ReactMarkdown>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function GamesPage({ games, gamesStatus, t }) {
  return (
    <section className="section page-shell">
      <h1>{t('currentProjects')}</h1>
      <p className="page-lead">{t('gamesOverviewLead')}</p>
      <GamesGrid games={games} gamesStatus={gamesStatus} t={t} />
    </section>
  );
}

function UpdatesPage({ games, gamesStatus, t }) {
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
        <p className="eyebrow">{t('developmentBlog')}</p>
        <p className="page-lead">{t('updatesLead')}</p>
        <hr className="updates-divider" />
      </div>

      <section className="game-blog updates-blog" aria-label={t('allDevelopmentUpdates')}>
        {status === 'loading' ? (
          <p className="game-blog-empty">{t('fetchingBlogContent')}</p>
        ) : status === 'error' ? (
          <p className="game-blog-empty">{t('couldNotLoadUpdates')}</p>
        ) : posts.length === 0 ? (
          <p className="game-blog-empty">{t('noUpdatesFound')}</p>
        ) : (
          <div className="blog-posts">
            {posts.map(({ post, game }, index) => (
              <div key={`${game.slug}-${post.slug}`}>
                {index > 0 && <hr className="blog-post-separator" />}
                <BlogPost post={post} game={game} t={t} />
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function GamesGrid({ games, gamesStatus, t }) {
  if (gamesStatus === 'loading') {
    return <p className="games-list-status">{t('fetchingGames')}</p>;
  }

  if (gamesStatus === 'error') {
    return <p className="games-list-status">{t('couldNotLoadGames')}</p>;
  }

  if (games.length === 0) {
    return <p className="games-list-status">{t('noGamesFound')}</p>;
  }

  return (
    <ul className="games-list" aria-label={t('gamesList')}>
      {games.map((game) => (
        <GameCard key={game.slug} game={game} t={t} />
      ))}
    </ul>
  );
}

function GameCard({ game, t }) {
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
            <p className="game-image-missing">{t('failedGamePreviewImage')}</p>
          )}
          <div className="game-image-overlay" />
        </Link>
      </div>
      <div className="game-card-copy">
        <Link to={`/games/${game.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          <h3>{game.name}</h3>
          <p>{game.teaser || t('failedGameDescription')}</p>
        </Link>
      </div>
      <div className="game-card-actions">
        <Link className="game-link" to={`/games/${game.slug}`}>
          {t('viewGamePage')}
        </Link>
        {game.githubRepo && (
          <a
            className="game-github-link"
            href={game.githubUrl || `https://github.com/${game.githubRepo}`}
            target="_blank"
            rel="noreferrer"
            aria-label={`${game.name} ${t('githubRepositoryLabel')}`}
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

function GameDetailContainer({ game, t }) {
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
          <p>{t('failedGamePreviewImage')}</p>
        </div>
      )}
      <div className="game-detail-hero-overlay" />
      <div className="game-detail-hero-copy">
        <div className="game-detail-copy-panel">
          <h1>{game.name}</h1>
          <p className="page-lead">{game.mainDescription || t('failedGameDescription')}</p>
          {game.secondaryDescription && <p>{game.secondaryDescription}</p>}
        </div>
      </div>
    </div>
  );
}

function GamePage({ games, gamesStatus, t }) {
  const { slug } = useParams();

  if (gamesStatus === 'loading') {
    return (
      <section className="section page-shell">
        <h1>{t('loadingGame')}</h1>
        <p>{t('fetchingGameFolder')}</p>
      </section>
    );
  }

  if (gamesStatus === 'error') {
    return (
      <section className="section page-shell">
        <h1>{t('couldNotLoadGames')}</h1>
        <p>{t('gameFolderUnavailable')}</p>
        <Link className="text-link" to="/">
          {t('backToHomepage')}
        </Link>
      </section>
    );
  }

  const game = games.find((entry) => entry.slug === slug);

  if (!game) {
    return (
      <section className="section page-shell">
        <h1>{t('gameNotFound')}</h1>
        <p>{t('gamePageDoesNotExist')}</p>
        <Link className="text-link" to="/">
          {t('backToHomepage')}
        </Link>
      </section>
    );
  }

  return (
    <section className="section game-detail-page">
      <GameDetailContainer game={game} t={t} />
      <GameBlog game={game} t={t} />
      <GitHubProject game={game} />
      <Link className="text-link" to="/">
        {t('backToHomepage')}
      </Link>
    </section>
  );
}

function AboutPage({ language, t }) {
  const [aboutUs, setAboutUs] = useState({ page: null, members: [] });
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    setStatus('loading');
    setErrorMessage('');
    fetchAboutUs(language)
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
  }, [language]);

  const page = aboutUs.page || {};
  const aboutMarkdown = status === 'loading'
    ? t('fetchingAboutContent')
    : status === 'error'
      ? errorMessage
      : page.body || t('failedAboutPageText');

  return (
    <section className="section about-page">
      <div className="about-hero">
        <h1>{status === 'ready' ? page.title : t('aboutFallbackTitle')}</h1>
        <div className="about-markdown page-lead">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {aboutMarkdown}
          </ReactMarkdown>
        </div>
      </div>

      <figure className="about-roadmap">
        <img src="/roadmapImage.png" alt="Wigum Gaming roadmap" />
      </figure>

      <RoadmapSection className="about-roadmap-summary" language={language} t={t} />

      <section className="about-workflow-section" aria-labelledby="workflow-title">
        <h2 id="workflow-title" className="about-section-title">{t('workflow')}</h2>
        <div className="about-feature-grid" aria-label={t('workflow')}>
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
              <p>{t('workflowGodotBody')}</p>
              <a className="about-feature-link" href="https://godotengine.org/" target="_blank" rel="noreferrer">
                {t('visitGodot')}
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
              <p>{t('workflowGithubBody')}</p>
              <a className="about-feature-link" href="https://github.com/OL3s" target="_blank" rel="noreferrer">
                {t('visitGithub')}
              </a>
            </div>
          </article>
        </div>
      </section>

      {status === 'ready' && page.releaseNote && <p className="about-release-note">{page.releaseNote}</p>}

      <h2 className="about-section-title">{t('team')}</h2>
      {status === 'loading' ? (
        <p className="about-members-status">{t('fetchingTeamMembers')}</p>
      ) : status === 'error' ? (
        <p className="about-members-status">{errorMessage}</p>
      ) : aboutUs.members.length === 0 ? (
        <p className="about-members-status">{t('failedTeamMembers')}</p>
      ) : (
        <div className="about-members-list">
          {aboutUs.members.map((member) => (
            <TeamMemberCard key={member.name} member={member} t={t} />
          ))}
        </div>
      )}

      <Link className="text-link" to="/">
        {t('backToHomepage')}
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

function TeamMemberCard({ member, t }) {
  return (
    <article className="about-founder-card">
      {member.imageSrc ? (
        <img className="about-founder-image" src={member.imageSrc} alt={member.name} />
      ) : (
        <div className="about-founder-image about-founder-image-missing">{t('failedMemberImage')}</div>
      )}
      <div>
        {member.role && <p className="eyebrow">{member.role}</p>}
        <h2>{member.name || t('failedMemberName')}</h2>
        <div className="about-member-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {member.body || t('failedMemberText')}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}

export default App;
