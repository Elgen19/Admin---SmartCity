import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust the path as per your setup
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Make sure it's inside the component

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Ensure useNavigate is called directly within the component

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Check if the user exists in Firebase Auth
            const response = await axios.post('https://admin-smart-city-jjxbecet9-elgens-projects.vercel.app/api/auth/check-user', { email });

            if (response.data.exists) {
                // If user exists, send the reset password email
                await sendPasswordResetEmail(auth, email);
                setMessage('A password reset link has been sent to your email address.');

                // Delay before navigating to allow the message to show
                setTimeout(() => {
                    navigate('/'); // Redirect to the sign-in page
                }, 2000); // Adjust delay as needed
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send password reset email. Please check the email address and try again.');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
                <form onSubmit={handlePasswordReset}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full p-2 border rounded"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {message && <p className="text-green-500 text-sm">{message}</p>}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-600 transition-colors"
                    >
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
