'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { TextStyle, FontFamily, FontSize, Color } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { useEffect, useRef, useState } from 'react';
import styles from './ProposalEditor.module.css';

// ── Toolbar icons (inline SVG keeps zero extra dependencies) ─────────────────

const Icons = {
  Undo: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7v6h6" />
      <path d="M3 13C5.2 7.9 10.1 5 15.5 5 21 5 24 9 24 12" />
    </svg>
  ),
  Redo: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7v6h-6" />
      <path d="M21 13C18.8 7.9 13.9 5 8.5 5 3 5 0 9 0 12" />
    </svg>
  ),
  Bold: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  ),
  Italic: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  ),
  Underline: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  ),
  Strike: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <path d="M16 6C16 6 14.5 4 12 4C9 4 7 6 7 8C7 10 8.5 11 10 11.5" />
      <path d="M8 18C8 18 9.5 20 12 20C15 20 17 18 17 16C17 14 15.5 13 14 12.5" />
    </svg>
  ),
  AlignLeft: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  ),
  AlignCenter: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  AlignRight: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="6" y1="18" x2="21" y2="18" />
    </svg>
  ),
  AlignJustify: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  BulletList: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="4" cy="12" r="1" fill="currentColor" />
      <circle cx="4" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
  OrderedList: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  ),
  Blockquote: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  ),
  HR: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  ),
  Link: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Image: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  ClearFormat: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7V4h16v3" />
      <path d="M5 20h6" />
      <path d="M13 4l-4 16" />
      <line x1="17" y1="17" x2="22" y2="22" />
      <line x1="22" y1="17" x2="17" y2="22" />
    </svg>
  ),
  TextColor: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16" />
      <path d="m6 16 6-12 6 12" />
      <path d="M8 12h8" />
    </svg>
  ),
  Highlight: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 11-6 6v3h9l3-3" />
      <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
    </svg>
  ),
};

const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

const FONT_SIZES = [
  '10px',
  '11px',
  '12px',
  '13px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '48px',
  '64px',
];

