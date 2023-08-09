import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';
import { cacheOrRun, setCache } from '$lib/cache/cache';

export const load = (async ({ url }) => {
	const data = cacheOrRun(url.toString(), getBooks);

	const loadedData = await data;
	setCache(url.toString(), loadedData);

	return {
		books: data
	};
}) satisfies PageLoad;
