import React from 'react';
import { Link } from 'react-router-dom';

function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo} p-0.5 shadow-lg transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
    >
      <div className="h-full w-full rounded-2xl bg-white p-5 transition-colors group-hover:bg-white/90">
        <div className="flex items-center gap-3">
          <div className="text-3xl" aria-hidden>
            {category.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">{category.description}</p>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
          <span>View resources</span>
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  );
}

export default CategoryCard;
