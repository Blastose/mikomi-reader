import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';
import { cacheOrRun } from '$lib/cache/cache';

// TODO - placeholder for testing
export const load = (async ({ url, params }) => {
	const data = cacheOrRun(url.toString(), getBooks);
	const books = await data;

	const book = books.find((e) => e.book.id === params.id);
	if (!book) {
		throw Error('');
	}

	return { book };
}) satisfies PageLoad;
