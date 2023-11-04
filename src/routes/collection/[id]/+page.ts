import { getBooksBelongingToCollections } from '$lib/bindings';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const { collection, books } = await getBooksBelongingToCollections(params.id);

	return { collection, books };
}) satisfies PageLoad;
