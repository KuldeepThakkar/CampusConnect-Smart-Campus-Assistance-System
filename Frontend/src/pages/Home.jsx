import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useNotices } from "../context/NoticeContext";

function Home() {

    const { user } = useAuth();
    const { unreadCount } = useNotices();

    return (
        <div>
            <h1>Campus Connect</h1>
            <p>Smart Campus Assistance System</p>

            <div className="home-actions">

                {!user && (
                    <Link to="/navigation">
                        <button type="button" className="btn-primary">Get Started</button>
                    </Link>
                )}

                {user?.role === "student" && (
                    <>
                        <Link to="/navigation">
                            <button type="button" className="btn-primary">Find Your Class</button>
                        </Link>
                        <Link to="/free-classrooms">
                            <button type="button" className="btn-primary">Free Classroom</button>
                        </Link>
                        <Link to="/events">
                            <button type="button" className="btn-primary">Events</button>
                        </Link>
                        <Link to="/notices">
                            <button type="button" className="btn-primary btn-with-dot">
                                Notice Board
                                {unreadCount > 0 && <span className="unread-dot unread-dot-on-button" aria-label="Unread notices" />}
                            </button>
                        </Link>
                    </>
                )}

                {(user?.role === "teacher" || user?.role === "admin") && (
                    <>
                        <Link to="/free-classrooms">
                            <button type="button" className="btn-primary">Free Classroom</button>
                        </Link>
                        <Link to="/teacher-dashboard">
                            <button type="button" className="btn-primary">Reservation Classroom</button>
                        </Link>
                        <Link to="/events">
                            <button type="button" className="btn-primary">Events</button>
                        </Link>
                        <Link to="/notices">
                            <button type="button" className="btn-primary">Notice Board</button>
                        </Link>
                    </>
                )}

            </div>
        </div>
    );

}

export default Home;