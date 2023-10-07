import {
	getBooks,
	getCollections,
	type Collection,
	type BookWithAuthorsAndCoverAndSettingsAndCollections,
	type BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettingsAndCollections
} from '$lib/bindings';
import type { PageLoad } from './$types';

const groupBy = <T, K extends keyof never>(
	list: T[],
	getKey: (item: T) => K[],
	initial: Record<K, T[]>
) =>
	list.reduce((previous, currentItem) => {
		const groups = getKey(currentItem);
		for (const group of groups) {
			if (!previous[group]) {
				previous[group] = [];
			}
			previous[group].push(currentItem);
		}

		return previous;
	}, initial as Record<K, T[]>);

export const load = (async () => {
	const collections = await getCollections();

	const books = await getBooks();

	const initialGroup: Record<
		string,
		BookWithAuthorsAndCoverAndBookmarksAndHighlightsAndSettingsAndCollections[]
	> = {};
	for (const collection of collections) {
		initialGroup[collection.id] = [];
	}
	const groupedBooks = groupBy(books, (b) => b.collections.map((c) => c.id), initialGroup);
	const collectionsWithBooks: {
		collection: Collection;
		books: BookWithAuthorsAndCoverAndSettingsAndCollections[];
	}[] = [];
	for (const group of Object.entries(groupedBooks)) {
		collectionsWithBooks.push({
			// We know that it must exist in collections
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			collection: collections.find((c) => c.id === group[0])!,
			books: group[1]
		});
	}

	collectionsWithBooks.sort((a, b) => a.collection.name.localeCompare(b.collection.name));
	// console.log(collectionsWithBooks);

	return {
		collections,
		books,
		collectionsWithBooks
	};
}) satisfies PageLoad;
