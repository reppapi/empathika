"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Underline as UnderlineIcon,
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
import { useEditor, EditorContent, Editor, Extension, wrappingInputRule } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
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

function isRomanValid(str: string): boolean {
  return /^(X{0,3})(IX|IV|V?I{0,3})$/i.test(str.trim());
}

// Memecah teks dokumen klinis menjadi lembaran A4 multi-halaman
function parseTextToPages(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return ["<p></p>"];

  let parts: string[] = [rawText];
  if (rawText.includes("<!-- PAGE_BREAK -->")) {
    parts = rawText.split("<!-- PAGE_BREAK -->").map((p) => p.trim());
  } else if (rawText.includes("--- HALAMAN BARU ---")) {
    parts = rawText.split("--- HALAMAN BARU ---").map((p) => p.trim());
  }

  // Filter: hanya simpan halaman yang benar-benar ada isinya (kecuali halaman 1 jika dokumen kosong)
  const cleanParts = parts.filter((part, idx) => {
    if (idx === 0) return true;
    const stripped = part.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    return stripped.length > 0;
  });

  return cleanParts.length > 0 ? cleanParts : ["<p></p>"];
}

// Menggabungkan seluruh isi HTML halaman menjadi satu teks utuh dengan pemisah PAGE_BREAK
function combinePages(pagesList: string[]): string {
  // Hanya simpan lembaran yang memiliki konten bermakna (selain lembar pertama)
  const validPages = (pagesList || []).filter((p, idx) => {
    if (idx === 0) return true;
    const stripped = p.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    return stripped.length > 0;
  });
  return (validPages.length > 0 ? validPages : ["<p></p>"]).join("\n\n<!-- PAGE_BREAK -->\n\n");
}

// Konversi teks mentah / markdown / format lama ke format HTML standar TipTap (<p>, <ol><li>, <ul><li>)
function convertRawToHtml(raw: string): string {
  if (!raw || !raw.trim()) return "<p></p>";
  let html = raw.trim();

  // Konversi sintaks markdown jika ada dari data lama
  html = html
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/__([^_]+)__/g, "<u>$1</u>");

  // Jika sudah berupa HTML dengan tag blok (<p>, <ol>, <ul>, <div>)
  if (/<(?:p|ol|ul|div)[^>]*>/i.test(html)) {
    // Normalisasi tag <div> lama menjadi <p> agar TipTap mengenali sebagai node paragraf
    html = html.replace(/<div([^>]*)>([\s\S]*?)<\/div>/gi, (_, attrs, inner) => {
      if (!inner || inner === "<br>" || inner.trim() === "") {
        return "<p></p>";
      }
      return `<p${attrs}>${inner}</p>`;
    });
    return html;
  }

  // Jika plain text biasa dengan baris-baris terpisah newline
  const lines = html.split("\n");
  const result: string[] = [];
  let inOrderedList = false;
  let inBulletList = false;
  let inRomanList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (inOrderedList || inRomanList) {
        result.push("</ol>");
        inOrderedList = false;
        inRomanList = false;
      }
      if (inBulletList) {
        result.push("</ul>");
        inBulletList = false;
      }
      result.push("<p></p>");
      continue;
    }

    // Numbered list: "1. Teks"
    const numMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (inBulletList) {
        result.push("</ul>");
        inBulletList = false;
      }
      if (inRomanList) {
        result.push("</ol>");
        inRomanList = false;
      }
      if (!inOrderedList) {
        result.push("<ol>");
        inOrderedList = true;
      }
      result.push(`<li><p>${numMatch[2]}</p></li>`);
      continue;
    }

    // Roman list: "I. Teks"
    const romanMatch = line.match(/^\s*([IVXLCDMivxlcdm]+)\.\s+(.*)$/);
    if (romanMatch && isRomanValid(romanMatch[1])) {
      if (inBulletList) {
        result.push("</ul>");
        inBulletList = false;
      }
      if (inOrderedList && !inRomanList) {
        result.push("</ol>");
        inOrderedList = false;
      }
      if (!inRomanList) {
        result.push('<ol type="I" class="list-roman">');
        inRomanList = true;
      }
      result.push(`<li><p>${romanMatch[2]}</p></li>`);
      continue;
    }

    // Bullet list: "• Teks", "- Teks", "* Teks"
    const bulletMatch = line.match(/^\s*[•\-\*]\s+(.*)$/);
    if (bulletMatch) {
      if (inOrderedList || inRomanList) {
        result.push("</ol>");
        inOrderedList = false;
        inRomanList = false;
      }
      if (!inBulletList) {
        result.push("<ul>");
        inBulletList = true;
      }
      result.push(`<li><p>${bulletMatch[1]}</p></li>`);
      continue;
    }

    // Paragraf biasa: tutup list yang masih terbuka
    if (inOrderedList || inRomanList) {
      result.push("</ol>");
      inOrderedList = false;
      inRomanList = false;
    }
    if (inBulletList) {
      result.push("</ul>");
      inBulletList = false;
    }

    // Cek leading spaces untuk indentasi paragraf
    const leadingSpaces = line.match(/^ +/);
    if (leadingSpaces && leadingSpaces[0].length >= 4) {
      const indentLevel = Math.floor(leadingSpaces[0].length / 4);
      result.push(
        `<p data-indent="${indentLevel}" class="editor-paragraph-indent editor-indent-${indentLevel}" style="padding-left: ${
          indentLevel * 28
        }px;">${trimmed}</p>`
      );
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  if (inOrderedList || inRomanList) result.push("</ol>");
  if (inBulletList) result.push("</ul>");

  return result.join("");
}

