import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import Header from "./components/common/Header.jsx";
import ThemeToggle from "./components/common/ThemeToggle.jsx";
import PostView from "./pages/PostView.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CreatePost from "./components/posts/CreatePost.jsx";
import EditPost from "./components/posts/EditPost.jsx";
import BlogHome from "./pages/BlogHome.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import HomePage from "./pages/Home.jsx";
import ConfirmEmailPage from "./pages/ConfirmEmailPage.jsx";

function PrivateRoute({children, condition, redirectTo = "/login"}) {
    return condition ? children : <Navigate to={redirectTo} replace/>;
}

function AppContent() {
    const {isAuthenticated, isAdmin, logout} = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);

        const handleAuthChange = () => setIsLoading(false);

        window.addEventListener('auth-change', handleAuthChange);
        return () => window.removeEventListener('auth-change', handleAuthChange);
    }, []);

    if (isLoading) {
        return (
            <div className="loading" role="status" aria-live="polite">
                <span className="spinner" aria-label="Carregando"></span>
                Carregando...
            </div>
        );
    }

    return (
        <div className="app-container">
            <Header isAuthenticated={isAuthenticated} isAdmin={isAdmin} onLogout={logout}/>
            <ThemeToggle/>
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<BlogHome/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                    <Route path="/post/:id" element={<PostView/>}/>
                    <Route path="/confirm-email" element={<ConfirmEmailPage/>}/>

                    <Route path="/profile" element={
                        <PrivateRoute condition={isAuthenticated}>
                            <HomePage/>
                        </PrivateRoute>
                    }/>

                    <Route path="/login" element={
                        isAuthenticated
                            ? <Navigate to="/profile" replace/>
                            : <LoginPage/>
                    }/>

                    <Route path="/admin" element={
                        <PrivateRoute condition={isAdmin}>
                            <AdminDashboard/>
                        </PrivateRoute>
                    }/>

                    <Route path="/create-post" element={
                        <PrivateRoute condition={isAuthenticated}>
                            <CreatePost/>
                        </PrivateRoute>
                    }/>

                    <Route path="/edit-post/:id" element={
                        <PrivateRoute condition={isAuthenticated}>
                            <EditPost/>
                        </PrivateRoute>
                    }/>

                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </main>
            <footer className="footer">
                <p>&copy; {new Date().getFullYear()} Blogify - Plataforma de Blogs</p>
            </footer>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent/>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;