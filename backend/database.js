const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Create tables for persistence
  await db.exec(`
    CREATE TABLE IF NOT EXISTS phc_status (
      id TEXT PRIMARY KEY,
      data TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medicines_catalog (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      stock INTEGER,
      reorderLevel INTEGER
    );

    CREATE TABLE IF NOT EXISTS medicine_transactions (
      id TEXT PRIMARY KEY,
      medId TEXT,
      type TEXT,
      qty INTEGER,
      source TEXT,
      patientRef TEXT,
      user TEXT,
      remarks TEXT,
      isAdjustment BOOLEAN DEFAULT false,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medicine_alerts (
      id TEXT PRIMARY KEY,
      medId TEXT,
      type TEXT,
      message TEXT,
      resolved BOOLEAN DEFAULT false,
      resolutionNotes TEXT,
      resolvedBy TEXT,
      resolvedAt DATETIME,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reconciliation_records (
      id TEXT PRIMARY KEY,
      medId TEXT,
      expectedQty INTEGER,
      actualQty INTEGER,
      matched BOOLEAN,
      remarks TEXT,
      user TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS token_alerts (
      id TEXT PRIMARY KEY,
      phone TEXT,
      triggerType TEXT,
      status TEXT DEFAULT 'pending',
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_trail (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId TEXT NOT NULL,
      actor TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default PHC data if missing
  const row = await db.get('SELECT id FROM phc_status WHERE id = ?', ['phc_1']);
  if (!row) {
    const defaultStatus = {
      phcName: "Rampur PHC, Sitapur, Uttar Pradesh",
      doctors: {
        doc1: { name: "Dr. Priya Sharma", dept: "General Medicine", status: "Available" },
        doc2: { name: "Dr. Rakesh Verma", dept: "Pediatrics", status: "Available" },
        doc3: { name: "Dr. Meena Patel", dept: "Gynaecology", status: "Absent" }
      },
      queue: 14,
      serving: 42,
      alerts: ["Lab closed till 2:00 PM"],
      emergency: false,
      symptoms: {
        fever: { count: 18, avg: 8, emoji: "🌡️", name: "Fever" },
        vomiting: { count: 4, avg: 3, emoji: "🤢", name: "Vomiting" },
        rash: { count: 2, avg: 2, emoji: "🔴", name: "Rash" },
        diarrhoea: { count: 7, avg: 5, emoji: "🚿", name: "Diarrhoea" },
        cough: { count: 9, avg: 10, emoji: "😷", name: "Cough" },
        eyeinf: { count: 1, avg: 1, emoji: "👁️", name: "Eye Infection" }
      }
    };
    await db.run('INSERT INTO phc_status (id, data) VALUES (?, ?)', ['phc_1', JSON.stringify(defaultStatus)]);
  }

  // Seed inventory if missing
  const med = await db.get('SELECT id FROM medicines_catalog LIMIT 1');
  if (!med) {
    const initialMeds = [
      { id: "M001", name: "Paracetamol 500mg", type: "Tablet", stock: 1200, reorderLevel: 200 },
      { id: "M002", name: "Amoxicillin 250mg", type: "Capsule", stock: 150, reorderLevel: 500 },
      { id: "M003", name: "Metformin 500mg", type: "Tablet", stock: 850, reorderLevel: 300 },
      { id: "M004", name: "ORS Sachets", type: "Packet", stock: 0, reorderLevel: 100 },
      { id: "M005", name: "Iron+Folic Acid", type: "Tablet", stock: 2400, reorderLevel: 500 }
    ];
    for (const m of initialMeds) {
      await db.run(
        'INSERT INTO medicines_catalog (id, name, type, stock, reorderLevel) VALUES (?, ?, ?, ?, ?)',
        [m.id, m.name, m.type, m.stock, m.reorderLevel]
      );
    }
    
    // Insert an initial low stock alert
    await db.run(
      'INSERT INTO medicine_alerts (id, medId, type, message) VALUES (?, ?, ?, ?)',
      ["al-" + Date.now().toString().slice(-6), "M002", "LOW_STOCK", "Amoxicillin stock (150) below reorder level (500)."]
    );
  }

  return db;
}

function getDB() {
  if (!db) {
    throw new Error('DB not initialized. Call initDB first.');
  }
  return db;
}

module.exports = { initDB, getDB };
