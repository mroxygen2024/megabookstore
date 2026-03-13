
import React from 'react';
import ChatWidget from '../components/ChatWidget';
import { apiFetch, getApiErrorMessage } from '../services/api';
import { Book } from '../types';

const HomePage: React.FC = () => {
  const [books, setBooks] = React.useState<Book[]>([]);
  const [booksError, setBooksError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    const loadBooks = async () => {
      try {
        setBooksError(null);
        const data = await apiFetch<{ books: Array<Book & { _id: string }> }>('/api/books?limit=12');
        if (!active) return;
        const normalized = data.books.map((book) => ({
          ...book,
          id: book.id || book._id,
        }));
        setBooks(normalized);
      } catch (err) {
        if (!active) return;
        setBooksError(getApiErrorMessage(err, 'Failed to load books.'));
      }
    };

    loadBooks();
    return () => {
      active = false;
    };
  }, []);

  const highlightBooks = books.slice(0, 3);
  const featuredBooks = books.slice(3, 9);
  const readerCirclePerks = [
    {
      badge: 'WELCOME',
      title: '10% Member Discount',
      detail: 'Applies to every order at checkout.'
    },
    {
      badge: 'EARLY ACCESS',
      title: 'First Look Collections',
      detail: 'Shop curated drops before everyone else.'
    },
    {
      badge: 'MONTHLY',
      title: 'Exclusive Reading Lists',
      detail: 'Fresh picks from our editors each month.'
    }
  ];

  const getCoverUrl = (book: Book) => {
    if (book.coverImage) return book.coverImage;
    if (book.coverId) {
      return `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`;
    }
    if (book.coverEditionKey) {
      return `https://covers.openlibrary.org/b/olid/${book.coverEditionKey}-L.jpg`;
    }
    if (book.isbn) {
      return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
    }
    return '';
  };

  return (
    <div className="space-y-16 py-10 animate-in fade-in duration-700">
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-stone-900">
          Mega Book Store
        </h1>
        <p className="text-xl text-stone-600 leading-relaxed font-sans">
          Handpicked books for better habits, sharper thinking, and meaningful growth.
        </p>
        <div className="flex justify-center gap-4">
          <button className="px-8 py-3 bg-stone-800 text-stone-50 rounded-md font-sans font-medium hover:bg-stone-700 transition-colors shadow-lg">
            Shop Top Picks
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {highlightBooks.length === 0 && !booksError ? (
          <div className="col-span-full text-center text-stone-400 font-sans text-sm">
            Loading top picks...
          </div>
        ) : (
          highlightBooks.map((book) => (
            <div key={book.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 shadow-md transition-shadow group-hover:shadow-xl">
                {getCoverUrl(book) ? (
                  <img
                    src={getCoverUrl(book)}
                    alt={book.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50" />
                )}
                <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top,_rgba(15,15,15,0.15),_transparent_55%)]" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-1 line-clamp-2">{book.title}</h3>
              <p className="text-stone-500 text-sm font-sans">{book.author}</p>
            </div>
          ))
        )}
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-stone-900">Featured Books</h2>
            <p className="text-sm text-stone-500 font-sans">Reader favorites and fresh arrivals.</p>
          </div>
        </div>

        {booksError && (
          <p className="text-sm font-sans text-red-600">{booksError}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBooks.length === 0 && !booksError ? (
            <div className="col-span-full text-center text-stone-400 font-sans text-sm">
              Loading featured picks...
            </div>
          ) : (
            featuredBooks.map((book) => (
              <div key={book.id} className="group bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-[3/4] bg-stone-100">
                  {getCoverUrl(book) ? (
                    <img
                      src={getCoverUrl(book)}
                      alt={book.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-stone-50">
                    <p className="text-xs uppercase tracking-wider font-sans">{book.category}</p>
                    <h3 className="text-lg font-bold leading-tight line-clamp-2">{book.title}</h3>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm text-stone-600 font-sans">{book.author}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-stone-900">{book.price} {book.currency}</span>
                    <span className="text-xs font-sans text-stone-500">In stock: {book.stock}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="bg-stone-200 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <h2 className="text-3xl font-bold">Reader Circle</h2>
          <p className="text-stone-700 font-sans leading-relaxed">
            Members receive 10% off every order, early access to curated collections, and exclusive reading lists each month.
          </p>
        </div>
        <div className="w-full md:w-1/3 space-y-3">
          {readerCirclePerks.map((perk) => (
            <div
              key={perk.title}
              className="relative rounded-xl border border-stone-300 bg-stone-100/90 px-4 py-3 shadow-sm"
            >
              <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-stone-200 border border-stone-300" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 h-4 w-4 rounded-full bg-stone-200 border border-stone-300" />
              <p className="text-[10px] font-sans font-bold tracking-[0.2em] text-stone-500">{perk.badge}</p>
              <h3 className="text-base font-bold text-stone-900">{perk.title}</h3>
              <p className="text-xs font-sans text-stone-600">{perk.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <ChatWidget />
    </div>
  );
};

export default HomePage;
