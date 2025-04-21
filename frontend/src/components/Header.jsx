import React from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, SignOutButton, useUser } from '@clerk/clerk-react';
import { MicrophoneIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const { isSignedIn, user } = useUser();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <MicrophoneIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 font-bold text-xl text-gray-800">Whisper Transcribe</span>
            </Link>
          </div>
          <div className="flex items-center">
            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/record" 
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Record
                </Link>
                <div className="flex items-center space-x-2">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.profileImageUrl}
                    alt={user.firstName}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName}
                  </span>
                </div>
                <SignOutButton>
                  <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                  Sign in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;