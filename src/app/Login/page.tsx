'use client'
import React, { useState } from 'react'
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from 'next/navigation'
import 'react-phone-number-input/style.css'
import { db } from '../lib/firebase.js'

const Login = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [aadhar, setAadhar] = useState<string>('');

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'Admins', aadhar);
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                alert("You are not a valid candidate");
                return;
            }
            const phoneNumber = snapshot.data().Phone_Number;
            //redirect to SignInWithPhone
            router.push('/SignInWithPhone?phoneNumber=' + phoneNumber);

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Login
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div>
                            <input
                                type="text"
                                name="Aadhar"
                                placeholder="Enter Aadhar Number"
                                onChange={(e) => setAadhar(e.target.value)}
                                value={aadhar}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Logging In...' : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;