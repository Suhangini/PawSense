import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/SignUp";
import PetProfile from "../pages/PetProfile";
import BreedDetection from "../pages/BreedDetection";
import HealthInfo from "../pages/HealthInfo";
import Confirm from "../pages/Confirm";
import Dashboard from "../pages/Dashboard";
import FoodDetection from "../pages/FoodDetection";
import HeatCycle from "../pages/HeatCycle";
import EmotionDetection from "../pages/EmotionDetection";
import Emergency from "../pages/Emergency";
import HealthRecords from "../pages/HealthRecords";
import PostureGuidance from "../pages/PostureGuidance";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/signup" element={<Signup />} />

            <Route
                path="/pet-profile"
                element={<PetProfile />}
            />

            <Route
                path="/breed-detection"
                element={<BreedDetection />}
            />

            <Route
                path="/health-info"
                element={<HealthInfo />}
            />

            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            <Route
                path="/confirm"
                element={<Confirm />}
            />

            <Route
                path="/food-detection"
                element={<FoodDetection />}
            />

            <Route
                path="/heat-cycle"
                element={<HeatCycle />}
            />

            <Route
                path="/emotion-detection"
                element={<EmotionDetection />}
            />

            {/* Emergency First-Aid */}
            <Route
                path="/emergency"
                element={<Emergency />}
            />

            <Route
    path="/posture-guidance"
    element={<PostureGuidance />}
/>

            <Route
                path="/health-records"
                element={<HealthRecords />}
            />
        </Routes>
    );
}

export default AppRoutes;