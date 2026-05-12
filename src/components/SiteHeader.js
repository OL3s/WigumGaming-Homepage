import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function SiteHeader({ games, gamesStatus }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const headerRef = useRef(null);
  const brandContainerRef = useRef(null);
  const menuMeasureRef = useRef(null);

  useEffect(() => {
    const updateMenuLayout = () => {
      const header = headerRef.current;
      const brandContainer = brandContainerRef.current;
      const menuMeasure = menuMeasureRef.current;

      if (!header || !brandContainer || !menuMeasure) {
        return;
      }

      const headerStyle = window.getComputedStyle(header);
      const horizontalPadding = parseFloat(headerStyle.paddingLeft) + parseFloat(headerStyle.paddingRight);
      const headerGap = parseFloat(headerStyle.columnGap || headerStyle.gap) || 0;
      const availableMenuWidth = header.clientWidth - horizontalPadding - brandContainer.offsetWidth - headerGap;
      const needsCollapsedMenu = menuMeasure.scrollWidth > availableMenuWidth;

      setIsMenuCollapsed(needsCollapsedMenu);
    };

    updateMenuLayout();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateMenuLayout);
      return () => window.removeEventListener('resize', updateMenuLayout);
    }

    const resizeObserver = new ResizeObserver(updateMenuLayout);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(headerRef.current);
    resizeObserver.observe(menuMeasureRef.current);

    return () => resizeObserver.disconnect();
  }, [games, gamesStatus]);

  useEffect(() => {
    if (!isMenuCollapsed) {
      setIsMenuOpen(false);
    }
  }, [isMenuCollapsed]);

  const renderHeaderMenu = (className, ref = null, isMeasure = false) => {
    const linkProps = isMeasure ? { tabIndex: -1 } : { onClick: () => setIsMenuOpen(false) };

    return (
      <div ref={ref} className={className} aria-hidden={isMeasure}>
        <div className="site-nav-group site-nav-group-primary">
          <nav className="site-nav" aria-label="Site pages">
            <NavLink to="/" {...linkProps}>Home</NavLink>
            <NavLink to="/updates" {...linkProps}>Updates</NavLink>
            <NavLink to="/about" {...linkProps}>About Us</NavLink>
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
              <NavLink key={game.slug} to={`/games/${game.slug}`} {...linkProps}>
                {game.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    );
  };

  return (
    <header ref={headerRef} className={`site-header ${isMenuCollapsed ? 'is-menu-collapsed' : ''}`}>
      <div ref={brandContainerRef} className="site-header-brand-container">
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
      {renderHeaderMenu('site-header-menu site-header-menu-measure', menuMeasureRef, true)}
    </header>
  );
}

export default SiteHeader;
