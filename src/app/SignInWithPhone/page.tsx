'use client'
import React, { useState, useEffect } from 'react'
import { signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '../lib/firebase'

const SignInWithPhone = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phoneNumber = '+91' + searchParams.get('phoneNumber');

    const [user, setUser] = useState<ConfirmationResult | null>(null);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const sendOTP = async () => {
        try {
            setLoading(true);
            const recaptcha = new RecaptchaVerifier(auth, 'recaptcha', {
                'size': 'invisible',
            });
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptcha);
            setUser(confirmationResult);
            setOtpSent(true);
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert('Error sending OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (phoneNumber && phoneNumber !== '+91null') {
            sendOTP();
        }
    }, [phoneNumber]);

    const verifyOTP = async (otpValue: string) => {
        try {
            setLoading(true);
            if (!user) return;

            const userCredential = await user.confirm(otpValue);
            console.log('User signed in:', userCredential.user);
            router.push('/admin');
        } catch (error) {
            console.error('Error verifying OTP:', error);
            alert('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Phone Verification
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    We've sent an OTP to {phoneNumber}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {otpSent ? (
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            verifyOTP(otp);
                        }}>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-600">
                                {loading ? 'Sending OTP...' : 'Preparing to send OTP...'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Required for reCAPTCHA */}
            <div id="recaptcha"></div>
        </div>
    )
}

export default SignInWithPhone;