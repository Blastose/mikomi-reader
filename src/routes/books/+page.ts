import type { PageLoad } from './$types';
import { getBooks, getLanguages } from '$lib/bindings';
import { escapeRegExp } from '$lib/components/reader/search/search';

export const load = (async ({ url }) => {
	let books = await getBooks();
	const databaseLanguages = await getLanguages();

	console.log(url.pathname + url.search);

	const statuses = url.searchParams.getAll('status');
	const languages = url.searchParams.getAll('lang');
	const searchQuery = url.searchParams.get('q');

	if (statuses.length > 0) {
		console.log(statuses);
		books = books.filter((b) => statuses.includes(b.reading_status));
	}
	if (languages.length > 0) {
		books = books.filter((b) => languages.includes(b.language ?? 'null'));
	}
	if (searchQuery) {
		books = books.filter((b) => b.title.match(new RegExp(escapeRegExp(searchQuery), 'gi')));
	}

	const queryData = {
		statuses,
		searchQuery,
		languages
	};

	return {
		books,
		searchQuery,
		queryData,
		databaseLanguages
	};
}) satisfies PageLoad;
