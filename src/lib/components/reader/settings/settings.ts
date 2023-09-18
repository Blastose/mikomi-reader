export type TextAlign = 'left' | 'right' | 'center' | 'justify' | 'initial';

export type LineHeight = 'normal' | number;

export const englishFontArray = [
	'initial',
	'Arial',
	'Georgia',
	'Times New Roman',
	'Trebuchet MS',
	'Verdana'
] as const;

export type EnglishFont = (typeof englishFontArray)[number];
