import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserPage from './pages/UserPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectsDetail from './pages/ProjectsDetail';
// Placeholder pages - sẽ được implement sau

const TasksPage = () => {
    const { id } = useParams();
    return <div>Tasks Page {id && `for Project ${id}`}</div>;
};

const LogworksPage = () => {
    const { id } = useParams();
    return <div>Logworks Page {id && `for Project ${id}`}</div>;
};

const AnalyticsPage = () => {
    const { id } = useParams();
    return <div>Analytics Page {id && `for Project ${id}`}</div>;
};

const CalendarPage = () => {
    const { id } = useParams();
    return <div>Calendar Page {id && `for Project ${id}`}</div>;
};

const ProjectSettingsPage = () => {
    const { id } = useParams();
    return <div>Project Settings Page {id && `for Project ${id}`}</div>;
};

const SettingsPage = () => <div>Settings Page</div>;
const KanbanPage = () => <div>Kanban Page</div>;

const App = () => {
    return (
        <BrowserRouter>

            <Routes>
                {/* Public route - Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes - Cần đăng nhập */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Navigate to="/dashboard" replace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <DashboardPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ProjectsPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects/:id"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ProjectsDetail />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects/:id/tasks"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <TasksPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects/:id/logworks"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <LogworksPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects/:id/analytics"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <AnalyticsPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects/:id/calendar"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <CalendarPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/projects/:id/settings"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ProjectSettingsPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <UserPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <SettingsPage />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

        </BrowserRouter>
    );
};

export default App;
