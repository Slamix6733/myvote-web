// Import the auth instance from your configuration file
import { auth } from '../app/lib/firebase'; // Adjust the path as needed

// Import the signOut function from the auth library
import { signOut } from 'firebase/auth';

const SignOutButton = () => {

    const handleSignOut = () => {
        signOut(auth).then(() => {
            console.log('User signed out');
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    }

    return (
        <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow"
            onClick={handleSignOut}
        >
            Sign Out
        </button>
    )
}

export default SignOutButton;

