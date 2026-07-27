'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';
import FontFamily from '@tiptap/extension-font-family';
import { useEffect, useRef } from 'react';

/* ─── All toolbar icons as inline SVG components ─── */
const IcBold = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5S13.83 9.5 13 9.5h-3V6.5zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5S14.33 15.5 13.5 15.5z"/></svg>;
const IcItalic = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>;
const IcUnderline = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>;
const IcStrike = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>;
const IcCode = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="m8.293 6.293-2.497 2.497 2.497 2.497 1.414-1.414L8.624 8.79l1.083-1.083zm7.414 0-1.414 1.414 1.083 1.083-1.083 1.083 1.414 1.414 2.497-2.497zM3.293 11.293l-1.293 1.207 1.293 1.207L4.707 12.5zm17.414 0-1.414 1.207 1.414 1.207 1.414-1.207zm-15 1.914-5.414 4.499 1.414 1.708L3.416 15.12l-.709.586L7.122 12.5zM13 9.5 11 12l2 2.5h2.5l-3-2.5 3-2.5z"/></svg>;
const IcHighlight = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="m20.707 5.826-3.535-3.533a.999.999 0 0 0-1.408-.006L7.096 10.82a1.01 1.01 0 0 0-.273.488l-1.024 4.437L2 12.21V17h5.697l4.347-1.001a1 1 0 0 0 .485-.274l8.164-8.165a1 1 0 0 0 .014-1.734zM6.979 15H4v-2.979l6.885-6.885 2.979 2.979L6.979 15zm8.293-8.293-2.979-2.979 1.293-1.293 2.978 2.978-1.292 1.294z"/><path d="M2 20h20v2H2z"/></svg>;
const IcEraser = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M22 17H12l5-5 5 5zM2 22h20v-2H2v2zM16.5 3.5l-10 10-5-5 10-10 5 5z"/></svg>;
const IcAlignLeft = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/></svg>;
const IcAlignCenter = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 5h18v2H3V5zm3 4h12v2H6V9zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z"/></svg>;
const IcAlignRight = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 5h18v2H3V5zm6 4h12v2H9V9zm-6 4h18v2H3v-2zm6 4h12v2H9v-2z"/></svg>;
const IcAlignJustify = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 5h18v2H3V5zm0 4h18v2H3V9zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/></svg>;
const IcListUl = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M4 6h2v2H4zm0 5h2v2H4zm0 5h2v2H4zm16-8V6H8.023v2H20zM8 11h12v2H8zm0 5h12v2H8z"/></svg>;
const IcListOl = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-5v2h14V6H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>;
const IcIndent = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 5v14l8-7z"/><path d="M11 19h10V5H11v14zm2-2V7h6v10h-6z"/></svg>;
const IcOutdent = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11 5v14l-8-7z"/><path d="M3 19h10V5H3v14zm2-2V7h6v10H5z"/></svg>;
const IcTable = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H5V5h15zM5 10h4v4H5v-4zm6 0h4v4h-4v-4zm6 0h3v4h-3v-4zM5 16h4v3H5v-3zm6 0h4v3h-4v-3zm6 0h3v3h-3v-3z"/></svg>;

/* ─── Toolbar Button ─── */
function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center w-7 h-7 rounded-md text-sm transition-all
        ${active
          ? 'bg-violet-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );
}

/* ─── Divider ─── */
function Sep() {
  return <div className="w-px h-5 bg-slate-200 mx-0.5 shrink-0" />;
}

