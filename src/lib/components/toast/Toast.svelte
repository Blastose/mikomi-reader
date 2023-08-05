<script lang="ts">
	import { createProgress, melt, type Toast, type ToastsElements } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import type { ToastData } from './ToastContainer.svelte';
	import { IconX } from '@tabler/icons-svelte';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';

	export let elements: ToastsElements;
	$: ({ content, title, description, close } = elements);

	export let toast: Toast<ToastData>;
	$: ({ data, id, getPercentage } = toast);

	const percentage = writable(0);
	const {
		elements: { root: progress },
		options: { max }
	} = createProgress({
		max: 100,
		value: percentage
	});

	onMount(() => {
		let frame: number;
		const updatePercentage = () => {
			percentage.set(getPercentage());
			frame = requestAnimationFrame(updatePercentage);
		};
		frame = requestAnimationFrame(updatePercentage);

		return () => cancelAnimationFrame(frame);
	});
</script>

<div
	use:melt={$content(id)}
	in:fly={{ duration: 200, x: '100%' }}
	out:fly={{ duration: 200, x: '100%' }}
	class="relative text-white rounded-lg shadow-md bg-neutral-800"
>
	<div
		use:melt={$progress}
		class="absolute left-5 top-2 h-1 w-[10%] overflow-hidden rounded-full bg-black/40"
	>
		<div
			class="w-full h-full bg-gray-500"
			style={`transform: translateX(-${100 - (100 * ($percentage ?? 0)) / ($max ?? 1)}%)`}
		/>
	</div>

	<div
		class="relative flex w-[24rem] max-w-[calc(100vw-2rem)] items-center justify-between gap-4 p-5 pt-6"
	>
		<div>
			<h3 use:melt={$title(id)} class="flex items-center gap-2 font-semibold">
				{data.title}
				<span class="rounded-full square-1.5 {data.color}" />
			</h3>
			<div use:melt={$description(id)}>
				{data.description}
			</div>
		</div>
		<button
			use:melt={$close(id)}
			class="absolute grid text-gray-500 rounded-full right-4 top-4 place-items-center square-6 hover:bg-gray-900/50"
		>
			<IconX />
		</button>
	</div>
</div>
