import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { login as loginRequest } from "../services/auth";
import { useAuth } from "../context/AuthContext";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleLogin = async () => {

        if (!email || !password) {
            setErrorMessage("Please enter your email and password.");
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {

            const response = await loginRequest({ email, password });

            login(response.data.token, response.data.user);

            navigate("/");

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Login failed.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div>
            <h2>Log In</h2>

            {errorMessage && (
                <div className="error-box">
                    <p>{errorMessage}</p>
                </div>
            )}

            <div className="field">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div className="field">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <button
                type="button"
                className="btn-primary"
                onClick={handleLogin}
                disabled={isLoading}
            >
                {isLoading ? "Logging in..." : "Log In"}
            </button>

            <p className="auth-footer">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>

        </div>
    );

}

export default Login;