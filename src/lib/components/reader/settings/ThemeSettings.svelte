<script lang="ts">
	import ColorPicker from '$lib/components/settings/ColorPicker.svelte';
	import { readerThemeStore } from '$lib/components/reader/stores/readerSettingsStore';
	import { presetReaderThemes } from '$lib/components/reader/stores/readerSettingsStore';

	let backgroundColor: string;
	let color: string;
	let linkColor: string;
</script>

<div class="flex flex-col gap-2">
	<ColorPicker label="Background color" bind:color={backgroundColor} />{backgroundColor}
	<ColorPicker label="Text color" bind:color />{color}
	<ColorPicker label="Link color" bind:color={linkColor} />{linkColor}

	<button>Image blend mode</button>
	<button>Invert image</button>
</div>

<div class="flex flex-col gap-2">
	{#each presetReaderThemes as presetTheme}
		<button
			class="bg-gray-500 text-white"
			on:click={() => {
				readerThemeStore.set(presetTheme);
			}}>{presetTheme.name}</button
		>
		<div
			class="rounded-full w-6 h-6 border"
			style="background-color: {presetTheme.backgroundColor};"
		/>
	{/each}
</div>
