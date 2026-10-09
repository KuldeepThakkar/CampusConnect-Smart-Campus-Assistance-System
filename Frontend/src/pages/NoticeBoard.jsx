import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { useNotices } from "../context/NoticeContext";
import NoticeCard from "../components/NoticeCard";

function NoticeBoard() {

    const { notices, isLoading, markRead } = useNotices();
    const { user } = useAuth();

    const canCreateNotice = user?.role === "teacher" || user?.role === "admin";

    const [expandedId, setExpandedId] = useState(null);

    const handleToggle = async (notice) => {

        const isOpening = expandedId !== notice._id;

        setExpandedId(isOpening ? notice._id : null);

        // Tapping an unread notice counts as seeing it.
        if (isOpening && notice.isRead === false) {
            await markRead([notice._id]);
        }

    };

    return (
        <div>
            <Link to="/" className="btn-retry" style={{ display: "inline-block", marginBottom: "16px", textDecoration: "none" }}>
                ← Home
            </Link>

            <h2>Notice Board</h2>
            {canCreateNotice && (
                <Link to="/create-notice" style={{ display: "block", marginBottom: "16px", textDecoration: "none" }}>
                    <button type="button" className="btn-primary">Create Notice</button>
                </Link>
            )}

            {isLoading && <p className="status-text">Loading notices...</p>}

            {!isLoading && notices.length === 0 && (
                <p className="status-text">No notices yet.</p>
            )}

            {notices.length > 0 && (
                <div className="results">
                    {notices.map((notice) => (
                        <NoticeCard
                            key={notice._id}
                            notice={notice}
                            isExpanded={expandedId === notice._id}
                            onToggle={handleToggle}
                        />
                    ))}
                </div>
            )}

        </div>
    );

}

export default NoticeBoard;