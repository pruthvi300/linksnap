import { useState, useEffect } from 'react';
import './index.css';
import { API_BASE_URL } from './config';
import URLShortenerForm from './components/URLShortenerForm';
import URLList from './components/URLList';
import Header from './components/Header';
import AuthPage from './components/AuthPage';

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  // Initialize user directly from localStorage to prevent flash of login screen
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      fetchUrls(token);
    }
  }, []);

  const fetchUrls = async (token = null) => {
    const authToken = token || localStorage.getItem('token');

    if (!authToken) {
      setUrls([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/urls/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUrls(data);
      } else if (response.status === 401) {
        handleLogout();
        showNotification('Session expired. Please login again.', 'error');
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    // Save to local storage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);
    fetchUrls(token);
    showNotification(`Welcome back, ${userData.name}! 👋`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUrls([]);
    showNotification('Logged out successfully', 'success');
  };

  const handleUrlCreated = (newUrl) => {
    setUrls([newUrl, ...urls]);
    showNotification('URL shortened successfully! 🎉', 'success');
  };

  const handleDeleteUrl = (deletedId) => {
    setUrls(urls.filter(url => url.id !== deletedId));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateUrl = () => {
    if (!user) {
      // No need to show modal, we redirect to AuthPage (handled by render logic)
      showNotification('Please sign in to create short URLs', 'error');
      return false;
    }
    return true;
  };

  return (
    <>
      {!user ? (
        // Show full-page authentication if not logged in
        <AuthPage onLogin={handleLogin} />
      ) : (
        // Show main app if logged in
        <div style={{ minHeight: '100vh' }}>
          <Header
            user={user}
            onSignInClick={() => { }} // No modal to open anymore
            onLogout={handleLogout}
          />

          <main className="container py-8">
            {notification && (
              <div className={`notification notification-${notification.type}`}>
                <span>{notification.message}</span>
              </div>
            )}

            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                Shorten Your URLs
                <br />
                In Seconds
              </h1>
              <p className="text-lg" style={{ color: '#94a3b8' }}>
                Create short, memorable links that are easy to share.
              </p>
            </div>

            <URLShortenerForm
              onUrlCreated={handleUrlCreated}
              onBeforeSubmit={handleCreateUrl}
              isAuthenticated={!!user}
            />

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Your Shortened URLs</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                  <p style={{ color: '#94a3b8' }}>Loading your URLs...</p>
                </div>
              ) : (
                <URLList urls={urls} onCopy={showNotification} onDelete={handleDeleteUrl} />
              )}
            </div>
          </main>

          <footer style={{ borderTop: '1px solid #1e293b', marginTop: '6rem', padding: '2rem 0', textAlign: 'center', color: '#64748b' }}>
            <p>Built with ❤️ using FastAPI & React</p>
          </footer>
        </div>
      )}
    </>
  );
}

export default App;
