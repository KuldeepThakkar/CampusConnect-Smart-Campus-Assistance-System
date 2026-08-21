import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { setAcademicDetails } from "../services/user";
import { useAuth } from "../context/AuthContext";

function AcademicSetup() {

    const navigate = useNavigate();
    const { user, isLoading: authLoading, updateUser } = useAuth();

    const [academicData, setAcademicData] = useState({});

    const [department, setDepartment] = useState("");
    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("");
    const [division, setDivision] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const departments = Object.keys(academicData);
    const branches = department ? Object.keys(academicData[department] || {}) : [];
    const semesters = department && branch ? Object.keys(academicData[department]?.[branch] || {}) : [];
    const divisions = department && branch && semester ? academicData[department]?.[branch]?.[semester] || [] : [];

    const fetchAcademicOptions = async () => {

        setIsLoading(true);
        setErrorMessage(null);

        try {

            const response = await api.get("/timetable/options");
            setAcademicData(response.data.data);

        } catch (error) {
            console.error(error);
            setErrorMessage("Couldn't load academic options. Please try again.");
        } finally {
            setIsLoading(false);
        }

    };

    useEffect(() => {
        fetchAcademicOptions();
    }, []);

    useEffect(() => {

        if (authLoading) return;

        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role !== "student") {
            navigate("/");
            return;
        }

        if (user.academicDetails?.isLocked) {
            navigate("/");
            return;
        }

    }, [authLoading, user]);

    const handleDepartmentChange = (e) => {
        setDepartment(e.target.value);
        setBranch("");
        setSemester("");
        setDivision("");
    };

    const handleBranchChange = (e) => {
        setBranch(e.target.value);
        setSemester("");
        setDivision("");
    };

    const handleSemesterChange = (e) => {
        setSemester(e.target.value);
        setDivision("");
    };

    const handleDivisionChange = (e) => {
        setDivision(e.target.value);
    };

    const handleSave = async () => {

        if (!department || !branch || !semester || !division) {
            setErrorMessage("Please select all academic details.");
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);

        try {

            const response = await setAcademicDetails({
                department,
                branch,
                semester: Number(semester),
                division
            });

            updateUser({ academicDetails: response.data });

            navigate("/");

        } catch (error) {

            if (error.response) {
                setErrorMessage(error.response.data.message || "Couldn't save your details.");
            } else {
                setErrorMessage("Something went wrong. Please check your connection.");
            }

        } finally {
            setIsSaving(false);
        }

    };

    return (
        <div>
            <h2>Set Up Your Academic Details</h2>

            <p className="status-text">
                This is a one-time setup. Once saved, only an admin can change these.
            </p>

            {isLoading && <p className="status-text">Loading academic options...</p>}

            {errorMessage && (
                <div className="error-box">
                    <p>{errorMessage}</p>
                </div>
            )}

            <div className="field">
                <label htmlFor="department">Department</label>
                <select id="department" value={department} onChange={handleDepartmentChange} disabled={isLoading || isSaving}>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
            </div>

            <div className="field">
                <label htmlFor="branch">Branch</label>
                <select id="branch" value={branch} onChange={handleBranchChange} disabled={!department || isLoading || isSaving}>
                    <option value="">Select Branch</option>
                    {branches.map((branchName) => (
                        <option key={branchName} value={branchName}>{branchName}</option>
                    ))}
                </select>
            </div>

            <div className="field">
                <label htmlFor="semester">Semester</label>
                <select id="semester" value={semester} onChange={handleSemesterChange} disabled={!branch || isLoading || isSaving}>
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                </select>
            </div>

            <div className="field">
                <label htmlFor="division">Division</label>
                <select id="division" value={division} onChange={handleDivisionChange} disabled={!semester || isLoading || isSaving}>
                    <option value="">Select Division</option>
                    {divisions.map((divisionName) => (
                        <option key={divisionName} value={divisionName}>{divisionName}</option>
                    ))}
                </select>
            </div>

            <button type="button" className="btn-primary" onClick={handleSave} disabled={isLoading || isSaving}>
                {isSaving ? "Saving..." : "Save & Lock"}
            </button>

        </div>
    );

}

export default AcademicSetup;