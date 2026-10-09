function formatPostedAt(isoString) {

    return new Date(isoString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}

function NoticeCard({ notice, isExpanded, onToggle, currentUser, onDelete, isDeleting }) {

    // Only students get an isRead flag; teachers/admin never see a dot.
    const isUnread = notice.isRead === false;

    // The server re-checks ownership, so this only controls visibility.
    const canDelete = currentUser && (
        currentUser.role === "admin" ||
        (currentUser.role === "teacher" && notice.createdBy === currentUser.id)
    );

    return (
        <div className="card">

            <button
                type="button"
                className="notice-header"
                onClick={() => onToggle(notice)}
                aria-expanded={isExpanded}
            >
                <span className="notice-title">
                    {isUnread && <span className="unread-dot" aria-label="Unread" />}
                    {notice.title}
                </span>
                <span className="notice-chevron">{isExpanded ? "−" : "+"}</span>
            </button>

            <p className="status-text" style={{ margin: "4px 0 0" }}>
                {notice.createdByEmail} · {formatPostedAt(notice.createdAt)}
            </p>

            {isExpanded && (
                <p className="notice-message">{notice.message}</p>
            )}

            {canDelete && (
                <button
                    type="button"
                    className="btn-retry"
                    style={{ marginTop: "12px" }}
                    onClick={() => onDelete(notice._id)}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete Notice"}
                </button>
            )}

        </div>
    );

}

export default NoticeCard;