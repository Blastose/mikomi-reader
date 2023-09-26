<script lang="ts">
	import ColorPicker from '$lib/components/settings/ColorPicker.svelte';
	import { readerThemeStore } from '$lib/components/reader/stores/readerSettingsStore';
	import { presetReaderThemes } from '$lib/components/reader/stores/readerSettingsStore';
</script>

<div class="flex flex-col gap-2">
	<ColorPicker
		label="Background color"
		bind:color={$readerThemeStore.backgroundColor}
	/>{$readerThemeStore.backgroundColor}
	<ColorPicker label="Text color" bind:color={$readerThemeStore.color} />{$readerThemeStore.color}
	<ColorPicker
		label="Link color"
		bind:color={$readerThemeStore.linkColor}
	/>{$readerThemeStore.linkColor}

	<button>Image blend mode</button>
	<button>Invert image</button>
	<button>Save current theme to preset themes</button>
</div>

<div class="flex flex-col gap-2">
	<h3>Preset themes</h3>
	{#each presetReaderThemes as presetTheme}
		<button
			class="bg-gray-500 text-white"
			on:click={() => {
				readerThemeStore.set(structuredClone(presetTheme));
				localStorage.setItem('last-reader-theme', JSON.stringify(presetTheme));
			}}>{presetTheme.name}</button
		>
		<div
			class="rounded-full w-6 h-6 border"
			style="background-color: {presetTheme.backgroundColor};"
		/>
	{/each}
</div>
