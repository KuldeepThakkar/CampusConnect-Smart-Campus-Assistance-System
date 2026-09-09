import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Home() {

    const { user } = useAuth();

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
                    </>
                )}

            </div>
        </div>
    );

}

export default Home;