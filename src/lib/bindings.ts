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
    return invoke()<BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettingsAndCollections | null>("get_book", { id })
}

export function getBooks() {
    return invoke()<BookWithAuthorsAndCoverAndSettingsAndCollections[]>("get_books")
}

export function getBooksBelongingToCollections(collectionId: string) {
    return invoke()<CollectionWithBooks>("get_books_belonging_to_collections", { collectionId })
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

export function updateBookReadingStatus(id: string, readingStatus: string) {
    return invoke()<null>("update_book_reading_status", { id,readingStatus })
}

export function removeBook(id: string) {
    return invoke()<null>("remove_book", { id })
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

export function getCollections() {
    return invoke()<Collection[]>("get_collections")
}

export function getCollectionsAndTheirBooks() {
    return invoke()<CollectionWithBooks[]>("get_collections_and_their_books")
}

export function addCollection(newCollection: Collection) {
    return invoke()<null>("add_collection", { newCollection })
}

export function updateCollectionName(id: string, name: string) {
    return invoke()<null>("update_collection_name", { id,name })
}

export function reorderCollections(collections: CollectionIdWithSortOrder[]) {
    return invoke()<null>("reorder_collections", { collections })
}

export function reorderBooksInCollection(bookCollectionLinks: BookCollectionLink[]) {
    return invoke()<null>("reorder_books_in_collection", { bookCollectionLinks })
}

export function removeCollection(id: string) {
    return invoke()<null>("remove_collection", { id })
}

export function addBookToCollections(bookId: string, collectionIds: string[]) {
    return invoke()<null>("add_book_to_collections", { bookId,collectionIds })
}

export function removeBookFromCollection(bookId: string, collectionId: string) {
    return invoke()<null>("remove_book_from_collection", { bookId,collectionId })
}

export function getLanguages() {
    return invoke()<Language[]>("get_languages")
}

export type Highlight = { id: string; book_id: string; date_added: number; note: string; start_container: string; start_offset: number; end_container: string; end_offset: number; color: string }
export type BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettingsAndCollections = ({ id: string; title: string; path: string; last_read: number | null; date_added: number; reading_status: string; language: string | null; last_modified: string | null; identifier: string | null; published_date: string | null; description: string | null; publisher: string | null; page_progression_direction: string | null }) & { authors: Author[]; bookmarks: Bookmark[]; highlights: Highlight[]; collections: Collection[]; cover: string | null; settings: BookSettings | null }
export type Language = { name: string }
export type Bookmark = { id: string; book_id: string; display_text: string; date_added: number; css_selector: string }
export type BookSettings = { id: string; book_id: string; width: number | null; height: number | null; percentage: number | null; last_element: string | null; last_page: number | null; font_size: number; line_height: string; margins: number; text_align: string; column_count: number; writing_mode: string; font_family: string; background_color: string; color: string; link_color: string; primary_color: string; image_blend_mode: string }
export type Book = { id: string; title: string; path: string; last_read: number | null; date_added: number; reading_status: string; language: string | null; last_modified: string | null; identifier: string | null; published_date: string | null; description: string | null; publisher: string | null; page_progression_direction: string | null }
export type ReaderTheme = { id: string; name: string; background_color: string; color: string; link_color: string; primary_color: string; image_blend_mode: string }
export type BookCollectionLink = { book_id: string; collection_id: string; sort_order: number | null }
export type Collection = { id: string; name: string; sort_order: number | null }
export type Author = { id: string; name: string }
export type BookWithAuthorsAndCoverAndSettingsAndCollections = ({ id: string; title: string; path: string; last_read: number | null; date_added: number; reading_status: string; language: string | null; last_modified: string | null; identifier: string | null; published_date: string | null; description: string | null; publisher: string | null; page_progression_direction: string | null }) & { authors: Author[]; cover: string | null; settings: BookSettings | null; collections: Collection[] }
export type CollectionIdWithSortOrder = { id: string; sort_order: number }
export type BookWithCover = ({ id: string; title: string; path: string; last_read: number | null; date_added: number; reading_status: string; language: string | null; last_modified: string | null; identifier: string | null; published_date: string | null; description: string | null; publisher: string | null; page_progression_direction: string | null }) & { cover: string | null }
export type CollectionWithBooks = { collection: Collection; books: BookWithCover[] }
