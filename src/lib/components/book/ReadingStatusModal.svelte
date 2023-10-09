<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconX, IconCheck } from '@tabler/icons-svelte';
	import { updateBookReadingStatus } from '$lib/bindings';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import type { Writable } from 'svelte/store';
	import LoadingButton from '$lib/components/modal/LoadingButton.svelte';
	import { mainStateStore, selectedBookMapStore } from '$lib/stores/mainStateStore';

	const readingStatuses = ['Reading', 'Plan to read', 'Finished'] as const;

	export let bookIds: string[];
	export let currentStatus: string;
	export let openStore: Writable<boolean>;
	export const resetSelectedStatus = () => {
		newStatus = 'Reading';
	};

	let newStatus = currentStatus;
	let loading = false;

	const {
		elements: { overlay, content, title, close, portalled }
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
		open: openStore
	});

	async function updateReadingStatusSingle(id: string) {
		try {
			await updateBookReadingStatus(id, newStatus);
			await invalidateAll();
			addToast({ data: { title: 'Updated reading status', color: '', description: '' } });
		} catch {
			addToast({
				data: { title: 'Unable to update reading status', color: '', description: '' }
			});
		} finally {
			openStore.set(false);
		}
	}

	async function updateReadingStatusMultiple(ids: string[]) {
		loading = true;
		const promises = [];
		for (const bookId of ids) {
			promises.push(updateBookReadingStatus(bookId, newStatus));
		}
		await Promise.allSettled(promises);
		loading = false;
		invalidateAll();
		addToast({ data: { title: 'Updated reading statuses', color: '', description: '' } });

		openStore.set(false);
	}
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
            overflow-y-scroll custom-scroll
            p-6 shadow-lg"
			use:melt={$content}
			transition:fly={{
				duration: 150,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-4">
				<h2 use:melt={$title} class="m-0 text-lg font-medium">Change reading status</h2>

				<div class="flex flex-col gap-2 items-center">
					{#each readingStatuses as readingStatus}
						<button
							on:click={() => {
								newStatus = readingStatus;
							}}
							class="flex justify-center items-center gap-1 rounded-md duration-300 px-4 py-2 w-full
                {newStatus === readingStatus
								? 'bg-neutral-300 text-black'
								: 'bg-neutral-700 hover:bg-neutral-800'}"
						>
							{#if newStatus === readingStatus}
								<IconCheck />
							{/if}
							{readingStatus}
						</button>
					{/each}
				</div>

				<div class="flex gap-4 items-center justify-end">
					<button use:melt={$close} class="hover:bg-neutral-700 duration-300 rounded-md px-4 py-2">
						Cancel
					</button>

					<LoadingButton
						buttonText="Save"
						handleClick={async () => {
							if (bookIds.length === 1) {
								await updateReadingStatusSingle(bookIds[0]);
							} else {
								await updateReadingStatusMultiple(bookIds);
							}
							openStore.set(false);
							mainStateStore.set('default');
							selectedBookMapStore.reset();
						}}
						{loading}
					/>
				</div>
			</div>

			<button
				on:click={() => {
					console.log('alksdjsaldsld');
				}}
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
