import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./components/HomePage";
import AddArtistForm from "./components/AddArtistForm";
import AuthService from "./services/AuthService";
import { useState } from "react";

function App() {


  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(AuthService.isAuthenticated());

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
  };
  return (
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
                <Link className="nav-link" to="/new-artist">
                  New Artist
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/new-content">
                  New Content
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<h2 className="text-center">Page Not Found</h2>} />
          <Route path="/new-artist" element={<AddArtistForm/>} />
          <Route path="/new-content" element={<h2 className="text-center">New Content Page</h2>} />
          <Route path="/discover" element={<h2 className="text-center">Discover Page</h2>} />
          <Route path="/subscriptions" element={<h2 className="text-center">Subscriptions Page</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
