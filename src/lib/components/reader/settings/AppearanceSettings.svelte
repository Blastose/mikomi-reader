<script lang="ts">
	import type { Orientation } from '../utils';
	import DisplaySettings from './DisplaySettings.svelte';
	import FontSettings from './FontSettings.svelte';
	import SettingsButtonsItem from './SettingsButtonsItem.svelte';
	import type { EnglishFont, LineHeight, TextAlign } from './settings';

	export let fontSize: number;
	export let lineHeight: LineHeight;
	export let columnCount: 1 | 2;
	export let textAlign: TextAlign;
	export let fontFamily: EnglishFont;
	export let writingMode: Orientation;
	export let margins: number;
	export let onColumnCountChange: (newColumnCount: 1 | 2) => Promise<void>;
	export let onWritingModeChange: (newWritingMode: Orientation) => Promise<void>;
	export let dispatchWrapper: (f: () => void | (() => Promise<void>)) => void;
</script>

<div class="flex flex-col gap-2">
	<DisplaySettings bind:fontSize bind:lineHeight bind:margins {dispatchWrapper} />
	<SettingsButtonsItem
		bind:textAlign
		bind:columnCount
		bind:writingMode
		{dispatchWrapper}
		{onColumnCountChange}
		{onWritingModeChange}
	/>
	<FontSettings bind:fontFamily {dispatchWrapper} />
</div>
