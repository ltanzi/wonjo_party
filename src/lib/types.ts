import type { Format, ItemStatus, SlotStatus } from "@/config";

export interface Slot {
  id: string;
  day_key: string;
  stage_key: string;
  start_time: string | null; // 'HH:MM:SS' from Postgres `time`
  end_time: string | null;
  format: Format;
  artist_name: string;
  country: string | null;
  status: SlotStatus;
  notes: string;
  sort_order: number;
  updated_by: string;
  updated_at: string;
}

/** Fields the client may write; the rest are set by the audit trigger. */
export type SlotDraft = Omit<Slot, "id" | "updated_by" | "updated_at">;

export interface Item {
  id: string;
  section_key: string;
  title: string;
  owner: string | null;
  status: ItemStatus;
  notes: string;
  due_date: string | null;
  sort_order: number;
  updated_by: string;
  updated_at: string;
}
