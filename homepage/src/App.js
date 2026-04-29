import { useEffect, useRef, useState } from 'react';
import './App.css';
import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom';

const games = [
  {
    slug: 'singleplayer-roguelite',
    name: 'SingleplayerRoguelite',
    tagline: 'A run-based solo adventure built around momentum and adaptation.',
    description:
      'A focused singleplayer project where each run builds toward stronger choices, harder encounters, and deeper mastery.',
    imageWideSrc: 'https://placehold.co/2400x1200/1a2036/a9b8ff?text=Wide+Image',
    imagePortraitSrc: 'https://placehold.co/1600x1600/1a2036/a9b8ff?text=Portrait+Image',
    imageScale: 1.04,
  },
  {
    slug: 'multiplayer-arena',
    name: 'MultiplayerArena',
    tagline: 'A competitive battleground for fast matches and clutch team moments.',
    description:
      'A multiplayer project centered on arena combat, repeatable match flow, and the kind of rivalries players remember.',
    imageWideSrc: 'https://placehold.co/2400x1200/241326/ff9ed1?text=Wide+Image',
    imagePortraitSrc: 'https://placehold.co/1600x1600/241326/ff9ed1?text=Portrait+Image',
    imageScale: 1.04,
  },
];

function App() {
  return (
    <div className="App">
      <header className="site-header">
        <Link className="brand" to="/">
          Wigum Gaming
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          {games.map((game) => (
            <NavLink key={game.slug} to={`/games/${game.slug}`}>
              {game.name}
            </NavLink>
          ))}
          <NavLink to="/about">About Us</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
          <div className="game-card-copy">
            <h3>{game.name}</h3>
            <p>{game.description}</p>
          </div>
        </Link>
      </div>
      <Link className="game-link" to={`/games/${game.slug}`}>
        View game page
      </Link>
    </li>
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
    <section className="section page-shell">
      <h1>{game.name}</h1>
      <p className="page-lead">{game.tagline}</p>
      <p>{game.description}</p>
      <Link className="text-link" to="/">
        Back to homepage
      </Link>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="section page-shell">
      <h1>Built to highlight the games first.</h1>
      <p className="page-lead">
        Wigum Gaming is shaping a simple studio presence with room for each project to
        grow into its own destination.
      </p>
      <p>
        The goal is straightforward: give players a clean front door, clear navigation,
        and individual game pages that can expand with updates, screenshots, details,
        and release information later.
      </p>
      <Link className="text-link" to="/">
        Back to homepage
      </Link>
    </section>
  );
}

export default App;
