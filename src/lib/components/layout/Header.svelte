<script lang="ts">
	import { IconDotsVertical } from '@tabler/icons-svelte';

	let currentHeaderText: string = 'Home';
</script>

<div class="sticky top-0 z-10 h-16 bg-cyan-100 bg-opacity-20 backdrop-blur-lg">
	<div class="container flex items-center justify-between h-full px-4 mx-auto duration-[450ms]">
		<div class="text-4xl font-bold text-gray-700 heading">{currentHeaderText}</div>

		<div>
			<IconDotsVertical />
		</div>
	</div>
</div>

<style>
	.heading {
		font-family: 'Times New Roman', Times, serif;
	}
</style>
