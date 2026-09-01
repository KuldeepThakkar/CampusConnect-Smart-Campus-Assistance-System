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
            </div>
        </div>
    );
}

export default Home;