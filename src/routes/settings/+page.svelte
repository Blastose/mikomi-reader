<script lang="ts">
	import ColorPicker from '$lib/components/settings/ColorPicker.svelte';
	import { themeStore } from '$lib/stores/themeStore';

	let backgroundColor: string;
</script>

<div class="container-mi">
	<div class="flex flex-col gap-2">
		<h2 class="font-bold text-lg">Theme</h2>

		<div />
	</div>

	<ColorPicker label={'Background color'} bind:color={backgroundColor} />

	<button
		class="font-bold text-lg"
		on:click={() => {
			if ($themeStore === 'light') {
				themeStore.set('dark');
			} else if ($themeStore === 'dark') {
				themeStore.set('light');
			}
		}}>Switch theme</button
	>
</div>
