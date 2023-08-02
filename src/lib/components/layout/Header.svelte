<script lang="ts">
	import { IconDotsVertical, IconPlus } from '@tabler/icons-svelte';

	let currentHeaderText: string = 'Home';
</script>

<div class="sticky top-0 z-10 h-16 bg-white bg-opacity-60 backdrop-blur-lg">
	<div class="flex items-center justify-between h-full container-mi">
		<div class="text-4xl font-bold text-gray-700 heading">{currentHeaderText}</div>

		<div class="flex gap-4">
			<IconPlus />
			<IconDotsVertical />
		</div>
	</div>
</div>

<style>
	.heading {
		font-family: 'Times New Roman', Times, serif;
	}
</style>
