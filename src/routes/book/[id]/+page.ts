import type { PageLoad } from './$types';
import { getBook, getCollections } from '$lib/bindings';

export const load = (async ({ params }) => {
	const book = await getBook(params.id);
	const collections = await getCollections();

	if (!book) {
		throw Error('');
	}

	collections.sort((a, b) => a.name.localeCompare(b.name));

	return { book, collections };
}) satisfies PageLoad;
