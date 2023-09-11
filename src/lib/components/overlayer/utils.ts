type Rectangle = { x: number; y: number; width: number; height: number };

export function filterCompletelyOverlappingRectangles<T extends Rectangle>(rects: T[]): T[] {
	const filteredRects = [];
	const overlappingIndices: number[] = [];
	for (let i = 0; i < rects.length; i++) {
		let isOverlapping = false;
		for (let j = 0; j < rects.length; j++) {
			if (i === j) continue;
			if (overlappingIndices.includes(i)) continue;
			if (overlappingIndices.includes(j)) continue;
			const rect1 = rects[i];
			const rect2 = rects[j];

			// if rect1 is completely inside rect2, it completely overlaps
			if (
				rect1.x >= rect2.x &&
				rect1.y >= rect2.y &&
				rect1.x + rect1.width <= rect2.x + rect2.width &&
				rect1.y + rect1.height <= rect2.y + rect2.height
			) {
				isOverlapping = true;
				overlappingIndices.push(i);
				break;
			}
		}
		if (!isOverlapping) {
			filteredRects.push(rects[i]);
		}
	}

	return filteredRects;
}
