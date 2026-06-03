import { useEffect, useState } from 'react';

export default function Alert({ message, type }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!visible) return null;

    return (
        <div className={`alert-box ${type}`} style={{ display: 'block' }}>
            {message}
        </div>
    );
}