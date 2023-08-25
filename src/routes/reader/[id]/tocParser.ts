export type NavPoint = {
	content: string;
	label: string;
	children: NavPoint[];
	page?: number;
};

export function parseNcxToc(doc: Element, basePath: string): NavPoint[] {
	const navPoints: NavPoint[] = [];

	const childNavPoints = doc.querySelectorAll(':scope > navPoint');

	for (const childNavPoint of childNavPoints) {
		const content = childNavPoint.querySelector(':scope > content')?.getAttribute('src') ?? '';
		const label =
			childNavPoint.querySelector(':scope > navLabel')?.querySelector(':scope > text')
				?.textContent ?? '';

		const newNavPoint = {
			content: buildEpubUri(basePath, content),
			label,
			children: parseNcxToc(childNavPoint, basePath)
		};
		navPoints.push(newNavPoint);
	}

	return navPoints;
}

export function parseNavToc(doc: Element, basePath: string) {
	const navPoints: NavPoint[] = [];

	const childNavPoints = doc.querySelectorAll(':scope > li');

	for (const childNavPoint of childNavPoints) {
		const anchorTag = childNavPoint.querySelector<HTMLAnchorElement>(':scope > a');
		let content = '';
		let label = '';
		if (anchorTag) {
			content = anchorTag.getAttribute('href') ?? '';
			label = anchorTag.innerText;
		}

		const childOlNode = childNavPoint.querySelector(':scope > ol');

		const newNavPoint = {
			content: buildEpubUri(basePath, content),
			label,
			children: childOlNode ? parseNavToc(childOlNode, basePath) : []
		};
		navPoints.push(newNavPoint);
	}

	return navPoints;
}

function buildEpubUri(path: string, append: string): string {
	if (append.startsWith('http')) {
		return append;
	}

	const pathSegments = path.split('/');
	const appendSegments = append.split('/');
	pathSegments.pop();

	for (const segment of appendSegments) {
		if (segment === '..') {
			pathSegments.pop();
		} else {
			pathSegments.push(segment);
		}
	}

	return `epub://${pathSegments.join('/')}`;
}
