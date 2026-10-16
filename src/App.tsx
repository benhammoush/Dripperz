/**
 * Responsive Phase 3 showcase with local galleries and explicitly historical content.
 * @packageDocumentation
 */

import { APP_VERSION } from './appVersion';
import { useRef, useState } from 'react';
import { Atmosphere } from './Atmosphere';
import { SECTIONS } from './sections';
import { Collection, Cybermap, ShowcaseFaq } from './CoreShowcase';
import { PUBLIC_LINKS } from './showcaseContent';

/**
 * Render shared desktop/mobile navigation and approved core content without external integrations.
 * @returns The core showcase, remaining deferred-feature targets and runtime version.
 */
export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  /** Close the mobile disclosure after following a section link. */
  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="shell" data-paused={paused}>
      <a className="skip-link" href="#main" tabIndex={0}>
        Skip to content
      </a>
      <header
        className="site-header"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && menuOpen) {
            closeMenu();
            menuButton.current?.focus();
          }
        }}
      >
        <a
          className="brand"
          tabIndex={0}
          href="#home"
          aria-label="Dripperz home"
          onClick={closeMenu}
        >
          <img
            src="/branding/dripperz-mark.png"
            width="34"
            height="40"
            alt=""
          />
          <span>
            DRIPPERZ<span className="brand-subtitle">CYBER CLUB</span>
          </span>
        </a>
        <button
          className="menu-toggle"
          ref={menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? 'Close menu' : 'Menu'}{' '}
          <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
        </button>
        <nav
          id="primary-navigation"
          className="primary-navigation"
          aria-label="Main"
          data-open={menuOpen}
        >
          {SECTIONS.map((section) => (
            <a
              href={`#${section.id}`}
              tabIndex={0}
              key={section.id}
              onClick={closeMenu}
            >
              {section.label}
            </a>
          ))}
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <Atmosphere>
          <section className="hero" id="home" aria-labelledby="hero-title">
            <p className="eyebrow">Dripperz Cyber Club / Phase 03</p>
            <h1 id="hero-title">
              <span className="sr-only">Dripperz — </span>ENTER THE
              <br />
              <span className="glitch">CYBERCLUB</span>
            </h1>
            <p className="hero-description">
              A historical showcase.
              <br />A cyberpunk identity. No wallet required.
            </p>
            <a className="enter-link" href="#collection" tabIndex={0}>
              Explore the club <span aria-hidden="true">↓</span>
            </a>
            <div className="hero-base">
              <p>
                Historical showcase <span>/ Core collection archive</span>
              </p>
              <button
                className="motion-toggle"
                type="button"
                aria-pressed={paused}
                onClick={() => setPaused(!paused)}
              >
                {paused ? 'Resume effects' : 'Pause effects'}
              </button>
            </div>
          </section>
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[0, 1].map((copy) => (
                <span key={copy}>
                  WELCOME TO THE CYBERCLUB / DRIPPERZ / WELCOME TO THE CYBERCLUB
                  / DRIPPERZ /{' '}
                </span>
              ))}
            </div>
          </div>
        </Atmosphere>
        <div className="sections">
          {SECTIONS.map((section, index) => (
            <section
              className="content-panel"
              id={section.id}
              tabIndex={-1}
              key={section.id}
              aria-labelledby={`${section.id}-title`}
            >
              <p className="eyebrow">
                0{index + 1} / {section.label}
              </p>
              <h2 id={`${section.id}-title`}>{section.title}</h2>
              {section.id === 'collection' ? (
                <Collection />
              ) : section.id === 'cybermap' ? (
                <Cybermap />
              ) : section.id === 'faq' ? (
                <ShowcaseFaq />
              ) : (
                <>
                  <p>{section.detail}</p>
                  <span className="milestone-label">Not yet implemented</span>
                </>
              )}
            </section>
          ))}
        </div>
      </main>
      <footer className="site-footer">
        <a href="#home" tabIndex={0}>
          Dripperz Cyber Club ↑
        </a>
        <p>Historical showcase · No Web3 integration</p>
        {PUBLIC_LINKS.map((link) => (
          <a key={link.href} href={link.href} tabIndex={0}>
            {link.label} ↗
          </a>
        ))}
        <p>
          Version <span data-testid="app-version">{APP_VERSION}</span>
        </p>
      </footer>
    </div>
  );
}
