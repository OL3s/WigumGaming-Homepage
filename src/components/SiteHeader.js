import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const MENU_COLLAPSE_QUERY = '(max-width: 980px)';

function SiteHeader({ games, gamesStatus }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      const updateMenuLayout = () => setIsMenuCollapsed(window.innerWidth <= 980);

      updateMenuLayout();
      window.addEventListener('resize', updateMenuLayout);

      return () => window.removeEventListener('resize', updateMenuLayout);
    }

    const mediaQuery = window.matchMedia(MENU_COLLAPSE_QUERY);
    const updateMenuLayout = () => setIsMenuCollapsed(mediaQuery.matches);

    updateMenuLayout();
    mediaQuery.addEventListener('change', updateMenuLayout);

    return () => mediaQuery.removeEventListener('change', updateMenuLayout);
  }, []);

  useEffect(() => {
    if (!isMenuCollapsed) {
      setIsMenuOpen(false);
    }
  }, [isMenuCollapsed]);

  const renderHeaderMenu = (className) => {
    return (
      <div className={className}>
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
            {gamesStatus === 'loading' && <span className="site-nav-loading">Loading games...</span>}
            {games.map((game) => (
              <NavLink key={game.slug} to={`/games/${game.slug}`} onClick={() => setIsMenuOpen(false)}>
                {game.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    );
  };

  return (
    <header className={`site-header ${isMenuCollapsed ? 'is-menu-collapsed' : ''}`}>
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

      {renderHeaderMenu(`site-header-menu ${isMenuOpen ? 'is-open' : ''}`)}
    </header>
  );
}

export default SiteHeader;