/* ─── Toolbar ─── */
function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="template-editor-toolbar flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-200 bg-slate-50/80 rounded-t-xl">
      {/* Heading Selector */}
      <select
        value={
          editor.isActive('heading', { level: 1 })
            ? '1'
            : editor.isActive('heading', { level: 2 })
            ? '2'
            : editor.isActive('heading', { level: 3 })
            ? '3'
            : '0'
        }
        onChange={(e) => {
          const val = Number(e.target.value);
          if (val === 0) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().setHeading({ level: val as 1 | 2 | 3 }).run();
          }
        }}
        title="Heading"
        className="text-xs font-medium text-slate-700 border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400 h-7 min-w-[90px]"
      >
        <option value="0">Normal</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      {/* Font Family */}
      <select
        value={editor.getAttributes('textStyle').fontFamily || ''}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) {
            editor.chain().focus().unsetFontFamily().run();
          } else {
            editor.chain().focus().setFontFamily(val).run();
          }
        }}
        title="Font Family"
        className="text-xs font-medium text-slate-700 border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-violet-400 h-7 min-w-[100px]"
      >
        <option value="">Default Font</option>
        <option value="Arial, sans-serif">Arial</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Courier New', monospace">Courier New</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="Verdana, sans-serif">Verdana</option>
        <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
      </select>

      <Sep />

      {/* Text Formatting */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
        <IcBold />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
        <IcItalic />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
        <IcUnderline />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <IcStrike />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
        <IcCode />
      </ToolbarBtn>

      <Sep />

      {/* Text Color */}
      <label title="Text Color" className="relative inline-flex items-center justify-center w-7 h-7 rounded-md cursor-pointer hover:bg-slate-100 transition-all">
        <span className="text-xs font-bold leading-none text-slate-700" style={{ fontFamily: 'serif' }}>A</span>
        <span
          className="absolute bottom-1 left-1 right-1 h-[3px] rounded-sm"
          style={{ background: (editor.getAttributes('textStyle') as { color?: string }).color || '#7c3aed' }}
        />
        <input
          type="color"
          defaultValue="#7c3aed"
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Text Color"
        />
      </label>

      {/* Highlight Color */}
      <label title="Highlight Color" className="relative inline-flex items-center justify-center w-7 h-7 rounded-md cursor-pointer hover:bg-slate-100 transition-all">
        <IcHighlight />
        <input
          type="color"
          defaultValue="#fde68a"
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
          title="Highlight"
        />
      </label>

      <Sep />

      {/* Alignment */}
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
        <IcAlignLeft />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
        <IcAlignCenter />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
        <IcAlignRight />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
        <IcAlignJustify />
      </ToolbarBtn>

      <Sep />

      {/* Lists */}
      <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
        <IcListUl />
      </ToolbarBtn>
      <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
        <IcListOl />
      </ToolbarBtn>

      <Sep />

      {/* Indent */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
        disabled={!editor.can().sinkListItem('listItem')}
        title="Increase Indent"
      >
        <IcIndent />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().liftListItem('listItem').run()}
        disabled={!editor.can().liftListItem('listItem')}
        title="Decrease Indent"
      >
        <IcOutdent />
      </ToolbarBtn>

      <Sep />

      {/* Table */}
      <ToolbarBtn onClick={addTable} title="Insert Table">
        <IcTable />
      </ToolbarBtn>

      {/* Table controls — only shown when cursor is in a table */}
      {editor.isActive('table') && (
        <>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
            title="Add Column After"
            className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 font-medium whitespace-nowrap"
          >+Col</button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
            title="Add Row After"
            className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 font-medium whitespace-nowrap"
          >+Row</button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }}
            title="Delete Column"
            className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-medium whitespace-nowrap"
          >−Col</button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }}
            title="Delete Row"
            className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-medium whitespace-nowrap"
          >−Row</button>
        </>
      )}

      <Sep />

      {/* Clear Formatting */}
      <ToolbarBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
        <IcEraser />
      </ToolbarBtn>
    </div>
  );
}

/* ─── Main TemplateEditor Component ─── */
interface TemplateEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function TemplateEditor({
  value,
  onChange,
  placeholder = 'Start building your template here...',
  minHeight = 480,
}: TemplateEditorProps) {
  // Track external value to avoid cursor-jump on every keystroke
  const lastExternalValue = useRef<string>(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastExternalValue.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'template-editor-content focus:outline-none',
        style: `min-height: ${minHeight}px; padding: 1.25rem 1.5rem;`,
      },
    },
  });

  // Sync external value changes (e.g. loading a different template) without losing cursor
  useEffect(() => {
    if (!editor) return;
    if (value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      const currentHtml = editor.getHTML();
      if (currentHtml !== value) {
        editor.commands.setContent(value);
      }
    }
  }, [editor, value]);

  return (
    <div className="template-editor-wrapper border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