// Extension TipTap kustom untuk mendukung atribut indentasi & tipe list romawi
const CustomGlobalAttributesExtension = Extension.create({
  name: "customGlobalAttributes",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const dataIndent = element.getAttribute("data-indent");
              if (dataIndent) return parseInt(dataIndent, 10);
              const classMatch = element.className.match(/editor-indent-(\d+)/);
              if (classMatch) return parseInt(classMatch[1], 10);
              const padMatch = element.style.paddingLeft.match(/(\d+)px/);
              if (padMatch && parseInt(padMatch[1], 10) >= 28) {
                return Math.floor(parseInt(padMatch[1], 10) / 28);
              }
              return 0;
            },
            renderHTML: (attributes) => {
              if (!attributes.indent) return {};
              return {
                "data-indent": attributes.indent,
                class: `editor-paragraph-indent editor-indent-${attributes.indent}`,
              };
            },
          },
          firstLineIndent: {
            default: false,
            parseHTML: (element) => {
              return (
                element.getAttribute("data-first-line-indent") === "true" ||
                element.classList.contains("editor-first-line-indent") ||
                element.style.textIndent === "28px"
              );
            },
            renderHTML: (attributes) => {
              if (!attributes.firstLineIndent) return {};
              return {
                "data-first-line-indent": "true",
                class: "editor-first-line-indent",
              };
            },
          },
          hangingIndent: {
            default: false,
            parseHTML: (element) => {
              return (
                element.getAttribute("data-hanging-indent") === "true" ||
                element.classList.contains("editor-hanging-indent") ||
                (element.style.textIndent === "-28px" &&
                  element.style.paddingLeft === "28px")
              );
            },
            renderHTML: (attributes) => {
              if (!attributes.hangingIndent) return {};
              return {
                "data-hanging-indent": "true",
                class: "editor-hanging-indent",
              };
            },
          },
        },
      },
      {
        types: ["orderedList"],
        attributes: {
          type: {
            default: "1",
            parseHTML: (element) =>
              element.getAttribute("type") ||
              (element.classList.contains("list-roman") ? "I" : "1"),
            renderHTML: (attributes) => {
              if (attributes.type === "I") {
                return {
                  type: "I",
                  class: "list-roman",
                  style: "list-style-type: upper-roman;",
                };
              }
              return { type: "1" };
            },
          },
        },
      },
    ];
  },
});

