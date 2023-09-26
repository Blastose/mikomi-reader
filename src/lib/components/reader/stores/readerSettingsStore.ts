import { writable } from 'svelte/store';
import type { EnglishFont, LineHeight, TextAlign } from '../settings/settings';
import type { Orientation } from '../utils';
import { addBookSettings } from '$lib/bindings';

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

export const readerThemeStore = writable<ReaderThemeSettings>();

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
		name: 'Dark 2',
		backgroundColor: '#202124',
		color: '#f8f9fa',
		linkColor: '#4ca6ff',
		imageMixBlendMode: 'normal'
	},
	{
		name: 'Dark contrast',
		backgroundColor: '#121212',
		color: '#ffffff',
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
		name: 'Sepia contrast',
		backgroundColor: '#fbf0d9',
		color: '#000000',
		linkColor: '#9b674c',
		imageMixBlendMode: 'multiply'
	},
	{
		name: 'Green',
		backgroundColor: '#c5e7ce',
		color: '#3a4a43',
		linkColor: '#19568f',
		imageMixBlendMode: 'normal'
	}
];

export const savedReaderThemes = writable<(ReaderThemeSettings & { id: string })[]>([]);

export async function addBookSettingsFromSettingsAndTheme(
	bookId: string,
	height: number,
	width: number,
	settings: ReaderSettings,
	theme: ReaderThemeSettings,
	percentage?: number,
	lastElement?: string
) {
	await addBookSettings({
		background_color: theme.backgroundColor,
		book_id: bookId,
		color: theme.color,
		column_count: settings.columnCount,
		font_family: settings.fontFamily,
		font_size: settings.fontSize,
		height,
		id: crypto.randomUUID(),
		image_blend_mode: theme.imageMixBlendMode,
		line_height: String(settings.lineHeight),
		link_color: theme.linkColor,
		margins: settings.margins,
		text_align: settings.textAlign,
		width,
		writing_mode: settings.writingMode,
		last_element: lastElement ?? null,
		percentage: percentage ?? null
	});
}
