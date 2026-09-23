import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div>
            <h2>Page Not Found</h2>
            <p className="status-text">The page you're looking for doesn't exist.</p>
            <Link to="/">
                <button type="button" className="btn-primary">Go Home</button>
            </Link>
        </div>
    );
}

export default NotFound;