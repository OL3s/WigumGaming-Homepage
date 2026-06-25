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
          <Route path="/" element={<HomePage language={language} t={t} />} />
          <Route path="/updates" element={<UpdatesPage games={games} gamesStatus={gamesStatus} t={t} />} />
          <Route path="/games" element={<GamesPage games={games} gamesStatus={gamesStatus} t={t} />} />
          <Route path="/games/:slug" element={<GamePage games={games} gamesStatus={gamesStatus} t={t} />} />
          <Route path="/tools" element={<ToolsPage t={t} />} />
          <Route path="/about" element={<AboutPage language={language} t={t} />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage({ language, t }) {
  const focusCardRefs = useRef([]);
  const [visibleFocusCards, setVisibleFocusCards] = useState(() => new Set());
  const focusSections = [
    {
      label: t('homeLowPolyLabel'),
      title: t('homeLowPolyTitle'),
      body: t('homeLowPolyBody'),
      image: '/low-poly-placeholder.svg',
      imageAlt: t('homeLowPolyImageAlt'),
    },
    {
      label: t('homeControlsLabel'),
      title: t('homeControlsTitle'),
      body: t('homeControlsBody'),
      image: '/flexible-controls-placeholder.svg',
      imageAlt: t('homeControlsImageAlt'),
    },
    {
      label: t('homeDesignLabel'),
      title: t('homeDesignTitle'),
      body: t('homeDesignBody'),
      image: '/difficulty-loop-placeholder.svg',
      imageAlt: t('homeDesignImageAlt'),
    },
    {
      label: t('homeTeamplayLabel'),
      title: t('homeTeamplayTitle'),
      body: t('homeTeamplayBody'),
      image: '/teamplay-placeholder.svg',
      imageAlt: t('homeTeamplayImageAlt'),
    },
  ];
  const featuredLinks = [
    { to: '/games', title: t('games'), body: t('homeGamesCard'), icon: 'games' },
    { to: '/tools', title: t('tools'), body: t('homeToolsCard'), icon: 'tools' },
    { to: '/updates', title: t('updates'), body: t('homeUpdatesCard'), icon: 'updates' },
  ];

  useEffect(() => {
    const cards = focusCardRefs.current.filter(Boolean);

    if (cards.length === 0) {
      return undefined;
    }

    if (typeof IntersectionObserver !== 'function') {
      setVisibleFocusCards(new Set(cards.map((_, index) => index)));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const visibleIndex = Number(entry.target.dataset.focusIndex);

            if (Number.isFinite(visibleIndex)) {
              setVisibleFocusCards((current) => {
                if (current.has(visibleIndex)) {
                  return current;
                }

                const next = new Set(current);
                next.add(visibleIndex);
                return next;
              });
            }
          }
        });
      },
      { rootMargin: '0px 0px -18% 0px', threshold: 0.2 }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section home-page">
      <div className="home-hero">
        <p className="eyebrow">Wigum Gaming</p>
        <h1>{t('homeTitle')}</h1>
        <p className="page-lead">{t('homeLead')}</p>
      </div>

      <div className="home-focus-stack" aria-label={t('companyFocus')}>
        {focusSections.map((section, index) => (
          <section
            key={section.title}
            data-focus-index={index}
            ref={(element) => {
              focusCardRefs.current[index] = element;
            }}
            className={`home-focus-card ${visibleFocusCards.has(index) ? 'is-visible' : ''}`}
          >
            <div>
              <p className="eyebrow">{section.label}</p>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
            {section.image && <img src={section.image} alt={section.imageAlt} />}
          </section>
        ))}
      </div>

      <div className="home-feature-grid" aria-label={t('homepageSections')}>
        {featuredLinks.map((link) => (
          <Link key={link.to} className="home-feature-card" to={link.to}>
            <HomeFeatureIcon name={link.icon} />
            <span>{link.title}</span>
            <p>{link.body}</p>
          </Link>
        ))}
      </div>

      <section className="home-about-prompt">
        <p>{t('moreAboutUsPrompt')}</p>
        <Link className="text-link" to="/about">
          {t('aboutUs')}
        </Link>
      </section>

      <RoadmapSection language={language} t={t} />
    </section>
  );
}

function GamesPage({ games, gamesStatus, t }) {
  const gamesByCategory = {
    finished: games.filter((game) => game.category === 'finished'),
    upcoming: games.filter((game) => game.category === 'upcoming'),
    planned: games.filter((game) => game.category === 'planned'),
  };

  return (
    <div className="home-stack">
      <GameCategorySection title={t('finishedGames')} games={gamesByCategory.finished} gamesStatus={gamesStatus} emptyLabel={t('noFinishedGamesFound')} t={t} />
      <GameCategorySection title={t('upcomingGames')} games={gamesByCategory.upcoming} gamesStatus={gamesStatus} emptyLabel={t('noUpcomingGamesFound')} t={t} />
      <GameCategorySection title={t('plannedGameIdeas')} games={gamesByCategory.planned} gamesStatus={gamesStatus} emptyLabel={t('noPlannedGamesFound')} t={t} />

      <section className="home-footer-prompt">
        <p>{t('aboutTeamPrompt')}</p>
        <Link className="text-link" to="/about">
          {t('aboutUs')}
        </Link>
      </section>
    </div>
  );
}

