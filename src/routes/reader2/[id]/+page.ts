import type { PageLoad } from './$types';
import { getBook } from '$lib/bindings';
import { readerSettingsStore } from '$lib/components/reader/stores/readerSettingsStore';

export const load = (async ({ params }) => {
	const book = await getBook(params.id);

	if (!book) {
		throw Error('');
	}
	console.log(book);

	readerSettingsStore.set({
		columnCount: 1,
		fontSize: 16,
		lineHeight: 'normal',
		textAlign: 'initial',
		fontFamily: 'initial',
		writingMode: 'horizontal',
		margins: 0
	});

	return { book };
}) satisfies PageLoad;
