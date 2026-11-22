"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BarChart3,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeft,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  Indent,
  Outdent,
  ChevronDown,
  Save,
  Plus,
  Trash2,
  ClipboardList,
  ExternalLink,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { psikotesService, type ReviewPsikotesItem } from "@/services/psikotes.service";
import RekapJawabanPasienView from "./RekapJawabanPasienView";
import ModalRekapJawabanFullscreen from "./ModalRekapJawabanFullscreen";

interface ModalReviewPsikotesProps {
  item: ReviewPsikotesItem | null;
  onClose: () => void;
  onSuccess: (updatedItem: ReviewPsikotesItem) => void;
  isStandalonePage?: boolean;
  initialDetail?: any;
}

// Standar ukuran Tab & Indentasi seragam (4 spasi persis)
const TAB_STR = "    ";

// SVG Icon untuk First Line Indent (Hanya baris pertama yang menjorok)
function FirstLineIndentIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <polyline points="3 6 6 6" />
    </svg>
  );
}

// SVG Icon untuk Hanging Indent (Baris lanjutan menjorok, baris pertama di posisi margin)
function HangingIndentIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// Helper Angka Romawi
function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let res = "";
  for (const [v, s] of map) {
    while (num >= v) {
      res += s;
      num -= v;
    }
  }
  return res || "I";
}

function fromRoman(str: string): number {
  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    i: 1,
    v: 5,
    x: 10,
  };
  let tot = 0;
  const s = str.trim();
  for (let i = 0; i < s.length; i++) {
    const c = map[s[i]] || 0;
    const n = map[s[i + 1]] || 0;
    if (c < n) {
      tot += n - c;
      i++;
    } else {
      tot += c;
    }
  }
  return tot;
}

function isRomanValid(str: string): boolean {
  return /^(X{0,3})(IX|IV|V?I{0,3})$/i.test(str.trim());
}

function findLastNumberBeforeCursor(value: string, cursorIndex: number): number {
  const textBefore = value.slice(0, cursorIndex);
  const lines = textBefore.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const match = line.match(/^(\s*)(\d+)\./);
    if (match) {
      return parseInt(match[2], 10);
    }
  }
  return 0;
}

function findLastRomanBeforeCursor(value: string, cursorIndex: number): number {
  const textBefore = value.slice(0, cursorIndex);
  const lines = textBefore.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const match = line.match(/^(\s*)([IVXLCDMivxlcdm]+)\./);
    if (match && isRomanValid(match[2])) {
      return fromRoman(match[2]);
    }
  }
  return 0;
}

function findLastNumberInAllPages(pagesList: string[], upToPageIndex: number): number {
  for (let p = upToPageIndex; p >= 0; p--) {
    const text = pagesList[p] || "";
    const lastNum = findLastNumberBeforeCursor(text, text.length);
    if (lastNum > 0) return lastNum;
  }
  return 0;
}

function findLastRomanInAllPages(pagesList: string[], upToPageIndex: number): number {
  for (let p = upToPageIndex; p >= 0; p--) {
    const text = pagesList[p] || "";
    const lastRoman = findLastRomanBeforeCursor(text, text.length);
    if (lastRoman > 0) return lastRoman;
  }
  return 0;
}

interface PrecedingListItem {
  type: "number" | "roman" | "letter" | "bullet";
  indent: string;
  val?: number;
  char?: string;
  bullet?: string;
  spacing: string;
}

// Mencari item list terakhir di atas posisi kursor untuk melanjutkan penomoran/poin setelah paragraf
function findPrecedingListItem(
  value: string,
  lineStart: number,
  pagesList?: string[],
  pageIdx?: number
): PrecedingListItem | null {
  const linesBefore = value.slice(0, lineStart).split("\n");
  for (let i = linesBefore.length - 1; i >= 0; i--) {
    const line = linesBefore[i];

    // Cek angka biasa: "1.    " atau "  2.    "
    const numMatch = line.match(/^(\s*)(\d+)\.(\s+)(.*)$/);
    if (numMatch) {
      return {
        type: "number",
        indent: numMatch[1],
        val: parseInt(numMatch[2], 10),
        spacing: numMatch[3],
      };
    }

    // Cek angka romawi: "I.    " atau "II.    "
    const romanMatch = line.match(/^(\s*)([IVXLCDMivxlcdm]+)\.(\s+)(.*)$/);
    if (romanMatch && isRomanValid(romanMatch[2])) {
      return {
        type: "roman",
        indent: romanMatch[1],
        val: fromRoman(romanMatch[2]),
        spacing: romanMatch[3],
      };
    }

    // Cek abjad: "a.    ", "b.    "
    const letterMatch = line.match(/^(\s*)([a-zA-Z])\.(\s+)(.*)$/);
    if (letterMatch) {
      return {
        type: "letter",
        indent: letterMatch[1],
        char: letterMatch[2],
        spacing: letterMatch[3],
      };
    }

    // Cek bullet: "•    "
    const bulletMatch = line.match(/^(\s*)([•\-\*])(\s+)(.*)$/);
    if (bulletMatch) {
      return {
        type: "bullet",
        indent: bulletMatch[1],
        bullet: bulletMatch[2],
        spacing: bulletMatch[3],
      };
    }

    // Jika baris ini bukan baris kosong dan tidak memiliki spasi awal (misal judul besar baru yang tidak berindentasi):
    // List dianggap terputus
    if (line.trim().length > 0 && !line.startsWith(" ") && !line.startsWith("\t")) {
      return null;
    }
  }

  // Jika tidak ditemukan di lembar ini, dan ada lembar sebelumnya (pageIdx > 0):
  if (pagesList && typeof pageIdx === "number" && pageIdx > 0) {
    for (let p = pageIdx - 1; p >= 0; p--) {
      const prevPageText = pagesList[p] || "";
      const result = findPrecedingListItem(prevPageText, prevPageText.length);
      if (result) return result;
    }
  }

  return null;
}

// Kapasitas tinggi teks (dalam pixel) per lembar A4 (794px x 1123px)
// Diberikan safe margin di atas footer agar baris terakhir dan ekor huruf (g, y, p) tidak terpotong
const PAGE1_FULL_HEIGHT = 760; // Batas aman Halaman 1 (sekitar 30-31 baris, menyisakan margin nyaman sebelum footer)
const PAGE1_MAX_WITH_SIG = 600; // Batas Halaman 1 jika sekaligus menampung tanda tangan (sekitar 24-25 baris)

// Halaman 2+ (Lanjutan) hanya memiliki running header minimalis
const SUBSEQUENT_FULL_HEIGHT = 860; // Batas aman Halaman 2+ (sekitar 35-36 baris, dengan margin nyaman sebelum footer)
const SUBSEQUENT_MAX_WITH_SIG = 700; // Batas Halaman 2+ jika sekaligus menampung tanda tangan (sekitar 28-29 baris)

// Estimasi baris per halaman untuk parser teks awal
const PAGE1_MAX_LINES = 30; // Halaman 1 isi sampai batas aman
const SUBSEQUENT_PAGE_MAX_LINES = 35; // Halaman 2+ isi sampai batas aman

// Helper informasi indentasi dan deteksi list item
function getListIndentInfo(lineText: string): { isList: boolean; level: number } {
  const clean = lineText.replace(/\u00a0/g, " ");
  const match = clean.match(/^(\s*)((\d+|[IVXLCDMivxlcdm]+|[a-zA-Z])\.|[•\-\*])(\s+)/);
  if (!match) return { isList: false, level: 0 };
  const leadingSpaces = match[1] || "";
  const level = Math.floor(leadingSpaces.length / 4);
  return { isList: true, level };
}

// Menerapkan styling Hanging Indent pada baris list dan Left Indent pada paragraf berindentasi
function applyHangingIndentToLine(lineEl: HTMLElement) {
  if (!lineEl || lineEl.nodeType !== Node.ELEMENT_NODE) return;
  const text = (lineEl.textContent || "").replace(/\u00a0/g, " ");
  const { isList, level } = getListIndentInfo(text);
  if (isList) {
    const pad = (level + 1) * 28;
    lineEl.style.paddingLeft = `${pad}px`;
    lineEl.style.textIndent = "-28px";
    lineEl.style.tabSize = "28px";
    lineEl.classList.add("editor-list-item");
    if (level > 0) {
      lineEl.classList.add(`editor-list-item-${level}`);
    }
    lineEl.removeAttribute("data-indent");
    lineEl.removeAttribute("data-first-line-indent");
    lineEl.removeAttribute("data-hanging-indent");
    lineEl.classList.remove(
      "editor-paragraph-indent",
      "editor-indent-1",
      "editor-indent-2",
      "editor-indent-3",
      "editor-first-line-indent",
      "editor-hanging-indent"
    );
  } else if (
    lineEl.getAttribute("data-first-line-indent") === "true" ||
    lineEl.classList.contains("editor-first-line-indent")
  ) {
    // 1. FIRST LINE INDENT: Hanya baris pertama yang menjorok (28px), baris lanjutan di margin kiri (0px)
    lineEl.style.textIndent = "28px";
    lineEl.style.paddingLeft = "";
    lineEl.style.tabSize = "";
    lineEl.setAttribute("data-first-line-indent", "true");
    lineEl.removeAttribute("data-hanging-indent");
    lineEl.removeAttribute("data-indent");
    lineEl.classList.add("editor-first-line-indent");
    lineEl.classList.remove(
      "editor-list-item",
      "editor-hanging-indent",
      "editor-paragraph-indent",
      "editor-indent-1",
      "editor-indent-2",
      "editor-indent-3"
    );
  } else if (
    lineEl.getAttribute("data-hanging-indent") === "true" ||
    lineEl.classList.contains("editor-hanging-indent")
  ) {
    // 2. HANGING INDENT (NON-LIST): Baris pertama di margin kiri (0px), baris lanjutan menjorok (28px)
    lineEl.style.paddingLeft = "28px";
    lineEl.style.textIndent = "-28px";
    lineEl.style.tabSize = "28px";
    lineEl.setAttribute("data-hanging-indent", "true");
    lineEl.removeAttribute("data-first-line-indent");
    lineEl.removeAttribute("data-indent");
    lineEl.classList.add("editor-hanging-indent");
    lineEl.classList.remove(
      "editor-list-item",
      "editor-first-line-indent",
      "editor-paragraph-indent",
      "editor-indent-1",
      "editor-indent-2",
      "editor-indent-3"
    );
  } else {
    lineEl.style.textIndent = "";
    lineEl.classList.remove(
      "editor-list-item",
      "editor-list-item-1",
      "editor-list-item-2",
      "editor-list-item-3",
      "editor-first-line-indent",
      "editor-hanging-indent"
    );

    // Cek apakah ada data-indent, class editor-indent-X, atau leading spaces
    const dataIndent = lineEl.getAttribute("data-indent");
    const classMatch = lineEl.className.match(/editor-indent-(\d+)/);
    const leadingMatch = text.match(/^ +/);

    let indentLevel = 0;
    if (dataIndent && parseInt(dataIndent, 10) > 0) {
      indentLevel = parseInt(dataIndent, 10);
    } else if (classMatch && parseInt(classMatch[1], 10) > 0) {
      indentLevel = parseInt(classMatch[1], 10);
    } else if (leadingMatch && leadingMatch[0].length >= 4) {
      indentLevel = Math.floor(leadingMatch[0].length / 4);
    }

    if (indentLevel > 0) {
      lineEl.style.paddingLeft = `${indentLevel * 28}px`;
      lineEl.setAttribute("data-indent", String(indentLevel));
      lineEl.classList.add("editor-paragraph-indent", `editor-indent-${indentLevel}`);
    } else {
      lineEl.style.paddingLeft = "";
      lineEl.removeAttribute("data-indent");
      lineEl.classList.remove(
        "editor-paragraph-indent",
        "editor-indent-1",
        "editor-indent-2",
        "editor-indent-3"
      );
    }
  }
}

// Memperbarui seluruh baris di editor agar hanging indent selalu aktif & sinkron
function updateAllHangingIndents(editorEl: HTMLElement) {
  if (!editorEl) return;
  const children = editorEl.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child instanceof HTMLElement) {
      applyHangingIndentToLine(child);
    }
  }
}

