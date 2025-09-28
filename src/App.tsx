import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/HomePage";
import AuthService from "./services/AuthService";
import { useState } from "react";
import DiscoverPage from "./pages/DiscoverPage";
import AddArtistForm from "./components/artist/AddArtistForm";
import UpdateMusicPage from "./pages/UpdateMusicPage";
import SubscriptionsPage from "./pages/SubscriptionPage";
import AlbumPage from "./pages/AlbumPage";
import FeedPage from "./pages/FeedPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadAlbumPage from "./pages/UploadAlbumPage";
import UploadMusicPage from "./pages/UploadMusicPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    AuthService.isAuthenticated()
  );

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
  };
  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <Router>
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm mb-4">
          <div className="container">
            <Link className="navbar-brand" to="/">
              MyApp
            </Link>
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
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/feed">
                    Feed
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/new-artist">
                    New Artist
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/upload-music">
                    Upload Music
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/upload-album/">
                    Upload Album
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/discover">
                    Discover
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/subscriptions">
                    Subscriptions
                  </Link>
                </li>
              </ul>
              <div className="d-flex">
                {!isLoggedIn ? (
                  <>
                    <Link to="/login" className="btn btn-outline-primary me-2">
                      Sign In
                    </Link>
                    <Link to="/register" className="btn btn-primary">
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <button onClick={handleLogout} className="btn btn-danger">
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/update-music/:genre/:musicId"
              element={<UpdateMusicPage />}
            />
            <Route path="/albums/:albumId" element={<AlbumPage />} />
            <Route
              path="*"
              element={<h2 className="text-center">Page Not Found</h2>}
            />
            <Route path="/new-artist" element={<AddArtistForm />} />

            <Route path="/upload-album" element={<UploadAlbumPage />} />
            <Route path="/upload-music" element={<UploadMusicPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
