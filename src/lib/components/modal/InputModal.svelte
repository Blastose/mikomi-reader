<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { IconX } from '@tabler/icons-svelte';
	import type { Writable } from 'svelte/store';

	export let modalTitle: string;
	export let onSave: () => void;
	export let placeholder: string;
	export let openStore: Writable<boolean>;
	export let inputValue: string;
	export let confirmText: string;
	export let cancelText: string;

	let inputNode: HTMLInputElement;

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

				<label class="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
					<span>Name: </span>
					<input
						bind:this={inputNode}
						bind:value={inputValue}
						on:keydown={(e) => {
							if (e.key === 'Enter') {
								onSave();
								openStore.set(false);
							}
						}}
						class="w-full bg-neutral-700 rounded-md px-2 py-1"
						type="text"
						{placeholder}
					/>
				</label>

				<div class="flex gap-4 items-center justify-end">
					<button class="hover:bg-neutral-700 duration-300 rounded-md px-4 py-2" use:melt={$close}
						>{cancelText}</button
					>
					<button
						on:click={() => {
							onSave();
							openStore.set(false);
						}}
						class="bg-neutral-600 hover:bg-neutral-700 duration-300 rounded-md px-4 py-2"
						>{confirmText}</button
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
