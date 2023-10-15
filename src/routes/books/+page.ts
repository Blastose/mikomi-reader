import type { PageLoad } from './$types';
import { getBooks, getLanguages, type Collection, getCollections } from '$lib/bindings';
import { escapeRegExp } from '$lib/components/reader/search/search';
import { redirect } from '@sveltejs/kit';
import { databaseCollectionsStore } from '$lib/stores/mainStateStore';

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

export const load = (async ({ url }) => {
	console.log(url.pathname + url.search);

	const statuses = url.searchParams.getAll('status');
	const languages = url.searchParams.getAll('lang');
	const collections = url.searchParams.getAll('collection');
	const searchQuery = url.searchParams.get('q');

	if (searchQuery === '') {
		url.searchParams.delete('q');
		throw redirect(307, url.pathname + url.search);
	}

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

	const queryData = {
		statuses,
		searchQuery,
		languages,
		collections
	};

	return {
		books,
		searchQuery,
		queryData,
		databaseLanguages,
		databaseCollections
	};
}) satisfies PageLoad;
