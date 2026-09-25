import React, { useState } from 'react';
import kasperLogoFull from '../assets/kasper_logo_full.svg';
import './SettingsPage.css';

export default function SettingsPage() {
  const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'

  return (
    <div className="settings-page">
      <div className="settings-content">
        <div className="settings-section">
          <h2>Aparência</h2>
          <div className="theme-selector-container">
            <div className="theme-options">
              
              <div className="theme-option" onClick={() => setTheme('light')}>
                <div className={`theme-preview light ${theme === 'light' ? 'active' : ''}`}>
                  <div className="preview-inner">
                    <span className="preview-text">Aa</span>
                  </div>
                  {theme === 'light' && (
                    <div className="checkmark">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
                <span className="theme-label">Claro</span>
              </div>

              <div className="theme-option" onClick={() => setTheme('dark')}>
                <div className={`theme-preview dark ${theme === 'dark' ? 'active' : ''}`}>
                  <div className="preview-inner">
                    <span className="preview-text">Aa</span>
                  </div>
                  {theme === 'dark' && (
                    <div className="checkmark">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
                <span className="theme-label">Escuro</span>
              </div>

              <div className="theme-option" onClick={() => setTheme('system')}>
                <div className={`theme-preview system ${theme === 'system' ? 'active' : ''}`}>
                  <div className="preview-inner dark-inner">
                    <span className="preview-text">Aa</span>
                  </div>
                  <div className="preview-inner light-inner">
                    <span className="preview-text">Aa</span>
                  </div>
                  {theme === 'system' && (
                    <div className="checkmark">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                </div>
                <span className="theme-label">Sistema</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="settings-footer">
        <img src={kasperLogoFull} alt="Kasper" className="footer-logo" />
        <span className="app-version">v1.0.0</span>
      </div>
    </div>
  );
}
