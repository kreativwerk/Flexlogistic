export type Role = "VERLADER" | "FAHRER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: Role;
  company: string;
  contact: string;
  phone: string;
  city: string;
  vehicle_types: string;
  created_at: string;
}

export type TourKind = "DIREKT" | "EXTRA" | "FEST";
export type TourStatus = "OFFEN" | "VERGEBEN" | "ABGEHOLT" | "ZUGESTELLT" | "STORNIERT";
export type PricingMode = "FESTPREIS" | "GEBOT";

export interface Tour {
  id: number;
  kind: TourKind;
  shipper_id: number;
  status: TourStatus;
  pickup_company: string;
  pickup_street: string;
  pickup_zip: string;
  pickup_city: string;
  delivery_company: string;
  delivery_street: string;
  delivery_zip: string;
  delivery_city: string;
  pickup_date: string | null;
  pickup_time: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  weekdays: string | null;
  start_date: string | null;
  end_date: string | null;
  vehicle_type: string;
  weight_kg: number | null;
  pallets: number | null;
  distance_km: number;
  notes: string;
  pricing_mode: PricingMode;
  price: number | null;
  carrier_id: number | null;
  final_price: number | null;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  pod_name: string | null;
  created_at: string;
}

export interface Bid {
  id: number;
  tour_id: number;
  carrier_id: number;
  amount: number;
  message: string;
  status: "OFFEN" | "ANGENOMMEN" | "ABGELEHNT";
  created_at: string;
}
