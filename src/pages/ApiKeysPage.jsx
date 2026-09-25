import React, { useState } from 'react';
import { LuSearch, LuPlus, LuCopy, LuTrash2, LuKey, LuEye, LuEyeOff } from 'react-icons/lu';
import kasperIcon from '../assets/kasper_logo_icon_large.svg';
import './ApiKeysPage.css';

export default function ApiKeysPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [keys, setKeys] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  const filteredKeys = keys.filter(k => 
    k.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    k.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteKey = (id) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  const toggleVisibility = (id) => {
    setVisibleKeys(prev => 
      prev.includes(id) ? prev.filter(keyId => keyId !== id) : [...prev, id]
    );
  };

  const generateMockKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'KASP-';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCreateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey = {
      id: Date.now(),
      name: newKeyName.trim(),
      key: generateMockKey(),
      createdAt: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setKeys([newKey, ...keys]);
    setIsModalOpen(false);
    setNewKeyName('');
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="api-keys-container">
      {/* Modal de Criação */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Criar nova chave de API</h2>
            <p className="modal-subtitle">Dê um nome para identificar a sua chave.</p>
            <form onSubmit={handleCreateKey}>
              <div className="modal-input-group">
                <label htmlFor="keyName">Nome da chave</label>
                <input 
                  type="text" 
                  id="keyName" 
                  placeholder="Ex: Chave de Produção" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  autoFocus
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="modal-btn confirm" disabled={!newKeyName.trim()}>Criar chave</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="api-keys-header">
        <h1 className="page-title">Chaves de API</h1>
        <button 
          className="create-key-btn" 
          onClick={() => setIsModalOpen(true)}
          onMouseMove={handleMouseMove}
        >
          <LuPlus size={16} />
          <span>Criar chave de API</span>
        </button>
      </header>

      <div className="api-keys-toolbar">
        <div className="search-bar">
          <LuSearch size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Pesquisar chaves de API..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="api-keys-table">
          <thead>
            <tr>
              <th>Chave</th>
              <th>Criado em</th>
              <th className="actions-header"></th>
            </tr>
          </thead>
          <tbody>
            {filteredKeys.length > 0 ? (
              filteredKeys.map(k => (
                <tr key={k.id}>
                  <td className="key-main-cell">
                    <div className="key-string-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="key-value">
                        {visibleKeys.includes(k.id) ? k.key : '•'.repeat(k.key.length - 4) + k.key.slice(-4)}
                      </span>
                      <button 
                        className="icon-btn"
                        onClick={() => toggleVisibility(k.id)}
                        style={{ padding: '2px', opacity: 0.6 }}
                        title={visibleKeys.includes(k.id) ? "Ocultar chave" : "Mostrar chave"}
                      >
                        {visibleKeys.includes(k.id) ? <LuEyeOff size={14} /> : <LuEye size={14} />}
                      </button>
                    </div>
                    <div className="key-name-subtitle">{k.name}</div>
                  </td>
                  <td className="key-date">{k.createdAt}</td>
                  <td className="key-actions">
                    <div className="key-actions-wrapper">
                      <button 
                        className={`icon-btn copy-btn ${copiedId === k.id ? 'copied' : ''}`} 
                        aria-label="Copiar chave" 
                        title="Copiar chave"
                        onClick={() => copyToClipboard(k.id, k.key)}
                      >
                        <LuCopy size={16} />
                        {copiedId === k.id && <span className="copy-tooltip">Copiado!</span>}
                      </button>
                      <button 
                        className="icon-btn danger" 
                        aria-label="Excluir chave" 
                        title="Excluir chave"
                        onClick={() => deleteKey(k.id)}
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-row">
                <td colSpan="4" className="empty-state">
                  <div className="empty-state-content">
                    <img 
                      src={kasperIcon} 
                      alt="Kasper" 
                      width={100} 
                      height={100} 
                      style={{ opacity: 0.8, marginBottom: '16px' }} 
                    />
                    <h3>Não encontrou suas chaves de API?</h3>
                    <p>Nenhuma chave corresponde à sua pesquisa. Tente usar outros termos ou crie uma nova chave de API acima.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