const HEADING_OPTIONS = [
  { label: 'Normal', value: 'paragraph' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
];

// ── Link dialog ───────────────────────────────────────────────────────────────

function LinkDialog({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const current = editor.getAttributes('link').href as string | undefined;
  const [url, setUrl] = useState(current ?? '');

  const apply = () => {
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = url.startsWith('http') ? url : `https://${url}`;
      editor.chain().focus().setLink({ href, target: '_blank' }).run();
    }
    onClose();
  };

  return (
    <div className={styles.linkDialogBackdrop} onClick={onClose}>
      <div className={styles.linkDialog} onClick={(e) => e.stopPropagation()}>
        <p className={styles.linkDialogTitle}>Insert / Edit Link</p>
        <input
          className={styles.linkDialogInput}
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          autoFocus
        />
        <div className={styles.linkDialogActions}>
          {current && (
            <button
              className={styles.linkDialogRemove}
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                onClose();
              }}
            >
              Remove link
            </button>
          )}
          <button className={styles.linkDialogCancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.linkDialogApply} onClick={apply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor }) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const highlightInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const currentHeading = HEADING_OPTIONS.find((h) => {
    if (h.value === 'paragraph') return editor.isActive('paragraph');
    const lvl = parseInt(h.value[1]);
    return editor.isActive('heading', { level: lvl });
  });

  const applyHeading = (val: string) => {
    if (val === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: parseInt(val[1]) as 1 | 2 | 3 | 4 })
        .run();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target?.result;
      if (typeof src === 'string') {
        editor.chain().focus().setImage({ src }).run();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const btn = (active: boolean) => `${styles.toolbarBtn} ${active ? styles.toolbarBtnActive : ''}`;

  return (
    <>
      <div className={styles.toolbar}>
        {/* History */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarBtn}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Icons.Undo />
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <Icons.Redo />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        {/* Heading */}
        <div className={styles.toolbarGroup}>
          <select
            className={styles.toolbarSelect}
            value={currentHeading?.value ?? 'paragraph'}
            onChange={(e) => applyHeading(e.target.value)}
            title="Heading style"
          >
            {HEADING_OPTIONS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.toolbarDivider} />

        {/* Font Family */}
        <div className={styles.toolbarGroup}>
          <select
            className={styles.toolbarSelect}
            style={{ minWidth: 110 }}
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            defaultValue=""
            title="Font family"
          >
            <option value="" disabled>
              Font
            </option>
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <select
            className={styles.toolbarSelect}
            style={{ minWidth: 60 }}
            onChange={(e) => {
              if (e.target.value) editor.chain().focus().setFontSize(e.target.value).run();
              else editor.chain().focus().unsetFontSize().run();
            }}
            defaultValue=""
            title="Font size"
          >
            <option value="" disabled>
              Size
            </option>
            {FONT_SIZES.map((sz) => (
              <option key={sz} value={sz}>
                {sz.replace('px', '')}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.toolbarDivider} />

        {/* Text formatting */}
        <div className={styles.toolbarGroup}>
          <button
            className={btn(editor.isActive('bold'))}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Icons.Bold />
          </button>
          <button
            className={btn(editor.isActive('italic'))}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Icons.Italic />
          </button>
          <button
            className={btn(editor.isActive('underline'))}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <Icons.Underline />
          </button>
          <button
            className={btn(editor.isActive('strike'))}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Icons.Strike />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        {/* Color */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarBtn}
            onClick={() => colorInputRef.current?.click()}
            title="Text color"
          >
            <Icons.TextColor />
          </button>
          <input
            ref={colorInputRef}
            type="color"
            className={styles.hiddenColorInput}
            defaultValue="#111827"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
          <button
            className={btn(editor.isActive('highlight'))}
            onClick={() => highlightInputRef.current?.click()}
            title="Highlight"
          >
            <Icons.Highlight />
          </button>
          <input
            ref={highlightInputRef}
            type="color"
            className={styles.hiddenColorInput}
            defaultValue="#fef08a"
            onChange={(e) =>
              editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
            }
          />
        </div>

        <div className={styles.toolbarDivider} />

        {/* Alignment */}
        <div className={styles.toolbarGroup}>
          <button
            className={btn(editor.isActive({ textAlign: 'left' }))}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align left"
          >
            <Icons.AlignLeft />
          </button>
          <button
            className={btn(editor.isActive({ textAlign: 'center' }))}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align center"
          >
            <Icons.AlignCenter />
          </button>
          <button
            className={btn(editor.isActive({ textAlign: 'right' }))}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            title="Align right"
          >
            <Icons.AlignRight />
          </button>
          <button
            className={btn(editor.isActive({ textAlign: 'justify' }))}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            title="Justify"
          >
            <Icons.AlignJustify />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        {/* Lists */}
        <div className={styles.toolbarGroup}>
          <button
            className={btn(editor.isActive('bulletList'))}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <Icons.BulletList />
          </button>
          <button
            className={btn(editor.isActive('orderedList'))}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <Icons.OrderedList />
          </button>
          <button
            className={btn(editor.isActive('blockquote'))}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <Icons.Blockquote />
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Icons.HR />
          </button>
        </div>

        <div className={styles.toolbarDivider} />

        {/* Insert */}
        <div className={styles.toolbarGroup}>
          <button
            className={btn(editor.isActive('link'))}
            onClick={() => setShowLinkDialog(true)}
            title="Insert / edit link"
          >
            <Icons.Link />
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={() => imageInputRef.current?.click()}
            title="Insert image"
          >
            <Icons.Image />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className={styles.hiddenColorInput}
            onChange={handleImageUpload}
          />
        </div>

        <div className={styles.toolbarDivider} />

        {/* Clear */}
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarBtn}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clear formatting"
          >
            <Icons.ClearFormat />
          </button>
        </div>
      </div>

      {showLinkDialog && <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface ProposalEditorHandle {
  getHTML: () => string;
}

interface ProposalEditorProps {
  initialContent: string;
  onEditorReady?: (editor: Editor) => void;
}

export function ProposalEditor({ initialContent, onEditorReady }: ProposalEditorProps) {
  const notifiedRef = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: true }),
      FontFamily.configure({ types: ['textStyle'] }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Highlight.configure({ multicolor: true }),
      FontSize,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'proposal-editor-content',
        spellcheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady && !notifiedRef.current) {
      notifiedRef.current = true;
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  if (!editor) return null;

  return (
    <div className={styles.root}>
      <Toolbar editor={editor} />
      <div className={styles.pageWrap}>
        <div className={styles.page}>
          <EditorContent editor={editor} className={styles.editorContent} />
        </div>
      </div>
    </div>
  );
}
