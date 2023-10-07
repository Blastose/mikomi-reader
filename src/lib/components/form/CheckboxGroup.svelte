<script lang="ts">
	import { IconPlus } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';

	type Item = { value: string; display: string };

	export let items: Item[];
	export let groupName: string;
	export let name: string;
	export let group: string[];
	export const resetCheckboxGroup = () => {
		selectedMap.clear();
		selectedMap = selectedMap;
		group = [];
	};

	let selectedMap = new Map<string, string>();

	onMount(() => {
		for (const s of group) {
			selectedMap.set(s, s);
		}
		selectedMap = selectedMap;
	});

	function setSelected(item: Item) {
		selectedMap.set(item.value, item.value);
	}

	function removeSelected(item: Item) {
		selectedMap.delete(item.value);
	}

	function handleClick(item: Item) {
		if (selectedMap.get(item.value)) {
			removeSelected(item);
		} else {
			console.log('asjdlk');
			setSelected(item);
		}
		selectedMap = selectedMap;
		group = [];
		for (const [_, s] of selectedMap) {
			group.push(s);
		}
	}
</script>

<div class="flex flex-col gap-2">
	<p class="text-lg font-bold">{groupName}</p>
	<div class="flex gap-2 flex-wrap">
		{#each items as item}
			<button
				on:click={() => {
					handleClick(item);
				}}
				type="button"
				class="btn"
				class:selected={selectedMap.get(item.value)}
			>
				{#if selectedMap.get(item.value)}
					<IconPlus size={16} />
				{/if}
				{item.display}
			</button>
		{/each}
		<button
			type="button"
			class="btn cursor-default"
			class:selected={selectedMap.size === 0 || selectedMap.size === items.length}
		>
			{#if selectedMap.size === 0 || selectedMap.size === items.length}
				<IconPlus size={16} />
			{/if}
			Any
		</button>
		{#each selectedMap as [_, value]}
			<input {name} type="hidden" {value} />
		{/each}
	</div>
</div>

<style lang="postcss">
	.btn {
		background-color: theme(colors.neutral.700);
		transition-duration: 300ms;
		border-radius: 0.375rem;
		padding: 0.25rem 0.5rem;

		display: flex;
		align-items: center;
		flex-gap: 0.5rem;
	}

	.btn:hover {
		background-color: theme(colors.neutral.600);
	}

	.btn.selected {
		background-color: theme(colors.neutral.300);
		color: black;
	}
</style>
