import {
  FileText,
  UserCheck,
  Calendar,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { SectionItem } from "../types/terms.types";

export const SECTIONS: SectionItem[] = [
  { id: "ketentuan-umum", number: "1", title: "Ketentuan Umum & Ruang Lingkup", icon: FileText },
  { id: "kelayakan-akun", number: "2", title: "Kelayakan & Pendaftaran Akun", icon: UserCheck },
  { id: "prosedur-layanan", number: "3", title: "Prosedur Konsultasi & Asesmen", icon: Calendar },
  { id: "pembayaran-transaksi", number: "4", title: "Tarif & Ketentuan Pembayaran", icon: CreditCard },
  { id: "reschedule-pembatalan", number: "5", title: "Penjadwalan Ulang & Pembatalan", icon: Clock },
  { id: "etika-kerahasiaan", number: "6", title: "Kode Etik & Kerahasiaan Sesi", icon: ShieldCheck },
  { id: "batasan-tanggung-jawab", number: "7", title: "Batasan Kewajiban & Hukum", icon: AlertTriangle },
  { id: "layanan-kontak", number: "8", title: "Pusat Bantuan & Kontak Resmi", icon: Mail },
];
