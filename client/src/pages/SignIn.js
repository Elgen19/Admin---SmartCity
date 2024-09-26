import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/Rectangle 18.png';
import emailIcon from '../assets/images/Email.png';
import secureIcon from '../assets/images/Secure.png';
import adminImage from '../assets/images/Smart city (1) 2.png';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                await sendEmailVerification(user);
                setError('Your email is not verified. A verification link has been sent to your email address.');
                auth.signOut();
                return;
            }

            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password'); // Ensure your route is correctly defined in your router setup
    };

    return (
        <div className="flex h-screen">
            {/* Left Side: Background Image */}
            <div className="w-3/5 relative">
                <img className="absolute inset-0 object-cover w-full h-full" alt="background" src={backgroundImage} />
            </div>

            {/* Right Side: Form and Content */}
            <div className="w-2/5 flex flex-col items-center justify-center px-8 bg-gradient-to-b from-[#0e1550] to-[#2030b6]">
                <img className="w-48 h-48 mb-6" alt="admin logo" src={adminImage} />
                <h1 className="text-5xl font-bold text-white mb-10 font-nunito tracking-wide">Sign In</h1>
                <div className="w-full max-w-md bg-white text-gray-800 shadow-lg rounded-2xl p-10 space-y-6">
                    <form onSubmit={handleSubmit}>
                        <div className="flex items-center border-2 border-gray-400 rounded-md mb-4 transition-transform duration-300 hover:scale-105">
                            <img className="w-8 h-8 mr-4 p-2" alt="email icon" src={emailIcon} />
                            <input
                                className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 p-2"
                                placeholder="Enter email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center border border-gray-300 rounded-md mb-6 transition-transform duration-300 hover:scale-105">
                            <img className="w-8 h-8 mr-4 p-2" alt="secure icon" src={secureIcon} />
                            <input
                                className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-800 p-2"
                                placeholder="Enter password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}
                        <div className="flex justify-between items-center text-sm mb-6">
                            <label className="flex items-center text-gray-800 font-nunito">
                                <input type="checkbox" className="mr-2" />
                                Remember me
                            </label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-blue-500 hover:underline font-nunito"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="w-full h-12 bg-darkturquoise text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:bg-darkturquoise-light active:scale-95"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
                <div className="text-gray-300 text-center mt-8 text-sm font-nunito">
                    This page is accessible only to authorized personnel.
                </div>
            </div>
        </div>
    );
};

export default SignIn;
