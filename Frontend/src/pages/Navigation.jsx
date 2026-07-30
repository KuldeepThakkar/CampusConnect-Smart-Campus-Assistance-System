import { useLocation } from "react-router-dom";

function Navigation(){

    const location = useLocation();

    const {
        department,
        branch,
        semester,
        division
    } = location.state || {};

    return (
        <div>
            <h2>Navigation Page</h2>

            <p>Department: {department}</p>
            <p>Branch: {branch}</p>
            <p>Semester: {semester}</p>
            <p>Division: {division}</p>
        </div>
    );

}


export default Navigation;