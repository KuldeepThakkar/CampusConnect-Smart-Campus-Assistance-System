import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Navigation from "../pages/Navigation";
import Layout from "../components/Layout";
import Signup from "../pages/Signup";
import VerifyOtp from "../pages/VerifyOtp";
import Login from "../pages/Login";
import AcademicSetup from "../pages/AcademicSetup";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes(){

    return (

            <Routes>

                <Route path="/signup" element={<Signup />} />

                <Route path="/verify-otp" element={<VerifyOtp />} />

                <Route path="/login" element={<Login />} />

                <Route
                    path="/setup-academic-details"
                    element={
                        <ProtectedRoute allowedRoles={["student"]} blockIfAlreadySetup>
                            <AcademicSetup />
                        </ProtectedRoute>
                    }
                />

                <Route element={<Layout />}>

                    <Route path="/" element={<Home />} />

                    <Route
                        path="/navigation"
                        element={
                            <ProtectedRoute allowedRoles={["student"]} requireAcademicSetup>
                                <Navigation />
                            </ProtectedRoute>
                        }
                    />

                </Route>

            </Routes>

    )
}

export default AppRoutes;