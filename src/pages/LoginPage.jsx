import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import kasperLogoFull from '../assets/kasper_logo_full.svg';
import githubLogo from '../assets/github_logo.png';
import './LoginPage.css';

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
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    navigate('/keys');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    navigate('/keys');
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
                <button className="landing-btn btn-primary" onClick={() => setView('login')}>
                  Login
                </button>
                <button className="landing-btn btn-secondary" onClick={() => setView('register')}>
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
                  onClick={() => setView('landing')}
                  title="Voltar"
                />
                
                <div className="form-content-wrapper" key={view}>
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

                        <button type="submit" className="submit-btn">Login</button>
                      </form>
                      
                      <div className="divider">
                        <span>Or Continue With</span>
                      </div>
                      
                      <div className="social-login">
                        <button className="social-btn google" type="button">
                          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/24/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="form-footer">
                        Don't have an account? <span onClick={() => setView('register')}>Register here</span>
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
                            placeholder="Crie uma senha forte" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                          />
                        </div>

                        <button type="submit" className="submit-btn">Cadastrar</button>
                      </form>
                      
                      <div className="form-footer" style={{ marginTop: '32px' }}>
                        Já tem uma conta? <span onClick={() => setView('login')}>Fazer login</span>
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
