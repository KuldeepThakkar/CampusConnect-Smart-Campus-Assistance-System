import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { signup } from "../services/auth";

function Signup() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSignup = async () => {

        if (!email || !password) {
            setErrorMessage("Please enter your email and password.");
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {

            await signup({ email, password, role });

            navigate("/verify-otp", {
                state: { email, role }
            });

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Signup failed.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div>
            <h2>Create Account</h2>

            {errorMessage && (
                <div className="error-box">
                    <p>{errorMessage}</p>
                </div>
            )}

            <div className="field">
                <label htmlFor="role">I am a</label>
                <div className="toggle-group">
                    <button
                        type="button"
                        className={`toggle-option ${role === "student" ? "active" : ""}`}
                        onClick={() => setRole("student")}
                        disabled={isLoading}
                    >
                        Student
                    </button>
                    <button
                        type="button"
                        className={`toggle-option ${role === "teacher" ? "active" : ""}`}
                        onClick={() => setRole("teacher")}
                        disabled={isLoading}
                    >
                        Teacher
                    </button>
                </div>
            </div>

            <div className="field">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname.23.branch@iite.indusuni.ac.in"
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
                    placeholder="At least 6 characters"
                    disabled={isLoading}
                />
            </div>

            <button
                type="button"
                className="btn-primary"
                onClick={handleSignup}
                disabled={isLoading}
            >
                {isLoading ? "Creating account..." : "Sign Up"}
            </button>

            <p className="auth-footer">
                Already have an account? <Link to="/login">Log in</Link>
            </p>

        </div>
    );

}

export default Signup;