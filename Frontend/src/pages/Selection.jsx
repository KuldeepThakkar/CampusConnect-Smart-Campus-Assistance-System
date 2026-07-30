import { useEffect, useState } from "react";
import api from "../api/axios";

function Selection(){

    const [academicData, setAcademicData] = useState({});
    const [department, setDepartment] = useState("");
    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("");
    const [division, setDivision] = useState("");

    const departments = Object.keys(academicData);
    const branches =department ? Object.keys(academicData[department]) : [];
    const semesters =department && branch ? Object.keys(academicData[department][branch]) : [];
    const divisions = department && branch && semester ? academicData[department][branch][semester] : [];

    useEffect(() => {

        fetchAcademicOptions()
        
        
    }, []);

    const fetchAcademicOptions = async () => {
        try {
            const response = await api.get("/timetable/options");

            setAcademicData(response.data.data);

        } catch (error) {
            console.error(error);
        }
    };    

    
    console.log(academicData);
    return(<div>
    <h2>Academic Selection</h2>
    <div>    
        <label htmlFor="department">
            Department
        </label>

        <select
            id="department"
            value={department}
            onChange={(e) => {
                setDepartment(e.target.value);
                setBranch("");
                setSemester("");
                setDivision("");
            }}
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
            onChange={(e) => {
                setBranch(e.target.value);
                setSemester("");
                setDivision("");
            }}
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
            onChange={(e) => {
                setSemester(e.target.value);
                setDivision("");
            }}
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
            onChange={(e) => setDivision(e.target.value)}
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
    </div>

    )

}


export default Selection;