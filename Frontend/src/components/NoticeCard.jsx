function formatPostedAt(isoString) {

    return new Date(isoString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}

function NoticeCard({ notice, isExpanded, onToggle }) {

    // Only students get an isRead flag; teachers/admin never see a dot.
    const isUnread = notice.isRead === false;

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

        </div>
    );

}

export default NoticeCard;