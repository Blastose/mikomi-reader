import type { PageLoad } from './$types';
import { getBooks } from '$lib/bindings';
import { escapeRegExp } from '$lib/components/reader/search/search';

export const load = (async ({ url }) => {
	let books = await getBooks();

	console.log(url.pathname + url.search);

	const statuses = url.searchParams.getAll('status');
	const searchQuery = url.searchParams.get('q');

	if (statuses.length > 0) {
		console.log(statuses);
		books = books.filter((b) => statuses.includes(b.reading_status));
	}
	if (searchQuery) {
		books = books.filter((b) => b.title.match(new RegExp(escapeRegExp(searchQuery), 'gi')));
	}

	const queryData = {
		statuses,
		searchQuery
	};

	return {
		books,
		searchQuery,
		queryData
	};
}) satisfies PageLoad;
