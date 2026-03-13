import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import connectDb from '../config/db.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import Chunk from '../models/Chunk.js';
import ChatSession from '../models/ChatSession.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@megabookstore.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
const USER_EMAIL = process.env.SEED_USER_EMAIL || 'user@megabookstore.com';
const USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'User@12345';

async function clearUploadsDirectory() {
  const uploadsDir = path.join(__dirname, '../uploads');

  try {
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(uploadsDir, entry.name);
        if (entry.isDirectory()) {
          await fs.rm(fullPath, { recursive: true, force: true });
          return;
        }
        if (entry.name !== '.gitkeep') {
          await fs.unlink(fullPath);
        }
      })
    );
  } catch (error) {
    if (error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

async function run() {
  await connectDb();
  console.log('Connected to MongoDB');

  const [deletedChunks, deletedDocuments, deletedChats, deletedUsers] = await Promise.all([
    Chunk.deleteMany({}),
    Document.deleteMany({}),
    ChatSession.deleteMany({}),
    User.deleteMany({})
  ]);

  await clearUploadsDirectory();

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const userPasswordHash = await bcrypt.hash(USER_PASSWORD, 10);

  const [admin, user] = await Promise.all([
    User.create({
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: 'admin'
    }),
    User.create({
      email: USER_EMAIL,
      passwordHash: userPasswordHash,
      role: 'user'
    })
  ]);

  console.log('Knowledge base and users reset complete.');
  console.log(`Deleted chunks: ${deletedChunks.deletedCount}`);
  console.log(`Deleted documents: ${deletedDocuments.deletedCount}`);
  console.log(`Deleted chat sessions: ${deletedChats.deletedCount}`);
  console.log(`Deleted users: ${deletedUsers.deletedCount}`);
  console.log('Seeded accounts:');
  console.log(`- Admin: ${admin.email} / ${ADMIN_PASSWORD}`);
  console.log(`- User: ${user.email} / ${USER_PASSWORD}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

run().catch((error) => {
  console.error('Reset/seed failed:', error);
  process.exit(1);
});
