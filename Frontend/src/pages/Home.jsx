import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>Campus Connect</h1>
            <p>Smart Campus Assistance System</p>

            <div className="home-actions">
                <Link to="/navigation">
                    <button type="button" className="btn-primary">Get Started</button>
                </Link>

                <Link to="/free-classrooms">
                    <button type="button" className="btn-retry">Find Free Classrooms</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;