"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import db from "./db";
import { getCurrentUser, setSessionCookie, clearSessionCookie } from "./auth";
import { estimatePrice, VEHICLE_TYPES } from "./pricing";
import type { Bid, Tour, User } from "./types";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function num(fd: FormData, key: string): number | null {
  const v = str(fd, key).replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---------- Auth ----------

export async function registerAction(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  const role = str(formData, "role");
  const company = str(formData, "company");
  const contact = str(formData, "contact");
  const phone = str(formData, "phone");
  const city = str(formData, "city");
  const vehicleTypes = formData
    .getAll("vehicle_types")
    .filter((v): v is string => typeof v === "string" && v in VEHICLE_TYPES)
    .join(",");

  if (!email.includes("@") || password.length < 8 || !company) {
    redirect("/registrieren?error=Bitte+alle+Pflichtfelder+ausfüllen+(Passwort+mind.+8+Zeichen).");
  }
  if (role !== "VERLADER" && role !== "FAHRER") {
    redirect("/registrieren?error=Ungültige+Rolle.");
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    redirect("/registrieren?error=Diese+E-Mail+ist+bereits+registriert.");
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `INSERT INTO users (email, password_hash, role, company, contact, phone, city, vehicle_types)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(email, hash, role, company, contact, phone, city, role === "FAHRER" ? vehicleTypes : "");

  await setSessionCookie(result.lastInsertRowid as number);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    redirect("/login?error=E-Mail+oder+Passwort+falsch.");
  }
  await setSessionCookie(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}

// ---------- Touren ----------

export async function createTourAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "VERLADER") redirect("/login");

  const kind = str(formData, "kind");
  if (!["DIREKT", "EXTRA", "FEST"].includes(kind)) redirect("/transporte/neu?error=Ungültige+Auftragsart.");

  const vehicleType = str(formData, "vehicle_type");
  if (!(vehicleType in VEHICLE_TYPES)) redirect("/transporte/neu?error=Bitte+Fahrzeugklasse+wählen.");

  const distanceKm = num(formData, "distance_km") ?? 0;
  const pricingMode = str(formData, "pricing_mode") === "GEBOT" ? "GEBOT" : "FESTPREIS";
  let price = num(formData, "price");
  if (pricingMode === "FESTPREIS" && (price == null || price <= 0)) {
    price = estimatePrice(vehicleType, distanceKm);
    if (price == null) redirect("/transporte/neu?error=Bitte+Festpreis+oder+Distanz+angeben.");
  }
  if (pricingMode === "GEBOT") price = null;

  const required = ["pickup_zip", "pickup_city", "delivery_zip", "delivery_city"];
  for (const f of required) {
    if (!str(formData, f)) redirect("/transporte/neu?error=Bitte+Abhol-+und+Zustelladresse+angeben.");
  }

  const weekdays =
    kind === "FEST"
      ? formData
          .getAll("weekdays")
          .filter((v): v is string => typeof v === "string")
          .join(",")
      : null;
  if (kind === "FEST" && !weekdays) redirect("/transporte/neu?error=Bitte+Wochentage+für+die+feste+Tour+wählen.");

  const result = db
    .prepare(
      `INSERT INTO tours (kind, shipper_id, pickup_company, pickup_street, pickup_zip, pickup_city,
        delivery_company, delivery_street, delivery_zip, delivery_city,
        pickup_date, pickup_time, delivery_date, delivery_time, weekdays, start_date, end_date,
        vehicle_type, weight_kg, pallets, distance_km, notes, pricing_mode, price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      kind,
      user.id,
      str(formData, "pickup_company"),
      str(formData, "pickup_street"),
      str(formData, "pickup_zip"),
      str(formData, "pickup_city"),
      str(formData, "delivery_company"),
      str(formData, "delivery_street"),
      str(formData, "delivery_zip"),
      str(formData, "delivery_city"),
      kind === "FEST" ? null : str(formData, "pickup_date") || null,
      str(formData, "pickup_time") || null,
      kind === "FEST" ? null : str(formData, "delivery_date") || null,
      str(formData, "delivery_time") || null,
      weekdays,
      kind === "FEST" ? str(formData, "start_date") || null : null,
      kind === "FEST" ? str(formData, "end_date") || null : null,
      vehicleType,
      num(formData, "weight_kg"),
      num(formData, "pallets"),
      distanceKm,
      str(formData, "notes"),
      pricingMode,
      price
    );

  revalidatePath("/boerse");
  revalidatePath("/transporte");
  redirect(`/transporte/${result.lastInsertRowid}`);
}

function getTourOr404(id: number): Tour {
  const tour = db.prepare("SELECT * FROM tours WHERE id = ?").get(id) as Tour | undefined;
  if (!tour) redirect("/dashboard");
  return tour;
}

export async function cancelTourAction(formData: FormData) {
  const user = await getCurrentUser();
  const id = Number(str(formData, "tour_id"));
  const tour = getTourOr404(id);
  if (!user || tour.shipper_id !== user.id) redirect("/login");
  if (tour.status === "ZUGESTELLT") redirect(`/transporte/${id}`);
  db.prepare("UPDATE tours SET status = 'STORNIERT' WHERE id = ?").run(id);
  revalidatePath(`/transporte/${id}`);
  revalidatePath("/boerse");
  redirect(`/transporte/${id}`);
}

/** Fahrer übernimmt eine Festpreis-Tour direkt. */
export async function acceptTourAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "FAHRER") redirect("/login");
  const id = Number(str(formData, "tour_id"));
  const tour = getTourOr404(id);
  if (tour.status !== "OFFEN" || tour.pricing_mode !== "FESTPREIS") redirect(`/transporte/${id}`);

  const changed = db
    .prepare(
      `UPDATE tours SET status = 'VERGEBEN', carrier_id = ?, final_price = price, assigned_at = datetime('now')
       WHERE id = ? AND status = 'OFFEN'`
    )
    .run(user.id, id).changes;
  if (changed === 0) redirect(`/transporte/${id}?error=Tour+wurde+bereits+vergeben.`);

  revalidatePath("/boerse");
  revalidatePath(`/transporte/${id}`);
  redirect(`/transporte/${id}`);
}

