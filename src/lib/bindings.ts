/* eslint-disable */
// This file was generated by [tauri-specta](https://github.com/oscartbeaumont/tauri-specta). Do not edit this file manually.

declare global {
    interface Window {
        __TAURI_INVOKE__<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
    }
}

// Function avoids 'window not defined' in SSR
const invoke = () => window.__TAURI_INVOKE__;

export function getBook(id: string) {
    return invoke()<BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettings | null>("get_book", { id })
}

export function getBooks() {
    return invoke()<BookWithAuthorsAndCoverAndSettings[]>("get_books")
}

export function addBookFromFile(path: string) {
    return invoke()<Book>("add_book_from_file", { path })
}

export function addMultipleBooksFromFiles(paths: string[]) {
    return invoke()<null>("add_multiple_books_from_files", { paths })
}

export function updateBook(book: Book) {
    return invoke()<null>("update_book", { book })
}

export function addBookmark(newBookmark: Bookmark) {
    return invoke()<null>("add_bookmark", { newBookmark })
}

export function removeBookmark(id: string) {
    return invoke()<null>("remove_bookmark", { id })
}

export function updateBookmark(id: string, displayText: string) {
    return invoke()<null>("update_bookmark", { id,displayText })
}

export function addHighlight(newHighlight: Highlight) {
    return invoke()<null>("add_highlight", { newHighlight })
}

export function removeHighlight(id: string) {
    return invoke()<null>("remove_highlight", { id })
}

export function updateHighlight(id: string, note: string, color: string) {
    return invoke()<null>("update_highlight", { id,note,color })
}

export function addBookSettings(newBookSettings: BookSettings) {
    return invoke()<null>("add_book_settings", { newBookSettings })
}

export function removeBookSettings(id: string) {
    return invoke()<null>("remove_book_settings", { id })
}

export function updateBookSettings(bookId: string, newBookSettings: BookSettings) {
    return invoke()<null>("update_book_settings", { bookId,newBookSettings })
}

export function getReaderThemes() {
    return invoke()<ReaderTheme[]>("get_reader_themes")
}

export function addReaderTheme(newReaderTheme: ReaderTheme) {
    return invoke()<null>("add_reader_theme", { newReaderTheme })
}

export function removeReaderTheme(id: string) {
    return invoke()<null>("remove_reader_theme", { id })
}

export function updateReaderTheme(id: string, name: string) {
    return invoke()<null>("update_reader_theme", { id,name })
}

export type Bookmark = { id: string; book_id: string; display_text: string; date_added: number; css_selector: string }
export type BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettings = ({ id: string; title: string; path: string; last_read: number | null }) & { authors: Author[]; bookmarks: Bookmark[]; highlights: Highlight[]; cover: string | null; settings: BookSettings | null }
export type BookWithAuthorsAndCoverAndSettings = ({ id: string; title: string; path: string; last_read: number | null }) & { authors: Author[]; cover: string | null; settings: BookSettings | null }
export type Book = { id: string; title: string; path: string; last_read: number | null }
export type Author = { id: string; name: string }
export type ReaderTheme = { id: string; name: string; background_color: string; color: string; link_color: string; primary_color: string; image_blend_mode: string }
export type BookSettings = { id: string; book_id: string; width: number | null; height: number | null; percentage: number | null; last_element: string | null; last_page: number | null; font_size: number; line_height: string; margins: number; text_align: string; column_count: number; writing_mode: string; font_family: string; background_color: string; color: string; link_color: string; primary_color: string; image_blend_mode: string }
export type Highlight = { id: string; book_id: string; date_added: number; note: string; start_container: string; start_offset: number; end_container: string; end_offset: number; color: string }
