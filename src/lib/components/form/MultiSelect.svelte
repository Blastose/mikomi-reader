<script lang="ts">
	import { createSelect, melt, type SelectOption } from '@melt-ui/svelte';
	import { IconCheck, IconChevronDown } from '@tabler/icons-svelte';
	import { writable } from 'svelte/store';

	export let allSelectedText: string;
	export let selectName: string;
	export let selectOptions: string[];
	export let selected: string[];
	export const resetSelected = () => {
		selectedMeltStore.set([]);
		selected = [];
	};

	let selectedMeltStore = writable<SelectOption<string>[]>(
		selected.map((i) => {
			return {
				value: i,
				label: i
			};
		})
	);

	$: selected = $selectedMeltStore.map((v) => v.value);

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
		multiple: true,
		preventScroll: false,
		selected: selectedMeltStore
	});
</script>

<div class="w-full sm:max-w-xs flex flex-col gap-1">
	<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
	<label class="block text-lg font-bold" use:melt={$label}>{selectName}</label>
	<button
		class="flex h-10 min-w-[220px] items-center justify-between rounded-lg px-3 py-2
    bg-neutral-700 shadow transition-opacity hover:opacity-90"
		use:melt={$trigger}
		aria-label="Food"
	>
		<span class="flex gap-2">
			{#if selected.length === 0}
				<span class="px-2 rounded-full text-sm text-black bg-neutral-200">{allSelectedText}</span>
			{:else if selected.length <= 2}
				{#each selected as selectItem}
					<span class="px-2 rounded-full text-sm text-black bg-neutral-200">{selectItem}</span>
				{/each}
			{:else}
				<span class="px-2 rounded-full text-sm text-black bg-neutral-200">{selected[0]}</span>
				<span class="px-2 rounded-full text-sm text-black bg-neutral-200"
					>+{selected.length - 1} more</span
				>
			{/if}
		</span>

		<IconChevronDown class="square-5" />
	</button>
	{#if $open}
		<div
			class="z-10 flex gap-1 max-h-[300px] flex-col
    overflow-y-auto rounded-lg bg-neutral-700 p-1
    shadow focus:!ring-0 text-white"
			use:melt={$menu}
		>
			{#each selectOptions as selectOption}
				<div
					class="relative cursor-pointer rounded-lg py-1 pr-4 pl-10 text-neutral-200
            focus:z-10 focus:text-neutral-700 duration-150
          data-[highlighted]:bg-neutral-400 data-[selected]:bg-neutral-300
          data-[highlighted]:text-neutral-900 data-[selected]:text-neutral-900"
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
