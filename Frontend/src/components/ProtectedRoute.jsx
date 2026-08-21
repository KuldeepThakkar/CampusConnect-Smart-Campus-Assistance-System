import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles, requireAcademicSetup, blockIfAlreadySetup }) {

    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <p className="status-text">Loading...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user.role !== "admin" && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    if (user.role === "student" && requireAcademicSetup && !user.academicDetails?.isLocked) {
        return <Navigate to="/setup-academic-details" replace />;
    }

    if (user.role === "student" && blockIfAlreadySetup && user.academicDetails?.isLocked) {
        return <Navigate to="/" replace />;
    }

    return children;

}

export default ProtectedRoute;