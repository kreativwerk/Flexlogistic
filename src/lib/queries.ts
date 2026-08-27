import db from "./db";
import type { Bid, Tour, User } from "./types";

export interface TourWithParties extends Tour {
  shipper_company: string;
  shipper_contact: string;
  shipper_phone: string;
  carrier_company: string | null;
  carrier_contact: string | null;
  carrier_phone: string | null;
}

export interface BidWithCarrier extends Bid {
  carrier_company: string;
  carrier_city: string;
  carrier_phone: string;
}

const TOUR_SELECT = `
  SELECT t.*,
    s.company AS shipper_company, s.contact AS shipper_contact, s.phone AS shipper_phone,
    c.company AS carrier_company, c.contact AS carrier_contact, c.phone AS carrier_phone
  FROM tours t
  JOIN users s ON s.id = t.shipper_id
  LEFT JOIN users c ON c.id = t.carrier_id
`;

export function getTour(id: number): TourWithParties | undefined {
  return db.prepare(`${TOUR_SELECT} WHERE t.id = ?`).get(id) as TourWithParties | undefined;
}

export function toursForShipper(shipperId: number): TourWithParties[] {
  return db
    .prepare(`${TOUR_SELECT} WHERE t.shipper_id = ? ORDER BY t.created_at DESC`)
    .all(shipperId) as TourWithParties[];
}

export function toursForCarrier(carrierId: number): TourWithParties[] {
  return db
    .prepare(`${TOUR_SELECT} WHERE t.carrier_id = ? ORDER BY t.created_at DESC`)
    .all(carrierId) as TourWithParties[];
}

export interface BoerseFilter {
  kind?: string;
  vehicleType?: string;
  zip?: string;
}

export function openTours(filter: BoerseFilter = {}): TourWithParties[] {
  const conditions = ["t.status = 'OFFEN'"];
  const params: (string | number)[] = [];
  if (filter.kind && ["DIREKT", "EXTRA", "FEST"].includes(filter.kind)) {
    conditions.push("t.kind = ?");
    params.push(filter.kind);
  }
  if (filter.vehicleType) {
    conditions.push("t.vehicle_type = ?");
    params.push(filter.vehicleType);
  }
  if (filter.zip) {
    conditions.push("(t.pickup_zip LIKE ? OR t.delivery_zip LIKE ?)");
    params.push(`${filter.zip}%`, `${filter.zip}%`);
  }
  return db
    .prepare(`${TOUR_SELECT} WHERE ${conditions.join(" AND ")} ORDER BY t.created_at DESC`)
    .all(...params) as TourWithParties[];
}

export function bidsForTour(tourId: number): BidWithCarrier[] {
  return db
    .prepare(
      `SELECT b.*, u.company AS carrier_company, u.city AS carrier_city, u.phone AS carrier_phone
       FROM bids b JOIN users u ON u.id = b.carrier_id
       WHERE b.tour_id = ? ORDER BY b.amount ASC`
    )
    .all(tourId) as BidWithCarrier[];
}

export function bidOfCarrier(tourId: number, carrierId: number): Bid | undefined {
  return db
    .prepare("SELECT * FROM bids WHERE tour_id = ? AND carrier_id = ?")
    .get(tourId, carrierId) as Bid | undefined;
}

export function shipperStats(shipperId: number) {
  return db
    .prepare(
      `SELECT
         SUM(CASE WHEN status = 'OFFEN' THEN 1 ELSE 0 END) AS offen,
         SUM(CASE WHEN status IN ('VERGEBEN','ABGEHOLT') THEN 1 ELSE 0 END) AS laufend,
         SUM(CASE WHEN status = 'ZUGESTELLT' THEN 1 ELSE 0 END) AS zugestellt
       FROM tours WHERE shipper_id = ?`
    )
    .get(shipperId) as { offen: number; laufend: number; zugestellt: number };
}

export function carrierStats(carrierId: number) {
  return db
    .prepare(
      `SELECT
         SUM(CASE WHEN status IN ('VERGEBEN','ABGEHOLT') THEN 1 ELSE 0 END) AS laufend,
         SUM(CASE WHEN status = 'ZUGESTELLT' THEN 1 ELSE 0 END) AS zugestellt,
         COALESCE(SUM(CASE WHEN status = 'ZUGESTELLT' THEN final_price ELSE 0 END), 0) AS umsatz
       FROM tours WHERE carrier_id = ?`
    )
    .get(carrierId) as { laufend: number; zugestellt: number; umsatz: number };
}

export function getUserById(id: number): User | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}
