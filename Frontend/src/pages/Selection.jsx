import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function Selection(){

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    const [academicData, setAcademicData] = useState({});

    const [department, setDepartment] = useState("");
    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("");
    const [division, setDivision] = useState("");

    const departments = Object.keys(academicData);
    const branches = department? Object.keys(academicData[department] || {}): [];
    const semesters =department && branch? Object.keys(academicData[department]?.[branch] || {}): [];
    const divisions =department && branch && semester? academicData[department]?.[branch]?.[semester] || []: [];

    const fetchAcademicOptions = async () => {

        try {

            const response = await api.get("/timetable/options");

            setAcademicData(response.data.data);

            const savedData = JSON.parse(localStorage.getItem("academicData"));

            if (savedData) {
                setDepartment(savedData.department || "");
                setBranch(savedData.branch || "");
                setSemester(savedData.semester || "");
                setDivision(savedData.division || "");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
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

    const handleContinue = () => {

        if (!department || !branch || !semester || !division) {
            alert("Please select all academic details.");
            return;
        }

        navigate("/navigation", {
            state: {
                department,
                branch,
                semester,
                division
            }
        });

    };

    useEffect(() => {
        fetchAcademicOptions();
    }, []);


    useEffect(() => {
        if (!department || !branch || !semester || !division) return;

        localStorage.setItem(
            "academicData",
            JSON.stringify({
                department,
                branch,
                semester,
                division,
            })
        );
    }, [department, branch, semester, division]);

    return(<div>
    <h2>Academic Selection</h2>

    {isLoading && <p>Loading academic options...</p>}
    <div>    
        <label htmlFor="department">
            Department
        </label>

        <select
            id="department"
            value={department}
            onChange={handleDepartmentChange}
            disabled={isLoading}
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
            disabled={!department || isLoading}
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
            disabled={!branch || isLoading}
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
            disabled={!semester || isLoading}
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