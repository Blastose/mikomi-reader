<script lang="ts">
	import { IconDotsVertical } from '@tabler/icons-svelte';
	import { page } from '$app/stores';
	import { IconArrowLeft } from '@tabler/icons-svelte';
	import AddBookButton from './AddBookButton.svelte';

	let currentHeaderText: string = 'Home';

	let scrollY: number;
	$: isOnBookRoute = $page.url.pathname.startsWith('/book/');
</script>

<svelte:window bind:scrollY />

<div
	class="sticky top-0 z-10 h-16
	{isOnBookRoute ? 'header-transition' : 'bg-white bg-opacity-80 backdrop-blur-lg'} 
	{scrollY > 0 ? 'bg-white bg-opacity-80 backdrop-blur-lg' : ''}"
>
	<div class="flex items-center justify-between h-full container-mi">
		<div class="text-4xl font-bold text-neutral-700">
			{#if isOnBookRoute}
				<button
					class="p-2 duration-300 rounded-full hover:bg-neutral-300"
					on:click={() => {
						history.back();
					}}
					aria-label="Go back"
				>
					<IconArrowLeft />
				</button>
			{:else if $page.url.pathname.startsWith('/books')}
				{'Library'}
			{:else}
				{currentHeaderText}
			{/if}
		</div>

		<div class="flex items-center gap-4">
			<AddBookButton />

			<button class="flex flex-col items-center text-gray-700 hover:text-black">
				<IconDotsVertical />
				<span class="text-xs">More</span>
			</button>
		</div>
	</div>
</div>

<style>
	.header-transition {
		transition: background-color 500ms;
	}
</style>
