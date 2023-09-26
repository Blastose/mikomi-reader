<script lang="ts">
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { IconChevronDown } from '@tabler/icons-svelte';
	import {
		mixBlendModeArray,
		type MixBlendMode
	} from '$lib/components/reader/stores/readerSettingsStore';

	export let imageBlendMode: MixBlendMode;

	const {
		elements: { trigger, menu, option, label },
		states: { selectedLabel, open }
	} = createSelect({
		preventScroll: false,
		defaultSelected: { value: imageBlendMode, label: imageBlendMode },
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		},
		onSelectedChange: (val) => {
			if (val.next) {
				imageBlendMode = val.next.value;
			}
			return val.next;
		}
	});
</script>

<div class="flex flex-col gap-2">
	<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
	<label class="block font-medium" use:melt={$label}>Image blend mode</label>

	<button
		class="flex h-10 items-center justify-between rounded-lg bg-neutral-700 px-3 py-2 shadow transition-opacity hover:opacity-90"
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
			{#each mixBlendModeArray as blendMode}
				<div
					class="relative cursor-pointer rounded-lg py-1 px-4 text-neutral-200
            focus:z-10 focus:text-neutral-700 duration-150
          data-[highlighted]:bg-neutral-300 data-[selected]:bg-neutral-300
          data-[highlighted]:text-neutral-900 data-[selected]:text-neutral-900"
					use:melt={$option({ value: blendMode, label: blendMode })}
				>
					<span class="capitalize">{blendMode}</span>
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
