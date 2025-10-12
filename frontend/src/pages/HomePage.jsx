import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import CategoryCard from '../components/CategoryCard';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="mx-auto max-w-6xl px-4 pt-14 sm:pt-16">
        <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">🎓 EduShare</h1>
              <p className="mt-2 text-gray-600">Upload and download learning materials by category.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/upload"
                className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Upload Resource
              </Link>
              <a
                href="#categories"
                className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50"
              >
                Browse Categories
              </a>
            </div>
          </div>
        </div>
      </header>

      <main id="categories" className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <h2 className="mb-5 text-lg font-semibold text-gray-800">Popular Categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </main>

      <footer className="border-t bg-white/60 py-6">
        <div className="mx-auto max-w-6xl px-4 text-sm text-gray-500">
          © {new Date().getFullYear()} EduShare
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
