<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconX } from '@tabler/icons-svelte';
	import type { Writable } from 'svelte/store';

	export let modalTitle: string;
	export let subText: string;
	export let onConfirm: () => void;
	export let openStore: Writable<boolean>;
	export let cancelText: string;
	export let confirmText: string;

	const {
		elements: { overlay, content, title, close, portalled, description }
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
            p-6 shadow-lg"
			use:melt={$content}
			transition:fly={{
				duration: 150,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-4">
				<h2 use:melt={$title} class="m-0 text-lg font-medium">{modalTitle}</h2>

				<p use:melt={$description}>{subText}</p>

				<div class="flex gap-4 items-center justify-end">
					<button use:melt={$close} class="hover:bg-neutral-700 duration-300 rounded-md px-4 py-2">
						{cancelText}
					</button>
					<button
						on:click={() => {
							onConfirm();
							openStore.set(false);
						}}
						class="bg-neutral-600 hover:bg-neutral-700 rounded-md px-4 py-2">{confirmText}</button
					>
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
