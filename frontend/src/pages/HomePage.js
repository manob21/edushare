import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const ALL_CATEGORIES = [
  { id: "notes", name: "Notes", emoji: "🗒️" },
  { id: "books", name: "Books", emoji: "📚" },
  { id: "assignments", name: "Assignments", emoji: "📎" },
  { id: "past-papers", name: "Past Papers", emoji: "📝" },
  { id: "slides", name: "Slides", emoji: "📽️" },
  { id: "tutorials", name: "Tutorials", emoji: "🎯" },
  { id: "research", name: "Research Papers", emoji: "🔬" },
  { id: "projects", name: "Projects", emoji: "🧩" },
  { id: "ebooks", name: "E‑Books", emoji: "📖" },
  { id: "cheatsheets", name: "Cheatsheets", emoji: "🧠" },
];

export default function HomePage() {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return ALL_CATEGORIES;
    return ALL_CATEGORIES.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <header className="bg-white/10 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <h1 className="text-white text-2xl font-bold tracking-tight">EduShare</h1>
          </div>
          <div className="hidden sm:block text-sm text-white/80">
            Share and discover study materials
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8">
          <h2 className="text-white text-3xl font-semibold mb-3">
            Explore by category
          </h2>
          <p className="text-white/80 mb-6">
            Browse materials by type or search for what you need.
          </p>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border-0 px-4 py-3 pr-12 text-gray-900 shadow focus:outline-none focus:ring-4 focus:ring-white/40"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          </div>
        </section>

        {filteredCategories.length === 0 ? (
          <div className="text-center text-white/90 py-20">
            No categories match "{query}".
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/category/${category.id}`}
                  className="block group"
                >
                  <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 transition-transform group-hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl" aria-hidden>
                        {category.emoji}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">Tap to view resources</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
