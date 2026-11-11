import { useState } from 'react';
import { API_BASE_URL } from '../config';

function URLShortenerForm({ onUrlCreated, onBeforeSubmit, isAuthenticated }) {
    const [url, setUrl] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (onBeforeSubmit && !onBeforeSubmit()) {
            return;
        }

        if (!url) {
            setError('Please enter a URL');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/urls/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    original_url: url,
                    custom_code: customCode || null,
                    is_private: false,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to shorten URL');
            }

            const data = await response.json();
            onUrlCreated(data);

            setUrl('');
            setCustomCode('');
            setShowAdvanced(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-12">
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="url" className="text-sm font-semibold mb-4" style={{ display: 'block' }}>
                            Enter your long URL
                        </label>
                        <input
                            type="url"
                            id="url"
                            className="input"
                            placeholder="https://example.com/very/long/url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>

                    {showAdvanced && (
                        <div className="mb-6">
                            <label htmlFor="customCode" className="text-sm font-semibold mb-4" style={{ display: 'block' }}>
                                Custom Short Code (Optional)
                            </label>
                            <input
                                type="text"
                                id="customCode"
                                className="input"
                                placeholder="my-custom-link"
                                value={customCode}
                                onChange={(e) => setCustomCode(e.target.value)}
                                pattern="[a-zA-Z0-9-_]+"
                                title="Only letters, numbers, hyphens, and underscores allowed"
                            />
                            <small style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                                Only letters, numbers, hyphens, and underscores
                            </small>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', color: '#fca5a5' }}>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    <span>Shortening...</span>
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                                    </svg>
                                    <span>Shorten URL</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <span style={{ display: 'inline-block' }}>{showAdvanced ? 'Hide' : 'Advanced'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default URLShortenerForm;
