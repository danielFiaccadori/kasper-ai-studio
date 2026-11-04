import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import kasperLogoFull from '../assets/kasper_logo_full.svg';
import githubLogo from '../assets/github_logo.png';
import { kasperApi } from '../services/KasperApiClient';
import './LoginPage.css';

const phrases = [
  "Prevendo o futuro da educação, um aluno de cada vez.",
  "Antecipe a evasão escolar e aja no momento certo.",
  "Transformando dados em oportunidades de permanência.",
  "Gestão inteligente para instituições de ensino do futuro."
];

function PhraseCarousel() {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-container">
      <div className="carousel-content">
        <h3 key={index} className="carousel-text">{phrases[index]}</h3>
      </div>
      <div className="carousel-indicators">
        {phrases.map((_, i) => (
          <span key={i} className={`indicator ${i === index ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

function AnimatedDots() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = 0;
    let height = 0;
    let dots = [];
    const spacing = 20; // Diminuído de 28 para 20 para aumentar a densidade
    let time = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
      
      initDots();
    };

    const initDots = () => {
      dots = [];
      const cols = Math.floor(width / spacing) + 1;
      const rows = Math.floor(height / spacing) + 1;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            x: i * spacing,
            y: j * spacing,
            randomOffset: Math.random() * Math.PI * 2,
            distanceOffset: Math.sqrt(Math.pow(i * spacing - width/2, 2) + Math.pow(j * spacing - height/2, 2)) / 120
          });
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; 
      
      time += 0.02;

      dots.forEach(dot => {
        const wave = Math.sin(time - dot.distanceOffset) * 0.5 + 0.5;
        const randomWave = Math.sin(time * 0.7 + dot.randomOffset) * 0.5 + 0.5;
        
        const radius = 0.5 + (wave * randomWave) * 2; 

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }} 
    />
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
      setErrorMessage(err.message || 'Erro ao realizar login.');
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
      setErrorMessage(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <AnimatedDots />
      <div className="landing-glow"></div>
      
      {view === 'landing' && (
        <header className="landing-header">
          <img 
            src={kasperLogoFull} 
            alt="Kasper Logo" 
            className="landing-logo" 
            onClick={() => setView('landing')}
            style={{ cursor: 'pointer' }}
            title="Voltar para a página inicial"
          />
        </header>
      )}

      <main className="landing-content">
        <div className="view-container">
          
          {view === 'landing' && (
            <>
              <h1 className="landing-title">
                Eleve o gerenciamento de membros de forma precisa
              </h1>
              <p className="landing-description">
                Kasper, uma ferramenta para ajudar escolas e instituições a preverem evasão escolar,<br />
                oferecendo ferramentas úteis e práticas para APIs de gestão
              </p>
              
              <div className="landing-actions">
                <button className="landing-btn btn-primary" onClick={() => switchView('login')}>
                  Login
                </button>
                <button className="landing-btn btn-secondary" onClick={() => switchView('register')}>
                  Cadastrar
                </button>
              </div>
            </>
          )}

          {(view === 'login' || view === 'register') && (
            <div className="split-card">
              <div className="split-left">
                <img 
                  src={kasperLogoFull} 
                  alt="Kasper Logo" 
                  className="card-logo" 
                  onClick={() => switchView('landing')}
                  title="Voltar"
                />
                
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
                          <label htmlFor="email">Email</label>
                          <input 
                            type="email" 
                            id="email" 
                            placeholder="Enter your email address" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                          />
                        </div>
                        
                        <div className="input-group">
                          <label htmlFor="password">Password</label>
                          <input 
                            type="password" 
                            id="password" 
                            placeholder="Enter your Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                          />
                        </div>
                        
                        <div className="form-options">
                          <label className="remember-me">
                            <input type="checkbox" /> Remember me
                          </label>
                          <a href="#" className="forgot-password">Forgot Password?</a>
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                          {isLoading ? 'Autenticando...' : 'Login'}
                        </button>
                      </form>
                      
                      <div className="form-footer" style={{ marginTop: '28px' }}>
                        Don't have an account? <span onClick={() => switchView('register')}>Register here</span>
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
                      
                      <div className="form-footer" style={{ marginTop: '28px' }}>
                        Já tem uma conta? <span onClick={() => switchView('login')}>Fazer login</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="split-right">
                <PhraseCarousel />
              </div>
            </div>
          )}

        </div>
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
