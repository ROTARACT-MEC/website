const fs = require('fs');
const path = require('path');

const rawDataPath = path.join(__dirname, 'data.json');
if (!fs.existsSync(rawDataPath)) {
  console.error("Error: data.json not found at " + rawDataPath);
  process.exit(1);
}

const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));

// Helper to convert snake_case to camelCase
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Helper to clean and format a record
function cleanRecord(record) {
  const cleaned = {};
  
  // Metadata keys to exclude
  const metadataKeys = [
    'created_at', 'updated_at', 'published_at',
    'document_id', 'created_by_id', 'updated_by_id',
    'locale', 'subscribers_notified', 'subscribersNotified'
  ];
  
  for (const key of Object.keys(record)) {
    if (metadataKeys.includes(key)) {
      continue;
    }
    
    // Omit null values so TypeScript treats optional fields as undefined rather than null
    if (record[key] === null) {
      continue;
    }
    
    let val = record[key];
    // Map /uploads/ to /assets/
    if (typeof val === 'string' && val.startsWith('/uploads/')) {
      val = val.replace('/uploads/', '/assets/');
    }
    
    // Try to parse stringified JSON arrays/objects
    if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
      try {
        val = JSON.parse(val);
      } catch (e) {}
    }
    
    const camelKey = snakeToCamel(key);
    cleaned[camelKey] = val;
  }
  
  // Ensure id is a string
  if (cleaned.id !== undefined && cleaned.id !== null) {
    cleaned.id = String(cleaned.id);
  }
  
  return cleaned;
}

// Process data from a table, resolving publish state and de-duplicating draft/publish versions
function processTable(rows) {
  if (!rows || !Array.isArray(rows)) return [];
  
  // Check if table contains published_at column (draft/publish system enabled)
  const hasPublishSystem = rows.some(row => row.hasOwnProperty('published_at'));
  
  let filteredRows = rows;
  if (hasPublishSystem) {
    // Keep only rows that are published
    filteredRows = rows.filter(row => row.published_at !== null && row.published_at !== undefined);
  }
  
  // De-duplicate rows by ID (since draft and published rows might share the same ID)
  const seenIds = new Set();
  const uniqueRows = [];
  for (const row of filteredRows) {
    if (!seenIds.has(row.id)) {
      seenIds.add(row.id);
      uniqueRows.push(row);
    }
  }
  
  return uniqueRows.map(cleanRecord);
}

// Extract and clean each collection
const coordinators = processTable(rawData.coordinators || []);
const events = processTable(rawData.events || []);
const blogs = processTable(rawData.blogs || []);
const activities = processTable(rawData.activities || []);
const introductions = processTable(rawData.introductions || []);
const members = processTable(rawData.memberships || []);

const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write files
fs.writeFileSync(
  path.join(dataDir, 'coordinators.ts'),
  `import { Coordinator } from '../types';\n\nexport const coordinators: Coordinator[] = ${JSON.stringify(coordinators, null, 2)};\n`,
  'utf8'
);

fs.writeFileSync(
  path.join(dataDir, 'events.ts'),
  `import { Event } from '../types';\n\nexport const events: Event[] = ${JSON.stringify(events, null, 2)};\n`,
  'utf8'
);

fs.writeFileSync(
  path.join(dataDir, 'blogs.ts'),
  `import { Blog } from '../types';\n\nexport const blogs: Blog[] = ${JSON.stringify(blogs, null, 2)};\n`,
  'utf8'
);

fs.writeFileSync(
  path.join(dataDir, 'activities.ts'),
  `import { Activity } from '../types';\n\nexport const activities: Activity[] = ${JSON.stringify(activities, null, 2)};\n`,
  'utf8'
);

fs.writeFileSync(
  path.join(dataDir, 'introductions.ts'),
  `export const introductions: any[] = ${JSON.stringify(introductions, null, 2)};\n`,
  'utf8'
);

fs.writeFileSync(
  path.join(dataDir, 'members.ts'),
  `import { Member } from '../types';\n\nexport const members: Member[] = ${JSON.stringify(members, null, 2)};\n`,
  'utf8'
);

console.log("Successfully generated separate TS files in src/data/");
