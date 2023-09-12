<script context="module" lang="ts">
	const {
		elements,
		helpers: { addToast: addToastMelt },
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>();

	export type ToastData = {
		title: string;
		description: string;
		color: string;
		onUndo?: (() => void) | (() => Promise<void>);
	};

	export function addToast(addToastProps: Parameters<typeof addToastMelt>[0]) {
		addToastMelt(addToastProps);
	}
</script>

<script lang="ts">
	import { createToaster } from '@melt-ui/svelte';
	import { flip } from 'svelte/animate';
	import Toast from './Toast.svelte';
</script>

<div
	class="fixed top-0 right-0 z-50 flex flex-col items-end gap-2 m-4 md:bottom-0 md:top-auto"
	use:portal
>
	{#each $toasts as toast (toast.id)}
		<div animate:flip={{ duration: 500 }}>
			<Toast {elements} {toast} />
		</div>
	{/each}
</div>
