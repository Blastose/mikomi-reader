<script lang="ts">
	import { createTabs, melt } from '@melt-ui/svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import AppearanceSettings from './AppearanceSettings.svelte';
	import type { EnglishFont, LineHeight, TextAlign } from './settings';
	import type { Orientation } from '../utils';
	import ThemeSettings from './ThemeSettings.svelte';

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

	const {
		elements: { root, list, content, trigger },
		states: { value }
	} = createTabs({
		defaultValue: 'tab-1'
	});

	const triggers = [
		{ id: 'tab-1', title: 'Display' },
		{ id: 'tab-2', title: 'Theme' }
	];

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<div use:melt={$root} class="flex flex-col h-full">
	<div>
		<slot />
		<div
			use:melt={$list}
			class="flex shrink-0 overflow-x-auto px-6
    data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r"
			aria-label="Change reader settings"
		>
			{#each triggers as triggerItem}
				<button use:melt={$trigger(triggerItem.id)} class="trigger relative hover:cursor-pointer">
					{triggerItem.title}
					{#if $value === triggerItem.id}
						<div
							in:send={{ key: 'trigger' }}
							out:receive={{ key: 'trigger' }}
							class="absolute bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-slate-400"
						/>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<div use:melt={$content('tab-1')} class="grow custom-scroll overflow-y-auto">
		<AppearanceSettings
			bind:columnCount
			bind:fontFamily
			bind:fontSize
			bind:lineHeight
			bind:margins
			bind:textAlign
			bind:writingMode
			{onWritingModeChange}
			{onColumnCountChange}
			{dispatchWrapper}
		/>
	</div>
	<div use:melt={$content('tab-2')} class="grow custom-scroll overflow-y-auto">
		<ThemeSettings />
	</div>
</div>

<style>
	.trigger {
		display: flex;
		align-items: center;
		justify-content: center;

		border-radius: 0;

		font-weight: 500;
		line-height: 1;

		flex: 1;
		height: 3rem;
		padding-inline: 0.5rem;
	}
</style>
