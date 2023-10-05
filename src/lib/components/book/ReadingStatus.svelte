<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import {
		IconX,
		IconBook,
		IconCircleArrowRight,
		IconCheckbox,
		IconCheck
	} from '@tabler/icons-svelte';
	import { updateBook, type BookWithAuthorsAndCoverAndSettingsAndCollections } from '$lib/bindings';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '../toast/ToastContainer.svelte';

	const readingStatuses = ['Reading', 'Plan to read', 'Finished'] as const;
	type readingStatus = (typeof readingStatuses)[number];

	export let book: BookWithAuthorsAndCoverAndSettingsAndCollections;
	export let currentStatus: string;

	let newStatus = currentStatus;

	const {
		elements: { overlay, content, title, close, portalled, trigger },
		states: { open }
	} = createDialog({
		forceVisible: true,
		preventScroll: false
	});
</script>

<button
	use:melt={$trigger}
	class="text-black flex items-center justify-center h-fit w-full gap-2 px-8 py-4 font-bold duration-300 rounded-md hover:bg-neutral-400 bg-neutral-300 dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-700 sm:w-fit"
>
	<span class="flex gap-2">
		{#if currentStatus === 'Reading'}
			<IconBook />
		{:else if currentStatus === 'Plan to read'}
			<IconCircleArrowRight />
		{:else if currentStatus === 'Finished'}
			<IconCheckbox />
		{/if}
		{currentStatus}
	</span>
</button>

<div use:melt={$portalled}>
	{#if $open}
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
					<button
						on:click={async () => {
							try {
								await updateBook({ ...book, reading_status: newStatus });
								await invalidateAll();
								addToast({ data: { title: 'Updated reading status', color: '', description: '' } });
							} catch {
								addToast({
									data: { title: 'Unable to update reading status', color: '', description: '' }
								});
							} finally {
								open.set(false);
							}
						}}
						class="bg-neutral-600 hover:bg-neutral-700 rounded-md px-4 py-2"
					>
						Save
					</button>
				</div>
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
