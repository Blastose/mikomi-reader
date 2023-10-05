<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconX } from '@tabler/icons-svelte';
	import type { Writable } from 'svelte/store';
	import { addBookToCollections, type Collection } from '$lib/bindings';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';

	export let bookId: string;
	export let openStore: Writable<boolean>;
	export let collections: Collection[];
	export let bookCollections: Collection[];

	let checkboxGroup: string[] = [];

	for (const collection of collections) {
		for (const bookCollection of bookCollections) {
			if (collection.id === bookCollection.id) {
				checkboxGroup.push(collection.id);
				break;
			}
		}
	}

	$: console.log(checkboxGroup);

	const {
		elements: { overlay, content, title, close, portalled }
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
		open: openStore
	});
</script>

<div use:melt={$portalled}>
	{#if $openStore}
		<div
			transition:fade={{ duration: 150 }}
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
		/>
		<div
			class="dialog-theme fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[350px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            p-6 shadow-lg
            custom-scroll overflow-y-auto"
			use:melt={$content}
			transition:fly={{
				duration: 150,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-4">
				<h2 use:melt={$title} class="m-0 text-lg font-medium">Add to collection</h2>

				<div class="flex flex-col gap-2">
					{#each collections as collection}
						<label class="flex gap-4">
							<input type="checkbox" value={collection.id} bind:group={checkboxGroup} />
							<span class="overflow-hidden text-ellipsis whitespace-nowrap">{collection.name}</span>
						</label>
					{/each}
				</div>

				<button
					on:click={async () => {
						await addBookToCollections(bookId, checkboxGroup);
						invalidateAll();
						addToast({
							data: { title: 'Collections successfully updated', color: '', description: '' }
						});
						openStore.set(false);
					}}
					class="bg-neutral-700 rounded-md p-2">Save</button
				>
			</div>

			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex p-1
            appearance-none items-center justify-center rounded-full text-neutral-200
            hover:bg-neutral-700 focus:shadow-neutral-400 focus:outline-none focus:ring-2
            focus:ring-neutral-400"
			>
				<IconX />
			</button>
		</div>
	{/if}
</div>
