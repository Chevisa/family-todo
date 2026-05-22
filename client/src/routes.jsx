import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import PageWithLoader from './components/ui/PageWithLoader.jsx';
import { isAuthenticated } from './utils/auth.js';

const Welcome = lazy(() => import('./pages/Welcome/Welcome.jsx'));
const Teams = lazy(() => import('./pages/Teams/Teams.jsx'));

function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/welcome" replace />;
    }

    return children;
}

export const router = createBrowserRouter([
    {
        path: '/',
        children: [
            { index: true, element: <Navigate to="/welcome" replace /> },
            {
                path: 'welcome',
                element: (
                    <PageWithLoader>
                        <Welcome />
                    </PageWithLoader>
                ),
            },
            {
                path: 'teams',
                element: (
                    <PageWithLoader>
                        <ProtectedRoute>
                            <Teams />
                        </ProtectedRoute>
                    </PageWithLoader>
                ),
            },
        ],
    },
]);
