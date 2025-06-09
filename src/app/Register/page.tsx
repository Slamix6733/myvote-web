'use client'
import React, { useState, ChangeEvent } from 'react'
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from 'next/navigation'
import { db } from '../lib/firebase.js'

const Registration_form = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        Full_Name: '',
        email: '',
        Organisation: '',
        Phone_Number: '',
        Aadhar: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'Admins', formData.Aadhar);
            const snapshot = await getDoc(docRef);

            if (!snapshot.exists()) {
                alert("You are not a valid candidate");
                return;
            }

            await updateDoc(snapshot.ref, {
                Full_Name: formData.Full_Name,
                email: formData.email,
                Organization: formData.Organisation,
                'Phone Number': formData.Phone_Number,
                Verified: true,
                'Registered At': serverTimestamp()
            });

            //redirect to SignInWithPhone
            router.push('/SignInWithPhone?phoneNumber=' + formData.Phone_Number);
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
                    Registration Form
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div>
                            <input
                                type="text"
                                name="Full_Name"
                                placeholder="Full Name"
                                onChange={handleChange}
                                value={formData.Full_Name}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                onChange={handleChange}
                                value={formData.email}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                name="Organisation"
                                placeholder="Organisation"
                                onChange={handleChange}
                                value={formData.Organisation}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="tel"
                                name="Phone_Number"
                                placeholder="Phone Number"
                                onChange={handleChange}
                                value={formData.Phone_Number}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                name="Aadhar"
                                placeholder="Enter Aadhar Number"
                                onChange={handleChange}
                                value={formData.Aadhar}
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
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Registration_form