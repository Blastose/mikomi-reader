<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconPlus, IconX } from '@tabler/icons-svelte';
	import { writable, type Writable } from 'svelte/store';
	import HeaderButton from '$lib/components/layout/HeaderButton.svelte';
	import DropFiles from '$lib/components/form/DropFiles.svelte';

	let openStore: Writable<boolean> = writable(false);

	const {
		elements: { overlay, content, title, close, portalled, trigger }
	} = createDialog({
		forceVisible: true,
		preventScroll: false,
		open: openStore
	});

	function handleClick() {
		openStore.set(true);
	}

	let autoCreateCollection = false;
</script>

<HeaderButton {handleClick} subText={'Add book(s)'}>
	<IconPlus />
</HeaderButton>

<div use:melt={$portalled}>
	{#if $openStore}
		<div
			transition:fade={{ duration: 150 }}
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
		/>
		<div
			class="dialog-theme fixed left-[50%] top-[50%] z-50 h-[85vh] w-[90vw]
            max-h-[650px] max-w-[1024px]
            translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            p-6 shadow-lg"
			use:melt={$content}
			transition:fly={{
				duration: 150,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-4 h-full">
				<div>
					<h2 use:melt={$title} class="m-0 text-lg font-medium">Select files</h2>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:value={autoCreateCollection} />
						<span>Automatically create collection and add books to it</span>
					</label>
				</div>

				<DropFiles {openStore} extensions={['epub']} {autoCreateCollection} />
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