// Extension TipTap kustom untuk keyboard shortcut (Tab, Shift+Tab, Backspace, Ctrl+Enter) & auto input rules
const createKeyboardShortcutsExtension = (
  onAddPageAfter: (initialHtml?: string) => void,
  onRemovePageIfEmpty?: () => void,
  pageIdx?: number
) =>
  Extension.create({
    name: "customKeyboardShortcuts",
    addKeyboardShortcuts() {
      return {
        "Mod-Enter": () => {
          onAddPageAfter();
          return true;
        },
        Enter: () => {
          const { selection } = this.editor.state;

          // 1. Jika di dalam list item dan kosong: keluar dari list dan otomatis sejajar dengan teks nomor (indent: 1)
          if (this.editor.isActive("listItem")) {
            const parent = selection.$from.parent;
            if (selection.empty && parent.type.name === "paragraph" && parent.content.size === 0) {
              const lifted = this.editor.commands.liftListItem("listItem");
              if (lifted) {
                this.editor.commands.updateAttributes("paragraph", {
                  indent: 1,
                  firstLineIndent: false,
                  hangingIndent: false,
                });
                return true;
              }
            }
            return false;
          }

          // 2. Jika di dalam paragraf kosong yang berindentasi: reset kembali ke margin awal (0)
          if (selection.empty) {
            const parent = selection.$from.parent;
            if (parent.type.name === "paragraph" && parent.content.size === 0) {
              const curAttrs = this.editor.getAttributes("paragraph");
              if (curAttrs.indent > 0 || curAttrs.firstLineIndent || curAttrs.hangingIndent) {
                return this.editor.commands.updateAttributes("paragraph", {
                  indent: 0,
                  firstLineIndent: false,
                  hangingIndent: false,
                });
              }
            }
          }
          return false;
        },
        Tab: () => {
          // 1. Jika di dalam list item: sink ke sub-level
          if (this.editor.isActive("listItem")) {
            return this.editor.commands.sinkListItem("listItem");
          }

          const curAttrs = this.editor.getAttributes("paragraph");
          const curIndent = curAttrs.indent || 0;
          const isFirstLine = Boolean(curAttrs.firstLineIndent);

          // 2. Jika paragraf di bawah nomor (indent >= 1) dan belum ada lekuk awal:
          // Menekan Tab mengaktifkan lekuk awal paragraf (First Line Indent) sehingga baris 1 menjorok,
          // sedangkan baris 2 tetap SEJAJAR dengan awal kata nomor di atasnya!
          if (curIndent > 0 && !isFirstLine) {
            return this.editor.commands.updateAttributes("paragraph", {
              firstLineIndent: true,
              hangingIndent: false,
            });
          }

          // 3. Jika paragraf di margin 0 dan belum ada lekuk awal:
          // Menekan Tab langsung membuat lekuk awal paragraf (First Line Indent)!
          if (curIndent === 0 && !isFirstLine) {
            return this.editor.commands.updateAttributes("paragraph", {
              firstLineIndent: true,
              hangingIndent: false,
            });
          }

          // 4. Jika lekuk awal sudah aktif: menjorokkan paragraf secara penuh ke level berikutnya
          return this.editor.commands.updateAttributes("paragraph", {
            indent: curIndent + 1,
            firstLineIndent: true,
            hangingIndent: false,
          });
        },
        "Shift-Tab": () => {
          if (this.editor.isActive("listItem")) {
            return this.editor.commands.liftListItem("listItem");
          }
          const curAttrs = this.editor.getAttributes("paragraph");
          const curIndent = curAttrs.indent || 0;
          const isFirstLine = Boolean(curAttrs.firstLineIndent);

          if (isFirstLine) {
            return this.editor.commands.updateAttributes("paragraph", {
              firstLineIndent: false,
            });
          }
          if (curIndent > 0) {
            return this.editor.commands.updateAttributes("paragraph", {
              indent: curIndent - 1,
            });
          }
          return this.editor.commands.updateAttributes("paragraph", {
            firstLineIndent: false,
            hangingIndent: false,
          });
        },
        Backspace: () => {
          const { selection } = this.editor.state;

          // 0. Jika di lembar ke-2 dst, dan halaman kosong atau kursor di posisi paling awal: hapus lembar ini dan fokus ke sebelumnya
          if ((pageIdx || 0) > 0 && selection.empty && selection.$from.pos <= 1) {
            const stripped = this.editor.getText().trim();
            if (!stripped && onRemovePageIfEmpty) {
              onRemovePageIfEmpty();
              return true;
            }
          }

          // 1. Jika di dalam list item kosong: hapus nomor dan posisikan kursor sejajar dengan teks nomor (indent: 1)
          if (this.editor.isActive("listItem")) {
            const parent = selection.$from.parent;
            if (selection.empty && parent.type.name === "paragraph" && parent.content.size === 0) {
              const lifted = this.editor.commands.liftListItem("listItem");
              if (lifted) {
                this.editor.commands.updateAttributes("paragraph", {
                  indent: 1,
                  firstLineIndent: false,
                  hangingIndent: false,
                });
                return true;
              }
            }
            return false;
          }

          // 2. Jika di awal paragraf (offset 0): hapus indentasi bertahap
          if (selection.empty && selection.$from.parentOffset === 0) {
            const curAttrs = this.editor.getAttributes("paragraph");
            if (curAttrs.firstLineIndent) {
              return this.editor.commands.updateAttributes("paragraph", {
                firstLineIndent: false,
              });
            }
            if (curAttrs.hangingIndent) {
              return this.editor.commands.updateAttributes("paragraph", {
                hangingIndent: false,
              });
            }
            if (curAttrs.indent && curAttrs.indent > 0) {
              return this.editor.commands.updateAttributes("paragraph", {
                indent: curAttrs.indent - 1,
              });
            }
          }
          return false;
        },
      };
    },
    addInputRules() {
      return [
        wrappingInputRule({
          find: /^\s*([IVXLCDMivxlcdm]+)\.\s$/,
          type: this.editor.schema.nodes.orderedList,
          getAttributes: () => ({ type: "I" }),
        }),
      ];
    },
  });

