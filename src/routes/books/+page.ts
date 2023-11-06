import type { PageLoad } from './$types';
import {
	getBooks,
	getLanguages,
	type Collection,
	getCollections,
	type BookWithAuthorsAndCoverAndSettingsAndCollections
} from '$lib/bindings';
import { escapeRegExp } from '$lib/components/reader/search/search';
import { redirect } from '@sveltejs/kit';
import { databaseCollectionsStore } from '$lib/stores/mainStateStore';
import type { SortBy } from '$lib/components/form/utils';

function searchParamsCollectionIncludesCollection(
	searchparamsCollectionMap: Map<string, string>,
	collection: Collection[]
): boolean {
	const stringCollection = collection.map((v) => v.name);

	if (stringCollection.length === 0 && searchparamsCollectionMap.get('*No collection*')) {
		return true;
	}

	for (const c of stringCollection) {
		if (searchparamsCollectionMap.get(c)) {
			return true;
		}
	}

	return false;
}

function sortBooks(sortBy: SortBy, books: BookWithAuthorsAndCoverAndSettingsAndCollections[]) {
	if (sortBy === 'Last Read Ascending') {
		books.sort((a, b) => (b.last_read ?? 0) - (a.last_read ?? 0));
	} else if (sortBy === 'Last Read Descending') {
		books.sort((a, b) => (a.last_read ?? 0) - (b.last_read ?? 0));
	} else if (sortBy === 'Oldest Added') {
		books.sort((a, b) => a.date_added - b.date_added);
	} else if (sortBy === 'Recently Added') {
		books.sort((a, b) => b.date_added - a.date_added);
	} else if (sortBy === 'Title Ascending') {
		books.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
	} else if (sortBy === 'Title Descending') {
		books.sort((a, b) => -1 * a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
	}
}

export const load = (async ({ url }) => {
	console.log(url.pathname + url.search);

	const statuses = url.searchParams.getAll('status');
	const languages = url.searchParams.getAll('lang');
	const collections = url.searchParams.getAll('collection');
	const searchQuery = url.searchParams.get('q');
	const sortBy = url.searchParams.get('sort');

	let throwRedirect = false;
	if (searchQuery === '') {
		url.searchParams.delete('q');
		throwRedirect = true;
	}
	if (sortBy === 'Title Ascending') {
		url.searchParams.delete('sort');
		throwRedirect = true;
	}
	// This needs to be outside the `if`s since it will cause a 500 error
	// for redirect loops if more than 1 of the `if` statements throw redirects
	if (throwRedirect) throw redirect(307, url.pathname + url.search);

	let books = await getBooks();
	const databaseLanguages = await getLanguages();
	const databaseCollections = await getCollections();
	databaseCollectionsStore.set(databaseCollections);

	if (statuses.length > 0) {
		console.log(statuses);
		books = books.filter((b) => statuses.includes(b.reading_status));
	}
	if (languages.length > 0) {
		books = books.filter((b) => languages.includes(b.language ?? 'null'));
	}
	if (collections.length > 0) {
		const collectionMap = new Map<string, string>();
		for (const c of collections) {
			collectionMap.set(c, c);
		}
		books = books.filter((b) =>
			searchParamsCollectionIncludesCollection(collectionMap, b.collections)
		);
	}
	if (searchQuery) {
		books = books.filter((b) => b.title.match(new RegExp(escapeRegExp(searchQuery), 'gi')));
	}

	if (sortBy) {
		sortBooks(sortBy as SortBy, books);
	} else {
		sortBooks('Title Ascending', books);
	}

	const queryData = {
		statuses,
		searchQuery,
		languages,
		collections,
		sortBy: sortBy as SortBy | null
	};

	return {
		books,
		searchQuery,
		queryData,
		databaseLanguages,
		databaseCollections
	};
}) satisfies PageLoad;