export async function placeBidAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "FAHRER") redirect("/login");
  const id = Number(str(formData, "tour_id"));
  const amount = num(formData, "amount");
  const tour = getTourOr404(id);
  if (tour.status !== "OFFEN" || tour.pricing_mode !== "GEBOT") redirect(`/transporte/${id}`);
  if (amount == null || amount <= 0) redirect(`/transporte/${id}?error=Bitte+gültigen+Gebotspreis+angeben.`);

  db.prepare(
    `INSERT INTO bids (tour_id, carrier_id, amount, message)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(tour_id, carrier_id) DO UPDATE SET amount = excluded.amount,
       message = excluded.message, status = 'OFFEN', created_at = datetime('now')`
  ).run(id, user.id, amount, str(formData, "message"));

  revalidatePath(`/transporte/${id}`);
  redirect(`/transporte/${id}`);
}

export async function acceptBidAction(formData: FormData) {
  const user = await getCurrentUser();
  const bidId = Number(str(formData, "bid_id"));
  const bid = db.prepare("SELECT * FROM bids WHERE id = ?").get(bidId) as Bid | undefined;
  if (!bid) redirect("/dashboard");
  const tour = getTourOr404(bid.tour_id);
  if (!user || tour.shipper_id !== user.id) redirect("/login");
  if (tour.status !== "OFFEN") redirect(`/transporte/${tour.id}`);

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE tours SET status = 'VERGEBEN', carrier_id = ?, final_price = ?, assigned_at = datetime('now')
       WHERE id = ?`
    ).run(bid.carrier_id, bid.amount, tour.id);
    db.prepare("UPDATE bids SET status = 'ANGENOMMEN' WHERE id = ?").run(bidId);
    db.prepare("UPDATE bids SET status = 'ABGELEHNT' WHERE tour_id = ? AND id != ?").run(tour.id, bidId);
  });
  tx();

  revalidatePath(`/transporte/${tour.id}`);
  revalidatePath("/boerse");
  redirect(`/transporte/${tour.id}`);
}

export async function markPickedUpAction(formData: FormData) {
  const user = await getCurrentUser();
  const id = Number(str(formData, "tour_id"));
  const tour = getTourOr404(id);
  if (!user || tour.carrier_id !== user.id) redirect("/login");
  if (tour.status !== "VERGEBEN") redirect(`/transporte/${id}`);
  db.prepare("UPDATE tours SET status = 'ABGEHOLT', picked_up_at = datetime('now') WHERE id = ?").run(id);
  revalidatePath(`/transporte/${id}`);
  redirect(`/transporte/${id}`);
}

export async function markDeliveredAction(formData: FormData) {
  const user = await getCurrentUser();
  const id = Number(str(formData, "tour_id"));
  const tour = getTourOr404(id);
  if (!user || tour.carrier_id !== user.id) redirect("/login");
  if (tour.status !== "ABGEHOLT" && tour.status !== "VERGEBEN") redirect(`/transporte/${id}`);
  db.prepare(
    "UPDATE tours SET status = 'ZUGESTELLT', delivered_at = datetime('now'), pod_name = ? WHERE id = ?"
  ).run(str(formData, "pod_name") || null, id);
  revalidatePath(`/transporte/${id}`);
  redirect(`/transporte/${id}`);
}
