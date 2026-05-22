import { Suspense } from 'react';
import { useLocation} from 'react-router-dom';
import Loader from './Loader.jsx';
import MinLoaderDelay from './MinLoaderDelay.jsx';

function PageWithLoader({ children }) {
    const location = useLocation();
    return (
        <Suspense fallback={<Loader />}>
            <MinLoaderDelay key={location.key}>
                {children}
            </MinLoaderDelay>
        </Suspense>
    )
}

export default PageWithLoader;