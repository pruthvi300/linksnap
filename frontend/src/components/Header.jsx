function Header({ user, onSignInClick, onLogout }) {
    return (
        <header className="header">
            <div className="container">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                            <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#8B5CF6" />
                                    <stop offset="100%" stopColor="#EC4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="gradient-text">LinkSnap</span>
                    </div>

                    <nav className="flex items-center gap-4">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                    <div className="rounded-full flex items-center justify-center font-bold text-sm" style={{ width: '2.25rem', height: '2.25rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', color: 'white' }}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                        <span className="font-semibold text-sm">{user.name}</span>
                                        <span className="text-sm" style={{ color: '#94a3b8' }}>{user.email}</span>
                                    </div>
                                </div>

                                <button className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={onLogout}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-primary" style={{ padding: '0.625rem 1.5rem' }} onClick={onSignInClick}>
                                Sign Up
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}

export default Header;
