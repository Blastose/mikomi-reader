import type { PageLoad } from './$types';
import { getBook, getReaderThemes } from '$lib/bindings';
import {
	readerSettingsStore,
	readerThemeStore,
	type MixBlendMode,
	type ReaderThemeSettings,
	addBookSettingsFromSettingsAndTheme,
	type ReaderSettings,
	savedReaderThemes
} from '$lib/components/reader/stores/readerSettingsStore';
import type { Orientation } from '$lib/components/reader/utils';
import type { EnglishFont, LineHeight, TextAlign } from '$lib/components/reader/settings/settings';

function stringToLineHeight(str: string): LineHeight {
	if (str === 'normal') {
		return str;
	}
	return parseFloat(str);
}

export const load = (async ({ params }) => {
	const book = await getBook(params.id);

	if (!book) {
		throw Error('');
	}
	console.log(book);

	const savedThemes = (await getReaderThemes()).map((theme) => {
		return {
			backgroundColor: theme.background_color,
			color: theme.color,
			imageMixBlendMode: theme.image_blend_mode as MixBlendMode,
			linkColor: theme.link_color,
			name: theme.name,
			id: theme.id
		} satisfies ReaderThemeSettings & { id: string };
	});
	savedReaderThemes.set(savedThemes);

	if (book.settings) {
		readerSettingsStore.set({
			columnCount: book.settings.column_count as 1 | 2,
			fontSize: book.settings.font_size,
			lineHeight: stringToLineHeight(book.settings.line_height),
			textAlign: book.settings.text_align as TextAlign,
			fontFamily: book.settings.font_family as EnglishFont,
			writingMode: book.settings.writing_mode as Orientation,
			margins: book.settings.margins
		});

		readerThemeStore.set({
			name: 'Custom',
			backgroundColor: book.settings.background_color,
			color: book.settings.color,
			linkColor: book.settings.link_color,
			imageMixBlendMode: book.settings.image_blend_mode as MixBlendMode
		});
	} else {
		const defaultSettings = {
			columnCount: 1,
			fontSize: 16,
			lineHeight: 'normal',
			textAlign: 'initial',
			fontFamily: 'initial',
			writingMode: 'horizontal',
			margins: 0
		} as ReaderSettings;
		readerSettingsStore.set(defaultSettings);

		const lastUsedThemeStr = localStorage.getItem('last-reader-theme');
		let defaultTheme;
		if (lastUsedThemeStr) {
			const lastUsedTheme = JSON.parse(lastUsedThemeStr) as ReaderThemeSettings;
			readerThemeStore.set(lastUsedTheme);
			defaultTheme = lastUsedTheme;
		} else {
			defaultTheme = {
				name: 'Light',
				backgroundColor: '#ffffff',
				color: '#333333',
				linkColor: '#007acc',
				imageMixBlendMode: 'normal'
			} as ReaderThemeSettings;
			readerThemeStore.set(defaultTheme);
		}
		await addBookSettingsFromSettingsAndTheme(params.id, 860, 512, defaultSettings, defaultTheme);
	}

	return { book };
}) satisfies PageLoad;
