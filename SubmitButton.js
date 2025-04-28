"use client"
import { motion } from 'framer-motion';
import { buttonHoverVariants, itemVariants } from '../styles/animations';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

const SubmitButton = ({
    loginMethod,
    username,
    password,
    onError,
    onSuccess
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const endpoint = loginMethod === 'password'
                ? 'api/auth/login-password'
                : 'api/auth/request-verification';

            const response = await fetch(`https://ftp-safenet.liara.run/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });

            // ... existing code ...
        } catch (error) {
            console.error('Error submitting form:', error);
            onError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
            {isLoading ? 'Loading...' : 'Submit'}
        </button>
    );
};

export default SubmitButton; 