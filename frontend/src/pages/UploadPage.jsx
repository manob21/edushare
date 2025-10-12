import React from 'react';
import { Link } from 'react-router-dom';

function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900">Upload a Resource</h1>
        <p className="mt-2 text-gray-600">This is a placeholder upload page. Integrate your upload form here.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-white">Back to Home</Link>
      </div>
    </div>
  );
}

export default UploadPage;
