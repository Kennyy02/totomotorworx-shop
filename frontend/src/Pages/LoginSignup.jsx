import React, { useState } from 'react';
import './CSS/LoginSignup.css';

// ✅ Environment Variable for Deployment
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const passwordPolicy = (pwd) => {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;
  return re.test(pwd);
};

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [agree, setAgree] = useState(false);
  const [titleFading, setTitleFading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordFeedback, setShowPasswordFeedback] = useState(false);

  // ✅ Modal control
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async () => {
    setError("");
    setShowPasswordFeedback(true);

    if (state === "Sign Up") {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all required fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!agree) {
        setError("You must agree to the Terms and Conditions and Privacy Statement.");
        return;
      }
      if (!passwordPolicy(formData.password)) {
        setError("Password does not meet requirements.");
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError("Email and password are required.");
        return;
      }
    }

    setLoading(true);
    try {
      // ✅ CRITICAL FIX: Use API_BASE_URL for deployment
      const url = state === "Login" 
        ? `${API_BASE_URL}/login` 
        : `${API_BASE_URL}/signup`;
      
      const bodyPayload = { ...formData };
      if (state === "Sign Up") bodyPayload.consent = agree;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth-token', data['auth-token']);
        setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        window.location.replace("/");
      } else {
        setError(data.errors || data.error || "Authentication failed.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleState = (newState) => {
    setTitleFading(true);
    setTimeout(() => {
      setState(newState);
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
      setAgree(false);
      setError("");
      setShowPasswordFeedback(false);
      setTitleFading(false);
    }, 200);
  };

  const passwordsMatch =
    state === "Sign Up" &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <div className='loginsignup'>
      <div className={`loginsignup-container ${state === "Sign Up" ? 'signup-active' : ''}`}>
        <h1 className={titleFading ? 'fade-title' : ''}>{state}</h1>

        <div className="username-field-container">
          {state === "Sign Up" && (
            <input
              name='username'
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder='Your Name'
              aria-label="username"
            />
          )}
        </div>

        <div className="loginsignup-fields">
          <input
            name='email'
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder={state === "Login" ? "Email or Username" : "Email address"}
            aria-label="email"
          />

          {/* Password */}
          <div className="password-wrapper">
            <input
              name='password'
              value={formData.password}
              onChange={changeHandler}
              type={showPassword ? "text" : "password"}
              placeholder='Password'
              aria-label="password"
            />
            <span
              className="toggle-password-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* Confirm Password Field */}
          {state === "Sign Up" && (
            <>
              <div className="password-wrapper">
                <input
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={changeHandler}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder='Confirm Password'
                  aria-label="confirm password"
                />
                <span
                  className="toggle-password-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </span>
              </div>

              {/* Live match feedback */}
              {formData.confirmPassword && (
                <p
                  className={`password-match ${
                    passwordsMatch ? "match" : "mismatch"
                  }`}
                >
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </p>
              )}
            </>
          )}
        </div>

        {/* Password Requirements */}
        {state === "Sign Up" && (
          <div className="password-requirements">
            <p>Password must include:</p>
            <ul>
              <li className={`${/[A-Z]/.test(formData.password) ? "valid" : "invalid"} ${showPasswordFeedback ? "show-feedback" : ""}`}>
                At least 1 uppercase letter
              </li>
              <li className={`${/[a-z]/.test(formData.password) ? "valid" : "invalid"} ${showPasswordFeedback ? "show-feedback" : ""}`}>
                At least 1 lowercase letter
              </li>
              <li className={`${/\d/.test(formData.password) ? "valid" : "invalid"} ${showPasswordFeedback ? "show-feedback" : ""}`}>
                At least 1 number
              </li>
              <li className={`${/[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/.test(formData.password) ? "valid" : "invalid"} ${showPasswordFeedback ? "show-feedback" : ""}`}>
                At least 1 special character
              </li>
              <li className={`${formData.password.length >= 8 ? "valid" : "invalid"} ${showPasswordFeedback ? "show-feedback" : ""}`}>
                Minimum 8 characters
              </li>
            </ul>
          </div>
        )}

        {/* Terms and Conditions */}
        {state === "Sign Up" && (
          <div className="loginsignup-terms">
            <div className="loginsignup-agree">
              <input
                id="consent_checkbox"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                aria-label="agree to terms"
              />
              <label htmlFor="consent_checkbox">
                I agree to the{" "}
                <span
                  className="terms-link"
                  onClick={() => { setModalType("terms"); setShowModal(true); }}
                >
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span
                  className="terms-link"
                  onClick={() => { setModalType("privacy"); setShowModal(true); }}
                >
                  Privacy Policy
                </span>
              </label>
            </div>
          </div>
        )}

        {error && <p className="error-message" role="alert">{error}</p>}

        <button
          onClick={() => handleAuth()}
          disabled={loading || (state === "Sign Up" && !agree)}
          style={{ opacity: loading || (state === "Sign Up" && !agree) ? 0.6 : 1 }}
        >
          {loading ? "Please wait..." : "Continue"}
        </button>

        {state === "Sign Up"
          ? <p className="loginsignup-login">Already have an account? <span onClick={() => toggleState("Login")}>Login here</span></p>
          : <p className="loginsignup-login">Create an account? <span onClick={() => toggleState("Sign Up")}>Click here</span></p>
        }
      </div>

      {/* ✅ Modal for Terms and Privacy */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✖</button>
            <h2>{modalType === "terms" ? "Terms and Conditions" : "Privacy Policy"}</h2>

            {modalType === "terms" ? (
              <div className="modal-text">
                <p><strong>1. Account Registration</strong><br />Users must provide accurate and complete information. You are responsible for safeguarding login details.</p>
                <p><strong>2. Password Protection</strong><br />Passwords must meet security standards. Do not share your password with others.</p>
                <p><strong>3. Purchases and Transactions</strong><br />All purchases are subject to availability and price changes.</p>
                <p><strong>4. Prohibited Conduct</strong><br />Misuse of the platform, fraud, or unauthorized access may result in suspension.</p>
                <p><strong>5. Limitation of Liability</strong><br />We are not liable for indirect damages caused by misuse of services.</p>
              </div>
            ) : (
              <div className="modal-text">
                <p><strong>1. Data Collection and Storage</strong><br />We collect and securely store user data in compliance with the Data Privacy Act of 2012 (RA 10173).</p>
                <p><strong>2. Data Usage</strong><br />Data is used to deliver services, improve user experience, and communicate updates.</p>
                <p><strong>3. Password Security</strong><br />Passwords are encrypted and never stored in plain text.</p>
                <p><strong>4. Data Sharing</strong><br />We do not sell or rent personal information. Data may be shared only when legally required.</p>
                <p><strong>5. User Rights</strong><br />Users may request access, correction, or deletion of personal data, or withdraw consent anytime.</p>
                <p><strong>6. Compliance</strong><br />We strictly comply with RA 10173, ensuring responsible data processing.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginSignup;