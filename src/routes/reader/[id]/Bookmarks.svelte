<script lang="ts">
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	const {
		elements: { menu, item, trigger, arrow },
		states: { open }
	} = createDropdownMenu();

	export let bookmarks: { el: HTMLElement; page?: number }[];
	export let onClick: (el: HTMLElement) => void;
</script>

<button use:melt={$trigger}>Click me</button>

{#if $open}
	<div
		transition:fly={{ duration: 150, y: -10 }}
		use:melt={$menu}
		class="z-10 flex max-h-[300px] overflow-y-auto min-w-[220px] flex-col shadow-lg rounded-md bg-white p-1 shadow-neutral-900/30 lg:max-h-none ring-0"
	>
		<div use:melt={$arrow} />
		{#each bookmarks as bookmark}
			<div
				use:melt={$item}
				on:m-click={() => {
					onClick(bookmark.el);
				}}
			>
				{bookmark.page}
			</div>
		{/each}
	</div>
{/if}
