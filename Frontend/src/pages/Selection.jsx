import { useEffect, useState } from "react";
import api from "../api/axios";

function Selection(){

    const [academicData, setAcademicData] = useState({});
    const [department, setDepartment] = useState("");
    const [branch, setBranch] = useState("");

    const departments = Object.keys(academicData);
    const branches =department ? Object.keys(academicData[department]) : [];

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
            onChange={(e) => setBranch(e.target.value)}
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
    </div>
    )

}


export default Selection;