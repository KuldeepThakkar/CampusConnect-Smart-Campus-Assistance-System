import { useEffect, useState } from "react";
import api from "../api/axios";

function Selection(){

    const [academicData, setAcademicData] = useState({});
    const [department, setDepartment] = useState("");

    const departments = Object.keys(academicData);

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
    return(
    <div>
        <h2>Academic Selection</h2>
        <label htmlFor="department">
            Department
        </label>

        <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
        >
            <option value="">Select Department</option>

            {departments.map((dept) => (
                <option key={dept} value={dept}>
                    {dept}
                </option>
            ))}
        </select>
    </div>
    )

}


export default Selection;