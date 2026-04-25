'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback } from 'react'
import styles from './RichTextEditor.module.scss'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Write your article content here...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: styles.content, 'aria-label': 'Article content editor' },
    },
  })

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:')
    if (url && editor) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const setLink = useCallback(() => {
    const url = window.prompt('Enter URL:')
    if (!url) { editor?.chain().focus().unsetLink().run(); return }
    editor?.chain().focus().setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar} role="toolbar" aria-label="Editor toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`${styles.toolBtn} ${editor.isActive('bold') ? styles.active : ''}`} title="Bold"><b>B</b></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`${styles.toolBtn} ${editor.isActive('italic') ? styles.active : ''}`} title="Italic"><i>I</i></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`${styles.toolBtn} ${editor.isActive('strike') ? styles.active : ''}`} title="Strikethrough"><s>S</s></button>
        <div className={styles.divider} />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${styles.toolBtn} ${editor.isActive('heading', { level: 2 }) ? styles.active : ''}`} title="Heading 2">H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${styles.toolBtn} ${editor.isActive('heading', { level: 3 }) ? styles.active : ''}`} title="Heading 3">H3</button>
        <div className={styles.divider} />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${styles.toolBtn} ${editor.isActive('bulletList') ? styles.active : ''}`} title="Bullet list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="18" r="1" fill="currentColor"/></svg>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${styles.toolBtn} ${editor.isActive('orderedList') ? styles.active : ''}`} title="Numbered list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10H6"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </button>
        <div className={styles.divider} />
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${styles.toolBtn} ${editor.isActive('blockquote') ? styles.active : ''}`} title="Blockquote">❝</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={`${styles.toolBtn} ${editor.isActive('code') ? styles.active : ''}`} title="Code">{`</>`}</button>
        <button type="button" onClick={setLink} className={`${styles.toolBtn} ${editor.isActive('link') ? styles.active : ''}`} title="Link">🔗</button>
        <button type="button" onClick={addImage} className={styles.toolBtn} title="Image">🖼</button>
        <div className={styles.divider} />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={styles.toolBtn} title="Undo">↩</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={styles.toolBtn} title="Redo">↪</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
