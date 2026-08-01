import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNextClass } from "../services/navigation";

import api from "../api/axios";

function Selection(){

    const navigate = useNavigate();

    const [academicData, setAcademicData] = useState({});
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null
    });
    const [navigationData, setNavigationData] = useState(null);

    const [department, setDepartment] = useState("");
    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("");
    const [division, setDivision] = useState("");

    const departments = Object.keys(academicData);
    const branches =department ? Object.keys(academicData[department]) : [];
    const semesters =department && branch ? Object.keys(academicData[department][branch]) : [];
    const divisions = department && branch && semester ? academicData[department][branch][semester] : [];

    

    const fetchAcademicOptions = async () => {
        try {
            const response = await api.get("/timetable/options");

            setAcademicData(response.data.data);

        } catch (error) {
            console.error(error);
        }
    }; 

    const handleDepartmentChange = (e) => {

        const value = e.target.value;

        setDepartment(value);
        setBranch("");
        setSemester("");
        setDivision("");

    };

    const handleBranchChange = (e) => {

        const value = e.target.value;

        setBranch(value);
        setSemester("");
        setDivision("");

    };

    const handleSemesterChange = (e) => {

        const value = e.target.value;

        setSemester(value);
        setDivision("");

    };

    const handleDivisionChange = (e) => {

        setDivision(e.target.value);

    };

    const getUserLocation = () => {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const { latitude, longitude } = position.coords;

                setLocation({
                    latitude,
                    longitude
                });

                fetchNextClass(latitude, longitude);

                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);

            },

            (error) => {
                console.error(error);
                alert("Unable to retrieve your location.");
            }

        );

    };

    const fetchNextClass = async (latitude, longitude) => {

        try {

            const requestBody = {
                latitude,
                longitude,
                department,
                branch,
                semester: Number(semester),
                division,
                // currentDate:'2026-07-31T14:03:23'
                currentDate: new Date().toISOString().slice(0, 19)
            };

            console.log(requestBody);

            const response = await getNextClass(requestBody);

            console.log(response);

            setNavigationData(response);

        } catch (error) {

            if (error.response) {

                    console.log(error.response.data);

                    // alert(error.response.data.message);

                } else {

                    console.error(error);

                    alert("Something went wrong.");

                }

        }

    };
    
    const handleContinue = () => {

        if (!department || !branch || !semester || !division) {
            alert("Please select all academic details.");
            return;
        }

        getUserLocation();

    };

    useEffect(() => {
        fetchAcademicOptions()     
    }, []);
    
    return(<div>
    <h2>Academic Selection</h2>
    <div>    
        <label htmlFor="department">
            Department
        </label>

        <select
            id="department"
            value={department}
            onChange={handleDepartmentChange}
        >
            <option value="">Select Department</option>

            {departments.map((dept) => (
                <option key={dept} value={dept}>
                    {dept}
                </option>
            ))}
        </select>
    </div>
    <div>
        <label htmlFor="branch">Branch</label>

        <select
            id="branch"
            value={branch}
            onChange={handleBranchChange}
            disabled={!department}
        >
            <option value="">Select Branch</option>

            {branches.map((branchName) => (
                <option
                    key={branchName}
                    value={branchName}
                >
                    {branchName}
                </option>
            ))}
        </select>
    </div>
    <div>
        <label htmlFor="semester">Semester</label>

        <select
            id="semester"
            value={semester}
            onChange={handleSemesterChange}
            disabled={!branch}
        >
            <option value="">
                Select Semester
            </option>

            {semesters.map((sem) => (
                <option
                    key={sem}
                    value={sem}
                >
                    Semester {sem}
                </option>
            ))}
        </select>
    </div>
    <div>
        <label htmlFor="division">
            Division
        </label>

        <select
            id="division"
            value={division}
            onChange={handleDivisionChange}
            disabled={!semester}
        >
            <option value="">
                Select Division
            </option>

            {divisions.map((divisionName) => (
                <option
                    key={divisionName}
                    value={divisionName}
                >
                    {divisionName}
                </option>
            ))}
        </select>
    </div>
    <button
        type="button"
        onClick={handleContinue}
    >
        Continue
    </button>
    </div>

    )

}


export default Selection;