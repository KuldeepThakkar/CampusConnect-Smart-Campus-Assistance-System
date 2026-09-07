import { Outlet, Link } from "react-router-dom";

import LogoutButton from "./LogoutButton";
import { useAuth } from "../context/AuthContext";

function Layout(){

    const { user } = useAuth();

    return (

        <div>

            <header className="app-header">
                <h1>
                    Class Locator
                </h1>

                {user && (
                    <nav className="app-nav">
                        <Link to="/">Home</Link>
                        <Link to="/free-classrooms">Free Classrooms</Link>
                        {user.role === "teacher" && (
                            <Link to="/teacher-dashboard">Reserve Classroom</Link>
                        )}
                    </nav>
                )}

                {user && <LogoutButton />}
            </header>


            <main>
                <Outlet />
            </main>


        </div>

    )

}

export default Layout;