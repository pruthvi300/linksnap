import { useState } from 'react';
import { API_BASE_URL } from '../config';

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
    const [isLogin, setIsLogin] = useState(false); // Changed to false to show Sign Up first
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const body = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Authentication failed');
            }

            const data = await response.json();

            if (isLogin) {
                // Store token and user info
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onAuthSuccess(data.user);
            } else {
                // After registration, switch to login
                setIsLogin(true);
                setError('');
                setFormData({ name: '', email: '', password: '' });
                // Show success message
                alert('Registration successful! Please login.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({ name: '', email: '', password: '' });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="modal-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="modal-header">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Sign in to manage your URLs' : 'Sign up to get started'}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="modal-label">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="modal-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="modal-label">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="modal-input"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="modal-label">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="modal-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                    </div>

                    {error && (
                        <div className="modal-error">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                            </>
                        ) : (
                            isLogin ? 'Sign In' : 'Sign Up'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="modal-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        {' '}
                        <button type="button" className="link-btn" onClick={switchMode}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
