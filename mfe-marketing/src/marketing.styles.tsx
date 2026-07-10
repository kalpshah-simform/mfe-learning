import { Global, css } from "@emotion/react";

/**
 * Emotion's <Global> injects its <style> tag via a `useInsertionEffect`
 * inside React's commit phase — i.e. after MarketingApp has mounted (or
 * re-mounted), not at module-evaluation time. Rendering GlobalStyle from
 * within MarketingApp means the <style> tag is inserted every time this
 * component mounts, in both standalone and federated contexts, and removed
 * by Emotion when it unmounts.
 *
 * Only namespaced (--mfe-mkt-*) custom properties live here, so this is
 * safe to render from the federated path (marketing-bootstrap.tsx) without
 * colliding with the same token names in mfe-auth, mfe-dashboard, or
 * mfe-container. The non-prefixable page-shell rules (`#root`, `body`) live
 * in standalone-shell.css instead, imported only by main.tsx — see that
 * file for why they can't ship here.
 */
export const GlobalStyle = () => (
  <Global
    styles={css`
      :root {
        --mfe-mkt-text: #6b6375;
        --mfe-mkt-text-h: #08060d;
        --mfe-mkt-bg: #fff;
        --mfe-mkt-border: #e5e4e7;
        --mfe-mkt-code-bg: #f4f3ec;
        --mfe-mkt-accent: #aa3bff;
        --mfe-mkt-accent-bg: rgba(170, 59, 255, 0.1);
        --mfe-mkt-accent-border: rgba(170, 59, 255, 0.5);
        --mfe-mkt-social-bg: rgba(244, 243, 236, 0.5);
        --mfe-mkt-shadow:
          rgba(0, 0, 0, 0.1) 0 10px 15px -3px,
          rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

        --mfe-mkt-sans: system-ui, "Segoe UI", Roboto, sans-serif;
        --mfe-mkt-heading: system-ui, "Segoe UI", Roboto, sans-serif;
        --mfe-mkt-mono: ui-monospace, Consolas, monospace;

        font: 18px/145% var(--mfe-mkt-sans);
        letter-spacing: 0.18px;
        color-scheme: light dark;
        color: var(--mfe-mkt-text);
        background: var(--mfe-mkt-bg);
        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        @media (max-width: 1024px) {
          font-size: 16px;
        }
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --mfe-mkt-text: #9ca3af;
          --mfe-mkt-text-h: #f3f4f6;
          --mfe-mkt-bg: #16171d;
          --mfe-mkt-border: #2e303a;
          --mfe-mkt-code-bg: #1f2028;
          --mfe-mkt-accent: #c084fc;
          --mfe-mkt-accent-bg: rgba(192, 132, 252, 0.15);
          --mfe-mkt-accent-border: rgba(192, 132, 252, 0.5);
          --mfe-mkt-social-bg: rgba(47, 48, 58, 0.5);
          --mfe-mkt-shadow:
            rgba(0, 0, 0, 0.4) 0 10px 15px -3px,
            rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
        }
      }
    `}
  />
);
