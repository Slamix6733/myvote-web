'use client'


import React from "react";
import { useRouter } from "next/navigation";

const MainPageBeforeLogin = () => {
    const Router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <h1 className="text-3xl font-bold mb-8 text-blue-800">Welcome to MyVote</h1>
            <div className="flex flex-col gap-4 w-full max-w-xs">
                <button
                    type="button"
                    onClick={() => Router.push('/Login')}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold text-lg">
                    Login
                </button>
                <button
                    type="button"
                    onClick={() => Router.push('/Register')}
                    className="w-full px-6 py-3 bg-white text-blue-700 border border-blue-600 rounded-lg shadow hover:bg-blue-50 transition-colors font-semibold text-lg">
                    Register
                </button>
            </div>
        </div>
    )
}

export default MainPageBeforeLogin;