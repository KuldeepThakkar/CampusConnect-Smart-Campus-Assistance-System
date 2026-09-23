import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { verifyOtp } from "../services/auth";

function VerifyOtp() {

    const location = useLocation();
    const navigate = useNavigate();

    const { login } = useAuth();

    const { email, role } = location.state || {};

    const [code, setCode] = useState("");
    const [adminCode, setAdminCode] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    if (!email || !role) {

        return (
            <div>
                <div className="error-box">
                    <p>No signup in progress. Please sign up first.</p>
                </div>
                <Link to="/signup" className="btn-primary" style={{ display: "block", textAlign: "center", textDecoration: "none", lineHeight: "48px" }}>
                    Go to Signup
                </Link>
            </div>
        );

    }

    const handleVerify = async () => {

        if (!code || (role === "teacher" && !adminCode)) {
            setErrorMessage("Please enter the required code(s).");
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {

            const response = await verifyOtp({
                email,
                code,
                adminCode: role === "teacher" ? adminCode : undefined
            });

            login(response.data.token, response.data.user);

            navigate("/");

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Verification failed.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div>
            <h2>Verify Your Account</h2>

            <p className="status-text">
                We've sent a code to <strong>{email}</strong>
                {role === "teacher" && " and an approval code to the admin"}.
            </p>

            {errorMessage && (
                <div className="error-box">
                    <p>{errorMessage}</p>
                </div>
            )}

            <div className="field">
                <label htmlFor="code">Your Code</label>
                <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="otp-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            {role === "teacher" && (
                <div className="field">
                    <label htmlFor="adminCode">Admin Approval Code</label>
                    <input
                        id="adminCode"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="otp-input"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            )}

            <button
                type="button"
                className="btn-primary"
                onClick={handleVerify}
                disabled={isLoading}
            >
                {isLoading ? "Verifying..." : "Verify Account"}
            </button>

        </div>
    );

}

export default VerifyOtp;