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