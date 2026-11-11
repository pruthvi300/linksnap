import { useState } from 'react';
import './AuthPage.css';
import { API_BASE_URL } from '../config';

function AuthPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(false); // Default to Register for new users
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isLogin ? 'login' : 'register';

        try {
            const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Authentication failed');
            }

            if (isLogin) {
                onLogin(data.user, data.access_token);
            } else {
                // After register, automatically login
                const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    }),
                });

                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();
                    onLogin(loginData.user, loginData.access_token);
                } else {
                    setIsLogin(true);
                    setError('Registration successful! Please log in.');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Background Effects */}
            <div className="auth-bg-orb orb-purple"></div>
            <div className="auth-bg-orb orb-pink"></div>

            <div className="auth-content">
                {/* Auth Card */}
                <div className="auth-card">
                    {/* Left Side: Brand */}
                    <div className="auth-brand-side">
                        <div className="brand-logo">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </div>
                        <h1 className="brand-title">LinkSnap</h1>
                        <p className="brand-subtitle">Shorten URLs, expand your reach.</p>
                    </div>

                    {/* Right Side: Form */}
                    <div className="auth-form-side">
                        <div className="auth-toggle">
                            <button
                                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                                onClick={() => { setIsLogin(false); setError(''); }}
                            >
                                Sign Up
                            </button>
                            <button
                                className={`toggle-btn ${isLogin ? 'active' : ''}`}
                                onClick={() => { setIsLogin(true); setError(''); }}
                            >
                                Log In
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required={!isLogin}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="auth-error">
                                    <svg className="error-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="error-text">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-submit-btn"
                            >
                                {loading ? (
                                    <div className="loading-content">
                                        <div className="loading-spinner"></div>
                                        <span>Please wait...</span>
                                    </div>
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </form>

                        <p className="auth-footer">
                            &copy; {new Date().getFullYear()} LinkSnap. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