interface TipTapSheetEditorProps {
  pageIdx: number;
  initialContent: string;
  isReadOnly: boolean;
  isFirstPage: boolean;
  onUpdateContent: (html: string) => void;
  onFocus: (editor: Editor) => void;
  onTransaction: () => void;
  onAddPageAfter: (initialHtml?: string) => void;
  onRemovePageIfEmpty?: () => void;
  registerEditor: (pageIdx: number, editor: Editor | null) => void;
}

const TipTapSheetEditor: React.FC<TipTapSheetEditorProps> = ({
  pageIdx,
  initialContent,
  isReadOnly,
  isFirstPage,
  onUpdateContent,
  onFocus,
  onTransaction,
  onAddPageAfter,
  onRemovePageIfEmpty,
  registerEditor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overflowDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  const keyboardExtension = useMemo(
    () => createKeyboardShortcutsExtension(onAddPageAfter, onRemovePageIfEmpty, pageIdx),
    [onAddPageAfter, onRemovePageIfEmpty, pageIdx]
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !isReadOnly,
    content: initialContent || "<p></p>",
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder: isFirstPage
          ? "Mulai ketik telaah klinis, interpretasi, dan rekomendasi secara leluasa di sini... (Ketik 1. atau - lalu Spasi untuk daftar otomatis, Shift+Enter untuk baris baru)"
          : `Lanjutkan penulisan telaah pada Halaman ${pageIdx + 1}...`,
      }),
      CustomGlobalAttributesExtension,
      keyboardExtension,
    ],
    onUpdate: ({ editor: ed }) => {
      onUpdateContent(ed.getHTML());
      if (overflowDebounceTimer.current) {
        clearTimeout(overflowDebounceTimer.current);
      }
      overflowDebounceTimer.current = setTimeout(() => {
        checkOverflowAndSplit();
      }, 150);
    },
    onFocus: ({ editor: ed }) => {
      onFocus(ed);
    },
    onTransaction: () => {
      onTransaction();
    },
    onSelectionUpdate: () => {
      onTransaction();
    },
  });

  const checkOverflowAndSplit = useCallback(() => {
    if (isReadOnly || !editor) return;
    const container = containerRef.current;
    if (!container) return;

    const pmEl = container.querySelector(".ProseMirror") as HTMLElement | null;
    if (!pmEl) return;

    const containerRect = container.getBoundingClientRect();
    if (containerRect.height <= 150) return; // Belum selesai layout awal

    // Cek apakah scrollHeight melebihi tinggi container
    if (pmEl.scrollHeight > container.clientHeight + 4) {
      const children = Array.from(pmEl.children) as HTMLElement[];
      if (children.length <= 1) return; // Jangan potong jika hanya 1 elemen blok

      let overflowStartIndex = -1;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childRect = child.getBoundingClientRect();
        if (childRect.bottom > containerRect.bottom - 4) {
          overflowStartIndex = i;
          break;
        }
      }

      if (overflowStartIndex > 0) {
        const overflowChildren = children.slice(overflowStartIndex);
        const overflowHtml = overflowChildren.map((el) => el.outerHTML).join("");

        const { state, dispatch } = editor.view;
        const { doc } = state;

        let cutPos = -1;
        let blockCount = 0;
        doc.forEach((node, pos) => {
          if (blockCount === overflowStartIndex && cutPos === -1) {
            cutPos = pos;
          }
          blockCount++;
        });

        if (cutPos >= 0) {
          const tr = state.tr.delete(cutPos, doc.content.size);
          dispatch(tr);
          onUpdateContent(editor.getHTML());
          onAddPageAfter(overflowHtml);
        }
      }
    }
  }, [editor, isReadOnly, onUpdateContent, onAddPageAfter]);

  useEffect(() => {
    return () => {
      if (overflowDebounceTimer.current) {
        clearTimeout(overflowDebounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkOverflowAndSplit();
    }, 350);
    return () => clearTimeout(timer);
  }, [checkOverflowAndSplit]);

  useEffect(() => {
    if (editor) {
      registerEditor(pageIdx, editor);
    }
    return () => {
      registerEditor(pageIdx, null);
    };
  }, [editor, pageIdx, registerEditor]);

  // Sinkronisasi jika konten diperbarui dari database eksternal dan editor belum disentuh user
  useEffect(() => {
    if (editor && !editor.isFocused && initialContent) {
      const cur = editor.getHTML();
      if (initialContent.trim() !== cur.trim() && initialContent !== cur) {
        editor.commands.setContent(initialContent, { emitUpdate: false });
      }
    }
  }, [initialContent, editor]);

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 h-full min-h-0 flex flex-col cursor-text overflow-hidden"
      onClick={() => {
        if (editor && !editor.isFocused) {
          editor.commands.focus("end");
        }
      }}
    >
      <EditorContent
        editor={editor}
        className={`w-full flex-1 h-full min-h-0 flex flex-col bg-transparent border-0 focus:ring-0 focus:outline-none font-sans text-xs sm:text-[13px] leading-relaxed text-gray-800 ${
          isReadOnly ? "cursor-default select-text" : ""
        }`}
      />
    </div>
  );
};

