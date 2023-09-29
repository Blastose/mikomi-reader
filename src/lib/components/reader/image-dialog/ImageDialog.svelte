<script lang="ts">
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import type { Writable } from 'svelte/store';
	import { readerStateStore } from '$lib/components/reader/stores/readerStateStore';
	import { IconX } from '@tabler/icons-svelte';

	export let showImageStore: Writable<boolean>;
	export let src: string | null;

	$: if ($showImageStore) {
		readerStateStore.set('imageOpen');
	} else {
		readerStateStore.set('reading');
	}

	const {
		elements: { overlay, content, close, portalled }
	} = createDialog({ open: showImageStore, preventScroll: false });
</script>

<div use:melt={$portalled}>
	{#if $showImageStore}
		<div
			transition:fade={{ duration: 150 }}
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
		/>
		<div
			class="fixed left-[50%] top-[50%] z-50 h-[100vh]
          w-[100vw] translate-x-[-50%] translate-y-[-50%] p-6"
			use:melt={$content}
			use:melt={$close}
			transition:fade={{ duration: 150 }}
		>
			<div class="h-full w-full overflow-y-auto overflow-x-auto">
				<img class="mx-auto" {src} alt="" />
			</div>

			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex p-1
      appearance-none items-center justify-center rounded-full text-neutral-200
       bg-neutral-700 focus:shadow-neutral-400 focus:outline-none focus:ring-2
      focus:ring-neutral-400"
			>
				<IconX />
			</button>
		</div>
	{/if}
</div>
