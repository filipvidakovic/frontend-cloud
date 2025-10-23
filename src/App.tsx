import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/HomePage";
import AuthService from "./services/AuthService";
import DiscoverPage from "./pages/DiscoverPage";
import AddArtistForm from "./components/artist/AddArtistForm";
import UpdateMusicPage from "./pages/UpdateMusicPage";
import SubscriptionsPage from "./pages/SubscriptionPage";
import AlbumPage from "./pages/AlbumPage";
import FeedPage from "./pages/FeedPage";
import UploadAlbumPage from "./pages/UploadAlbumPage";
import UploadMusicPage from "./pages/UploadMusicPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArtistSongsPage from "./pages/ArtistSongsPage";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(AuthService.isAuthenticated());
  const [role, setRole] = useState<string | null>(AuthService.getRole());
  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setRole(null);
    window.location.href = "/login";
  };

  const isAdmin = role === "admin";

  return (
    <>
      <ToastContainer position="bottom-center" autoClose={3000} theme="colored" />

      <Router>
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
          <div className="container">
            <Link className="navbar-brand" to="/">MyApp</Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav me-auto">
                {isLoggedIn && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/feed">Feed</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/discover">Discover</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/subscriptions">Subscriptions</Link></li>
                  </>
                )}


                {/* Admin-only links */}
                {isAdmin && (
                  <>
                    <li className="nav-item"><Link className="nav-link" to="/new-artist">New Artist</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/upload-music">Upload Music</Link></li>
                    <li className="nav-item"><Link className="nav-link" to="/upload-album">Upload Album</Link></li>
                  </>
                )}
              </ul>

              <div className="d-flex">
                {!isLoggedIn ? (
                  <>
                    <Link to="/login" className="btn btn-outline-primary me-2">Sign In</Link>
                    <Link to="/register" className="btn btn-primary">Sign Up</Link>
                  </>
                ) : (
                  <button onClick={handleLogout} className="btn btn-danger">Sign Out</button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="container">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/albums/:albumId" element={<AlbumPage />} />
            <Route path="/login" element={<Login onLoginSuccess={() => {
              setIsLoggedIn(true);
              setRole(AuthService.getRole());
            }} />} />

            <Route path="/register" element={<Register />} />

            {/* Admin-only routes */}
            <Route
              path="/new-artist"
              element={isAdmin ? <AddArtistForm /> : <Navigate to="/" replace />}
            />
            <Route
              path="/upload-music"
              element={isAdmin ? <UploadMusicPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/upload-album"
              element={isAdmin ? <UploadAlbumPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/update-music/:genre/:musicId"
              element={isAdmin ? <UpdateMusicPage /> : <Navigate to="/" replace />}
            />
            <Route path="/artists/:artistId/songs" element={<ArtistSongsPage />} />

            {/* Fallback */}
            <Route path="*" element={<h2 className="text-center">Page Not Found</h2>} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
