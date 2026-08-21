import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>Campus Connect</h1>
            <p>Smart Campus Assistance System</p>

            <Link to="/navigation">
                <button>Get Started</button>
            </Link>
        </div>
    );
}

export default Home;