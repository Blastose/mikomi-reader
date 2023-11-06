<script lang="ts">
	import { createSelect, melt, type SelectOption } from '@melt-ui/svelte';
	import { IconCheck, IconChevronDown } from '@tabler/icons-svelte';
	import { writable } from 'svelte/store';

	export let selectName: string;
	export let selectOptions: ReadonlyArray<string>;
	export let selected: string;
	export let defaultValue: string;
	export const resetSelected = () => {
		selectedMeltStore.set({ value: defaultValue, label: defaultValue });
		selected = defaultValue;
	};

	let selectedMeltStore = writable<SelectOption<string>>({ value: selected, label: selected });

	$: selected = $selectedMeltStore.value;

	const {
		elements: { trigger, menu, option, label },
		states: { selectedLabel, open },
		helpers: { isSelected }
	} = createSelect({
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		},
		preventScroll: false,
		selected: selectedMeltStore
	});

	let containerWidth: number;
</script>

<div bind:clientWidth={containerWidth} class="w-full sm:max-w-xs flex flex-col gap-1">
	<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
	<label class="block text-lg font-bold" use:melt={$label}>{selectName}</label>
	<button
		class="flex h-10 min-w-[220px] items-center justify-between rounded-lg px-3 py-2
    bg-neutral-700 shadow transition-opacity hover:opacity-90"
		use:melt={$trigger}
		aria-label="Food"
	>
		<span class="flex gap-2">
			{$selectedLabel}
		</span>

		<IconChevronDown class="square-5" />
	</button>
	{#if $open}
		<div
			class="z-10 overflow-y-auto overflow-x-hidden flex gap-1 max-h-[300px] flex-col
     rounded-lg bg-[#404040fe] p-1
    focus:!ring-0"
			use:melt={$menu}
		>
			{#each selectOptions as selectOption}
				<div
					class="relative cursor-pointer rounded-lg py-1 pr-4 pl-10 text-neutral-200
            focus:z-10 focus:text-neutral-700 duration-150
          data-[highlighted]:bg-[#a3a3a3fe] data-[selected]:bg-[#d5d5d5fe]
          data-[highlighted]:text-[#171717fe] data-[selected]:text-[#171717fe]"
					use:melt={$option({ value: selectOption, label: selectOption })}
				>
					<div class="check {$isSelected(selectOption) ? 'block' : 'hidden'}">
						<IconCheck />
					</div>
					{selectOption}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style lang="postcss">
	.check {
		position: absolute;
		left: theme(spacing.2);
		top: 50%;
		z-index: theme(zIndex.20);
		translate: 0 calc(-50% + 1px);
		color: theme(colors.neutral.500);
	}
</style>
