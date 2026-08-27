import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "flexlogistic.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('VERLADER','FAHRER','ADMIN')),
  company TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  vehicle_types TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('DIREKT','EXTRA','FEST')),
  shipper_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'OFFEN'
    CHECK (status IN ('OFFEN','VERGEBEN','ABGEHOLT','ZUGESTELLT','STORNIERT')),
  pickup_company TEXT NOT NULL DEFAULT '',
  pickup_street TEXT NOT NULL DEFAULT '',
  pickup_zip TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  delivery_company TEXT NOT NULL DEFAULT '',
  delivery_street TEXT NOT NULL DEFAULT '',
  delivery_zip TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  pickup_date TEXT,
  pickup_time TEXT,
  delivery_date TEXT,
  delivery_time TEXT,
  weekdays TEXT,
  start_date TEXT,
  end_date TEXT,
  vehicle_type TEXT NOT NULL,
  weight_kg REAL,
  pallets INTEGER,
  distance_km REAL NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  pricing_mode TEXT NOT NULL DEFAULT 'FESTPREIS' CHECK (pricing_mode IN ('FESTPREIS','GEBOT')),
  price REAL,
  carrier_id INTEGER REFERENCES users(id),
  final_price REAL,
  assigned_at TEXT,
  picked_up_at TEXT,
  delivered_at TEXT,
  pod_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tour_id INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  carrier_id INTEGER NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'OFFEN' CHECK (status IN ('OFFEN','ANGENOMMEN','ABGELEHNT')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tour_id, carrier_id)
);

CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_shipper ON tours(shipper_id);
CREATE INDEX IF NOT EXISTS idx_tours_carrier ON tours(carrier_id);
CREATE INDEX IF NOT EXISTS idx_bids_tour ON bids(tour_id);
`);

function seed() {
  const hash = bcrypt.hashSync("demo1234", 10);
  const insertUser = db.prepare(
    `INSERT INTO users (email, password_hash, role, company, contact, phone, city, vehicle_types)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const shipperId = insertUser.run(
    "verlader@demo.de", hash, "VERLADER",
    "Muster Industrie GmbH", "Anna Beispiel", "+49 201 123456", "Essen", ""
  ).lastInsertRowid as number;
  const carrierId = insertUser.run(
    "fahrer@demo.de", hash, "FAHRER",
    "Blitz KEP Service", "Murat Schnell", "+49 172 9876543", "Dortmund",
    "PKW,CADDY,TRANSPORTER"
  ).lastInsertRowid as number;

  const insertTour = db.prepare(
    `INSERT INTO tours (kind, shipper_id, pickup_company, pickup_street, pickup_zip, pickup_city,
      delivery_company, delivery_street, delivery_zip, delivery_city,
      pickup_date, pickup_time, delivery_date, delivery_time, weekdays, start_date,
      vehicle_type, weight_kg, pallets, distance_km, notes, pricing_mode, price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const today = new Date();
  const d = (offset: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() + offset);
    return x.toISOString().slice(0, 10);
  };

  insertTour.run(
    "DIREKT", shipperId, "Muster Industrie GmbH", "Industriestr. 12", "45141", "Essen",
    "AutoTeile Nord GmbH", "Hafenweg 3", "28217", "Bremen",
    d(0), "14:00", d(0), "18:30", null, null,
    "TRANSPORTER", 450, 2, 268, "2 Paletten Ersatzteile, Ladungssicherung erforderlich. Eilig!", "FESTPREIS", 289
  );
  insertTour.run(
    "EXTRA", shipperId, "Muster Industrie GmbH", "Industriestr. 12", "45141", "Essen",
    "Maschinenbau Süd AG", "Werkstr. 88", "70565", "Stuttgart",
    d(1), "08:00", d(1), "14:00", null, null,
    "LKW_7_5", 2400, 6, 420, "6 Paletten, Hebebühne erforderlich.", "GEBOT", null
  );
  insertTour.run(
    "FEST", shipperId, "Muster Industrie GmbH", "Industriestr. 12", "45141", "Essen",
    "Zentrallager West", "Logistikpark 1", "50354", "Hürth",
    null, "06:30", null, "09:00", "Mo,Di,Mi,Do,Fr", d(7),
    "CADDY", 120, 1, 78, "Tägliche Feste Tour: Dokumente und Kleinteile, werktags.", "FESTPREIS", 95
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void carrierId;
}

// Seeding atomar ausführen – während des Builds initialisieren mehrere
// Worker-Prozesse die Datenbank gleichzeitig, nur einer darf seeden.
try {
  db.transaction(() => {
    const count = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number }).c;
    if (count === 0) seed();
  }).exclusive();
} catch {
  // Ein anderer Prozess hat bereits geseedet oder hält die Sperre.
}

export default db;
