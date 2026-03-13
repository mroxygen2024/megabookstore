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

async function seedBooks() {
  await connectDb();
  console.log('Connected to MongoDB');

  let totalBooks = 0;

  for (const item of MANUAL_SEED_BOOKS) {
    const pageCount = Math.floor(Math.random() * 220) + 180;
    const book = {
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      category: item.category,
      price: calculateEtbPrice(pageCount),
      currency: 'ETB',
      stock: getRandomStock(),
      publisher: 'Oak & Ink Press',
      publishedYear: 2010 + Math.floor(Math.random() * 16),
      description: `A practical ${item.category.toLowerCase()} title focused on personal growth, discipline, and better decision making.`,
      coverImage: '',
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
