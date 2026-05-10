const fs = require('fs');
let code = fs.readFileSync('src/App.js', 'utf8');

const target = `<nav className="site-nav site-nav-games" aria-label="Games navigation">
          {games.map((game) => (
            <NavLink key={game.slug} to={\`/games/\${game.slug}\`}>
              {game.name}
            </NavLink>
          ))}
        </nav>`;

const replacement = `<div className="games-nav-container">
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
              <NavLink key={game.slug} to={\`/games/\${game.slug}\`}>
                {game.name}
              </NavLink>
            ))}
          </nav>
        </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.js', code);
