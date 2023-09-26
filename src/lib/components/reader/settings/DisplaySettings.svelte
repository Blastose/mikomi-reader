<script lang="ts">
	import SettingsItem from './SettingsItem.svelte';
	import type { LineHeight } from './settings';

	export let fontSize: number;
	export let lineHeight: LineHeight;
	export let margins: number;
	export let dispatchWrapper: (f: () => void) => void;

	function clampAfterAdding(value: number, toAdd: number, min: number, max: number): number {
		value += toAdd;
		return Math.max(min, Math.min(value, max));
	}
</script>

<div class="flex flex-col gap-2">
	<SettingsItem
		titleText={'Font size'}
		value={fontSize}
		onDecrement={() => {
			dispatchWrapper(() => {
				fontSize = clampAfterAdding(fontSize, -4, 4, 64);
			});
		}}
		onIncrement={() => {
			dispatchWrapper(() => {
				fontSize = clampAfterAdding(fontSize, 4, 4, 64);
			});
		}}
		reset={() => {
			dispatchWrapper(() => {
				fontSize = 16;
			});
		}}
	/>

	<SettingsItem
		titleText={'Line height'}
		value={lineHeight}
		onDecrement={() => {
			dispatchWrapper(() => {
				if (typeof lineHeight === 'number') {
					lineHeight -= 0.1;
				} else {
					lineHeight = 1.2;
				}
				lineHeight = Math.round(lineHeight * 10) / 10;
			});
		}}
		onIncrement={() => {
			dispatchWrapper(() => {
				if (typeof lineHeight === 'number') {
					lineHeight += 0.1;
				} else {
					lineHeight = 1.2;
				}
				lineHeight = Math.round(lineHeight * 10) / 10;
			});
		}}
		reset={() => {
			dispatchWrapper(() => {
				lineHeight = 'normal';
			});
		}}
	/>

	<SettingsItem
		titleText={'Page margins'}
		value={margins}
		onDecrement={() => {
			dispatchWrapper(() => {
				margins = clampAfterAdding(margins, -8, 0, 64);
			});
		}}
		onIncrement={() => {
			dispatchWrapper(() => {
				margins = clampAfterAdding(margins, 8, 0, 64);
			});
		}}
		reset={() => {
			dispatchWrapper(() => {
				margins = 0;
			});
		}}
	/>
</div>
