import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

function GitHubProject({ game, compact = false }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!game.githubRepo) {
    return null;
  }

  const repoUrl = game.githubUrl || `https://github.com/${game.githubRepo}`;
  const panelContentId = `${game.slug || game.githubRepo.replace(/[^a-z0-9]/gi, '-')}-github-details`;

  return (
    <section className={`github-panel${compact ? ' github-panel-compact' : ''}`} aria-label={`${game.name} GitHub project`}>
      <div className="github-panel-header">
        <button
          className="github-panel-toggle"
          type="button"
          aria-expanded={isExpanded}
          aria-controls={panelContentId}
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span>
            <span className="eyebrow">GitHub Repo</span>
            <span className="github-panel-title">{game.githubRepo}</span>
          </span>
          <span className="github-panel-toggle-label">{isExpanded ? 'Hide GitHub details' : 'Show GitHub details'}</span>
        </button>
        <a className="github-status-link" href={repoUrl} target="_blank" rel="noreferrer" aria-label={`${game.name} GitHub repository`}>
          <img
            className="github-status-logo"
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            alt=""
          />
        </a>
      </div>

      {isExpanded && (
        <div id={panelContentId}>
          <GitHubStatus game={game} />
          <GitHubReadme game={game} />
        </div>
      )}
    </section>
  );
}

function GitHubStatus({ game }) {
  const [status, setStatus] = useState({ state: 'idle', repo: null, milestones: [] });

  useEffect(() => {
    if (!game.githubRepo) {
      return undefined;
    }

    const controller = new AbortController();
    const baseUrl = `https://api.github.com/repos/${game.githubRepo}`;

    async function fetchStatus() {
      setStatus({ state: 'loading', repo: null, milestones: [] });

      try {
        const [repoResponse, milestonesResponse] = await Promise.all([
          fetch(baseUrl, { signal: controller.signal }),
          fetch(`${baseUrl}/milestones?state=all&sort=due_on&direction=asc&per_page=100`, {
            signal: controller.signal,
          }),
        ]);

        if (!repoResponse.ok || !milestonesResponse.ok) {
          throw new Error('GitHub request failed');
        }

        const [repo, milestones] = await Promise.all([
          repoResponse.json(),
          milestonesResponse.json(),
        ]);

        setStatus({ state: 'ready', repo, milestones });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setStatus({ state: 'error', repo: null, milestones: [] });
        }
      }
    }

    fetchStatus();

    return () => controller.abort();
  }, [game.githubRepo]);

  if (!game.githubRepo) {
    return null;
  }

  const milestones = status.milestones.map((milestone) => {
    const closedIssues = milestone.closed_issues || 0;
    const totalIssues = closedIssues + (milestone.open_issues || 0);
    const progress = totalIssues > 0 ? Math.round((closedIssues / totalIssues) * 100) : 0;

    return { ...milestone, closedIssues, totalIssues, progress };
  });

  return (
    <div className="github-panel-section github-milestones-section" aria-label={`${game.name} milestones`}>
      <h5>Milestones:</h5>
      {status.state === 'loading' && <p>Fetching repository status...</p>}
      {status.state === 'error' && <p>Live GitHub status is unavailable right now.</p>}
      {status.state === 'ready' && (
        <>
          {milestones.length > 0 ? (
            <ul className="github-milestones" aria-label={`${game.name} milestones`}>
              {milestones.map((milestone) => (
                <GitHubMilestone key={milestone.id} milestone={milestone} />
              ))}
            </ul>
          ) : (
            <p>Repository connected. No milestones are currently defined.</p>
          )}
        </>
      )}
    </div>
  );
}

function GitHubMilestone({ milestone }) {
  return (
    <li className="github-milestone" style={{ '--milestone-progress': `${milestone.progress}%` }}>
      <div className="github-milestone-content">
        <span>{milestone.title}</span>
        <small>
          {milestone.closedIssues} / {milestone.totalIssues} tasks complete
          {milestone.totalIssues > 0 ? ` (${milestone.progress}%)` : ''}
          {milestone.state === 'closed' ? ' - closed' : ''}
        </small>
      </div>
    </li>
  );
}

function GitHubReadme({ game }) {
  const [readme, setReadme] = useState({ state: 'idle', text: '' });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!game.githubRepo) {
      return undefined;
    }

    const controller = new AbortController();

    async function fetchReadme() {
      setReadme({ state: 'loading', text: '' });

      try {
        const response = await fetch(`https://api.github.com/repos/${game.githubRepo}/readme`, {
          headers: { Accept: 'application/vnd.github.raw' },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('README request failed');
        }

        const text = await response.text();
        setReadme({ state: 'ready', text });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setReadme({ state: 'error', text: '' });
        }
      }
    }

    fetchReadme();

    return () => controller.abort();
  }, [game.githubRepo]);

  if (!game.githubRepo) {
    return null;
  }

  const readmeContentId = `${game.slug || game.githubRepo.replace(/[^a-z0-9]/gi, '-')}-readme`;

  return (
    <div className="github-panel-section github-readme-section" aria-label={`${game.name} README`}>
      <button
        className="github-readme-toggle"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={readmeContentId}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span>README</span>
        <span className="github-readme-toggle-action">{isExpanded ? 'Collapse' : 'Expand'}</span>
      </button>
      {isExpanded && (
        <div id={readmeContentId}>
          {readme.state === 'loading' && <p>Fetching README...</p>}
          {readme.state === 'error' && <p>README is unavailable right now.</p>}
          {readme.state === 'ready' && (
            <div className="github-readme-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                transformImageUri={(uri) => resolveGitHubReadmeAsset(uri, game.githubRepo)}
                transformLinkUri={(uri) => resolveGitHubReadmeLink(uri, game.githubRepo)}
              >
                {normalizeReadmeHtmlAssets(readme.text, game.githubRepo)}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function normalizeReadmeHtmlAssets(markdown, repo) {
  return markdown.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (match, before, src, after) => {
    return `${before}${resolveGitHubReadmeAsset(src, repo)}${after}`;
  });
}

function resolveGitHubReadmeAsset(uri, repo) {
  if (!uri || isAbsoluteReadmeUri(uri)) {
    return uri;
  }

  return `https://raw.githubusercontent.com/${repo}/HEAD/${uri.replace(/^\.\//, '').replace(/^\//, '')}`;
}

function resolveGitHubReadmeLink(uri, repo) {
  if (!uri || isAbsoluteReadUri(uri)) {
    return uri;
  }

  return `https://github.com/${repo}/blob/HEAD/${uri.replace(/^\.\//, '').replace(/^\//, '')}`;
}

function isAbsoluteReadUri(uri) {
  return /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(uri);
}

function isAbsoluteReadmeUri(uri) {
  return isAbsoluteReadUri(uri);
}

export default GitHubProject;
