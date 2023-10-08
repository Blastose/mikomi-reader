import { updateBook, type Book, type BookSettings } from '$lib/bindings';
import { WebviewWindow } from '@tauri-apps/api/window';

export function readBook(book: Book, settings: BookSettings | null) {
	updateBook({ ...book, last_read: Math.floor(Date.now() / 1000) });
	const newUrl = `/reader/${book.id}`;
	new WebviewWindow(book.id, {
		url: newUrl,
		height: settings?.height ?? 860,
		width: settings?.width ?? 512,
		title: `${book.title} - Mikomi Reader`,
		visible: false
	});
}
