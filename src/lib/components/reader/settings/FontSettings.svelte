<script lang="ts">
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import type { EnglishFont } from './settings';
	import { englishFontArray } from './settings';
	import { IconChevronDown } from '@tabler/icons-svelte';

	export let fontFamily: EnglishFont;
	export let dispatchWrapper: (f: () => void) => void;

	const {
		elements: { trigger, menu, option, label },
		states: { selectedLabel, open }
	} = createSelect({
		preventScroll: false,
		defaultSelected: { value: fontFamily, label: fontFamily },
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		},
		onSelectedChange: (val) => {
			if (val.next) {
				fontFamily = val.next.value;
				dispatchWrapper(() => {});
			}
			return val.next;
		}
	});
</script>

<div class="flex flex-col gap-2">
	<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
	<label class="block font-medium" use:melt={$label}>Font</label>

	<button
		class="flex h-10 min-w-[220px] items-center justify-between rounded-lg bg-neutral-700 px-3 py-2 shadow transition-opacity hover:opacity-90"
		use:melt={$trigger}
		aria-label="Food"
	>
		<span class="capitalize">{$selectedLabel}</span>
		<IconChevronDown />
	</button>
	{#if $open}
		<div
			class="z-10 flex max-h-[300px] flex-col
  overflow-y-auto rounded-lg bg-neutral-700 p-1
  shadow focus:!ring-0"
			use:melt={$menu}
			transition:fade={{ duration: 150 }}
		>
			{#each englishFontArray as font}
				<div
					class="relative cursor-pointer rounded-lg py-1 px-4 text-neutral-200
            focus:z-10 focus:text-neutral-700 duration-150
          data-[highlighted]:bg-neutral-300 data-[selected]:bg-neutral-300
          data-[highlighted]:text-neutral-900 data-[selected]:text-neutral-900"
					use:melt={$option({ value: font, label: font })}
				>
					<span class="capitalize" style={font !== 'initial' ? `font-family: ${font};` : ''}
						>{font}</span
					>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.check {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		z-index: 50;
		translate: 0 calc(-50% + 1px);
	}
</style>
