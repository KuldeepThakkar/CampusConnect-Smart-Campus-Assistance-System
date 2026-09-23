import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LogoutButton() {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <button type="button" className="btn-retry" onClick={handleLogout}>
            Log Out
        </button>
    );

}

export default LogoutButton;