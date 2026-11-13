import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import kasperLogoFull from '../assets/kasper_logo_full.svg';
import githubLogo from '../assets/github_logo.png';
import { kasperApi } from '../services/KasperApiClient';
import './LoginPage.css';

const phrases = [
  "Identifique riscos de evasão antes que eles se tornem perdas.",
  "Cada aluno conta. Cada dado revela uma história.",
  "Decisões mais inteligentes começam com previsões precisas.",
  "Integre a inteligência do Kasper às suas APIs em minutos.",
  "Mais permanência, menos incerteza para sua instituição."
];

const HERO_MESSAGES = [
  {
    lines: ["ELEVE O", "GERENCIAMENTO", "DE MEMBROS DE"],
    lastPrefix: "FORMA ",
    highlight: "PRECISA",
    description:
      "Kasper é uma ferramenta de fácil acesso que contribui, para escolas e instituições de ensino, na previsão de evasão escolar."
  },
  {
    lines: ["ANTECIPE RISCOS", "E AJA COM", "INTELIGÊNCIA"],
    lastPrefix: "EM TEMPO ",
    highlight: "REAL",
    description:
      "Com ela, é possível prever evasões com mais de 85% de eficácia, permitindo uma ação prévia."
  },
  {
    lines: ["INTEGRE DADOS", "ESTUDANTIS À", "SUA ROTINA"],
    lastPrefix: "COM ",
    highlight: "CLAREZA",
    description:
      "Ele oferece APIs rápidas e diretas para conectar seu sistema escolar a modelos preditivos prontos para produção."
  },
  {
    lines: ["MAIS RETENÇÃO", "E MENOS", "INCERTEZA NA"],
    lastPrefix: "SUA ",
    highlight: "GESTÃO",
    description:
      "Aumente a retenção, deixe a previsão com a gente."
  }
];

const HERO_OPEN_MS = 950;
const HERO_HIGHLIGHT_MS = 700;
const HERO_HOLD_MS = 7500;
const HERO_CLOSE_MS = 850;

const TOTAL_STUDENTS = 4424;
const EVADED_STUDENTS = 1421;
const MATRIX_COLS = 88;
const MATRIX_ROWS = Math.ceil(TOTAL_STUDENTS / MATRIX_COLS);

function createStudentMatrix() {
  // Deterministic pseudo-random distribution so exactly 1,421 of 4,424 dots are highlighted
  const indices = Array.from({ length: TOTAL_STUDENTS }, (_, idx) => idx);
  let seed = 44241421;
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }

  const evadedSet = new Set(indices.slice(0, EVADED_STUDENTS));
  const dots = [];
  for (let i = 0; i < TOTAL_STUDENTS; i++) {
    const col = i % MATRIX_COLS;
    const row = Math.floor(i / MATRIX_COLS);
    seed = (seed * 1664525 + 1013904223) >>> 0;
    dots.push({
      col,
      row,
      evaded: evadedSet.has(i),
      phase: ((seed % 628) / 100)
    });
  }
  return dots;
}

const STUDENT_DOTS = createStudentMatrix();

const PHRASE_DURATION_MS = 4000;
const FADE_OUT_MS = 400;

