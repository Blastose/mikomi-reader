import { writable } from 'svelte/store';
import type { EnglishFont, LineHeight, TextAlign } from '../settings/settings';
import type { Orientation } from '../utils';

export type ReaderSettings = {
	fontSize: number;
	lineHeight: LineHeight;
	columnCount: 1 | 2;
	textAlign: TextAlign;
	fontFamily: EnglishFont;
	writingMode: Orientation;
	margins: number;
};

export const readerSettingsStore = writable<ReaderSettings>();