export default function ModalReviewPsikotes({
  item,
  onClose,
  onSuccess,
  isStandalonePage = false,
  initialDetail = null,
}: ModalReviewPsikotesProps) {
  const [pages, setPages] = useState<string[]>(["<p></p>"]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [, setEditorTick] = useState(0);

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

  // Map editor TipTap per Halaman A4
  const editorsMapRef = useRef<Map<number, Editor>>(new Map());

  const registerEditor = useCallback((pageIdx: number, ed: Editor | null) => {
    if (ed) {
      editorsMapRef.current.set(pageIdx, ed);
      setActiveEditor((prev) => prev || ed);
    } else {
      editorsMapRef.current.delete(pageIdx);
    }
  }, []);

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
      const ed = editorsMapRef.current.get(idx);
      return ed ? ed.getHTML() : p;
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
        setPages(["<p></p>"]);
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
            setPages(["<p></p>"]);
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
    if (!item?.id || !pages.some((p) => p.replace(/<[^>]+>/g, "").trim().length > 0)) return;
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
    item.nama_paket?.toLowerCase().includes("multiaxial") ||
    item.nama_paket?.toLowerCase().includes("pola klinis") ||
    fullDetail?.paket?.alat_ukur?.kode?.toUpperCase().includes("MCMI")
  );

  const handleAddPage = (insertIndex?: number, initialHtml?: string) => {
    const content = initialHtml && initialHtml.trim() ? initialHtml : "<p></p>";
    setPages((prev) => {
      const targetIdx = typeof insertIndex === "number" ? insertIndex : prev.length;
      if (typeof insertIndex === "number" && insertIndex < prev.length && initialHtml) {
        const next = [...prev];
        next[insertIndex] = (next[insertIndex] || "") + initialHtml;
        return next;
      }
      const next = [...prev];
      next.splice(targetIdx, 0, content);
      return next;
    });
    const newActiveIdx = typeof insertIndex === "number" ? insertIndex : pages.length;
    setActivePageIndex(newActiveIdx);
    setTimeout(() => {
      const ed = editorsMapRef.current.get(newActiveIdx);
      if (ed) {
        ed.commands.focus("end");
        setActiveEditor(ed);
      }
    }, 60);
  };

  const handleRemovePage = (pageIdx: number, silent = false) => {
    if (pages.length <= 1) return;
    const pageContent = (pages[pageIdx] || "").replace(/<[^>]+>/g, "").trim();
    if (pageContent.length > 0 && !silent) {
      if (!window.confirm(`Hapus Halaman ${pageIdx + 1}? Tulisan pada halaman ini akan ikut terhapus.`)) {
        return;
      }
    }
    editorsMapRef.current.delete(pageIdx);
    setPages((prev) => prev.filter((_, idx) => idx !== pageIdx));
    const newActiveIdx = Math.max(0, pageIdx - 1);
    setActivePageIndex(newActiveIdx);
    setTimeout(() => {
      const ed = editorsMapRef.current.get(newActiveIdx);
      if (ed) {
        ed.commands.focus("end");
        setActiveEditor(ed);
      }
    }, 50);
  };

  // Editor yang sedang aktif atau editor lembar halaman saat ini
  const currentEditor = activeEditor || editorsMapRef.current.get(activePageIndex) || editorsMapRef.current.get(0) || null;

  // Status indikator aktif toolbar format WYSIWYG reaktif terhadap TipTap
  const isBoldActive = Boolean(currentEditor?.isActive("bold"));
  const isItalicActive = Boolean(currentEditor?.isActive("italic"));
  const isUnderlineActive = Boolean(currentEditor?.isActive("underline"));
  const isFirstLineIndentActive = Boolean(currentEditor?.getAttributes("paragraph")?.firstLineIndent);
  const isHangingIndentActive = Boolean(currentEditor?.getAttributes("paragraph")?.hangingIndent);
  const currentIndentLevel = Number(currentEditor?.getAttributes("paragraph")?.indent || 0);
  const isListActive = Boolean(currentEditor?.isActive("orderedList") || currentEditor?.isActive("bulletList"));
  const isOrderedListActive = Boolean(currentEditor?.isActive("orderedList") && currentEditor?.getAttributes("orderedList")?.type !== "I");
  const isRomanListActive = Boolean(currentEditor?.isActive("orderedList") && currentEditor?.getAttributes("orderedList")?.type === "I");
  const isBulletListActive = Boolean(currentEditor?.isActive("bulletList"));

  // Eksekusi pemformatan TipTap
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
    const targetEditor = currentEditor;
    if (!targetEditor) return;

    targetEditor.commands.focus();

    switch (type) {
      case "bold":
        targetEditor.chain().focus().toggleBold().run();
        break;
      case "italic":
        targetEditor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        targetEditor.chain().focus().toggleUnderline().run();
        break;
      case "number":
        if (targetEditor.isActive("orderedList")) {
          const curType = targetEditor.getAttributes("orderedList")?.type;
          if (curType === "1" || !curType) {
            targetEditor.chain().focus().toggleOrderedList().run();
          } else {
            targetEditor.chain().focus().updateAttributes("orderedList", { type: "1" }).run();
          }
        } else {
          targetEditor
            .chain()
            .focus()
            .toggleOrderedList()
            .updateAttributes("orderedList", { type: "1" })
            .run();
        }
        break;
      case "roman":
        if (targetEditor.isActive("orderedList")) {
          const curType = targetEditor.getAttributes("orderedList")?.type;
          if (curType === "I") {
            targetEditor.chain().focus().toggleOrderedList().run();
          } else {
            targetEditor.chain().focus().updateAttributes("orderedList", { type: "I" }).run();
          }
        } else {
          targetEditor
            .chain()
            .focus()
            .toggleOrderedList()
            .updateAttributes("orderedList", { type: "I" })
            .run();
        }
        break;
      case "bullet":
        targetEditor.chain().focus().toggleBulletList().run();
        break;
      case "first-line-indent": {
        const isFirst = targetEditor.getAttributes("paragraph").firstLineIndent;
        targetEditor
          .chain()
          .focus()
          .updateAttributes("paragraph", {
            firstLineIndent: !isFirst,
            hangingIndent: false,
          })
          .run();
        break;
      }
      case "hanging-indent": {
        const isHanging = targetEditor.getAttributes("paragraph").hangingIndent;
        targetEditor
          .chain()
          .focus()
          .updateAttributes("paragraph", {
            hangingIndent: !isHanging,
            firstLineIndent: false,
          })
          .run();
        break;
      }
      case "indent": {
        if (targetEditor.isActive("listItem")) {
          targetEditor.chain().focus().sinkListItem("listItem").run();
        } else {
          const curAttrs = targetEditor.getAttributes("paragraph");
          const curIndent = curAttrs.indent || 0;
          const isFirst = Boolean(curAttrs.firstLineIndent);
          if (curIndent > 0 && !isFirst) {
            targetEditor
              .chain()
              .focus()
              .updateAttributes("paragraph", {
                firstLineIndent: true,
                hangingIndent: false,
              })
              .run();
          } else if (curIndent === 0 && !isFirst) {
            targetEditor
              .chain()
              .focus()
              .updateAttributes("paragraph", {
                firstLineIndent: true,
                hangingIndent: false,
              })
              .run();
          } else {
            targetEditor
              .chain()
              .focus()
              .updateAttributes("paragraph", {
                indent: curIndent + 1,
                hangingIndent: false,
              })
              .run();
          }
        }
        break;
      }
      case "outdent": {
        if (targetEditor.isActive("listItem")) {
          targetEditor.chain().focus().liftListItem("listItem").run();
        } else {
          const curAttrs = targetEditor.getAttributes("paragraph");
          const curIndent = curAttrs.indent || 0;
          const isFirst = Boolean(curAttrs.firstLineIndent);
          if (isFirst) {
            targetEditor
              .chain()
              .focus()
              .updateAttributes("paragraph", { firstLineIndent: false })
              .run();
          } else if (curIndent > 0) {
            targetEditor
              .chain()
              .focus()
              .updateAttributes("paragraph", { indent: curIndent - 1 })
              .run();
          } else {
            targetEditor
              .chain()
              .focus()
              .updateAttributes("paragraph", {
                firstLineIndent: false,
                hangingIndent: false,
              })
              .run();
          }
        }
        break;
      }
    }
  };

  const handleSaveDraft = async () => {
    const combined = getCombinedCatatan(pages);
    if (!pages.some((p) => p.replace(/<[^>]+>/g, "").trim().length > 0)) {
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
    if (!pages.some((p) => p.replace(/<[^>]+>/g, "").trim().length > 0)) {
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
                disabled={isSavingDraft || isSubmitting || !pages.some((p) => p.replace(/<[^>]+>/g, "").trim().length > 0)}
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
                  if (!pages.some((p) => p.replace(/<[^>]+>/g, "").trim().length > 0)) {
                    setSubmitError("Catatan telaah psikolog wajib diisi sebelum menerbitkan laporan.");
                    return;
                  }
                  setShowPublishConfirmModal(true);
                }}
                disabled={isSubmitting || isSavingDraft || !pages.some((p) => p.replace(/<[^>]+>/g, "").trim().length > 0)}
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
                    <UnderlineIcon className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-gray-200 mx-1" />

                  {/* 2. Dropdown Format Daftar (Angka, Romawi, Poin) */}
                  <div className="relative" ref={listDropdownRef}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setIsListDropdownOpen((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 font-medium border text-xs ${
                        isListDropdownOpen || isListActive
                          ? "bg-purple-50 border-purple-300 text-purple-900 font-semibold"
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
                          className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isOrderedListActive
                              ? "bg-purple-100 text-purple-900 font-bold"
                              : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                          }`}
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
                          className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isRomanListActive
                              ? "bg-purple-100 text-purple-900 font-bold"
                              : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                          }`}
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
                          className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                            isBulletListActive
                              ? "bg-purple-100 text-purple-900 font-bold"
                              : "text-gray-700 hover:bg-purple-50 hover:text-purple-900"
                          }`}
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
                </div>
              </div>
            )}

            {/* Global Style Typography, Word Wrapping, Hanging Indent & Keep Lines Together */}
            <style dangerouslySetInnerHTML={{ __html: `
              .tiptap {
                min-height: 100% !important;
                height: 100% !important;
                flex: 1 1 auto !important;
                display: flex !important;
                flex-direction: column !important;
                outline: none !important;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                font-size: 12px;
                line-height: 1.625;
                color: #1f2937;
                overflow-wrap: break-word !important;
                word-break: normal !important;
                white-space: pre-wrap !important;
              }
              @media (min-width: 640px) {
                .tiptap {
                  font-size: 13px;
                }
              }
              .tiptap:focus, .ProseMirror:focus {
                outline: none !important;
              }
              .tiptap p {
                margin: 0 0 6px 0;
                overflow-wrap: break-word !important;
                word-break: normal !important;
                white-space: pre-wrap !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              .tiptap p:last-child {
                margin-bottom: 0;
              }
              .tiptap ol {
                list-style-type: decimal !important;
                list-style-position: outside !important;
                padding-left: 28px !important;
                margin: 4px 0 6px 0 !important;
              }
              .tiptap ol.list-roman,
              .tiptap ol[type="I"] {
                list-style-type: upper-roman !important;
              }
              .tiptap ul {
                list-style-type: disc !important;
                list-style-position: outside !important;
                padding-left: 28px !important;
                margin: 4px 0 6px 0 !important;
              }
              .tiptap li {
                display: list-item !important;
                margin-bottom: 3px !important;
                padding-left: 4px !important;
                overflow-wrap: break-word !important;
                word-break: normal !important;
                white-space: pre-wrap !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              .tiptap li::marker {
                font-weight: bold !important;
                color: #111827 !important;
              }
              .tiptap li p {
                margin: 0 !important;
                padding: 0 !important;
                text-indent: 0 !important;
                display: inline !important;
              }
              .tiptap .editor-first-line-indent,
              .tiptap p.editor-first-line-indent {
                text-indent: 28px !important;
              }
              .tiptap .editor-hanging-indent,
              .tiptap p.editor-hanging-indent {
                padding-left: 28px !important;
                text-indent: -28px !important;
                tab-size: 28px !important;
              }
              .tiptap .editor-indent-1.editor-hanging-indent,
              .tiptap p.editor-indent-1.editor-hanging-indent {
                padding-left: 56px !important;
                text-indent: -28px !important;
              }
              .tiptap .editor-indent-2.editor-hanging-indent,
              .tiptap p.editor-indent-2.editor-hanging-indent {
                padding-left: 84px !important;
                text-indent: -28px !important;
              }
              .tiptap .editor-paragraph-indent,
              .tiptap p.editor-paragraph-indent {
                overflow-wrap: break-word !important;
              }
              .tiptap .editor-indent-1,
              .tiptap p.editor-indent-1 {
                padding-left: 28px !important;
              }
              .tiptap .editor-indent-2,
              .tiptap p.editor-indent-2 {
                padding-left: 56px !important;
              }
              .tiptap .editor-indent-3,
              .tiptap p.editor-indent-3 {
                padding-left: 84px !important;
              }
              .tiptap p.is-editor-empty:first-child::before {
                content: attr(data-placeholder);
                float: left;
                color: #9ca3af;
                pointer-events: none;
                height: 0;
                font-family: ui-sans-serif, system-ui, sans-serif;
                font-size: 13px;
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
                  onClick={() => {
                    setActivePageIndex(pageIdx);
                    const ed = editorsMapRef.current.get(pageIdx);
                    if (ed) {
                      setActiveEditor(ed);
                      if (!ed.isFocused) {
                        ed.commands.focus("end");
                      }
                    }
                  }}
                  className="relative bg-white rounded-sm shadow-2xl border border-gray-300/90 w-full max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] mx-auto px-8 sm:px-12 py-7 sm:py-8 flex flex-col justify-between text-gray-900 font-sans transition-all overflow-hidden box-border cursor-text"
                  style={{ width: "794px", height: "1123px", minHeight: "1123px", maxHeight: "1123px" }}
                >
                  {/* BAGIAN ATAS LEMBAR A4 (HEADER & IDENTITAS) */}
                  <div className="shrink-0 space-y-3">
                    {isFirstPage ? (
                      <>
                        {/* 1. KOP SURAT RESMI BIRO PSIKOLOGI EMPATHIKA */}
                        <div className="text-center space-y-1 pb-2 font-sans select-none">
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
                        <div className="font-sans text-xs sm:text-[13px] text-gray-800 py-2.5 border-b border-gray-300/80 select-none">
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
                      <div className="pb-2.5 border-b border-gray-300/80 flex items-center justify-between text-xs text-gray-600 font-sans select-none">
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

                  {/* AREA KETIK LEMBAR A4 DOKUMEN WYSIWYG BERBASIS TIPTAP: FLEX-1 MENGISI PENUH SISA RUANG */}
                  <div className="flex-1 flex flex-col min-h-0 pt-2 pb-3.5 overflow-hidden">
                    <TipTapSheetEditor
                      pageIdx={pageIdx}
                      initialContent={pageText}
                      isReadOnly={isReadOnly}
                      isFirstPage={isFirstPage}
                      onUpdateContent={(html) => {
                        setPages((prev) => {
                          const next = [...prev];
                          next[pageIdx] = html;
                          return next;
                        });
                      }}
                      onFocus={(ed) => {
                        setActiveEditor(ed);
                        setActivePageIndex(pageIdx);
                        setEditorTick((t) => t + 1);
                      }}
                      onTransaction={() => {
                        setEditorTick((t) => t + 1);
                      }}
                      onAddPageAfter={(initialHtml) => handleAddPage(pageIdx + 1, initialHtml)}
                      onRemovePageIfEmpty={() => handleRemovePage(pageIdx, true)}
                      registerEditor={registerEditor}
                    />
                  </div>

                  {/* BAGIAN BAWAH LEMBAR A4 (TANDA TANGAN & FOOTER) */}
                  <div className="shrink-0 space-y-2 pt-1.5 select-none">
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
