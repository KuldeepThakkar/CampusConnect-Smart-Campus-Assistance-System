import { useState } from "react";

import { useNotices } from "../context/NoticeContext";
import { useAuth } from "../context/AuthContext";

// Remembers the ✕ for this visit even if Layout unmounts (e.g. a trip to
// /notices and back). Module state resets on a full page load, so unread
// notices bring the popup back next time the site is opened.
let dismissedForUserId = null;

function NoticePopup() {

    const { user } = useAuth();
    const { notices, unreadCount, markRead } = useNotices();

    const [isDismissed, setIsDismissed] = useState(dismissedForUserId === user?.id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const dismiss = () => {
        dismissedForUserId = user?.id ?? null;
        setIsDismissed(true);
    };

    const unreadNotices = notices.filter((notice) => notice.isRead === false);

    if (isDismissed || unreadCount === 0) {
        return null;
    }

    const handleGotIt = async () => {

        setIsSubmitting(true);

        const ok = await markRead(unreadNotices.map((notice) => notice._id));

        setIsSubmitting(false);

        // On failure keep the popup open so the student can retry.
        if (ok) {
            dismiss();
        }

    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="New notices">
            <div className="modal">

                <div className="modal-header">
                    <h2>New Notices ({unreadNotices.length})</h2>
                    <button
                        type="button"
                        className="modal-close"
                        onClick={dismiss}
                        aria-label="Close"
                        disabled={isSubmitting}
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {unreadNotices.map((notice) => (
                        <div key={notice._id} className="modal-notice">
                            <p className="modal-notice-title">{notice.title}</p>
                            <p className="modal-notice-message">{notice.message}</p>
                            <p className="status-text" style={{ margin: 0 }}>{notice.createdByEmail}</p>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className="btn-primary"
                    onClick={handleGotIt}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Got it"}
                </button>

            </div>
        </div>
    );

}

export default NoticePopup;