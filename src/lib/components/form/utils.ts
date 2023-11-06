export const sortByArray = [
	'Title Ascending',
	'Title Descending',
	'Last Read Ascending',
	'Last Read Descending',
	'Recently Added',
	'Oldest Added'
] as const;

export type SortBy = (typeof sortByArray)[number];
