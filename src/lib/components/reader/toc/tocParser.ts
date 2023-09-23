export type NavPoint = {
	// epub://
	content: string;
	// display text
	label: string;
	children: NavPoint[];
	page?: number;
	playOrder?: number;
};

export function parseNcxToc(doc: Element, basePath: string): NavPoint[] {
	const navPoints: NavPoint[] = [];

	const childNavPoints = doc.querySelectorAll(':scope > navPoint');

	for (const childNavPoint of childNavPoints) {
		const content = childNavPoint.querySelector(':scope > content')?.getAttribute('src') ?? '';
		const label =
			childNavPoint.querySelector(':scope > navLabel')?.querySelector(':scope > text')
				?.textContent ?? '';

		const playOrder = Number.parseInt(childNavPoint.getAttribute('playOrder') ?? '0');

		const newNavPoint = {
			content: buildEpubUri(basePath, content),
			label,
			children: parseNcxToc(childNavPoint, basePath),
			playOrder
		};
		navPoints.push(newNavPoint);
	}

	navPoints.sort((a, b) => {
		const aPlayOrder = a.playOrder ?? 0;
		const bPlayOrder = b.playOrder ?? 0;
		return aPlayOrder - bPlayOrder;
	});

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
