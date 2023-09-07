<script lang="ts">
	import { IconGripVertical } from '@tabler/icons-svelte';

	let color: string = '#aabbcc';
	let height: number = 64;

	function dragging(node: HTMLDivElement) {
		document.body.appendChild(node);

		let isDragging = false;
		let offsetY: number;

		function onPointerDown(e: PointerEvent) {
			isDragging = true;
			offsetY = e.clientY - node.getBoundingClientRect().top;
			node.style.cursor = 'grabbing';

			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', onPointerUp);
		}

		function onPointerMove(e: PointerEvent) {
			if (!isDragging) return;

			const newTop = e.clientY - offsetY;
			node.style.top = `${newTop}px`;
		}

		function onPointerUp(_e: PointerEvent) {
			isDragging = false;
			node.style.cursor = 'grab';

			let nodeTop = parseInt(node.style.top);
			console.log(nodeTop);
			if (nodeTop < 0) {
				nodeTop = 0;
			} else if (nodeTop > window.innerHeight - node.clientHeight) {
				nodeTop = window.innerHeight - node.clientHeight;
			}
			node.style.top = `${nodeTop}px`;

			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
		}

		node.addEventListener('pointerdown', onPointerDown);

		return {
			destroy() {
				node.removeEventListener('pointerdown', onPointerDown);
			}
		};
	}
</script>

<div
	use:dragging
	class="ruler top-0 flex items-center px-4 text-gray-600 justify-end fixed w-full h-8 cursor-grab z-50"
	style="--ruler-color: {color}; --ruler-height: {height}px"
>
	<IconGripVertical />
</div>

<style>
	.ruler {
		background-color: var(--ruler-color);
		opacity: 75%;
		height: var(--ruler-height);
		user-select: none;
	}
</style>
