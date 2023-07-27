/* eslint-disable */
// This file was generated by [tauri-specta](https://github.com/oscartbeaumont/tauri-specta). Do not edit this file manually.

declare global {
    interface Window {
        __TAURI_INVOKE__<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
    }
}

// Function avoids 'window not defined' in SSR
const invoke = () => window.__TAURI_INVOKE__;

export function getBooks() {
    return invoke()<BookWithCover[]>("get_books")
}

export function getBooksBase64() {
    return invoke()<BookWithAuthorsAndCover[]>("get_books_base64")
}

export function addBook(title: string, path: string) {
    return invoke()<Book>("add_book", { title,path })
}

export function addBookFromFile(path: string) {
    return invoke()<Book>("add_book_from_file", { path })
}

export function addMultipleBooksFromFiles(paths: string[]) {
    return invoke()<null>("add_multiple_books_from_files", { paths })
}

export type BookWithCover = { book: Book; cover: number[] | null }
export type BookWithAuthorsAndCover = { book: Book; authors: Author[]; cover: string | null }
export type Book = { id: string; title: string; path: string }
export type Author = { id: string; name: string }
