import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../config';

// Fixed Tooltip Component
function Tooltip({ text, children }) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.top,
                left: rect.left + rect.width / 2
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <>
            <div
                ref={triggerRef}
                className="tooltip-trigger"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {isVisible && createPortal(
                <div
                    className="tooltip-fixed"
                    style={{ top: position.top, left: position.left }}
                >
                    {text}
                </div>,
                document.body
            )}
        </>
    );
}

// Reusable Dialog Component
function Dialog({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return createPortal(
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-content" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div className="dialog-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

function URLStats({ shortCode }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/analytics/${shortCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [shortCode]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="spinner mb-4" style={{ width: '2rem', height: '2rem', borderTopColor: '#8b5cf6' }}></div>
            <span>Loading stats...</span>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-900/20 text-red-400 rounded-lg text-center border border-red-900/50">
            <div className="mb-2">⚠️ Error loading stats</div>
            <div className="text-sm opacity-80">{error}</div>
        </div>
    );

    if (!stats) return null;

    return (
        <div>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 gap-4 mb-8">
                <div className="stat-card">
                    <span className="text-sm text-gray-400 block mb-2 uppercase tracking-wider font-semibold">Total Clicks</span>
                    <span className="text-5xl font-bold gradient-text">{stats.total_clicks}</span>
                </div>
            </div>

            {/* Chart */}
            {stats.chart_data && stats.chart_data.length > 0 ? (
                <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Last 7 Days Activity</h4>
                    <div className="flex items-end gap-3 h-48 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                        {stats.chart_data.map((item, index) => (
                            <div
                                key={index}
                                className="flex-1 flex flex-col items-center gap-3 group relative"
                            >
                                {/* Tooltip for bar */}
                                <div className="absolute bottom-full mb-3 bg-gray-800 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-10 border border-gray-700 shadow-xl font-medium">
                                    {item.count} clicks on {new Date(item.date).toLocaleDateString()}
                                </div>

                                <div className="w-full relative h-full flex items-end">
                                    <div
                                        className="w-full rounded-t-lg transition-all duration-300 hover:opacity-90 group-hover:scale-y-105 origin-bottom"
                                        style={{
                                            height: `${Math.max((item.count / Math.max(...stats.chart_data.map(d => d.count), 1)) * 100, 5)}%`,
                                            background: 'linear-gradient(to top, #7c3aed, #ec4899)',
                                            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
                                        }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">
                                    {new Date(item.date).getDate()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-900/30 rounded-xl border border-gray-800 border-dashed">
                    No activity in the last 7 days
                </div>
            )}
        </div>
    );
}

function URLQrCode({ shortCode }) {
    const qrUrl = `${API_BASE_URL}/urls/${shortCode}/qr`;

    const handleDownload = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-${shortCode}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to download QR code:', err);
            alert('Failed to download QR code');
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="qr-container">
                <img
                    src={qrUrl}
                    alt={`QR Code for ${shortCode}`}
                    className="w-56 h-56"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>

            <p className="text-gray-400 text-sm text-center mb-6 max-w-xs">
                Scan this code to instantly visit <br />
                <span className="text-white font-mono mt-1 block">{API_BASE_URL.replace(/^https?:\/\//, '')}/urls/{shortCode}</span>
            </p>

            <button
                onClick={handleDownload}
                className="btn btn-primary w-full"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download PNG Image
            </button>
        </div>
    );
}

function URLList({ urls, onCopy, onDelete }) {
    const [copiedId, setCopiedId] = useState(null);
    const [activeDialog, setActiveDialog] = useState(null); // { type: 'stats' | 'qr', id: string, shortCode: string }
    const [deletingId, setDeletingId] = useState(null);

    const copyToClipboard = async (shortCode, id) => {
        const shortUrl = `${API_BASE_URL}/urls/${shortCode}`;
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopiedId(id);
            onCopy('Copied to clipboard! 📋', 'success');
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            onCopy('Failed to copy', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingId(id);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/urls/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete URL');

            if (onDelete) onDelete(id);
            onCopy('URL deleted successfully', 'success');
        } catch (err) {
            console.error('Error deleting URL:', err);
            onCopy('Failed to delete URL', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const openStats = (url) => {
        setActiveDialog({ type: 'stats', id: url.id, shortCode: url.short_code });
    };

    const openQr = (url) => {
        setActiveDialog({ type: 'qr', id: url.id, shortCode: url.short_code });
    };

    const closeDialog = () => {
        setActiveDialog(null);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (urls.length === 0) {
        return (
            <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor">
                    <circle cx="32" cy="32" r="30" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                    <path d="M32 20V32M32 44H32.02" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <h3>No URLs yet</h3>
                <p>Start by shortening your first URL above!</p>
            </div>
        );
    }

    return (
        <>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '35%' }}>Original URL</th>
                            <th style={{ width: '30%' }}>Short Link</th>
                            <th style={{ width: '15%' }}>Created</th>
                            <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {urls.map((urlItem) => (
                            <tr key={urlItem.id}>
                                <td>
                                    <Tooltip text={urlItem.original_url}>
                                        <div style={{
                                            maxWidth: '250px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            <a
                                                href={urlItem.original_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-gray-300 hover:text-white transition-colors"
                                                style={{ color: '#cbd5e1', textDecoration: 'none' }}
                                            >
                                                {urlItem.original_url}
                                            </a>
                                        </div>
                                    </Tooltip>
                                </td>
                                <td>
                                    <a
                                        href={`${API_BASE_URL}/urls/${urlItem.short_code}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-sm font-bold gradient-text"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        {API_BASE_URL}/urls/{urlItem.short_code}
                                    </a>
                                </td>
                                <td>
                                    <span className="text-sm text-gray-400">
                                        {formatDate(urlItem.created_at)}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center justify-end gap-2">
                                        {/* QR Code Button */}
                                        <button
                                            className="table-action-btn"
                                            onClick={() => openQr(urlItem)}
                                            title="QR Code"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="7" height="7"></rect>
                                                <rect x="14" y="3" width="7" height="7"></rect>
                                                <rect x="14" y="14" width="7" height="7"></rect>
                                                <path d="M3 21h7v-7H3z"></path>
                                            </svg>
                                        </button>

                                        {/* Stats Button */}
                                        <button
                                            className="table-action-btn"
                                            onClick={() => openStats(urlItem)}
                                            title="View Stats"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                                <line x1="6" y1="20" x2="6" y2="14"></line>
                                            </svg>
                                        </button>

                                        {/* Copy Button */}
                                        <button
                                            className={`table-action-btn ${copiedId === urlItem.id ? 'active' : ''}`}
                                            onClick={() => copyToClipboard(urlItem.short_code, urlItem.id)}
                                            title="Copy Link"
                                            style={copiedId === urlItem.id ? { color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)' } : {}}
                                        >
                                            {copiedId === urlItem.id ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                </svg>
                                            )}
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            className="table-action-btn delete"
                                            onClick={() => handleDelete(urlItem.id)}
                                            title="Delete URL"
                                            disabled={deletingId === urlItem.id}
                                        >
                                            {deletingId === urlItem.id ? (
                                                <div className="spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#ef4444' }}></div>
                                            ) : (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Dialogs */}
            <Dialog
                isOpen={activeDialog?.type === 'stats'}
                onClose={closeDialog}
                title="Link Statistics"
            >
                {activeDialog?.type === 'stats' && (
                    <URLStats shortCode={activeDialog.shortCode} />
                )}
            </Dialog>

            <Dialog
                isOpen={activeDialog?.type === 'qr'}
                onClose={closeDialog}
                title="QR Code"
            >
                {activeDialog?.type === 'qr' && (
                    <URLQrCode shortCode={activeDialog.shortCode} />
                )}
            </Dialog>
        </>
    );
}

export default URLList;
