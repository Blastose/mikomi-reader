export type NavPoint = {
	content: string;
	label: string;
	children: NavPoint[];
};

export function parseNcxToc(doc: Element): NavPoint[] {
	const navPoints: NavPoint[] = [];

	const childNavPoints = doc.querySelectorAll(':scope > navPoint');

	for (const childNavPoint of childNavPoints) {
		const content = childNavPoint.querySelector(':scope > content')?.getAttribute('src') ?? '';
		const label =
			childNavPoint.querySelector(':scope > navLabel')?.querySelector(':scope > text')
				?.textContent ?? '';

		const newNavPoint = {
			content,
			label,
			children: parseNcxToc(childNavPoint)
		};
		navPoints.push(newNavPoint);
	}

	return navPoints;
}

export function parseNavToc(doc: Element) {
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
			content: content,
			label,
			children: childOlNode ? parseNavToc(childOlNode) : []
		};
		navPoints.push(newNavPoint);
	}

	return navPoints;
}
