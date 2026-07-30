import type { Format, ItemStatus, SlotStatus } from "@/config";

export interface Slot {
  id: string;
  day_key: string;
  stage_key: string;
  start_time: string | null; // 'HH:MM:SS' from Postgres `time`
  end_time: string | null;
  format: Format;
  artist_name: string;
  status: SlotStatus;
  notes: string;
  sort_order: number;
  updated_by: string;
  updated_at: string;
}

/** One row of the old `artistas compilación` spreadsheet. */
export interface CompilationArtist {
  id: string;
  artist: string;
  email: string;
  confirmed: boolean; // 'Compilación: si' in the sheet
  sent: boolean; // track received
  drive_link: string; // Google Drive URL; '' when not set
  sort_order: number;
  updated_by: string;
  updated_at: string;
}

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