// Helper untuk mengonversi raw text / markdown menjadi visual HTML WYSIWYG
function convertRawToHtml(raw: string): string {
  if (!raw || !raw.trim()) return "";
  let html = raw;

  // Konversi sintaks markdown jika ada dari data lama
  html = html
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<i>$1</i>")
    .replace(/__([^_]+)__/g, "<u>$1</u>");

  // Jika teks belum dibungkus tag blok (div/p/br), ubah baris menjadi <div>
  if (!/<(?:p|div|br)[^>]*>/i.test(html)) {
    const lines = html.split("\n");
    html = lines
      .map((line) => {
        const leadingSpaces = line.match(/^ +/);
        let content = line;
        if (leadingSpaces) {
          const nbsps = "&nbsp;".repeat(leadingSpaces[0].length);
          content = nbsps + content.slice(leadingSpaces[0].length);
        }
        if (!content) return "<div><br></div>";
        const { isList, level } = getListIndentInfo(line);
        if (isList) {
          const pad = (level + 1) * 28;
          // Normalisasi pemisah antara marker list dan teks menjadi tab (\t) agar tepat sejajar dengan tab stop (28px)
          const normalizedContent = content.replace(
            /^(\s*(?:(?:\d+|[IVXLCDMivxlcdm]+|[a-zA-Z])\.|[•\-\*]))(?:\s+|&nbsp;|\u00a0)+/,
            "$1\t"
          );
          return `<div class="editor-list-item editor-list-item-${level}" style="padding-left: ${pad}px; text-indent: -28px; tab-size: 28px;">${normalizedContent}</div>`;
        }
        if (leadingSpaces && leadingSpaces[0].length >= 4) {
          const indentLevel = Math.floor(leadingSpaces[0].length / 4);
          const pad = indentLevel * 28;
          return `<div class="editor-paragraph-indent editor-indent-${indentLevel}" data-indent="${indentLevel}" style="padding-left: ${pad}px;">${content}</div>`;
        }
        return `<div>${content}</div>`;
      })
      .join("");
  }

  return html;
}

// Menyisipkan teks penomoran / bullet di posisi kursor dan meletakkan kursor persis di akhir spasi
function insertListPrefixAtCaret(editorEl: HTMLElement, prefixText: string) {
  editorEl.focus();
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);

  // Jika editor masih kosong atau hanya whitespace / <br>
  const textContent = (editorEl.textContent || "").trim();
  if (!textContent) {
    editorEl.innerHTML = "";
    const lineDiv = document.createElement("div");
    const textNode = document.createTextNode(prefixText);
    lineDiv.appendChild(textNode);
    applyHangingIndentToLine(lineDiv);
    editorEl.appendChild(lineDiv);

    const newRange = document.createRange();
    newRange.setStart(textNode, textNode.length);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    return;
  }

  // Cari baris saat ini (direct child dari editorEl)
  let directChild: Node | null = range.startContainer;
  while (directChild && directChild.parentNode !== editorEl) {
    directChild = directChild.parentNode;
  }

  // Jika baris saat ini adalah element kosong (misal div kosong hasil Enter)
  if (directChild && directChild.nodeType === Node.ELEMENT_NODE) {
    const el = directChild as HTMLElement;
    if (!el.textContent?.trim()) {
      el.innerHTML = "";
      const textNode = document.createTextNode(prefixText);
      el.appendChild(textNode);
      applyHangingIndentToLine(el);

      const newRange = document.createRange();
      newRange.setStart(textNode, textNode.length);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      return;
    }
  }

  // Jika berada di baris yang sudah ada teks, sisipkan di posisi kursor saat ini
  const textNode = document.createTextNode(prefixText);
  range.deleteContents();
  range.insertNode(textNode);
  if (directChild && directChild instanceof HTMLElement) {
    applyHangingIndentToLine(directChild);
  }

  const newRange = document.createRange();
  newRange.setStart(textNode, textNode.length);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

// Mendapatkan elemen baris saat ini dan teks barisnya
function getLineElementAndText(editorEl: HTMLElement) {
  if (typeof window === "undefined") return null;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);

  let directChild: Node | null = range.startContainer;
  while (directChild && directChild.parentNode !== editorEl) {
    directChild = directChild.parentNode;
  }

  if (!directChild || directChild === editorEl) {
    if (editorEl.childNodes.length === 0) {
      const lineDiv = document.createElement("div");
      lineDiv.innerHTML = "<br>";
      editorEl.appendChild(lineDiv);
      directChild = lineDiv;
    } else {
      directChild = editorEl.firstChild;
    }
  }

  if (!directChild) return null;

  let lineEl: HTMLElement;
  if (directChild.nodeType === Node.TEXT_NODE) {
    const wrapper = document.createElement("div");
    editorEl.insertBefore(wrapper, directChild);
    wrapper.appendChild(directChild);
    lineEl = wrapper;
  } else {
    lineEl = directChild as HTMLElement;
  }

  const lineText = (lineEl.textContent || "").replace(/\u00a0/g, " ");
  return { lineEl, lineText, range, sel };
}

// Auto deteksi pengetikan "1." + spasi, "I." + spasi, "-" / "*" + spasi, "a." + spasi
function handleSpaceAutoList(editorEl: HTMLElement): boolean {
  if (typeof window === "undefined") return false;
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return false;
  const range = sel.getRangeAt(0);

  let textNode: Text | null = null;
  let caretOffset = 0;

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    textNode = range.startContainer as Text;
    caretOffset = range.startOffset;
  } else if (range.startContainer.childNodes.length > 0) {
    const child = range.startContainer.childNodes[Math.max(0, range.startOffset - 1)];
    if (child && child.nodeType === Node.TEXT_NODE) {
      textNode = child as Text;
      caretOffset = textNode.textContent?.length || 0;
    }
  }

  if (!textNode) return false;

  const fullText = textNode.textContent || "";
  const textBefore = fullText.slice(0, caretOffset);
  const textAfter = fullText.slice(caretOffset);

  const numMatch = textBefore.match(/^(\s*)(\d+)\.$/);
  const romanMatch = textBefore.match(/^(\s*)([IVXLCDMivxlcdm]+)\.$/);
  const bulletMatch = textBefore.match(/^(\s*)([\-\*])$/);
  const letterMatch = textBefore.match(/^(\s*)([a-zA-Z])\.$/);

  let replacement = "";
  if (numMatch) {
    replacement = `${numMatch[1]}${numMatch[2]}.\t`;
  } else if (romanMatch && isRomanValid(romanMatch[2])) {
    replacement = `${romanMatch[1]}${romanMatch[2].toUpperCase()}.\t`;
  } else if (bulletMatch) {
    replacement = `${bulletMatch[1]}•\t`;
  } else if (letterMatch) {
    replacement = `${letterMatch[1]}${letterMatch[2]}.\t`;
  }

  if (replacement) {
    textNode.textContent = replacement + textAfter;
    const lineInfo = getLineElementAndText(editorEl);
    if (lineInfo?.lineEl) {
      applyHangingIndentToLine(lineInfo.lineEl);
    }
    const newRange = document.createRange();
    newRange.setStart(textNode, replacement.length);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
    return true;
  }

  return false;
}

