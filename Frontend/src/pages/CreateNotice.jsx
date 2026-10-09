import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { createNotice } from "../services/notice";
import { useNotices } from "../context/NoticeContext";

const MAX_TITLE_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 1000;

function CreateNotice() {

    const navigate = useNavigate();
    const { refreshNotices } = useNotices();

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {

        e.preventDefault();

        setIsSubmitting(true);
        setErrorMessage(null);

        try {

            await createNotice({ title, message });

            // The context only loads on login, so refresh it here so the
            // board shows the new notice immediately.
            await refreshNotices();

            navigate("/notices");

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Couldn't post notice.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsSubmitting(false);
        }

    };

    return (
        <div>
            <Link to="/notices" className="btn-retry" style={{ display: "inline-block", marginBottom: "16px", textDecoration: "none" }}>
                ← Back to Notice Board
            </Link>

            <h2>Create Notice</h2>

            <form onSubmit={handleSubmit}>

                <div className="field">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={MAX_TITLE_LENGTH}
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="field">
                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={MAX_MESSAGE_LENGTH}
                        rows={6}
                        disabled={isSubmitting}
                        required
                    />
                    <p className="status-text" style={{ margin: "4px 0 0" }}>
                        {message.length}/{MAX_MESSAGE_LENGTH}
                    </p>
                </div>

                {errorMessage && (
                    <div className="error-box">
                        <p>{errorMessage}</p>
                    </div>
                )}

                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post Notice"}
                </button>

            </form>

        </div>
    );

}

export default CreateNotice;