function GameCategorySection({ title, games, gamesStatus, emptyLabel, t }) {
  return (
    <section className="games-section" id={title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>
      <div className="home-games-divider">
        <span>{title}</span>
      </div>
      <GamesGrid games={games} gamesStatus={gamesStatus} emptyLabel={emptyLabel} t={t} />
    </section>
  );
}

function HomeFeatureIcon({ name }) {
  if (name === 'games') {
    return (
      <svg className="home-feature-icon" viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="20" width="48" height="28" rx="10" />
        <path d="M20 34h12M26 28v12" />
        <circle cx="42" cy="31" r="2" />
        <circle cx="48" cy="37" r="2" />
      </svg>
    );
  }

  if (name === 'tools') {
    return (
      <svg className="home-feature-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path d="m22 42 20-20" />
        <path d="m38 18 8-8 8 8-8 8Z" />
        <path d="M18 26 8 16l8-8 10 10" />
        <path d="M20 44 12 52" />
        <circle cx="46" cy="46" r="8" />
      </svg>
    );
  }

  return (
    <svg className="home-feature-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 14h36v36H14Z" />
      <path d="M22 24h20M22 32h20M22 40h12" />
      <path d="M46 10v12h12" />
    </svg>
  );
}

function ToolsPage({ t }) {
  const productionTools = [
    {
      name: 'Godot Engine',
      icon: 'https://godotengine.org/assets/press/icon_color.svg',
      linuxCommand: 'flatpak install flathub org.godotengine.Godot',
      windowsUrl: 'https://godotengine.org/download/windows/',
    },
    {
      name: '.NET SDK',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg',
      linuxCommand: 'sudo apt install dotnet-sdk-8.0',
      windowsUrl: 'https://dotnet.microsoft.com/download',
    },
    {
      name: 'Git',
      icon: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.svg',
      linuxCommand: 'sudo apt install git',
      windowsUrl: 'https://git-scm.com/download/win',
    },
    {
      name: 'GitHub CLI',
      icon: 'https://cli.github.com/assets/images/favicon.svg',
      linuxCommand: 'sudo apt install gh',
      windowsUrl: 'https://cli.github.com/',
    },
    {
      name: 'VS Code',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
      linuxCommand: 'sudo snap install code --classic',
      windowsUrl: 'https://code.visualstudio.com/Download',
    },
    {
      name: 'Blender',
      icon: 'https://www.blender.org/wp-content/uploads/2020/07/blender_logo_no_socket.svg',
      linuxCommand: 'flatpak install flathub org.blender.Blender',
      windowsUrl: 'https://www.blender.org/download/',
    },
    {
      name: 'Inkscape',
      icon: 'https://media.inkscape.org/static/images/inkscape-logo.svg',
      linuxCommand: 'flatpak install flathub org.inkscape.Inkscape',
      windowsUrl: 'https://inkscape.org/release/',
    },
    {
      name: 'Aseprite',
      icon: 'https://www.aseprite.org/assets/images/aseprite.png',
      linuxCommand: 'flatpak install flathub org.aseprite.Aseprite',
      windowsUrl: 'https://www.aseprite.org/download/',
      extraUrl: 'https://store.steampowered.com/app/431730/Aseprite/',
    },
    {
      name: 'Roblox Studio',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Roblox_Studio_Icon.png',
      linuxCommand: 'Roblox Studio is Windows/macOS-first. On Linux, use a Windows VM or compatibility tooling if needed.',
      windowsUrl: 'https://create.roblox.com/docs/studio/setup',
    },
  ];

  return (
    <section className="section tools-page">
      <div className="tools-hero">
        <p className="eyebrow">{t('tools')}</p>
        <h1>{t('toolsTitle')}</h1>
        <p className="page-lead">{t('toolsLead')}</p>
      </div>

      <section className="production-tools" aria-label={t('productionTools')}>
        <p className="tools-install-lead">{t('toolsInstallLead')}</p>
        <div className="production-tools-grid">
          {productionTools.map((tool) => (
            <article key={tool.name} className="production-tool-card">
              <div className="production-tool-heading">
                <img className="production-tool-icon" src={tool.icon} alt={`${tool.name} icon`} />
                <h2>{tool.name}</h2>
              </div>
              <div className="production-tool-install">
                <span>{t('linuxCommand')}</span>
                <code>{tool.linuxCommand}</code>
              </div>
              <a className="production-tool-link" href={tool.windowsUrl} target="_blank" rel="noreferrer">
                <img className="production-tool-link-icon" src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg" alt="" />
                {t('download')}
              </a>
              {tool.extraUrl && (
                <a className="production-tool-link production-tool-link-secondary" href={tool.extraUrl} target="_blank" rel="noreferrer">
                  {t('steamDownload')}
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <figure className="tool-sheet-card">
        <img className="tool-sheet-preview" src="/sheet-blender.svg" alt={t('sheetBlenderAlt')} />
        <figcaption>
          <span>{t('sheetBlenderCaption')}</span>
          <span className="tool-sheet-actions">
            <a className="production-tool-link" href="/sheet-blender.svg" target="_blank" rel="noreferrer">
              {t('preview')}
            </a>
            <a className="production-tool-link" href="/sheet-blender.svg" download>
              {t('download')}
            </a>
          </span>
        </figcaption>
      </figure>
    </section>
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

function UpdatesPage({ games, gamesStatus, t }) {
  const [blogPostsByGame, setBlogPostsByGame] = useState({});
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let isMounted = true;

    if (gamesStatus === 'loading') {
      setStatus('loading');
      return undefined;
    }

    if (gamesStatus === 'error') {
      setBlogPostsByGame({});
      setStatus('error');
      return undefined;
    }

    if (games.length === 0) {
      setBlogPostsByGame({});
      setStatus('ready');
      return undefined;
    }

    setStatus('loading');
    fetchBlogPostsByGame(games)
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

function GamesGrid({ games, gamesStatus, emptyLabel, t }) {
  if (gamesStatus === 'loading') {
    return <p className="games-list-status">{t('fetchingGames')}</p>;
  }

  if (gamesStatus === 'error') {
    return <p className="games-list-status">{t('couldNotLoadGames')}</p>;
  }

  if (games.length === 0) {
    return <p className="games-list-status">{emptyLabel || t('noGamesFound')}</p>;
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
        <div className="game-panel">
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
          <div className="game-card-content">
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
          </div>
        </div>
      </div>
    </li>
  );
}

function GameDetailContainer({ game, t }) {
  const hasPreviewImages = game.imageWideSrc && game.imagePortraitSrc;
  const shortDescription = game.teaser || game.description || t('failedGameDescription');

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
          <p className="page-lead">{shortDescription}</p>
          {game.description && <p>{game.description}</p>}
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
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Roblox_Logo_2022.jpg"
                  alt="Roblox logo"
                />
                <h2>Roblox</h2>
              </div>
              <p>{t('workflowRobloxBody')}</p>
              <a className="about-feature-link" href="https://create.roblox.com/" target="_blank" rel="noreferrer">
                {t('visitRoblox')}
              </a>
            </div>
          </article>

          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg"
                  alt=".NET SDK logo"
                />
                <h2>.NET SDK</h2>
              </div>
              <p>{t('workflowDotnetBody')}</p>
              <a className="about-feature-link" href="https://dotnet.microsoft.com/download" target="_blank" rel="noreferrer">
                {t('visitDotnet')}
              </a>
            </div>
          </article>

          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://git-scm.com/images/logos/downloads/Git-Icon-1788C.svg"
                  alt="Git logo"
                />
                <h2>Git</h2>
              </div>
              <p>{t('workflowGitBody')}</p>
              <a className="about-feature-link" href="https://git-scm.com/" target="_blank" rel="noreferrer">
                {t('visitGit')}
              </a>
            </div>
          </article>

          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://cli.github.com/assets/images/favicon.svg"
                  alt="GitHub CLI logo"
                />
                <h2>GitHub CLI</h2>
              </div>
              <p>{t('workflowGithubCliBody')}</p>
              <a className="about-feature-link" href="https://cli.github.com/" target="_blank" rel="noreferrer">
                {t('visitGithubCli')}
              </a>
            </div>
          </article>

          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"
                  alt="VS Code logo"
                />
                <h2>VS Code</h2>
              </div>
              <p>{t('workflowVscodeBody')}</p>
              <a className="about-feature-link" href="https://code.visualstudio.com/" target="_blank" rel="noreferrer">
                {t('visitVscode')}
              </a>
            </div>
          </article>

          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://www.aseprite.org/assets/images/aseprite.png"
                  alt="Aseprite logo"
                />
                <h2>Aseprite</h2>
              </div>
              <p>{t('workflowAsepriteBody')}</p>
              <a className="about-feature-link" href="https://www.aseprite.org/" target="_blank" rel="noreferrer">
                {t('visitAseprite')}
              </a>
            </div>
          </article>

          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://media.inkscape.org/static/images/inkscape-logo.svg"
                  alt="Inkscape logo"
                />
                <h2>Inkscape</h2>
              </div>
              <p>{t('workflowInkscapeBody')}</p>
              <a className="about-feature-link" href="https://inkscape.org/" target="_blank" rel="noreferrer">
                {t('visitInkscape')}
              </a>
            </div>
          </article>

          <article className="about-feature-card">
            <div>
              <div className="about-feature-heading">
                <img
                  className="about-feature-logo"
                  src="https://www.blender.org/wp-content/uploads/2020/07/blender_logo_no_socket.svg"
                  alt="Blender logo"
                />
                <h2>Blender</h2>
              </div>
              <p>{t('workflowBlenderBody')}</p>
              <a className="about-feature-link" href="https://www.blender.org/" target="_blank" rel="noreferrer">
                {t('visitBlender')}
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
