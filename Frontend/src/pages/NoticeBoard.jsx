import { useState } from "react";
import { Link } from "react-router-dom";

import { deleteNotice } from "../services/notice";
import { useAuth } from "../context/AuthContext";
import { useNotices } from "../context/NoticeContext";
import NoticeCard from "../components/NoticeCard";

function NoticeBoard() {

    const { notices, isLoading, markRead, refreshNotices } = useNotices();
    const { user } = useAuth();

    const [expandedId, setExpandedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const canCreateNotice = user?.role === "teacher" || user?.role === "admin";

    const handleToggle = async (notice) => {

        const isOpening = expandedId !== notice._id;

        setExpandedId(isOpening ? notice._id : null);

        // Tapping an unread notice counts as seeing it.
        if (isOpening && notice.isRead === false) {
            await markRead([notice._id]);
        }

    };

    const handleDelete = async (noticeId) => {

        setDeleteError(null);
        setDeletingId(noticeId);

        try {

            await deleteNotice(noticeId);
            await refreshNotices();

        } catch (error) {

            if (error.response) {
                setDeleteError(error.response.data.message || "Couldn't delete this notice.");
            } else {
                setDeleteError("Something went wrong. Please check your connection.");
            }

        } finally {
            setDeletingId(null);
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

            {deleteError && (
                <div className="error-box">
                    <p>{deleteError}</p>
                </div>
            )}

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
                            currentUser={user}
                            onDelete={handleDelete}
                            isDeleting={deletingId === notice._id}
                        />
                    ))}
                </div>
            )}

        </div>
    );

}

export default NoticeBoard;