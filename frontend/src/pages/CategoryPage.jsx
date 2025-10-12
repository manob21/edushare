import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCategoryBySlug } from '../data/categories';

function CategoryPage() {
  const { slug } = useParams();
  const category = getCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
          <p className="mt-2 text-gray-600">We couldn't find that category.</p>
          <Link to="/" className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-white">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl" aria-hidden>{category.icon}</div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          </div>
          <Link to="/" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Back</Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <p className="text-gray-600">Resources for this category will appear here. Try uploading one!</p>
          <Link to="/upload" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Upload to {category.name}</Link>
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