function PhraseCarousel() {
  const [index, setIndex] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    let swapTimeout;
    const interval = setInterval(() => {
      setIsLeaving(true);
      swapTimeout = setTimeout(() => {
        setIndex(prev => (prev + 1) % phrases.length);
        setIsLeaving(false);
      }, FADE_OUT_MS);
    }, PHRASE_DURATION_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(swapTimeout);
    };
  }, [index]);

  const selectPhrase = (targetIndex) => {
    if (targetIndex === index) return;
    setIsLeaving(true);
    setTimeout(() => {
      setIndex(targetIndex);
      setIsLeaving(false);
    }, FADE_OUT_MS);
  };

  return (
    <div className="carousel-container">
      <div className="carousel-content">
        <h3 key={index} className={`carousel-text ${isLeaving ? 'leaving' : ''}`}>{phrases[index]}</h3>
      </div>
      <div className="carousel-indicators">
        {phrases.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Mensagem ${i + 1}`}
            onClick={() => selectPhrase(i)}
            className={`indicator ${i === index ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

function StudentMatrixCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let time = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (prefersReducedMotion) {
        drawFrame(0);
      }
    };

    const drawFrame = (t) => {
      ctx.clearRect(0, 0, width, height);
      if (width <= 0 || height <= 0) return;

      const stepX = width / MATRIX_COLS;
      const stepY = height / MATRIX_ROWS;
      const baseRadius = Math.max(1.2, Math.min(stepX, stepY) * 0.34);

      // Draw inactive student dots in one path for performance
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      for (let i = 0; i < STUDENT_DOTS.length; i++) {
        const dot = STUDENT_DOTS[i];
        if (dot.evaded) continue;
        const cx = (dot.col + 0.5) * stepX;
        const cy = (dot.row + 0.5) * stepY;
        ctx.moveTo(cx + baseRadius, cy);
        ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      }
      ctx.fill();

      // Draw highlighted evaded student dots with subtle organic pulse
      for (let i = 0; i < STUDENT_DOTS.length; i++) {
        const dot = STUDENT_DOTS[i];
        if (!dot.evaded) continue;
        const cx = (dot.col + 0.5) * stepX;
        const cy = (dot.row + 0.5) * stepY;
        const pulse = prefersReducedMotion ? 0.85 : 0.72 + 0.28 * Math.sin(t * 1.6 + dot.phase);
        ctx.fillStyle = `rgba(247, 196, 0, ${pulse.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * 1.08, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      time += 0.018;
      drawFrame(time);
      animationFrameId = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      observer.disconnect();
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="matrix-canvas-wrapper" aria-hidden="true">
      <canvas ref={canvasRef} className="matrix-canvas" />
    </div>
  );
}

function HeroMessageRotator() {
  const [messageIndex, setMessageIndex] = useState(0);
  // Phases: 'opening' -> 'highlighting' -> 'visible' -> 'closing'
  const [phase, setPhase] = useState('opening');

  useEffect(() => {
    const tHighlight = setTimeout(() => setPhase('highlighting'), HERO_OPEN_MS);
    const tVisible = setTimeout(() => setPhase('visible'), HERO_OPEN_MS + HERO_HIGHLIGHT_MS);
    const tClosing = setTimeout(
      () => setPhase('closing'),
      HERO_OPEN_MS + HERO_HIGHLIGHT_MS + HERO_HOLD_MS
    );
    const tNext = setTimeout(() => {
      setMessageIndex((prev) => (prev + 1) % HERO_MESSAGES.length);
      setPhase('opening');
    }, HERO_OPEN_MS + HERO_HIGHLIGHT_MS + HERO_HOLD_MS + HERO_CLOSE_MS);

    return () => {
      clearTimeout(tHighlight);
      clearTimeout(tVisible);
      clearTimeout(tClosing);
      clearTimeout(tNext);
    };
  }, [messageIndex]);

  const current = HERO_MESSAGES[messageIndex];

  return (
    <div className="hero-message-rotator">
      {/* Invisible sizers lock height to the tallest variation across all viewports */}
      {HERO_MESSAGES.map((msg, idx) => (
        <div key={`sizer-${idx}`} className="hero-message-sizer" aria-hidden="true">
          <p className="landing-title">
            {msg.lines.map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
            {msg.lastPrefix}
            <span className="title-highlight">{msg.highlight}</span>
          </p>
          <p className="landing-description">{msg.description}</p>
        </div>
      ))}

      <div key={messageIndex} className={`hero-message-stage phase-${phase}`}>
        <h1 className="landing-title">
          {current.lines.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              <br />
            </React.Fragment>
          ))}
          {current.lastPrefix}
          <span className="title-highlight">{current.highlight}</span>
        </h1>
        <p className="landing-description">{current.description}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const switchView = (nextView) => {
    setErrorMessage('');
    setView(nextView);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await kasperApi.login({ email, password });
      navigate('/keys');
    } catch (err) {
      if (err.status === 401) {
        setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else {
        setErrorMessage(err.message || 'Não foi possível realizar o login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('A senha deve possuir no mínimo 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await kasperApi.registerAndLogin({ name, email, password });
      navigate('/keys');
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('já cadastrado')) {
        setErrorMessage('Este e-mail já está cadastrado. Tente fazer login.');
      } else {
        setErrorMessage(err.message || 'Não foi possível concluir o cadastro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`landing-container ${view !== 'landing' ? 'auth-mode' : ''}`}>
      {view === 'landing' ? (
        <div className="landing-geometry" aria-hidden="true">
          <div className="geo-corner-tl" />
          <div className="geo-top-right-yellow" />
          <div className="geo-top-right-black" />
          <div className="geo-top-right-accent" />
          <div className="geo-bottom-bar">
            <span className="geo-bar-black" />
            <span className="geo-bar-yellow" />
          </div>
          <div className="geo-bottom-right">
            <span className="geo-sq-black" />
            <span className="geo-sq-yellow" />
          </div>
        </div>
      ) : (
        <div className="landing-geometry auth-geometry" aria-hidden="true">
          <div className="geo-corner-tl" />
          <div className="geo-auth-top-line" />
          <div className="geo-bottom-bar">
            <span className="geo-bar-black" />
            <span className="geo-bar-yellow" />
          </div>
          <div className="geo-bottom-right">
            <span className="geo-sq-black" />
            <span className="geo-sq-yellow" />
          </div>
        </div>
      )}

      <header className="landing-header">
        <img
          src={kasperLogoFull}
          alt="Kasper Logo"
          className="landing-logo"
          onClick={() => switchView('landing')}
          title="Voltar para a página inicial"
        />
        {view === 'landing' && (
          <nav className="landing-nav" aria-label="Navegação principal">
            <a
              href="mailto:kasper.support.01@gmail.com"
              className="landing-contact-link"
            >
              Contact
            </a>
          </nav>
        )}
      </header>

      <main className="landing-content">
        {view === 'landing' && (
          <section className="hero-grid" aria-label="Apresentação do Kasper">
            <div className="hero-copy">
              <HeroMessageRotator />
              <div className="hero-divider" aria-hidden="true" />
              <div className="landing-actions">
                <button className="landing-btn btn-primary" onClick={() => switchView('login')}>
                  Login
                </button>
                <button className="landing-btn btn-secondary" onClick={() => switchView('register')}>
                  Cadastrar
                </button>
              </div>
            </div>

            <div className="hero-visual-wrapper">
              <div className="geo-card-backdrop" aria-hidden="true" />
              <div className="stats-card">
                <StudentMatrixCanvas />
                <div className="stats-card-footer">
                  <p className="stats-caption">
                    Cada ponto é um estudante da base de dados. 4.424 ao todo. Os 1.421 em amarelo evadiram.
                  </p>
                  <div className="stats-legend">
                    <span className="legend-dot" aria-hidden="true" />
                    <span>EVADIDO</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {(view === 'login' || view === 'register') && (
          <section className="auth-grid" aria-label={view === 'login' ? 'Entrar no Kasper' : 'Criar conta no Kasper'}>
            <div className="auth-form-column">
              <div className="form-content-wrapper" key={view}>
                {errorMessage && (
                  <div className="auth-error-banner" role="alert">
                    {errorMessage}
                  </div>
                )}

                {view === 'login' ? (
                  <>
                    <form className="auth-form" onSubmit={handleLoginSubmit}>
                      <div className="input-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                          type="email"
                          id="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="password">Senha</label>
                        <input
                          type="password"
                          id="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-options">
                        <label className="remember-me">
                          <input type="checkbox" /> Lembrar de mim
                        </label>
                        <a href="mailto:kasper.support.01@gmail.com?subject=Recupera%C3%A7%C3%A3o%20de%20senha" className="forgot-password">
                          Esqueceu a senha?
                        </a>
                      </div>

                      <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Autenticando...' : 'Login'}
                      </button>
                    </form>

                    <div className="form-footer">
                      Não tem uma conta?{' '}
                      <button type="button" className="form-switch-btn" onClick={() => switchView('register')}>
                        Cadastre-se aqui
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <form className="auth-form" onSubmit={handleRegisterSubmit}>
                      <div className="input-group">
                        <label htmlFor="name">Nome completo</label>
                        <input
                          type="text"
                          id="name"
                          placeholder="Seu nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="reg-email">E-mail</label>
                        <input
                          type="email"
                          id="reg-email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label htmlFor="reg-password">Senha</label>
                        <input
                          type="password"
                          id="reg-password"
                          placeholder="Mínimo de 8 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                      </div>

                      <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                      </button>
                    </form>

                    <div className="form-footer">
                      Já tem uma conta?{' '}
                      <button type="button" className="form-switch-btn" onClick={() => switchView('login')}>
                        Fazer login
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                className="auth-back-arrow-btn"
                onClick={() => switchView('landing')}
                aria-label="Voltar para a página inicial"
                title="Voltar"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  aria-hidden="true"
                >
                  <path d="M19 12H5" />
                  <path d="M11 18l-6-6 6-6" />
                </svg>
              </button>
            </div>

            <div className="auth-visual-wrapper">
              <div className="geo-card-backdrop" aria-hidden="true" />
              <div className="auth-showcase-card">
                <div className="auth-carousel-section">
                  <PhraseCarousel />
                </div>
                <div className="auth-matrix-section">
                  <div className="auth-matrix-fade">
                    <StudentMatrixCanvas />
                  </div>
                  <div className="stats-card-footer">
                    <p className="stats-caption">
                      Cada ponto é um estudante da base de dados. 4.424 ao todo. Os 1.421 em amarelo evadiram.
                    </p>
                    <div className="stats-legend">
                      <span className="legend-dot" aria-hidden="true" />
                      <span>EVADIDO</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <a
        href="https://github.com/danielFiaccadori/kasper-ai-studio"
        target="_blank"
        rel="noopener noreferrer"
        className="github-link"
        title="Ver repositório no GitHub"
      >
        <img src={githubLogo} alt="GitHub" />
      </a>
    </div>
  );
}
