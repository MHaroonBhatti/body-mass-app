export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      scans: {
        Row: {
          id: string;
          participant_id: string | null;
          age: number;
          sex: "male" | "female" | "prefer_not_to_say";
          height_cm: number;
          weight_kg: number;
          status: "draft" | "uploading" | "submitted" | "saved" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participant_id?: string | null;
          age: number;
          sex: "male" | "female" | "prefer_not_to_say";
          height_cm: number;
          weight_kg: number;
          status?: "draft" | "uploading" | "submitted" | "saved" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participant_id?: string | null;
          age?: number;
          sex?: "male" | "female" | "prefer_not_to_say";
          height_cm?: number;
          weight_kg?: number;
          status?: "draft" | "uploading" | "submitted" | "saved" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      scan_images: {
        Row: {
          id: string;
          scan_id: string;
          view: "front" | "back" | "left" | "right";
          storage_path: string;
          original_filename: string | null;
          mime_type: string;
          file_size_bytes: number;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scan_id: string;
          view: "front" | "back" | "left" | "right";
          storage_path: string;
          original_filename?: string | null;
          mime_type: string;
          file_size_bytes: number;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scan_id?: string;
          view?: "front" | "back" | "left" | "right";
          storage_path?: string;
          original_filename?: string | null;
          mime_type?: string;
          file_size_bytes?: number;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scan_images_scan_id_fkey";
            columns: ["scan_id"];
            isOneToOne: false;
            referencedRelation: "scans";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
