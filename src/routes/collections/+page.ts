import { getCollectionsAndTheirBooks } from '$lib/bindings';
import type { PageLoad } from './$types';

export const load = (async () => {
	const collectionsWithBooks = await getCollectionsAndTheirBooks();

	return {
		collectionsWithBooks
	};
}) satisfies PageLoad;
