import type { PageLoad } from './$types';
import { getBooks, getBooksBase64 } from '$lib/bindings';

export const load = (async () => {
	const books = await getBooksBase64();

	books.forEach((b) => {
		console.log(b.cover);
	});

	return {
		books
	};
}) satisfies PageLoad;
