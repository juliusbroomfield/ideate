import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

export default function SignInPage() {
  const [username, setUsername] = useState("");

  const handleUsernameChange = (e) => setUsername(e.target.value);

  const userState = {
    user: username,
  };

  return (
    <div className="signin-page-container">
      <div className="signin-content">
        <h2 className="signin-heading">Sign in to us</h2>
        <form className="signin-form" action="/home">
          <div className="signin-form-group">
            <label>Username or email address</label>
            <input
              className="signin-form-input"
              type="text"
              name="first_name"
              required
              onChange={handleUsernameChange}
            />
          </div>
          <div className="signin-form-group">
            <label>Password</label>
            <Link className="signin-link" to="/forget-password">
              <label className="right-label">Forgot password?</label>
            </Link>
            <input
              className="signin-form-input"
              type="password"
              name="password"
              required
            />
          </div>
          <div className="signin-form-group">
            <Link to="/record" state={userState}>
              <button className="signin-button" id="sub_btn" type="button">
                Login
              </button>
            </Link>
          </div>
        </form>
        <footer className="signin-footer">
          <p>
            First time?{" "}
            <Link className="signin-link" to="/">
              Create an account
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}