import type { PageLoad } from './$types';
import { getBook } from '$lib/bindings';

export const load = (async ({ params }) => {
	const book = await getBook(params.id);

	if (!book) {
		throw Error('');
	}
	console.log(book);
	return { book };
}) satisfies PageLoad;