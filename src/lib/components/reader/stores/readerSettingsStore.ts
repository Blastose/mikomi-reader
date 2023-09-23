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

export const mixBlendModeArray = [
	'normal',
	'multiply',
	'screen',
	'overlay',
	'darken',
	'lighten'
] as const;

export type MixBlendMode = (typeof mixBlendModeArray)[number];

export type ReaderThemeSettings = {
	name: string;
	backgroundColor: string;
	color: string;
	linkColor: string;
	imageMixBlendMode: MixBlendMode;
};

export const readerThemeStore = writable<ReaderThemeSettings>({
	name: 'Light',
	backgroundColor: '#ffffff',
	color: '#333333',
	linkColor: '#007acc',
	imageMixBlendMode: 'normal'
});

export const presetReaderThemes: ReaderThemeSettings[] = [
	{
		name: 'Light',
		backgroundColor: '#ffffff',
		color: '#333333',
		linkColor: '#007acc',
		imageMixBlendMode: 'normal'
	},
	{
		name: 'Dark',
		backgroundColor: '#121212',
		color: '#d3d3d3',
		linkColor: '#4ca6ff',
		imageMixBlendMode: 'normal'
	},
	{
		name: 'Sepia',
		backgroundColor: '#fbf0d9',
		color: '#5f4b32',
		linkColor: '#9b674c',
		imageMixBlendMode: 'multiply'
	},
	{
		name: 'Green',
		backgroundColor: '#c5e7ce',
		color: '#3a4a43',
		linkColor: '#4CA64C',
		imageMixBlendMode: 'normal'
	}
];