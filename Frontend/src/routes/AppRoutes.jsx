import {  Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Selection from "../pages/Selection";
import Navigation from "../pages/Navigation";
import Layout from "../components/Layout";
import Signup from "../pages/Signup";


function AppRoutes(){

    return (
       

            <Routes>

                <Route path="/signup" element={<Signup />} />

                <Route element={<Layout />}>

                    <Route path="/" element={<Home />} />

                    <Route 
                        path="/selection" 
                        element={<Selection />} 
                    />

                    <Route 
                        path="/navigation" 
                        element={<Navigation />} 
                    />

                </Route>

            </Routes>

        
    )
}


export default AppRoutes;