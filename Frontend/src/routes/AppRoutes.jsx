import {  Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Selection from "../pages/Selection";
import Navigation from "../pages/Navigation";
import Layout from "../components/Layout";
import Signup from "../pages/Signup";
import VerifyOtp from "../pages/VerifyOtp";
import Login from "../pages/Login";


function AppRoutes(){

    return (
       

            <Routes>

                <Route path="/signup" element={<Signup />} />

                <Route path="/verify-otp" element={<VerifyOtp />} />

                <Route path="/login" element={<Login />} />

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