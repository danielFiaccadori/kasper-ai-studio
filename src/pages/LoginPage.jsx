import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import kasperLogoFull from '../assets/kasper_logo_full.svg';
import './LoginPage.css';

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

      <main className="landing-content">
        <div className="view-container" key={view}>
          
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

          {view === 'login' && (
            <div className="form-card">
              <h2 className="form-title">Bem-vindo de volta</h2>
              <p className="form-subtitle">Faça login para continuar no estúdio</p>
              
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
                  <div className="label-with-link">
                    <label htmlFor="password">Senha</label>
                    <a href="#" className="forgot-password">Esqueceu a senha?</a>
                  </div>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>

                <button type="submit" className="submit-btn">Entrar</button>
              </form>
              
              <div className="form-footer">
                Não tem uma conta? <span onClick={() => setView('register')}>Criar agora</span>
              </div>
            </div>
          )}

          {view === 'register' && (
            <div className="form-card">
              <h2 className="form-title">Criar uma conta</h2>
              <p className="form-subtitle">Comece a prever a evasão escolar agora</p>
              
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
              
              <div className="form-footer">
                Já tem uma conta? <span onClick={() => setView('login')}>Fazer login</span>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
