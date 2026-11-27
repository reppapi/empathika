import {
  Database,
  SlidersHorizontal,
  Lock,
  UserCheck,
  Eye,
  RefreshCw,
  Mail,
} from "lucide-react";
import { SectionItem } from "../types/privacy.types";

export const SECTIONS: SectionItem[] = [
  { id: "informasi-dihimpun", number: "1", title: "Data & Informasi yang Dihimpun", icon: Database },
  { id: "penggunaan-informasi", number: "2", title: "Tujuan Pengolahan Data", icon: SlidersHorizontal },
  { id: "perlindungan-data", number: "3", title: "Keamanan & Kerahasiaan", icon: Lock },
  { id: "pihak-ketiga", number: "4", title: "Keterlibatan Pihak Ketiga", icon: UserCheck },
  { id: "hak-pengguna", number: "5", title: "Hak & Kendali Pemilik Data", icon: Eye },
  { id: "perubahan-kebijakan", number: "6", title: "Pembaruan Ketentuan", icon: RefreshCw },
  { id: "hubungi-kami", number: "7", title: "Saluran Bantuan & Kontak", icon: Mail },
];