// Memindahkan caret (kursor) ke akhir elemen node
function setCaretToEnd(el: Node) {
  if (typeof window === "undefined") return;
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// Memindahkan caret (kursor) ke awal elemen node
function setCaretToStart(el: Node) {
  if (typeof window === "undefined") return;
  const range = document.createRange();
  const sel = window.getSelection();
  if (el.nodeType === Node.ELEMENT_NODE) {
    const firstChild = (el as Element).firstChild;
    if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
      range.setStart(firstChild, 0);
    } else {
      range.setStart(el, 0);
    }
  } else {
    range.setStart(el, 0);
  }
  range.collapse(true);
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// Memindahkan caret tepat di akhir text node tertentu (misal setelah penomoran '2.\t')
function setCaretAtTextEnd(textNode: Text) {
  if (typeof window === "undefined") return;
  const range = document.createRange();
  const sel = window.getSelection();
  range.setStart(textNode, textNode.length);
  range.collapse(true);
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// Memecah teks tunggal menjadi lembaran halaman A4 terpisah
function parseTextToPages(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [""];

  if (rawText.includes("<!-- PAGE_BREAK -->")) {
    const parts = rawText.split("<!-- PAGE_BREAK -->").map((p) => p.trim());
    return parts.length > 0 ? parts : [""];
  }

  if (rawText.includes("--- HALAMAN BARU ---")) {
    const parts = rawText.split("--- HALAMAN BARU ---").map((p) => p.trim());
    return parts.length > 0 ? parts : [""];
  }

  return [rawText];
}

// Menggabungkan seluruh isi HTML halaman menjadi satu teks utuh dengan pemisah PAGE_BREAK
function combinePages(pagesList: string[]): string {
  return (pagesList || []).join("\n\n<!-- PAGE_BREAK -->\n\n");
}

export default function ModalReviewPsikotes({
  item,
  onClose,
  onSuccess,
  isStandalonePage = false,
  initialDetail = null,
}: ModalReviewPsikotesProps) {
  const [pages, setPages] = useState<string[]>([""]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal Konfirmasi Keamanan saat ingin keluar ke Antrean Review
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);
  const [isSavingAndExiting, setIsSavingAndExiting] = useState(false);
  // Modal Konfirmasi Terbitkan Laporan Resmi (Cek Kembali)
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  // Melacak isi konten awal untuk mendeteksi apakah ada perubahan (isDirty)
  const initialContentRef = useRef<string>("");

  // Dropdown Format List & Indentasi
  const [isListDropdownOpen, setIsListDropdownOpen] = useState(false);
  const listDropdownRef = useRef<HTMLDivElement>(null);
  const [isIndentDropdownOpen, setIsIndentDropdownOpen] = useState(false);
  const indentDropdownRef = useRef<HTMLDivElement>(null);

  // Accordion State untuk Sidebar Skor
  const [showPolaKepribadian, setShowPolaKepribadian] = useState(false);
  const [showSindromaKlinis, setShowSindromaKlinis] = useState(false);

  // Mode Tampilan Docs
  const [showScoreSidebar, setShowScoreSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tab Sidebar: Profil Skor vs Rekap Jawaban Pasien
  const [sidebarTab, setSidebarTab] = useState<"skor" | "jawaban">("skor");
  const [isFullscreenJawaban, setIsFullscreenJawaban] = useState(false);

  // Ref Editor contentEditable per Halaman A4
  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);

  // State indikator aktif toolbar format WYSIWYG
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [isFirstLineIndentActive, setIsFirstLineIndentActive] = useState(false);
  const [isHangingIndentActive, setIsHangingIndentActive] = useState(false);
  const [currentIndentLevel, setCurrentIndentLevel] = useState(0);

  const updateToolbarState = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      setIsBoldActive(document.queryCommandState("bold"));
      setIsItalicActive(document.queryCommandState("italic"));
      setIsUnderlineActive(document.queryCommandState("underline"));

      const curIdx = activePageIndex;
      const editor = editorRefs.current[curIdx];
      if (editor) {
        const lineInfo = getLineElementAndText(editor);
        if (lineInfo?.lineEl) {
          const isFirstLine =
            lineInfo.lineEl.getAttribute("data-first-line-indent") === "true" ||
            lineInfo.lineEl.classList.contains("editor-first-line-indent");
          const isHanging =
            lineInfo.lineEl.getAttribute("data-hanging-indent") === "true" ||
            lineInfo.lineEl.classList.contains("editor-hanging-indent") ||
            lineInfo.lineEl.classList.contains("editor-list-item");
          const indentVal = parseInt(
            lineInfo.lineEl.getAttribute("data-indent") || "0",
            10
          );

          setIsFirstLineIndentActive(isFirstLine);
          setIsHangingIndentActive(isHanging);
          setCurrentIndentLevel(indentVal);
        } else {
          setIsFirstLineIndentActive(false);
          setIsHangingIndentActive(false);
          setCurrentIndentLevel(0);
        }
      }
    } catch {}
  }, [activePageIndex]);

  useEffect(() => {
    document.addEventListener("selectionchange", updateToolbarState);
    return () => {
      document.removeEventListener("selectionchange", updateToolbarState);
    };
  }, [updateToolbarState]);

  // Full detail dari API jika diperlukan
  const [fullDetail, setFullDetail] = useState<any>(initialDetail);
  const [isLoadingDetail, setIsLoadingDetail] = useState(!initialDetail);

  // Auto-close dropdown format list & indentasi saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (listDropdownRef.current && !listDropdownRef.current.contains(event.target as Node)) {
        setIsListDropdownOpen(false);
      }
      if (indentDropdownRef.current && !indentDropdownRef.current.contains(event.target as Node)) {
        setIsIndentDropdownOpen(false);
      }
    }
    if (isListDropdownOpen || isIndentDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isListDropdownOpen, isIndentDropdownOpen]);

  // Gabungkan seluruh isi teks halaman untuk disimpan ke DB / localStorage
  const getCombinedCatatan = (pagesList: string[] = pages): string => {
    const currentPages = pagesList.map((p, idx) => {
      const el = editorRefs.current[idx];
      return el ? el.innerHTML : p;
    });
    return combinePages(currentPages);
  };

  useEffect(() => {
    if (!item?.id) return;

    // Utamakan data dari props jika ada
    const initialText = item.catatan_psikolog
      ? item.rekomendasi_psikolog && !item.catatan_psikolog.includes(item.rekomendasi_psikolog)
        ? `${item.catatan_psikolog}\n\nREKOMENDASI:\n${item.rekomendasi_psikolog}`
        : item.catatan_psikolog
      : "";

    setPages(parseTextToPages(initialText).map(convertRawToHtml));
    initialContentRef.current = initialText.trim();
    setSubmitError(null);
    setDraftMessage(null);

    // Gunakan initialDetail jika sudah ada dari parent (mencegah double-fetch)
    if (initialDetail) {
      setFullDetail(initialDetail);
      setIsLoadingDetail(false);
      const dbText = initialDetail.hasil?.catatan_psikolog;
      if (dbText && dbText.trim().length > 0) {
        const apiText =
          initialDetail.hasil.rekomendasi_psikolog &&
          !dbText.includes(initialDetail.hasil.rekomendasi_psikolog)
            ? `${dbText}\n\nREKOMENDASI:\n${initialDetail.hasil.rekomendasi_psikolog}`
            : dbText;
        setPages(parseTextToPages(apiText).map(convertRawToHtml));
        initialContentRef.current = apiText.trim();
      } else {
        // Jika di DB kosong (draft di-reset saat tiket dilepas), bersihkan cache browser
        if (typeof window !== "undefined") {
          localStorage.removeItem(`empathika_draft_review_${item.id}`);
        }
        setPages([""]);
        initialContentRef.current = "";
      }
      return;
    }

    setIsLoadingDetail(true);
    psikotesService
      .getHasilByBooking(item.id)
      .then((res) => {
        if (res?.data) {
          setFullDetail(res.data);
          // Prioritaskan konten telaah dari database resmi
          const dbText = res.data.hasil?.catatan_psikolog;
          if (dbText && dbText.trim().length > 0) {
            const apiText =
              res.data.hasil.rekomendasi_psikolog &&
              !dbText.includes(res.data.hasil.rekomendasi_psikolog)
                ? `${dbText}\n\nREKOMENDASI:\n${res.data.hasil.rekomendasi_psikolog}`
                : dbText;
            setPages((curPages) => {
              const curCombined = combinePages(curPages).trim();
              if (!curCombined || curCombined === initialContentRef.current) {
                initialContentRef.current = apiText.trim();
                return parseTextToPages(apiText).map(convertRawToHtml);
              }
              return curPages;
            });
          } else {
            // Database kosong -> bersihkan cache browser & kosongkan lembar telaah
            if (typeof window !== "undefined") {
              localStorage.removeItem(`empathika_draft_review_${item.id}`);
            }
            setPages([""]);
            initialContentRef.current = "";
          }
        }
      })
      .catch((err) => {
        console.warn("Gagal memuat detail lengkap asesmen:", err);
      })
      .finally(() => {
        setIsLoadingDetail(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, initialDetail]);

  // Auto-save draf secara berkala ke localStorage setiap kali ada perubahan teks
  useEffect(() => {
    if (!item?.id || !pages.some((p) => p.trim().length > 0)) return;
    try {
      const combined = combinePages(pages);
      localStorage.setItem(`empathika_draft_review_${item.id}`, combined);
    } catch {
      // Safe catch jika storage quota penuh
    }
  }, [pages, item?.id]);

  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const activePsiId =
    typeof window !== "undefined"
      ? localStorage.getItem("active_psikolog_id") || sessionStorage.getItem("active_psikolog_id")
      : null;
  const activePsiName =
    typeof window !== "undefined"
      ? localStorage.getItem("active_psikolog_name") || sessionStorage.getItem("active_psikolog_name")
      : null;

  const isClaimedByMe = Boolean(
    item?.id_psikolog && (
      isAdmin ||
      (user?.id && (
        item.psikolog?.id === user.id ||
        item.id_psikolog === user.id ||
        (item.psikolog as any)?.id_account === user.id
      )) ||
      (activePsiId && (
        item.id_psikolog === activePsiId ||
        item.psikolog?.id === activePsiId
      )) ||
      (user?.name && item.psikolog?.nama && (
        item.psikolog.nama.toLowerCase().includes(user.name.toLowerCase()) ||
        user.name.toLowerCase().includes(item.psikolog.nama.toLowerCase())
      )) ||
      (activePsiName && item.psikolog?.nama && (
        item.psikolog.nama.toLowerCase().includes(activePsiName.toLowerCase()) ||
        activePsiName.toLowerCase().includes(item.psikolog.nama.toLowerCase())
      ))
    )
  );

  const isSudahReview = item?.status_pengerjaan === "SELESAI";
  const isLockedByOther = Boolean(
    item?.id_psikolog &&
    !isClaimedByMe &&
    !isAdmin &&
    !isSudahReview
  );
  const isReadOnly = isSudahReview || isLockedByOther;

  // Handler Keamanan Navigasi Kembali ke Antrean Review:
  // Hanya munculkan peringatan JIKA kedeteksi ada perubahan (isDirty). Jika tidak ada perubahan, langsung kembali.
  const handleAttemptBack = () => {
    const currentContent = combinePages(pages).trim();
    const hasChanged = currentContent !== initialContentRef.current.trim();

    // Jika tidak ada perubahan atau laporan dalam mode read-only, langsung kembali tanpa notifikasi
    if (!hasChanged || isReadOnly) {
      onClose();
      return;
    }

    // Jika kedeteksi ada perubahan baru munculkan dialog konfirmasi
    setShowExitConfirmModal(true);
  };

  // Proteksi sebelum menutup tab/refresh browser agar ketikan tidak hilang jika ada perubahan
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentContent = combinePages(pages).trim();
      const hasChanged = currentContent !== initialContentRef.current.trim();
      if (hasChanged && !isReadOnly) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pages, isReadOnly]);

  if (!item) return null;

  const detailSkor = fullDetail?.hasil?.detail_skor || item.detail_skor;
  const isMcmi = Boolean(
    detailSkor?.validitas ||
    detailSkor?.polaKepribadianList ||
    item.nama_paket?.toLowerCase().includes("mcmi") ||
    item.nama_paket?.toLowerCase().includes("multiaxial")
  );

  const handleAddPage = (insertIndex?: number) => {
    setPages((prev) => {
      const targetIdx = typeof insertIndex === "number" ? insertIndex : prev.length;
      const next = [...prev];
      next.splice(targetIdx, 0, "");
      return next;
    });
    const newActiveIdx = typeof insertIndex === "number" ? insertIndex : pages.length;
    setActivePageIndex(newActiveIdx);
    setTimeout(() => {
      editorRefs.current[newActiveIdx]?.focus();
    }, 50);
  };

  const handleRemovePage = (pageIdx: number) => {
    if (pages.length <= 1) return;
    const pageContent = (pages[pageIdx] || "").replace(/<[^>]+>/g, "").trim();
    if (pageContent.length > 0) {
      if (!window.confirm(`Hapus Halaman ${pageIdx + 1}? Tulisan pada halaman ini akan ikut terhapus.`)) {
        return;
      }
    }
    setPages((prev) => prev.filter((_, idx) => idx !== pageIdx));
    const newActiveIdx = Math.max(0, pageIdx - 1);
    setActivePageIndex(newActiveIdx);
    setTimeout(() => {
      editorRefs.current[newActiveIdx]?.focus();
    }, 50);
  };

  // =========================================================================
  // GAYA GOOGLE DOCS / WORD: WYSIWYG FORMATTING, LISTS & KEYBOARD EVENTS
  // =========================================================================

  const handleContentChange = (pageIdx: number) => {
    const editor = editorRefs.current[pageIdx];
    if (!editor) return;
    updateAllHangingIndents(editor);
    const html = editor.innerHTML;
    setPages((prev) => {
      const next = [...prev];
      next[pageIdx] = html;
      return next;
    });

    // Cek kebutuhan pemindahan tanda tangan jika halaman ini adalah halaman terakhir
    const isPage1 = pageIdx === 0;
    const realClientHeight = editor.clientHeight > 100 ? editor.clientHeight - 8 : 0;
    const sigCapacity = Math.max(isPage1 ? PAGE1_MAX_WITH_SIG : SUBSEQUENT_MAX_WITH_SIG, realClientHeight ? realClientHeight - 160 : 0);
    const isLast = pageIdx === pages.length - 1;

    if (isLast && editor.scrollHeight > sigCapacity) {
      setPages((prev) => {
        const next = [...prev];
        next.push("");
        return next;
      });
    }
  };

  const applyFormat = (
    type:
      | "bold"
      | "italic"
      | "underline"
      | "number"
      | "roman"
      | "bullet"
      | "indent"
      | "outdent"
      | "first-line-indent"
      | "hanging-indent"
  ) => {
    const curIdx = activePageIndex;
    const editor = editorRefs.current[curIdx] || editorRefs.current[0];
    if (editor) {
      editor.focus();
    }

    if (type === "bold") {
      document.execCommand("bold", false);
      updateToolbarState();
      return;
    }

    if (type === "italic") {
      document.execCommand("italic", false);
      updateToolbarState();
      return;
    }

    if (type === "underline") {
      document.execCommand("underline", false);
      updateToolbarState();
      return;
    }

    if (type === "first-line-indent") {
      if (editor) {
        const lineInfo = getLineElementAndText(editor);
        if (lineInfo && lineInfo.lineEl) {
          const isCurrentlyFirstLine =
            lineInfo.lineEl.getAttribute("data-first-line-indent") === "true" ||
            lineInfo.lineEl.classList.contains("editor-first-line-indent");

          if (isCurrentlyFirstLine) {
            lineInfo.lineEl.removeAttribute("data-first-line-indent");
            lineInfo.lineEl.style.textIndent = "";
            lineInfo.lineEl.classList.remove("editor-first-line-indent");
          } else {
            lineInfo.lineEl.removeAttribute("data-hanging-indent");
            lineInfo.lineEl.removeAttribute("data-indent");
            lineInfo.lineEl.style.paddingLeft = "";
            lineInfo.lineEl.style.textIndent = "28px";
            lineInfo.lineEl.setAttribute("data-first-line-indent", "true");
            lineInfo.lineEl.classList.remove(
              "editor-hanging-indent",
              "editor-list-item",
              "editor-paragraph-indent"
            );
            lineInfo.lineEl.classList.add("editor-first-line-indent");
          }
          handleContentChange(curIdx);
          updateToolbarState();
          return;
        }
      }
      return;
    }

    if (type === "hanging-indent") {
      if (editor) {
        const lineInfo = getLineElementAndText(editor);
        if (lineInfo && lineInfo.lineEl) {
          const isCurrentlyHanging =
            lineInfo.lineEl.getAttribute("data-hanging-indent") === "true" ||
            lineInfo.lineEl.classList.contains("editor-hanging-indent");

          if (isCurrentlyHanging) {
            lineInfo.lineEl.removeAttribute("data-hanging-indent");
            lineInfo.lineEl.style.paddingLeft = "";
            lineInfo.lineEl.style.textIndent = "";
            lineInfo.lineEl.classList.remove("editor-hanging-indent");
          } else {
            lineInfo.lineEl.removeAttribute("data-first-line-indent");
            lineInfo.lineEl.removeAttribute("data-indent");
            lineInfo.lineEl.style.paddingLeft = "28px";
            lineInfo.lineEl.style.textIndent = "-28px";
            lineInfo.lineEl.style.tabSize = "28px";
            lineInfo.lineEl.setAttribute("data-hanging-indent", "true");
            lineInfo.lineEl.classList.remove(
              "editor-first-line-indent",
              "editor-paragraph-indent"
            );
            lineInfo.lineEl.classList.add("editor-hanging-indent");
          }
          handleContentChange(curIdx);
          updateToolbarState();
          return;
        }
      }
      return;
    }

    if (type === "number") {
      if (editor) {
        insertListPrefixAtCaret(editor, "1.\t");
        handleContentChange(curIdx);
      }
      updateToolbarState();
      return;
    }

    if (type === "roman") {
      if (editor) {
        insertListPrefixAtCaret(editor, "I.\t");
        handleContentChange(curIdx);
      }
      updateToolbarState();
      return;
    }

    if (type === "bullet") {
      if (editor) {
        insertListPrefixAtCaret(editor, "•\t");
        handleContentChange(curIdx);
      }
      updateToolbarState();
      return;
    }

    if (type === "indent") {
      if (editor) {
        const lineInfo = getLineElementAndText(editor);
        if (lineInfo && lineInfo.lineEl) {
          const curIndent = parseInt(lineInfo.lineEl.getAttribute("data-indent") || "0", 10);
          const nextIndent = curIndent + 1;
          lineInfo.lineEl.setAttribute("data-indent", String(nextIndent));
          lineInfo.lineEl.style.paddingLeft = `${nextIndent * 28}px`;
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.removeAttribute("data-first-line-indent");
          lineInfo.lineEl.removeAttribute("data-hanging-indent");
          lineInfo.lineEl.className = `editor-paragraph-indent editor-indent-${nextIndent}`;
          applyHangingIndentToLine(lineInfo.lineEl);
          handleContentChange(curIdx);
          updateToolbarState();
          return;
        }
      }
      return;
    }

    if (type === "outdent") {
      if (editor) {
        const lineInfo = getLineElementAndText(editor);
        if (lineInfo && lineInfo.lineEl) {
          if (lineInfo.lineEl.getAttribute("data-first-line-indent") === "true") {
            lineInfo.lineEl.removeAttribute("data-first-line-indent");
            lineInfo.lineEl.style.textIndent = "";
            lineInfo.lineEl.classList.remove("editor-first-line-indent");
            handleContentChange(curIdx);
            updateToolbarState();
            return;
          }
          if (lineInfo.lineEl.getAttribute("data-hanging-indent") === "true") {
            lineInfo.lineEl.removeAttribute("data-hanging-indent");
            lineInfo.lineEl.style.paddingLeft = "";
            lineInfo.lineEl.style.textIndent = "";
            lineInfo.lineEl.classList.remove("editor-hanging-indent");
            handleContentChange(curIdx);
            updateToolbarState();
            return;
          }

          const curIndent = parseInt(lineInfo.lineEl.getAttribute("data-indent") || "0", 10);
          if (curIndent > 0) {
            const nextIndent = curIndent - 1;
            if (nextIndent > 0) {
              lineInfo.lineEl.setAttribute("data-indent", String(nextIndent));
              lineInfo.lineEl.style.paddingLeft = `${nextIndent * 28}px`;
              lineInfo.lineEl.className = `editor-paragraph-indent editor-indent-${nextIndent}`;
            } else {
              lineInfo.lineEl.removeAttribute("data-indent");
              lineInfo.lineEl.style.paddingLeft = "";
              lineInfo.lineEl.className = "";
            }
            applyHangingIndentToLine(lineInfo.lineEl);
            handleContentChange(curIdx);
            updateToolbarState();
            return;
          }
        }
      }
      document.execCommand("outdent", false);
      handleContentChange(curIdx);
      updateToolbarState();
      return;
    }
  };

  const handleKeyDownOnPage = (
    e: React.KeyboardEvent<HTMLDivElement>,
    pageIdx: number
  ) => {
    setActivePageIndex(pageIdx);
    const editor = editorRefs.current[pageIdx];
    if (!editor) return;

    // 0. SHORTCUT CTRL+ENTER: TAMBAH LEMBAR HALAMAN BARU DI BAWAHNYA
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAddPage(pageIdx + 1);
      return;
    }

    // 1. SHORTCUTS CTRL+B, CTRL+I & CTRL+U
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyFormat("bold");
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyFormat("italic");
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
      e.preventDefault();
      applyFormat("underline");
      return;
    }

    // 2. SHIFT + ENTER: MEMBUAT BARIS BARU (<br>) DALAM PARAGRAF YANG SAMA (SOFT LINE BREAK)
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const br = document.createElement("br");
        range.insertNode(br);
        const lineInfo = getLineElementAndText(editor);
        if (lineInfo?.lineEl && br === lineInfo.lineEl.lastChild) {
          const ghostBr = document.createElement("br");
          lineInfo.lineEl.appendChild(ghostBr);
        }
        range.setStartAfter(br);
        range.setEndAfter(br);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        document.execCommand("insertLineBreak");
      }
      handleContentChange(pageIdx);
      return;
    }

    // 3. TAB (INDENTASI) & SHIFT+TAB (OUTDENT)
    if (e.key === "Tab") {
      e.preventDefault();
      const lineInfo = getLineElementAndText(editor);
      const lineText = lineInfo ? lineInfo.lineText : "";

      if (e.shiftKey) {
        // Shift + Tab: outdent
        if (lineInfo && lineInfo.lineEl) {
          const curIndent = parseInt(lineInfo.lineEl.getAttribute("data-indent") || "0", 10);
          if (curIndent > 0) {
            const nextIndent = curIndent - 1;
            if (nextIndent > 0) {
              lineInfo.lineEl.setAttribute("data-indent", String(nextIndent));
              lineInfo.lineEl.style.paddingLeft = `${nextIndent * 28}px`;
              lineInfo.lineEl.className = `editor-paragraph-indent editor-indent-${nextIndent}`;
            } else {
              lineInfo.lineEl.removeAttribute("data-indent");
              lineInfo.lineEl.style.paddingLeft = "";
              lineInfo.lineEl.className = "";
            }
            applyHangingIndentToLine(lineInfo.lineEl);
            setCaretToEnd(lineInfo.lineEl);
            handleContentChange(pageIdx);
            return;
          }

          const romanMatch = lineText.match(/^(\s*)([IVXLCDMivxlcdm]+)\.(\s+)(.*)$/);
          const letterMatch = lineText.match(/^(\s*)([a-zA-Z])\.(\s+)(.*)$/);
          const bulletMatch = lineText.match(/^(\s*)([•\-\*])(\s+)(.*)$/);

          if (romanMatch && romanMatch[1].length >= 4) {
            const newIndent = "\u00a0".repeat(romanMatch[1].length - 4);
            lineInfo.lineEl.innerHTML = `${newIndent}a.\t${romanMatch[4] || "<br>"}`;
            setCaretToEnd(lineInfo.lineEl);
            handleContentChange(pageIdx);
            return;
          } else if (letterMatch && letterMatch[1].length >= 4) {
            const newIndent = "\u00a0".repeat(letterMatch[1].length - 4);
            lineInfo.lineEl.innerHTML = `${newIndent}1.\t${letterMatch[4] || "<br>"}`;
            setCaretToEnd(lineInfo.lineEl);
            handleContentChange(pageIdx);
            return;
          } else if (bulletMatch && bulletMatch[1].length >= 4) {
            const newIndent = "\u00a0".repeat(bulletMatch[1].length - 4);
            lineInfo.lineEl.innerHTML = `${newIndent}•\t${bulletMatch[4] || "<br>"}`;
            setCaretToEnd(lineInfo.lineEl);
            handleContentChange(pageIdx);
            return;
          }
        }
        document.execCommand("outdent", false);
        handleContentChange(pageIdx);
        return;
      } else {
        // Tab: indent / convert to sublist
        if (lineInfo && lineInfo.lineEl) {
          const numMatch = lineText.match(/^(\s*)(\d+)\.(\s+)(.*)$/);
          const letterMatch = lineText.match(/^(\s*)([a-zA-Z])\.(\s+)(.*)$/);
          const bulletMatch = lineText.match(/^(\s*)([•\-\*])(\s+)(.*)$/);

          if (numMatch) {
            const newIndent = "\u00a0".repeat((numMatch[1] || "").length + 4);
            lineInfo.lineEl.innerHTML = `${newIndent}a.\t${numMatch[4] || "<br>"}`;
            setCaretToEnd(lineInfo.lineEl);
            handleContentChange(pageIdx);
            return;
          } else if (letterMatch) {
            const newIndent = "\u00a0".repeat((letterMatch[1] || "").length + 4);
            lineInfo.lineEl.innerHTML = `${newIndent}i.\t${letterMatch[4] || "<br>"}`;
            setCaretToEnd(lineInfo.lineEl);
            handleContentChange(pageIdx);
            return;
          } else if (bulletMatch) {
            const newIndent = "\u00a0".repeat((bulletMatch[1] || "").length + 4);
            lineInfo.lineEl.innerHTML = `${newIndent}•\t${bulletMatch[4] || "<br>"}`;
            setCaretToEnd(lineInfo.lineEl);
            handleContentChange(pageIdx);
            return;
          }

          // Jika baris paragraf biasa / baris kosong: tambah level indentasi
          const curIndent = parseInt(lineInfo.lineEl.getAttribute("data-indent") || "0", 10);
          const nextIndent = curIndent + 1;
          lineInfo.lineEl.setAttribute("data-indent", String(nextIndent));
          lineInfo.lineEl.style.paddingLeft = `${nextIndent * 28}px`;
          lineInfo.lineEl.className = `editor-paragraph-indent editor-indent-${nextIndent}`;
          applyHangingIndentToLine(lineInfo.lineEl);
          setCaretToEnd(lineInfo.lineEl);
          handleContentChange(pageIdx);
          return;
        }
        insertListPrefixAtCaret(editor, "\u00a0\u00a0\u00a0\u00a0");
        handleContentChange(pageIdx);
        return;
      }
    }

    // 4. SPACE: AUTO CONVERT LIST MARKER (1. , I. , - , * , a. )
    if (e.key === " ") {
      if (handleSpaceAutoList(editor)) {
        e.preventDefault();
        handleContentChange(pageIdx);
        return;
      }
    }

    // 5. BACKSPACE: PENGHAPUSAN NOMOR KOSONG & NORMALISASI INDENTASI PARAGRAF (GAYA WORD & DOCS)
    if (e.key === "Backspace") {
      const lineInfo = getLineElementAndText(editor);
      if (lineInfo && lineInfo.lineEl) {
        const fullClean = (lineInfo.lineEl.textContent || "").replace(/\u00a0/g, " ");
        const trimmed = fullClean.trim();

        // A. Cek apakah baris HANYA berisi penanda list (nomor, romawi, huruf, atau bullet) tanpa teks
        const emptyNum = /^(\d+)\.$/.test(trimmed);
        const emptyRoman = /^([IVXLCDMivxlcdm]+)\.$/i.test(trimmed) && isRomanValid(trimmed.slice(0, -1));
        const emptyLetter = /^([a-zA-Z])\.$/.test(trimmed);
        const emptyBullet = /^[•\-\*]$/.test(trimmed);

        const isEmptyList = emptyNum || emptyRoman || emptyLetter || emptyBullet;

        if (isEmptyList) {
          e.preventDefault();

          // Cek level indentasi list saat ini
          const leadingSpaces = fullClean.match(/^ +/);
          const indentLength = leadingSpaces ? leadingSpaces[0].length : 0;
          const listLevel = Math.floor(indentLength / 4);

          // PERILAKU GOOGLE DOCS / WORD:
          // 1. Hapus marker nomor/bullet dan format list
          // 2. Pertahankan posisi indentasi paragraf sesuai dengan awal teks setelah nomor pada item sebelumnya
          //    (misal nomor 1. di margin kiri -> awal teks berjarak 28px / level 1 -> paragraf baru tetap di 28px)
          const targetIndentLevel = listLevel + 1;
          const targetPad = targetIndentLevel * 28;

          lineInfo.lineEl.innerHTML = "<br>";
          lineInfo.lineEl.style.paddingLeft = `${targetPad}px`;
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.setAttribute("data-indent", String(targetIndentLevel));
          lineInfo.lineEl.className = `editor-paragraph-indent editor-indent-${targetIndentLevel}`;
          applyHangingIndentToLine(lineInfo.lineEl);

          // 3. Letakkan kursor tepat di baris ini
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.setStart(lineInfo.lineEl, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }

          handleContentChange(pageIdx);
          return;
        }

        // B. Jika pengguna berada di baris First Line Indent atau Hanging Indent dan berada di awal baris:
        const isFirstLineIndent =
          lineInfo.lineEl.getAttribute("data-first-line-indent") === "true" ||
          lineInfo.lineEl.classList.contains("editor-first-line-indent");
        const isHangingIndent =
          lineInfo.lineEl.getAttribute("data-hanging-indent") === "true" ||
          lineInfo.lineEl.classList.contains("editor-hanging-indent");

        if (isFirstLineIndent || isHangingIndent) {
          const sel = window.getSelection();
          const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
          const isAtStart =
            !trimmed ||
            (range && range.startContainer === lineInfo.lineEl && range.startOffset === 0) ||
            (range &&
              range.startContainer.nodeType === Node.TEXT_NODE &&
              range.startOffset === 0 &&
              range.startContainer === lineInfo.lineEl.firstChild);

          if (isAtStart) {
            e.preventDefault();
            lineInfo.lineEl.removeAttribute("data-first-line-indent");
            lineInfo.lineEl.removeAttribute("data-hanging-indent");
            lineInfo.lineEl.style.textIndent = "";
            lineInfo.lineEl.style.paddingLeft = "";
            lineInfo.lineEl.style.tabSize = "";
            lineInfo.lineEl.classList.remove(
              "editor-first-line-indent",
              "editor-hanging-indent"
            );
            applyHangingIndentToLine(lineInfo.lineEl);
            if (sel) {
              const newRange = document.createRange();
              newRange.setStart(lineInfo.lineEl, 0);
              newRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(newRange);
            }
            handleContentChange(pageIdx);
            return;
          }
        }

        // C. Jika pengguna berada di baris paragraf berindentasi (data-indent > 0) dan menekan Backspace di awal baris:
        //    Kurangi indentasi (outdent) 1 tingkat, jika sampai level 0 maka kembali ke margin kiri
        const curIndent = parseInt(lineInfo.lineEl.getAttribute("data-indent") || "0", 10);
        if (curIndent > 0) {
          const sel = window.getSelection();
          const range = sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
          const isAtStart =
            !trimmed ||
            (range && range.startContainer === lineInfo.lineEl && range.startOffset === 0) ||
            (range &&
              range.startContainer.nodeType === Node.TEXT_NODE &&
              range.startOffset === 0 &&
              range.startContainer === lineInfo.lineEl.firstChild);

          if (isAtStart) {
            e.preventDefault();
            const nextIndent = curIndent - 1;
            if (nextIndent > 0) {
              lineInfo.lineEl.setAttribute("data-indent", String(nextIndent));
              lineInfo.lineEl.style.paddingLeft = `${nextIndent * 28}px`;
              lineInfo.lineEl.className = `editor-paragraph-indent editor-indent-${nextIndent}`;
            } else {
              lineInfo.lineEl.removeAttribute("data-indent");
              lineInfo.lineEl.style.paddingLeft = "";
              lineInfo.lineEl.className = "";
            }
            applyHangingIndentToLine(lineInfo.lineEl);
            if (sel) {
              const newRange = document.createRange();
              newRange.setStart(lineInfo.lineEl, 0);
              newRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(newRange);
            }
            handleContentChange(pageIdx);
            return;
          }
        }

        // D. Jika pengguna menekan Backspace persis di antara marker list dan awal teks teks item list:
        //    Hapus marker nomor dan jadikan teks tersebut paragraf berindentasi
        const listPrefixMatch = fullClean.match(
          /^(\s*(?:(?:\d+|[IVXLCDMivxlcdm]+|[a-zA-Z])\.|[•\-\*])\s+)(.*)$/
        );
        if (listPrefixMatch) {
          const prefixStr = listPrefixMatch[1];
          const remainingText = listPrefixMatch[2];
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);

            let offsetInLine = 0;
            if (range.startContainer === lineInfo.lineEl) {
              offsetInLine = range.startOffset;
            } else {
              const walker = document.createTreeWalker(lineInfo.lineEl, NodeFilter.SHOW_TEXT, null);
              let curr = walker.nextNode();
              while (curr && curr !== range.startContainer) {
                offsetInLine += curr.textContent?.length || 0;
                curr = walker.nextNode();
              }
              if (curr === range.startContainer) {
                offsetInLine += range.startOffset;
              }
            }

            if (offsetInLine <= prefixStr.length) {
              e.preventDefault();
              lineInfo.lineEl.innerHTML = remainingText || "<br>";
              lineInfo.lineEl.setAttribute("data-indent", "1");
              lineInfo.lineEl.style.paddingLeft = "28px";
              lineInfo.lineEl.style.textIndent = "";
              lineInfo.lineEl.className = "editor-paragraph-indent editor-indent-1";
              applyHangingIndentToLine(lineInfo.lineEl);

              const newRange = document.createRange();
              newRange.setStart(lineInfo.lineEl, 0);
              newRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(newRange);

              handleContentChange(pageIdx);
              return;
            }
          }
        }
      }
    }

    // 6. ENTER (REGULER): AUTO NUMBERING / BULLET, FIRST-LINE, HANGING & PAGE OVERFLOW
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const lineInfo = getLineElementAndText(editor);
      if (!lineInfo || !lineInfo.lineEl) {
        const newDiv = document.createElement("div");
        newDiv.innerHTML = "<br>";
        editor.appendChild(newDiv);
        setCaretToStart(newDiv);
        handleContentChange(pageIdx);
        return;
      }

      const text = lineInfo.lineText;
      const curIndent = parseInt(lineInfo.lineEl.getAttribute("data-indent") || "0", 10);
      const isFirstLineIndent =
        lineInfo.lineEl.getAttribute("data-first-line-indent") === "true" ||
        lineInfo.lineEl.classList.contains("editor-first-line-indent");
      const isHangingIndent =
        lineInfo.lineEl.getAttribute("data-hanging-indent") === "true" ||
        lineInfo.lineEl.classList.contains("editor-hanging-indent");

      // Cek posisi kursor: apakah kursor berada di paling awal baris (offset 0)
      const sel = window.getSelection();
      let isAtLineStart = false;
      if (sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0);
        if (r.startContainer === lineInfo.lineEl && r.startOffset === 0) {
          isAtLineStart = true;
        } else if (
          r.startContainer.nodeType === Node.TEXT_NODE &&
          r.startOffset === 0 &&
          r.startContainer === lineInfo.lineEl.firstChild
        ) {
          isAtLineStart = true;
        }
      }

      // Jika kursor tepat di awal baris yang sudah ada teks: sisipkan baris kosong di atasnya
      if (isAtLineStart && text.trim().length > 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.innerHTML = "<br>";
        lineInfo.lineEl.before(emptyDiv);
        handleContentChange(pageIdx);
        return;
      }

      // Pisahkan teks sebelum dan sesudah kursor (DOM Range extract)
      let afterFragment: DocumentFragment | null = null;
      let hasTextAfter = false;

      if (sel && sel.rangeCount > 0) {
        const curRange = sel.getRangeAt(0);
        try {
          const afterRange = document.createRange();
          afterRange.setStart(curRange.endContainer, curRange.endOffset);
          afterRange.setEnd(lineInfo.lineEl, lineInfo.lineEl.childNodes.length);
          afterFragment = afterRange.extractContents();
          hasTextAfter = Boolean(
            afterFragment.textContent && afterFragment.textContent.trim().length > 0
          );
        } catch {
          // Safe catch
        }
      }

      // Pastikan lineEl tetap memiliki <br> jika teksnya kosong setelah dipotong
      if (lineInfo.lineEl.childNodes.length === 0 || !lineInfo.lineEl.textContent?.trim()) {
        const prefixMatch = text.match(/^(\s*(?:(?:\d+|[IVXLCDMivxlcdm]+|[a-zA-Z])\.|[•\-\*])\s+)/);
        if (prefixMatch && lineInfo.lineEl.textContent?.trim() !== "") {
          // Masih memiliki prefix list
        } else if (!lineInfo.lineEl.querySelector("br")) {
          lineInfo.lineEl.innerHTML = "<br>";
        }
      }

      // Cek apakah pengguna berada di batas bawah lembar halaman A4 (menuju halaman berikutnya)
      const isPage1 = pageIdx === 0;
      const maxSheetHeight = isPage1 ? PAGE1_FULL_HEIGHT : SUBSEQUENT_FULL_HEIGHT;
      const isAtPageBottom =
        lineInfo.lineEl === editor.lastElementChild &&
        editor.scrollHeight >= (editor.clientHeight > 100 ? editor.clientHeight - 40 : maxSheetHeight - 50);

      if (isAtPageBottom) {
        // Pindah otomatis ke halaman berikutnya saat mencapai batas bawah
        if (pageIdx === pages.length - 1) {
          handleAddPage(pageIdx + 1);
          return;
        } else {
          setActivePageIndex(pageIdx + 1);
          setTimeout(() => {
            const nextEditor = editorRefs.current[pageIdx + 1];
            if (nextEditor) {
              nextEditor.focus();
              setCaretToStart(nextEditor);
            }
          }, 50);
          return;
        }
      }

      // A. NUMBERED LIST
      const numMatch = text.match(/^(\s*)(\d+)\.(\s+)(.*)$/);
      if (numMatch) {
        if (!numMatch[4].trim() && !hasTextAfter) {
          // Baris kosong: keluar dari numbered list (revert ke margin normal)
          lineInfo.lineEl.innerHTML = "<br>";
          lineInfo.lineEl.style.paddingLeft = "";
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.style.tabSize = "";
          lineInfo.lineEl.removeAttribute("data-indent");
          lineInfo.lineEl.removeAttribute("data-first-line-indent");
          lineInfo.lineEl.removeAttribute("data-hanging-indent");
          lineInfo.lineEl.className = "";
          applyHangingIndentToLine(lineInfo.lineEl);
          setCaretToStart(lineInfo.lineEl);
          handleContentChange(pageIdx);
          return;
        }

        const indent = numMatch[1] ? "\u00a0".repeat(numMatch[1].length) : "";
        const nextNum = parseInt(numMatch[2], 10) + 1;
        const prefix = `${indent}${nextNum}.\t`;

        const newDiv = document.createElement("div");
        applyHangingIndentToLine(newDiv);

        const prefixNode = document.createTextNode(prefix);
        newDiv.appendChild(prefixNode);

        if (afterFragment && hasTextAfter) {
          newDiv.appendChild(afterFragment);
        } else {
          newDiv.appendChild(document.createElement("br"));
        }

        lineInfo.lineEl.after(newDiv);
        setCaretAtTextEnd(prefixNode);
        handleContentChange(pageIdx);
        return;
      }

      // B. ROMAN LIST
      const romanMatch = text.match(/^(\s*)([IVXLCDMivxlcdm]+)\.(\s+)(.*)$/);
      if (romanMatch && isRomanValid(romanMatch[2])) {
        if (!romanMatch[4].trim() && !hasTextAfter) {
          lineInfo.lineEl.innerHTML = "<br>";
          lineInfo.lineEl.style.paddingLeft = "";
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.style.tabSize = "";
          lineInfo.lineEl.removeAttribute("data-indent");
          lineInfo.lineEl.className = "";
          applyHangingIndentToLine(lineInfo.lineEl);
          setCaretToStart(lineInfo.lineEl);
          handleContentChange(pageIdx);
          return;
        }

        const indent = romanMatch[1] ? "\u00a0".repeat(romanMatch[1].length) : "";
        const curVal = fromRoman(romanMatch[2]);
        const nextRomanStr = toRoman(curVal + 1);
        const prefix = `${indent}${nextRomanStr}.\t`;

        const newDiv = document.createElement("div");
        applyHangingIndentToLine(newDiv);

        const prefixNode = document.createTextNode(prefix);
        newDiv.appendChild(prefixNode);

        if (afterFragment && hasTextAfter) {
          newDiv.appendChild(afterFragment);
        } else {
          newDiv.appendChild(document.createElement("br"));
        }

        lineInfo.lineEl.after(newDiv);
        setCaretAtTextEnd(prefixNode);
        handleContentChange(pageIdx);
        return;
      }

      // C. BULLET LIST
      const bulletMatch = text.match(/^(\s*)([•\-\*])(\s+)(.*)$/);
      if (bulletMatch) {
        if (!bulletMatch[4].trim() && !hasTextAfter) {
          lineInfo.lineEl.innerHTML = "<br>";
          lineInfo.lineEl.style.paddingLeft = "";
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.style.tabSize = "";
          lineInfo.lineEl.removeAttribute("data-indent");
          lineInfo.lineEl.className = "";
          applyHangingIndentToLine(lineInfo.lineEl);
          setCaretToStart(lineInfo.lineEl);
          handleContentChange(pageIdx);
          return;
        }

        const indent = bulletMatch[1] ? "\u00a0".repeat(bulletMatch[1].length) : "";
        const prefix = `${indent}•\t`;

        const newDiv = document.createElement("div");
        applyHangingIndentToLine(newDiv);

        const prefixNode = document.createTextNode(prefix);
        newDiv.appendChild(prefixNode);

        if (afterFragment && hasTextAfter) {
          newDiv.appendChild(afterFragment);
        } else {
          newDiv.appendChild(document.createElement("br"));
        }

        lineInfo.lineEl.after(newDiv);
        setCaretAtTextEnd(prefixNode);
        handleContentChange(pageIdx);
        return;
      }

      // D. LETTER LIST
      const letterMatch = text.match(/^(\s*)([a-zA-Z])\.(\s+)(.*)$/);
      if (letterMatch) {
        if (!letterMatch[4].trim() && !hasTextAfter) {
          lineInfo.lineEl.innerHTML = "<br>";
          lineInfo.lineEl.style.paddingLeft = "";
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.style.tabSize = "";
          lineInfo.lineEl.removeAttribute("data-indent");
          lineInfo.lineEl.className = "";
          applyHangingIndentToLine(lineInfo.lineEl);
          setCaretToStart(lineInfo.lineEl);
          handleContentChange(pageIdx);
          return;
        }

        const indent = letterMatch[1] ? "\u00a0".repeat(letterMatch[1].length) : "";
        const nextChar = String.fromCharCode(letterMatch[2].charCodeAt(0) + 1);
        const prefix = `${indent}${nextChar}.\t`;

        const newDiv = document.createElement("div");
        applyHangingIndentToLine(newDiv);

        const prefixNode = document.createTextNode(prefix);
        newDiv.appendChild(prefixNode);

        if (afterFragment && hasTextAfter) {
          newDiv.appendChild(afterFragment);
        } else {
          newDiv.appendChild(document.createElement("br"));
        }

        lineInfo.lineEl.after(newDiv);
        setCaretAtTextEnd(prefixNode);
        handleContentChange(pageIdx);
        return;
      }

      // E. FIRST LINE INDENT
      if (isFirstLineIndent) {
        if (!text.trim() && !hasTextAfter) {
          lineInfo.lineEl.removeAttribute("data-first-line-indent");
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.classList.remove("editor-first-line-indent");
          lineInfo.lineEl.innerHTML = "<br>";
          setCaretToStart(lineInfo.lineEl);
          handleContentChange(pageIdx);
          return;
        }

        const newDiv = document.createElement("div");
        newDiv.setAttribute("data-first-line-indent", "true");
        newDiv.style.textIndent = "28px";
        newDiv.className = "editor-first-line-indent";

        if (afterFragment && hasTextAfter) {
          newDiv.appendChild(afterFragment);
        } else {
          newDiv.innerHTML = "<br>";
        }

        lineInfo.lineEl.after(newDiv);
        setCaretToStart(newDiv);
        handleContentChange(pageIdx);
        return;
      }

      // F. HANGING INDENT (NON-LIST)
      if (isHangingIndent) {
        if (!text.trim() && !hasTextAfter) {
          lineInfo.lineEl.removeAttribute("data-hanging-indent");
          lineInfo.lineEl.style.paddingLeft = "";
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.style.tabSize = "";
          lineInfo.lineEl.classList.remove("editor-hanging-indent");
          lineInfo.lineEl.innerHTML = "<br>";
          setCaretToStart(lineInfo.lineEl);
          handleContentChange(pageIdx);
          return;
        }

        const newDiv = document.createElement("div");
        newDiv.setAttribute("data-hanging-indent", "true");
        newDiv.style.paddingLeft = "28px";
        newDiv.style.textIndent = "-28px";
        newDiv.style.tabSize = "28px";
        newDiv.className = "editor-hanging-indent";

        if (afterFragment && hasTextAfter) {
          newDiv.appendChild(afterFragment);
        } else {
          newDiv.innerHTML = "<br>";
        }

        lineInfo.lineEl.after(newDiv);
        setCaretToStart(newDiv);
        handleContentChange(pageIdx);
        return;
      }

      // G. TAB INDENT (PARAGRAF BERINDENTASI)
      if (curIndent > 0) {
        if (!text.trim() && !hasTextAfter) {
          lineInfo.lineEl.removeAttribute("data-indent");
          lineInfo.lineEl.style.paddingLeft = "";
          lineInfo.lineEl.style.textIndent = "";
          lineInfo.lineEl.className = "";
          lineInfo.lineEl.innerHTML = "<br>";
          applyHangingIndentToLine(lineInfo.lineEl);
          setCaretToStart(lineInfo.lineEl);
          handleContentChange(pageIdx);
          return;
        }

        const newDiv = document.createElement("div");
        newDiv.setAttribute("data-indent", String(curIndent));
        newDiv.style.paddingLeft = `${curIndent * 28}px`;
        newDiv.className = `editor-paragraph-indent editor-indent-${curIndent}`;

        if (afterFragment && hasTextAfter) {
          newDiv.appendChild(afterFragment);
        } else {
          newDiv.innerHTML = "<br>";
        }

        lineInfo.lineEl.after(newDiv);
        setCaretToStart(newDiv);
        handleContentChange(pageIdx);
        return;
      }

      // H. PARAGRAF BIASA (REGULER)
      const newDiv = document.createElement("div");
      if (afterFragment && hasTextAfter) {
        newDiv.appendChild(afterFragment);
      } else {
        newDiv.innerHTML = "<br>";
      }
      lineInfo.lineEl.after(newDiv);
      setCaretToStart(newDiv);
      handleContentChange(pageIdx);
      return;
    }
  };

  const handleSaveDraft = async () => {
    const combined = getCombinedCatatan(pages);
    if (!pages.some((p) => p.trim().length > 0)) {
      setSubmitError("Ketik isi telaah terlebih dahulu sebelum menyimpan draf.");
      return;
    }

    setIsSavingDraft(true);
    setSubmitError(null);
    setDraftMessage(null);

    // 1. Simpan langsung ke localStorage browser (Offline-First Guarantee)
    try {
      localStorage.setItem(`empathika_draft_review_${item.id}`, combined);
    } catch {
      // Safe catch
    }

    try {
      const activePsikologId =
        item.psikolog?.id ||
        localStorage.getItem("active_psikolog_id") ||
        sessionStorage.getItem("active_psikolog_id");

      await psikotesService.submitReview(item.id, {
        catatan_psikolog: combined,
        rekomendasi_psikolog: null,
        id_psikolog: activePsikologId || null,
        is_draft: true,
      });

      // Update fullDetail local state
      const nowIso = new Date().toISOString();
      setFullDetail((prev: any) => ({
        ...prev,
        hasil: {
          ...prev?.hasil,
          catatan_psikolog: combined,
          draft_saved_at: nowIso,
        },
      }));

      // Update parent state
      onSuccess({
        ...item,
        catatan_psikolog: combined,
        draft_saved_at: nowIso,
      });

      // Update initial content ref agar perubahan dianggap tersimpan
      initialContentRef.current = combined.trim();

      setDraftMessage("Draf berhasil disimpan!");
      setTimeout(() => {
        setDraftMessage(null);
      }, 3500);
    } catch (err: any) {
      console.warn("Gagal simpan draf ke server:", err);
      // Jika server gagal, draf tetap aman di localStorage
      setDraftMessage("Draf tersimpan di memori browser!");
      setTimeout(() => {
        setDraftMessage(null);
      }, 3500);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleExecutePublish = async () => {
    const combined = getCombinedCatatan(pages);
    if (!pages.some((p) => p.trim().length > 0)) {
      setSubmitError("Catatan telaah psikolog wajib diisi sebelum menerbitkan laporan.");
      setShowPublishConfirmModal(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const activePsikologId =
        item.psikolog?.id ||
        localStorage.getItem("active_psikolog_id") ||
        sessionStorage.getItem("active_psikolog_id");

      const res = await psikotesService.submitReview(item.id, {
        catatan_psikolog: combined,
        rekomendasi_psikolog: null,
        id_psikolog: activePsikologId || null,
      });

      try {
        localStorage.removeItem(`empathika_draft_review_${item.id}`);
      } catch {
        // Safe catch
      }

      const updated: ReviewPsikotesItem = {
        ...item,
        status_pengerjaan: "SELESAI",
        catatan_psikolog: combined,
        rekomendasi_psikolog: null,
        tanggal_review: new Date().toISOString(),
        psikolog: res.data?.booking?.psikolog
          ? {
              id: res.data.booking.psikolog.id,
              nama: res.data.booking.psikolog.nama_gelar,
            }
          : item.psikolog,
      };

      setShowPublishConfirmModal(false);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err.message || "Gagal menerbitkan review psikolog.");
      setShowPublishConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentJsx = (
    <div
      className={`relative w-full flex flex-col bg-[#F3F4F6] transition-all duration-300 font-sans text-gray-800 ${
        isStandalonePage
          ? "w-full h-screen overflow-hidden"
          : isFullscreen
            ? "h-screen w-screen rounded-none overflow-hidden"
            : "max-w-7xl h-[94vh] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-300/80 overflow-hidden"
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP TOOLBAR DOKUMEN (Clean Workspace Header)                           */}
      {/* ========================================================================= */}
      <header className="shrink-0 px-4 sm:px-6 py-2.5 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shadow-xs">
        {/* Sisi Kiri: Tombol Kembali & Kontrol Buka Sidebar */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Tombol Kembali khusus Halaman Mandiri */}
          {isStandalonePage && (
            <button
              type="button"
              onClick={handleAttemptBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
              title="Kembali ke Daftar Antrean Review"
            >
              <ArrowLeft className="w-4 h-4 text-[#561269]" />
              <span>Kembali</span>
            </button>
          )}

          {!showScoreSidebar && (
            <button
              type="button"
              onClick={() => setShowScoreSidebar(true)}
              className="p-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#561269] transition-colors cursor-pointer shrink-0"
              title="Buka Referensi Skor Asesmen"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sisi Kanan: Kontrol Toolbar, Simpan Draf & Aksi Terbitkan */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Notifikasi Simpan Draf */}
          {draftMessage && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {draftMessage}
            </span>
          )}

          {/* Toggle Fullscreen (hanya saat mode modal pop-up) */}
          {!isStandalonePage && (
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          {/* Aksi Saat Sudah Terbit / Terkunci Oleh Rekan Lain: Badge Status Read-Only */}
          {isSudahReview ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Laporan Resmi Diterbitkan</span>
            </span>
          ) : isLockedByOther ? (
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-2xs"
              title={`Sedang aktif ditinjau oleh ${item?.psikolog?.nama || "rekan psikolog lain"}`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Sedang Ditinjau: {item?.psikolog?.nama || "Psikolog Lain"} (Diproses)</span>
            </span>
          ) : (
            <>
              {/* Tombol Simpan Draf */}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft || isSubmitting || !pages.some((p) => p.trim().length > 0)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                title="Simpan draf telaah sementara"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-700" />
                    <span>Menyimpan Draf...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-gray-600" />
                    <span>Simpan Draf</span>
                  </>
                )}
              </button>

              {/* Tombol Terbitkan Laporan */}
              <button
                type="button"
                onClick={() => {
                  if (!pages.some((p) => p.trim().length > 0)) {
                    setSubmitError("Catatan telaah psikolog wajib diisi sebelum menerbitkan laporan.");
                    return;
                  }
                  setShowPublishConfirmModal(true);
                }}
                disabled={isSubmitting || isSavingDraft || !pages.some((p) => p.trim().length > 0)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Terbitkan Laporan</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Tombol Tutup (hanya saat mode modal pop-up) */}
          {!isStandalonePage && (
            <button
              type="button"
              onClick={handleAttemptBack}
              disabled={isSubmitting || isSavingDraft}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer ml-1"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

        {/* ========================================================================= */}
        {/* 2. BODY SPLIT WORKSPACE: SIDEBAR SKOR + LEMBAR DOKUMEN PUTIH POLOSAN      */}
        {/* ========================================================================= */}
        <div className="flex-1 flex overflow-hidden">
          {/* ======================================================================= */}
          {/* A. SIDEBAR REFERENSI SKOR & REKAP JAWABAN (KIRI) - Bisa di-collapse      */}
          {/* ======================================================================= */}
          {showScoreSidebar && (
            <aside className="w-80 lg:w-[420px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-left duration-200 transition-all">
              <div className="px-3 pt-3 pb-2 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between gap-1">
                {/* Segmented Control Tab */}
                <div className="inline-flex p-0.5 rounded-xl bg-gray-200/80 text-gray-600 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setSidebarTab("skor")}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sidebarTab === "skor"
                        ? "bg-white text-[#561269] shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Profil Skor
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("jawaban")}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      sidebarTab === "jawaban"
                        ? "bg-white text-[#561269] shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Rekap Jawaban
                    {Array.isArray(fullDetail?.rekap_jawaban) && (
                      <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-[#561269] text-[10px] font-mono">
                        {fullDetail.rekap_jawaban.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {isLoadingDetail && <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600 mr-0.5" />}

                  {sidebarTab === "jawaban" && (
                    <button
                      type="button"
                      onClick={() => setIsFullscreenJawaban(true)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                      title="Buka Lembar Jawaban Layar Penuh"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowScoreSidebar(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/80 transition-colors cursor-pointer"
                    title="Tutup Panel"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Konten Scrollable Sidebar: Tab Skor vs Tab Rekap Jawaban */}
              {sidebarTab === "jawaban" ? (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {isLoadingDetail ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#561269]" />
                      <p className="text-xs font-semibold text-gray-700">Memuat jawaban pasien dari database...</p>
                    </div>
                  ) : (
                    <RekapJawabanPasienView
                      rekapJawaban={fullDetail?.rekap_jawaban || []}
                      alatUkurKode={fullDetail?.paket?.alat_ukur?.kode}
                      namaPaket={item.nama_paket}
                      snapshotJawaban={fullDetail?.snapshot_jawaban}
                      onMaximize={() => setIsFullscreenJawaban(true)}
                    />
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs [scrollbar-width:thin]">
                  {/* 1. Indeks Validitas MCMI-IV */}
                  {isMcmi && detailSkor?.validitas && (
                    <div className="p-3.5 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                          Validitas Profil (MCMI)
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {detailSkor.validitas.kesimpulan}
                      </p>

                      <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px]">
                        <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400 block text-[9px]">Skala V</span>
                          <strong className="text-gray-900 text-xs">{detailSkor.validitas.skalaV ?? 0}</strong>
                          <span className="text-[8px] text-gray-400 block">(&le; 1)</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400 block text-[9px]">Skala W</span>
                          <strong className="text-gray-900 text-xs">{detailSkor.validitas.skalaW ?? 0}</strong>
                          <span className="text-[8px] text-gray-400 block">(&le; 19)</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100">
                          <span className="text-gray-400 block text-[9px]">Skala X</span>
                          <strong className="text-gray-900 text-xs">{detailSkor.validitas.skalaX ?? 0}</strong>
                          <span className="text-[8px] text-gray-400 block">(7–114)</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 col-span-1.5">
                          <span className="text-gray-400 block text-[9px]">Skala Y (Desirability)</span>
                          <strong className="text-gray-900 text-xs">BR {detailSkor.validitas.skalaY_BR ?? 0}</strong>
                          <span className="text-[8px] text-gray-400 block">(&le; 75)</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-100 col-span-1.5">
                          <span className="text-gray-400 block text-[9px]">Skala Z (Debasement)</span>
                          <strong className="text-gray-900 text-xs">BR {detailSkor.validitas.skalaZ_BR ?? 0}</strong>
                          <span className="text-[8px] text-gray-400 block">(&le; 75)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Spektrum Pola Kepribadian (15 Skala) - Dropdown Collapsible */}
                  {isMcmi && Array.isArray(detailSkor?.polaKepribadianList) && (
                    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setShowPolaKepribadian((prev) => !prev)}
                        className="w-full px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 transition-colors flex items-center justify-between text-left cursor-pointer"
                      >
                        <span className="font-bold text-gray-900 text-xs">
                          Pola Kepribadian (15 Skala)
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="text-[10px] text-gray-400">BR Base Rate</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              showPolaKepribadian ? "rotate-180 text-purple-800" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {showPolaKepribadian && (
                        <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto border-t border-gray-100 [scrollbar-width:thin] animate-in fade-in duration-150">
                          {detailSkor.polaKepribadianList.map((scale: any) => {
                            const br = Number(scale.brScore ?? 0);
                            const isDisorder = br >= 85;
                            const isType = br >= 75 && br < 85;
                            const isStyle = br >= 60 && br < 75;

                            return (
                              <div
                                key={scale.kode}
                                className={`p-2 rounded-lg border text-[11px] space-y-1 ${
                                  isDisorder
                                    ? "bg-rose-50/70 border-rose-200 text-rose-950"
                                    : isType
                                    ? "bg-amber-50/70 border-amber-200 text-amber-950"
                                    : isStyle
                                    ? "bg-purple-50/60 border-purple-200 text-purple-950"
                                    : "bg-gray-50/60 border-gray-100 text-gray-600"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className="font-semibold truncate flex-1 min-w-0"
                                    title={`Skala ${scale.kode}: ${(scale.nama || "").replace(/\s*\(Skala\s+[^)]+\)/i, "").trim()}`}
                                  >
                                    Skala {scale.kode}: {(scale.nama || "").replace(/\s*\(Skala\s+[^)]+\)/i, "").trim()}
                                  </span>
                                  <span className="font-bold shrink-0">BR {br}</span>
                                </div>
                                <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isDisorder
                                        ? "bg-rose-600"
                                        : isType
                                        ? "bg-amber-600"
                                        : isStyle
                                        ? "bg-purple-700"
                                        : "bg-gray-400"
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(5, (br / 115) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Sindroma Klinis (10 Skala) - Dropdown Collapsible */}
                  {isMcmi && Array.isArray(detailSkor?.sindromaKlinisList) && (
                    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setShowSindromaKlinis((prev) => !prev)}
                        className="w-full px-3.5 py-2.5 bg-gray-50/80 hover:bg-gray-100/80 transition-colors flex items-center justify-between text-left cursor-pointer"
                      >
                        <span className="font-bold text-gray-900 text-xs">
                          Sindroma Klinis (10 Skala)
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <span className="text-[10px] text-gray-400">BR Base Rate</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              showSindromaKlinis ? "rotate-180 text-purple-800" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {showSindromaKlinis && (
                        <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto border-t border-gray-100 [scrollbar-width:thin] animate-in fade-in duration-150">
                          {detailSkor.sindromaKlinisList.map((scale: any) => {
                            const br = Number(scale.brScore ?? 0);
                            const isSevere = br >= 85;
                            const isMild = br >= 75 && br < 85;
                            const isSubclinical = br >= 60 && br < 75;

                            return (
                              <div
                                key={scale.kode}
                                className={`p-2 rounded-lg border text-[11px] space-y-1 ${
                                  isSevere
                                    ? "bg-rose-50/70 border-rose-200 text-rose-950"
                                    : isMild
                                    ? "bg-amber-50/70 border-amber-200 text-amber-950"
                                    : isSubclinical
                                    ? "bg-purple-50/60 border-purple-200 text-purple-950"
                                    : "bg-gray-50/60 border-gray-100 text-gray-600"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span
                                    className="font-semibold truncate flex-1 min-w-0"
                                    title={`Skala ${scale.kode}: ${(scale.nama || "").replace(/\s*\(Skala\s+[^)]+\)/i, "").trim()}`}
                                  >
                                    Skala {scale.kode}: {(scale.nama || "").replace(/\s*\(Skala\s+[^)]+\)/i, "").trim()}
                                  </span>
                                  <span className="font-bold shrink-0">BR {br}</span>
                                </div>
                                <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isSevere
                                        ? "bg-rose-600"
                                        : isMild
                                        ? "bg-amber-600"
                                        : isSubclinical
                                        ? "bg-purple-700"
                                        : "bg-gray-400"
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(5, (br / 115) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Alternatif untuk tes non-MCMI */}
                  {!isMcmi && (
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                      <span className="font-bold text-gray-900 block">Hasil Asesmen Standar</span>
                      <p className="text-gray-700 font-semibold">
                        Total Skor: {fullDetail?.hasil?.total_skor ?? item.total_skor ?? "—"}
                      </p>
                      <p className="text-gray-600 text-[11px] leading-relaxed">
                        {fullDetail?.hasil?.deskripsi || "Tidak ada rincian profil tambahan."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </aside>
          )}

          {/* ======================================================================= */}
          {/* B. CANVAS KERTAS DOKUMEN (SEPARATE A4 SHEETS PRINT VIEW)                 */}
          {/* ======================================================================= */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#525659] [scrollbar-width:thin]">
            <div className="max-w-[820px] mx-auto space-y-8">
              {/* Notifikasi Error jika submit gagal */}
              {submitError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-md">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <p className="font-bold">Gagal Menyimpan Telaah:</p>
                    <p>{submitError}</p>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* GOOGLE DOCS MINIMALIST FORMATTING TOOLBAR                           */}
              {/* =================================================================== */}
              {isSudahReview ? (
                <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900 sticky top-0 z-20 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">Laporan Telaah Resmi Telah Diterbitkan</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-emerald-700">Mode Arsip Medis (Terkunci)</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
                    Dokumen resmi telah diserahkan kepada klien
                  </span>
                </div>
              ) : isLockedByOther ? (
                <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 sticky top-0 z-20 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-bold">Tiket Sedang Aktif Ditinjau</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-amber-800">
                      Oleh {item?.psikolog?.nama || "Rekan Psikolog"} (Mode Baca Saja)
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium hidden sm:inline">
                    Hanya psikolog pemeriksa yang bersangkutan yang dapat mengedit lembar ini
                  </span>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-300 shadow-md px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-sans sticky top-0 z-20">
                  {/* Kontrol Format Teks WYSIWYG */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* 1. Format Dasar: Bold, Italic, Underline */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFormat("bold")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isBoldActive
                          ? "bg-purple-100 text-[#561269] font-bold ring-1 ring-purple-300"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title="Tebal (Ctrl+B)"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFormat("italic")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isItalicActive
                          ? "bg-purple-100 text-[#561269] font-bold ring-1 ring-purple-300"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title="Miring (Ctrl+I)"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFormat("underline")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isUnderlineActive
                          ? "bg-purple-100 text-[#561269] font-bold ring-1 ring-purple-300"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title="Garis Bawah (Ctrl+U)"
                    >
                      <Underline className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-gray-200 mx-1" />

                    {/* 2. Dropdown Format Daftar (Angka, Romawi, Poin) */}
                    <div className="relative" ref={listDropdownRef}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setIsListDropdownOpen((prev) => !prev)}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-medium border text-xs ${
                          isListDropdownOpen
                            ? "bg-purple-50 border-purple-300 text-purple-900"
                            : "bg-white hover:bg-gray-100 border-gray-200/80 text-gray-700"
                        }`}
                        title="Pilihan Format Daftar (Angka, Romawi, Poin)"
                      >
                        <ListOrdered className="w-3.5 h-3.5 text-purple-800" />
                        <span>Daftar</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </button>

                      {isListDropdownOpen && (
                        <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 font-sans">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFormat("number");
                              setIsListDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <span className="font-mono font-bold text-purple-800 w-5">1.2.</span>
                            <span>Angka (1., 2., 3.)</span>
                          </button>

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFormat("roman");
                              setIsListDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <span className="font-serif font-black text-purple-900 w-5">I.</span>
                            <span>Romawi (I., II., III.)</span>
                          </button>

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFormat("bullet");
                              setIsListDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <span className="text-purple-800 font-bold w-5">•</span>
                            <span>Poin / Butir</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="h-4 w-px bg-gray-200 mx-1" />

                    {/* 3. Dropdown Menu Indentasi Paragraf */}
                    <div className="relative" ref={indentDropdownRef}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setIsIndentDropdownOpen((prev) => !prev)}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-medium border text-xs ${
                          isIndentDropdownOpen || isFirstLineIndentActive || isHangingIndentActive || currentIndentLevel > 0
                            ? "bg-purple-50 border-purple-300 text-purple-900 font-semibold"
                            : "bg-white hover:bg-gray-100 border-gray-200/80 text-gray-700"
                        }`}
                        title="Pilihan Tipe Indentasi Paragraf (First Line, Hanging, Tab Indent)"
                      >
                        <FirstLineIndentIcon className="w-3.5 h-3.5 text-purple-800" />
                        <span>Indentasi</span>
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </button>

                      {isIndentDropdownOpen && (
                        <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 font-sans">
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFormat("first-line-indent");
                              setIsIndentDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                              isFirstLineIndentActive
                                ? "bg-purple-100 text-purple-900 font-bold"
                                : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                            }`}
                          >
                            <FirstLineIndentIcon className="w-4 h-4 text-purple-700 shrink-0" />
                            <div>
                              <div className="font-semibold">Indent Baris Pertama</div>
                              <div className="text-[10px] text-gray-500 font-normal">Hanya baris pertama menjorok ke dalam (28px)</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFormat("hanging-indent");
                              setIsIndentDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                              isHangingIndentActive
                                ? "bg-purple-100 text-purple-900 font-bold"
                                : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                            }`}
                          >
                            <HangingIndentIcon className="w-4 h-4 text-purple-700 shrink-0" />
                            <div>
                              <div className="font-semibold">Hanging Indent</div>
                              <div className="text-[10px] text-gray-500 font-normal">Baris lanjutan menjorok, baris pertama di margin</div>
                            </div>
                          </button>

                          <div className="h-px bg-gray-100 my-1" />

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFormat("indent");
                              setIsIndentDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Indent className="w-4 h-4 text-purple-700 shrink-0" />
                            <div>
                              <div className="font-semibold">Tab Indent (Paragraf Penuh)</div>
                              <div className="text-[10px] text-gray-500 font-normal">Menjorokkan seluruh paragraf ke dalam (Tab)</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              applyFormat("outdent");
                              setIsIndentDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Outdent className="w-4 h-4 text-purple-700 shrink-0" />
                            <div>
                              <div className="font-semibold">Kurangi Indentasi (Outdent)</div>
                              <div className="text-[10px] text-gray-500 font-normal">Mengembalikan paragraf ke kiri (Shift+Tab)</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tombol Cepat: First-Line Indent & Hanging Indent */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFormat("first-line-indent")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFirstLineIndentActive
                          ? "bg-purple-100 text-[#561269] font-bold ring-1 ring-purple-300"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title="Indent Baris Pertama (Hanya baris awal menjorok)"
                    >
                      <FirstLineIndentIcon className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFormat("hanging-indent")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isHangingIndentActive
                          ? "bg-purple-100 text-[#561269] font-bold ring-1 ring-purple-300"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title="Hanging Indent (Baris lanjutan menjorok)"
                    >
                      <HangingIndentIcon className="w-4 h-4" />
                    </button>

                    {/* Tombol Cepat: Outdent & Indent (Tab) */}
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFormat("outdent")}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Kurangi Indentasi (Shift+Tab)"
                    >
                      <Outdent className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => applyFormat("indent")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        currentIndentLevel > 0
                          ? "bg-purple-100 text-[#561269] font-bold ring-1 ring-purple-300"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      title="Tambah Indentasi (Tab)"
                    >
                      <Indent className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sisi Kanan Toolbar: Petunjuk Keyboard & Fitur Typografi */}
                  <div className="hidden lg:flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono text-gray-700">
                        Enter
                      </kbd>
                      <span>Baris Baru</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono text-gray-700">
                        Shift+Enter
                      </kbd>
                      <span>Soft Line Break</span>
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono text-gray-700">
                        Tab
                      </kbd>
                      <span>Indent</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Global Style Typography, Word Wrapping, Hanging Indent & Keep Lines Together */}
              <style dangerouslySetInnerHTML={{ __html: `
                [contenteditable]:empty::before {
                  content: attr(data-placeholder);
                  color: #9ca3af;
                  pointer-events: none;
                  font-family: ui-sans-serif, system-ui, sans-serif;
                }
                .editor-list-item {
                  padding-left: 28px !important;
                  text-indent: -28px !important;
                  tab-size: 28px !important;
                  -moz-tab-size: 28px !important;
                  overflow-wrap: break-word !important;
                  word-break: normal !important;
                  white-space: pre-wrap !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
                .editor-list-item-1 {
                  padding-left: 56px !important;
                  text-indent: -28px !important;
                  tab-size: 28px !important;
                  -moz-tab-size: 28px !important;
                  overflow-wrap: break-word !important;
                  word-break: normal !important;
                  white-space: pre-wrap !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
                .editor-list-item-2 {
                  padding-left: 84px !important;
                  text-indent: -28px !important;
                  tab-size: 28px !important;
                  -moz-tab-size: 28px !important;
                  overflow-wrap: break-word !important;
                  word-break: normal !important;
                  white-space: pre-wrap !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
                .editor-list-item-3 {
                  padding-left: 112px !important;
                  text-indent: -28px !important;
                  tab-size: 28px !important;
                  -moz-tab-size: 28px !important;
                  overflow-wrap: break-word !important;
                  word-break: normal !important;
                  white-space: pre-wrap !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
                .editor-first-line-indent {
                  text-indent: 28px !important;
                  padding-left: 0px !important;
                  overflow-wrap: break-word !important;
                  word-break: normal !important;
                  white-space: pre-wrap !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
                .editor-hanging-indent {
                  padding-left: 28px !important;
                  text-indent: -28px !important;
                  tab-size: 28px !important;
                  -moz-tab-size: 28px !important;
                  overflow-wrap: break-word !important;
                  word-break: normal !important;
                  white-space: pre-wrap !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
                .editor-paragraph-indent {
                  overflow-wrap: break-word !important;
                  word-break: normal !important;
                  white-space: pre-wrap !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
                [contenteditable] > div {
                  overflow-wrap: break-word !important;
                  word-break: normal !important;
                  white-space: pre-wrap !important;
                  break-inside: avoid !important;
                  page-break-inside: avoid !important;
                }
              ` }} />

              {/* =================================================================== */}
              {/* LOOP LEMBARAN KERTAS A4 TERPISAH (SEPARATE PHYSICAL A4 SHEETS)       */}
              {/* =================================================================== */}
              {pages.map((pageText, pageIdx) => {
                const isFirstPage = pageIdx === 0;
                const isLastPage = pageIdx === pages.length - 1;

                return (
                  <div
                    key={pageIdx}
                    id={`page-sheet-${pageIdx}`}
                    onClick={() => setActivePageIndex(pageIdx)}
                    className="relative bg-white rounded-sm shadow-2xl border border-gray-300/90 w-full max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] mx-auto px-8 sm:px-12 py-7 sm:py-8 flex flex-col justify-between text-gray-900 font-sans transition-all overflow-hidden box-border"
                    style={{ width: "794px", height: "1123px", minHeight: "1123px", maxHeight: "1123px" }}
                  >
                    {/* BAGIAN ATAS LEMBAR A4 (HEADER & IDENTITAS) */}
                    <div className="shrink-0 space-y-3">
                      {isFirstPage ? (
                        <>
                          {/* 1. KOP SURAT RESMI BIRO PSIKOLOGI EMPATHIKA */}
                          <div className="text-center space-y-1 pb-2 font-sans">
                            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-gray-900 uppercase">
                              EMPATHIKA PSYCHOLOGICAL SERVICES
                            </h1>
                            <p className="text-xs sm:text-[13px] font-semibold text-gray-700 tracking-wide">
                              BIRO LAYANAN PSIKOLOGI, ASESMEN KLINIS &amp; KESEHATAN MENTAL TERPADU
                            </p>
                            <p className="text-[11px] text-gray-500 font-normal">
                              Layanan Psikotes Online &bull; Surat Keterangan / Laporan Psikologis Resmi Terverifikasi
                            </p>

                            {/* Garis Dobel Formal Kop Surat (Klasik Resmi) */}
                            <div className="pt-2">
                              <div className="border-b-2 border-gray-900 w-full" />
                              <div className="border-b border-gray-900 w-full mt-[2px]" />
                            </div>
                          </div>

                          {/* 2. IDENTITAS PESERTA (Clean & Resmi Tanpa Kotak-Kotak Warna) */}
                          <div className="font-sans text-xs sm:text-[13px] text-gray-800 py-2.5 border-b border-gray-300/80">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5">
                              {/* Kolom Kiri */}
                              <div className="space-y-1.5">
                                <div className="flex items-start">
                                  <span className="w-32 sm:w-36 text-gray-600 font-medium shrink-0">Nama Lengkap</span>
                                  <span className="w-4 text-gray-500 shrink-0">:</span>
                                  <span className="font-bold text-gray-900 leading-snug break-words flex-1">{item.nama_peserta}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-32 sm:w-36 text-gray-600 font-medium shrink-0">Jenis Kelamin</span>
                                  <span className="w-4 text-gray-500 shrink-0">:</span>
                                  <span className="text-gray-800">{item.jenis_kelamin || "—"}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-32 sm:w-36 text-gray-600 font-medium shrink-0">Usia</span>
                                  <span className="w-4 text-gray-500 shrink-0">:</span>
                                  <span className="text-gray-800">{item.usia ? `${item.usia} Tahun` : "—"}</span>
                                </div>
                              </div>

                              {/* Kolom Kanan */}
                              <div className="space-y-1.5">
                                <div className="flex items-center">
                                  <span className="w-32 sm:w-36 text-gray-600 font-medium shrink-0">Nomor Tiket</span>
                                  <span className="w-4 text-gray-500 shrink-0">:</span>
                                  <span className="font-mono font-bold text-gray-900">{item.kode_akses || "—"}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="w-32 sm:w-36 text-gray-600 font-medium shrink-0">Tanggal Pemeriksaan</span>
                                  <span className="w-4 text-gray-500 shrink-0">:</span>
                                  <span className="text-gray-800">
                                    {new Date(item.tanggal_pengerjaan).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <span className="w-32 sm:w-36 text-gray-600 font-medium shrink-0">Alat Ukur / Asesmen</span>
                                  <span className="w-4 text-gray-500 shrink-0">:</span>
                                  <span className="font-semibold text-gray-900 leading-snug break-words flex-1">
                                    {item.nama_paket}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* JIKA HALAMAN 2+: RUNNING HEADER DOKUMEN LANJUTAN RESMI */
                        <div className="pb-2.5 border-b border-gray-300/80 flex items-center justify-between text-xs text-gray-600 font-sans">
                          <span className="font-bold text-gray-900 tracking-wider uppercase text-[11px]">
                            EMPATHIKA PSYCHOLOGICAL SERVICES
                          </span>
                          {/* Tombol Hapus Lembar Halaman Ini jika > 1 halaman dan dokumen dapat diedit */}
                          {!isReadOnly && pages.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePage(pageIdx);
                              }}
                              className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus lembar halaman ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AREA KETIK LEMBAR A4 DOKUMEN WYSIWYG (GAYA GOOGLE DOCS): FLEX-1 MENGISI PENUH SISA RUANG */}
                    <div className="flex-1 flex flex-col min-h-0 pt-2 pb-3.5 overflow-hidden">
                      <div
                        ref={(el) => {
                          editorRefs.current[pageIdx] = el;
                          if (el && el.innerHTML !== pageText && document.activeElement !== el) {
                            el.innerHTML = pageText;
                            updateAllHangingIndents(el);
                          }
                        }}
                        contentEditable={!isReadOnly}
                        suppressContentEditableWarning
                        onFocus={() => {
                          setActivePageIndex(pageIdx);
                          updateToolbarState();
                        }}
                        onKeyUp={updateToolbarState}
                        onMouseUp={updateToolbarState}
                        onInput={() => handleContentChange(pageIdx)}
                        onKeyDown={(e) => !isReadOnly && handleKeyDownOnPage(e, pageIdx)}
                        data-placeholder={
                          isFirstPage
                            ? "Mulai ketik telaah klinis, interpretasi, dan rekomendasi secara leluasa di sini... (Ketik 1. atau I. lalu Spasi untuk auto-list, tekan Enter di batas halaman untuk lanjut ke halaman berikutnya)"
                            : `Lanjutkan penulisan telaah pada Halaman ${pageIdx + 1}...`
                        }
                        className={`w-full flex-1 h-full min-h-0 bg-transparent border-0 focus:ring-0 focus:outline-none font-serif text-sm sm:text-base leading-relaxed text-gray-900 resize-none p-0 overflow-hidden whitespace-pre-wrap break-words ${
                          isReadOnly ? "cursor-default select-text" : ""
                        }`}
                        style={{ tabSize: "28px" }}
                      />
                    </div>

                    {/* BAGIAN BAWAH LEMBAR A4 (TANDA TANGAN & FOOTER) */}
                    <div className="shrink-0 space-y-2 pt-1.5">
                      {/* JIKA HALAMAN TERAKHIR: TANDA TANGAN & PENGESAHAN PSIKOLOG RESMI */}
                      {isLastPage && (
                        <div className="font-sans flex justify-end pt-1">
                          <div className="text-center w-72 space-y-1 text-xs sm:text-sm text-gray-800">
                            <p className="text-gray-600">
                              Bandung,{" "}
                              {new Date().toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            <p className="font-semibold text-gray-900">Psikolog Pemeriksa,</p>

                            {/* Ruang Tanda Tangan */}
                            <div className="h-14" />

                            <p className="font-bold text-gray-900 underline underline-offset-2">
                              {item.psikolog?.nama || "Psikolog Klinis Empathika"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Footer Kertas Dokumen Formal */}
                      <div className="pt-2 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 font-sans text-[11px] text-gray-400">
                        <p>&copy; {new Date().getFullYear()} Empathika Psychological Services &bull; Kerahasiaan Medis Dijamin</p>
                        <p className="font-mono font-medium text-gray-600">
                          {pageIdx + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Tombol Tambah Lembar Halaman di Bawah Dokumen (Hanya saat draf/belum terbit & dapat diedit) */}
              {!isReadOnly && (
                <div className="flex justify-center pt-2 pb-6">
                  <button
                    type="button"
                    onClick={() => handleAddPage()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/95 hover:bg-white text-gray-800 hover:text-[#561269] text-xs font-bold shadow-lg hover:shadow-xl border border-gray-300 transition-all cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-purple-700" />
                    <span>Tambah Lembar Halaman Baru (A4)</span>
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );

  return (
    <>
      {isStandalonePage ? (
        <div className="w-full h-screen overflow-hidden bg-[#F3F4F6] flex flex-col font-sans text-gray-800">
          {contentJsx}
        </div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          {contentJsx}
        </div>
      )}

      {/* Modal Lembar Rekap Jawaban Layar Penuh */}
      <ModalRekapJawabanFullscreen
        isOpen={isFullscreenJawaban}
        onClose={() => setIsFullscreenJawaban(false)}
        rekapJawaban={fullDetail?.rekap_jawaban || []}
        namaPeserta={item.nama_peserta}
        namaPaket={item.nama_paket}
        alatUkurKode={fullDetail?.paket?.alat_ukur?.kode}
        snapshotJawaban={fullDetail?.snapshot_jawaban}
      />

      {/* Modal Peringatan Keamanan: Konfirmasi Simpan Draf Sebelum Keluar (Clean & No Icon) */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header Clean without icon */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Simpan Perubahan?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ada perubahan telaah yang belum disimpan.
                </p>
              </div>
              <button
                type="button"
                disabled={isSavingAndExiting}
                onClick={() => setShowExitConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer shrink-0"
                title="Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Ingin menyimpan tulisan Anda sebagai <strong>Draf</strong> terlebih dahulu sebelum kembali ke antrean?
            </p>

            <div className="flex flex-col gap-2 pt-1 font-sans">
              {/* Opsi 1: Simpan Draf & Keluar */}
              <button
                type="button"
                disabled={isSavingAndExiting}
                onClick={async () => {
                  setIsSavingAndExiting(true);
                  try {
                    await handleSaveDraft();
                    setShowExitConfirmModal(false);
                    onClose();
                  } catch {
                    setShowExitConfirmModal(false);
                    onClose();
                  } finally {
                    setIsSavingAndExiting(false);
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSavingAndExiting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan Draf...</span>
                  </>
                ) : (
                  <span>Simpan ke Draf & Keluar</span>
                )}
              </button>

              {/* Opsi 2: Langsung Keluar */}
              <button
                type="button"
                disabled={isSavingAndExiting}
                onClick={() => {
                  setShowExitConfirmModal(false);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium transition cursor-pointer active:scale-95 text-center"
              >
                Langsung Keluar
              </button>

              {/* Opsi 3: Batal */}
              <button
                type="button"
                disabled={isSavingAndExiting}
                onClick={() => setShowExitConfirmModal(false)}
                className="w-full py-1 text-center text-xs text-gray-400 hover:text-gray-600 font-medium transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Terbitkan Laporan Resmi (Clean & No Icon) */}
      {showPublishConfirmModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header Modal Clean without icon */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Terbitkan Laporan Resmi?
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Harap periksa kembali sebelum melanjutkan
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPublishConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition cursor-pointer shrink-0"
                title="Batal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Peringatan Dokumen Terkunci Permanen */}
            <div className="flex items-start gap-2.5 py-1 text-xs text-gray-600 leading-relaxed">
              <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p>
                Pastikan seluruh catatan, dinamika psikologis, dan rekomendasi klinis sudah diperiksa dengan teliti. Setelah diterbitkan, dokumen ini <strong className="text-gray-800 font-semibold">terkunci permanen dan tidak dapat diubah kembali</strong>.
              </p>
            </div>

            {/* Aksi Tombol */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowPublishConfirmModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition cursor-pointer active:scale-95 text-center"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExecutePublish}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#CA8A04] text-gray-950 text-xs font-bold shadow-sm hover:shadow transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menerbitkan...</span>
                  </>
                ) : (
                  <span>Ya, Terbitkan Laporan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
