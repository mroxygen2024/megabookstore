import mongoose from 'mongoose';
import connectDb from '../config/db.js';
import Book from '../models/Book.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MANUAL_SEED_BOOKS = [
  { title: 'Atomic Habits', author: 'James Clear', category: 'Habits', isbn: 'SKU-SH-001' },
  { title: 'The Power of Habit', author: 'Charles Duhigg', category: 'Habits', isbn: 'SKU-SH-002' },
  { title: 'Deep Work', author: 'Cal Newport', category: 'Productivity', isbn: 'SKU-SH-003' },
  { title: 'The 7 Habits of Highly Effective People', author: 'Stephen R. Covey', category: 'Personal Development', isbn: 'SKU-SH-004' },
  { title: 'Mindset', author: 'Carol S. Dweck', category: 'Mindset', isbn: 'SKU-SH-005' },
  { title: 'Essentialism', author: 'Greg McKeown', category: 'Productivity', isbn: 'SKU-SH-006' },
  { title: 'Make Your Bed', author: 'William H. McRaven', category: 'Motivation', isbn: 'SKU-SH-007' },
  { title: 'Can\'t Hurt Me', author: 'David Goggins', category: 'Motivation', isbn: 'SKU-SH-008' },
  { title: 'Grit', author: 'Angela Duckworth', category: 'Psychology', isbn: 'SKU-SH-009' },
  { title: 'The One Thing', author: 'Gary Keller and Jay Papasan', category: 'Productivity', isbn: 'SKU-SH-010' },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill', category: 'Success', isbn: 'SKU-SH-011' },
  { title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Business Motivation', isbn: 'SKU-SH-012' },
  { title: 'Start with Why', author: 'Simon Sinek', category: 'Leadership', isbn: 'SKU-SH-013' },
  { title: 'Leaders Eat Last', author: 'Simon Sinek', category: 'Leadership', isbn: 'SKU-SH-014' },
  { title: 'Dare to Lead', author: 'Brene Brown', category: 'Leadership', isbn: 'SKU-SH-015' },
  { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', category: 'Self-Help', isbn: 'SKU-SH-016' },
  { title: '12 Rules for Life', author: 'Jordan B. Peterson', category: 'Self-Help', isbn: 'SKU-SH-017' },
  { title: 'The Four Agreements', author: 'Don Miguel Ruiz', category: 'Personal Development', isbn: 'SKU-SH-018' },
  { title: 'Drive', author: 'Daniel H. Pink', category: 'Psychology', isbn: 'SKU-SH-019' },
  { title: 'So Good They Can\'t Ignore You', author: 'Cal Newport', category: 'Mindset', isbn: 'SKU-SH-020' }
];

const RESET_BEFORE_SEED = true;
const COVER_LOOKUP_DELAY_MS = 120;
const COVER_LOOKUP_USER_AGENT = 'mega-book-store-seeder/1.0';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomStock() {
  return Math.floor(Math.random() * 50) + 5;
}

function calculateEtbPrice(pageCount = 300) {
  const base = 700;
  const perPage = 3.5;
  const variance = Math.floor(Math.random() * 200);
  const price = Math.round(base + pageCount * perPage + variance);
  return Math.min(Math.max(price, 500), 3500);
}

async function fetchJson(url, attempt = 1) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': COVER_LOOKUP_USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (attempt < 3) {
      await wait(200 * attempt);
      return fetchJson(url, attempt + 1);
    }
    return null;
  }
}

function normalizeGoogleCover(url) {
  if (!url) return null;
  return String(url)
    .replace('http://', 'https://')
    .replace('&edge=curl', '')
    .replace('zoom=1', 'zoom=2');
}

async function resolveRealCoverImage({ title, author }) {
  const openLibraryUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1&fields=cover_i,isbn`;
  const openLibrary = await fetchJson(openLibraryUrl);
  const openDoc = openLibrary?.docs?.[0];

  if (typeof openDoc?.cover_i === 'number') {
    return `https://covers.openlibrary.org/b/id/${openDoc.cover_i}-L.jpg`;
  }

  if (Array.isArray(openDoc?.isbn) && openDoc.isbn.length > 0) {
    return `https://covers.openlibrary.org/b/isbn/${openDoc.isbn[0]}-L.jpg`;
  }

  const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`intitle:${title} inauthor:${author}`)}&maxResults=1`;
  const googleBooks = await fetchJson(googleBooksUrl);
  const thumbnail = googleBooks?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
  return normalizeGoogleCover(thumbnail);
}

function createCoverDataUri({ title, author, category, sku }) {
  const safeTitle = String(title || 'Book').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeAuthor = String(author || 'Unknown').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = String(category || 'General').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSku = String(sku || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#44403c"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
  </defs>
  <rect width="600" height="900" fill="url(#bg)"/>
  <rect x="36" y="36" width="528" height="828" rx="18" fill="none" stroke="#d6d3d1" stroke-width="2" opacity="0.55"/>
  <text x="64" y="120" fill="#d6d3d1" font-family="Georgia, serif" font-size="22" letter-spacing="2">MEGA BOOK STORE</text>
  <text x="64" y="250" fill="#fafaf9" font-family="Georgia, serif" font-size="46" font-weight="700">${safeTitle}</text>
  <text x="64" y="320" fill="#e7e5e4" font-family="Arial, sans-serif" font-size="22">${safeAuthor}</text>
  <text x="64" y="780" fill="#d6d3d1" font-family="Arial, sans-serif" font-size="18">${safeCategory}</text>
  <text x="64" y="812" fill="#a8a29e" font-family="Arial, sans-serif" font-size="16">${safeSku}</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function seedBooks() {
  await connectDb();
  console.log('Connected to MongoDB');

  if (RESET_BEFORE_SEED) {
    await Book.deleteMany({});
    console.log('Cleared existing books collection');
  }

  let totalBooks = 0;

  for (const item of MANUAL_SEED_BOOKS) {
    await wait(COVER_LOOKUP_DELAY_MS);
    const pageCount = Math.floor(Math.random() * 220) + 180;
    const realCoverImage = await resolveRealCoverImage(item);
    const book = {
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      category: item.category,
      price: calculateEtbPrice(pageCount),
      currency: 'ETB',
      stock: getRandomStock(),
      publisher: 'Mega Book Store Press',
      publishedYear: 2010 + Math.floor(Math.random() * 16),
      description: `A practical ${item.category.toLowerCase()} title focused on personal growth, discipline, and better decision making.`,
      coverImage: realCoverImage || createCoverDataUri({
        title: item.title,
        author: item.author,
        category: item.category,
        sku: item.isbn
      }),
      language: 'English',
      pageCount
    };

    try {
      await Book.findOneAndUpdate(
        { isbn: book.isbn },
        book,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      totalBooks++;
    } catch (err) {
      console.error(`Failed to save book ${book.title}:`, err.message);
    }
  }

  if (totalBooks === 0) {
    console.warn('No books were seeded. Check DB connection and seed data.');
  } else {
    console.log(`Successfully seeded ${totalBooks} books.`);
  }
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedBooks().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
