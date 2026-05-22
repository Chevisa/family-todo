import { useEffect, useState } from 'react';
import Loader from './Loader.jsx';

const DELAY_MS = 1000;

function MinLoaderDelay({ children }) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setReady(true), DELAY_MS)
        return () => clearTimeout(t)
    }, []);

    if (!ready) return <Loader />;
    return children;
}

export default MinLoaderDelay;