import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { NoticeProvider } from "./context/NoticeContext";

function App(){

    return (
        <AuthProvider>
            <NoticeProvider>
                <AppRoutes />
            </NoticeProvider>
        </AuthProvider>
    )

}

export default App; 