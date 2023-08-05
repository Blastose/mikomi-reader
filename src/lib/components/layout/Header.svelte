<script lang="ts">
	import { open as openDialog } from '@tauri-apps/api/dialog';
	import { IconDotsVertical, IconPlus } from '@tabler/icons-svelte';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';

	let currentHeaderText: string = 'Home';
</script>

<div class="sticky top-0 z-10 h-16 bg-white bg-opacity-60 backdrop-blur-lg">
	<div class="flex items-center justify-between h-full container-mi">
		<div class="text-4xl font-bold text-gray-700 heading">{currentHeaderText}</div>

		<div class="flex items-center gap-4">
			<button
				type="button"
				class="flex flex-col items-center p-2 text-gray-700 duration-300 rounded-md hover:text-black hover:bg-gray-200"
				on:click={async () => {
					const a = await openDialog({});
					addToast({
						data: { color: 'bg-green-500', description: `Added ${a}`, title: 'Success' }
					});
				}}
				aria-label="Add books"
			>
				<IconPlus />
				<span class="text-xs">Add book(s)</span>
			</button>

			<button class="flex flex-col items-center text-gray-700 hover:text-black">
				<IconDotsVertical />
				<span class="text-xs">More</span>
			</button>
		</div>
	</div>
</div>

<style>
	.heading {
		font-family: 'Times New Roman', Times, serif;
	}
</style>
