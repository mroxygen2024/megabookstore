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
import { chunkText } from '../services/text.js';
import { embedDocumentText } from '../services/embeddings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@megabookstore.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
const USER_EMAIL = process.env.SEED_USER_EMAIL || 'user@megabookstore.com';
const USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'User@12345';

const KNOWLEDGE_BASE_DOCS = [
  {
    filename: 'catalog-current.docx',
    content: `Mega Book Store - Current Catalog
Last Updated: 2026-03-13
Currency: ETB

SKU: SKU-SH-001 | Title: Atomic Habits | Author: James Clear | Category: Habits | Price: 1450 ETB | Stock: 32
SKU: SKU-SH-002 | Title: The Power of Habit | Author: Charles Duhigg | Category: Habits | Price: 1320 ETB | Stock: 24
SKU: SKU-SH-003 | Title: Deep Work | Author: Cal Newport | Category: Productivity | Price: 1490 ETB | Stock: 18
SKU: SKU-SH-004 | Title: The 7 Habits of Highly Effective People | Author: Stephen R. Covey | Category: Personal Development | Price: 1580 ETB | Stock: 20
SKU: SKU-SH-005 | Title: Mindset | Author: Carol S. Dweck | Category: Mindset | Price: 1360 ETB | Stock: 26
SKU: SKU-SH-006 | Title: Essentialism | Author: Greg McKeown | Category: Productivity | Price: 1410 ETB | Stock: 15
SKU: SKU-SH-007 | Title: Make Your Bed | Author: William H. McRaven | Category: Motivation | Price: 980 ETB | Stock: 29
SKU: SKU-SH-008 | Title: Can't Hurt Me | Author: David Goggins | Category: Motivation | Price: 1670 ETB | Stock: 12
SKU: SKU-SH-009 | Title: Grit | Author: Angela Duckworth | Category: Psychology | Price: 1430 ETB | Stock: 21
SKU: SKU-SH-010 | Title: The One Thing | Author: Gary Keller and Jay Papasan | Category: Productivity | Price: 1290 ETB | Stock: 17
SKU: SKU-SH-011 | Title: Think and Grow Rich | Author: Napoleon Hill | Category: Success | Price: 1210 ETB | Stock: 30
SKU: SKU-SH-012 | Title: The Psychology of Money | Author: Morgan Housel | Category: Business Motivation | Price: 1520 ETB | Stock: 19
SKU: SKU-SH-013 | Title: Start with Why | Author: Simon Sinek | Category: Leadership | Price: 1380 ETB | Stock: 16
SKU: SKU-SH-014 | Title: Leaders Eat Last | Author: Simon Sinek | Category: Leadership | Price: 1460 ETB | Stock: 14
SKU: SKU-SH-015 | Title: Dare to Lead | Author: Brene Brown | Category: Leadership | Price: 1540 ETB | Stock: 13
SKU: SKU-SH-016 | Title: The Subtle Art of Not Giving a F*ck | Author: Mark Manson | Category: Self-Help | Price: 1340 ETB | Stock: 22
SKU: SKU-SH-017 | Title: 12 Rules for Life | Author: Jordan B. Peterson | Category: Self-Help | Price: 1610 ETB | Stock: 11
SKU: SKU-SH-018 | Title: The Four Agreements | Author: Don Miguel Ruiz | Category: Personal Development | Price: 990 ETB | Stock: 35
SKU: SKU-SH-019 | Title: Drive | Author: Daniel H. Pink | Category: Psychology | Price: 1370 ETB | Stock: 18
SKU: SKU-SH-020 | Title: So Good They Can't Ignore You | Author: Cal Newport | Category: Mindset | Price: 1420 ETB | Stock: 23`
  },
  {
    filename: 'shipping-and-returns.docx',
    content: `Mega Book Store - Shipping and Returns Policy
Effective Date: 2026-03-13

Shipping
Standard Delivery (Addis Ababa): 1 to 2 business days, 120 ETB.
Standard Delivery (outside Addis Ababa): 2 to 5 business days, 180 ETB.
Express Delivery (selected areas): same day or next day, 250 ETB.
Free shipping is available for orders above 3000 ETB.

Returns
Return window: 7 days from delivery date.
Condition: item must be unused and in original condition.
Refund processing time: 3 to 7 business days after return inspection.
Shipping fee is non-refundable unless the return is due to store error.`
  },
  {
    filename: 'reader-circle-and-coupons.docx',
    content: `Mega Book Store - Reader Circle Membership and Coupons
Effective Date: 2026-03-13

Reader Circle Benefits
Members receive 10 percent discount on every order.
Members get early access to curated collections.
Members receive one exclusive reading list every month.

Active Coupons
Code: WELCOME10 | Benefit: 10 percent off | Minimum Order: 500 ETB | Expiry: 2026-12-31
Code: READMORE15 | Benefit: 15 percent off | Minimum Order: 1500 ETB | Expiry: 2026-09-30
Code: FREESHIP3000 | Benefit: free standard shipping | Minimum Order: 3000 ETB | Expiry: 2026-12-31`
  },
  {
    filename: 'faq-and-support.docx',
    content: `Mega Book Store - FAQ and Support
Effective Date: 2026-03-13

Support Channels
Email: support@megabookstore.com
Phone: +251-11-000-0000
Support Hours: Monday to Saturday, 9:00 AM to 6:00 PM EAT

FAQ
Q: How do I place an order?
A: Log in, add books to cart, proceed to checkout, and confirm payment.

Q: What payment methods are accepted?
A: Bank transfer, mobile wallet, and card where available.

Q: Can I cancel an order?
A: Yes, before shipment confirmation. Contact support with your order number.`
  }
];

async function seedKnowledgeBaseDocuments() {
  let totalChunks = 0;

  for (const sourceDoc of KNOWLEDGE_BASE_DOCS) {
    const doc = await Document.create({
      filename: sourceDoc.filename,
      originalName: sourceDoc.filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: Buffer.byteLength(sourceDoc.content, 'utf8'),
      status: 'processing'
    });

    const chunks = await chunkText(sourceDoc.content);

    for (const chunk of chunks) {
      const embedding = await embedDocumentText(chunk.text);
      await Chunk.create({
        text: chunk.text,
        embedding,
        documentId: doc._id,
        metadata: {
          ...chunk.metadata,
          filename: sourceDoc.filename,
          seeded: true
        }
      });
      totalChunks += 1;
    }

    doc.status = 'ready';
    await doc.save();
  }

  return {
    documents: KNOWLEDGE_BASE_DOCS.length,
    chunks: totalChunks
  };
}

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

  const seededKb = await seedKnowledgeBaseDocuments();

  console.log('Knowledge base and users reset complete.');
  console.log(`Deleted chunks: ${deletedChunks.deletedCount}`);
  console.log(`Deleted documents: ${deletedDocuments.deletedCount}`);
  console.log(`Deleted chat sessions: ${deletedChats.deletedCount}`);
  console.log(`Deleted users: ${deletedUsers.deletedCount}`);
  console.log('Seeded accounts:');
  console.log(`- Admin: ${admin.email} / ${ADMIN_PASSWORD}`);
  console.log(`- User: ${user.email} / ${USER_PASSWORD}`);
  console.log(`Seeded knowledge documents: ${seededKb.documents}`);
  console.log(`Seeded knowledge chunks: ${seededKb.chunks}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

run().catch((error) => {
  console.error('Reset/seed failed:', error);
  process.exit(1);
});
