// Header.tsx
import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header className="app-header d-flex align-items-center px-4 py-2 position-relative">
      <div className="header-left">
        <h1 className="display-3 mb-0">MySpotify</h1>
        <p className="m-0 text-muted">Your music, your way.</p>
      </div>

      <div className="header-center d-flex gap-3">
        <Link to="/" className="nav-btn">
          Feed
        </Link>
        <Link to="/discover" className="nav-btn">
          Discover
        </Link>
      </div>
    </header>
  );
};

export default Header;
