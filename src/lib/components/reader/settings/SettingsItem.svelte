<script lang="ts">
	import SettingsButton from './SettingsButton.svelte';
	import { IconPlus, IconMinus, IconArrowBack } from '@tabler/icons-svelte';

	export let titleText: string;
	export let value: string | number;
	export let onDecrement: () => void;
	export let onIncrement: () => void;
	export let reset: (() => void) | null = null;
</script>

<div class="flex flex-col gap-2">
	<h3 class="font-medium">
		{titleText}
	</h3>

	<div class="flex items-center gap-2">
		<SettingsButton onClick={onDecrement}>
			<svelte:fragment slot="icon">
				<IconMinus />
			</svelte:fragment>
		</SettingsButton>
		<p class="w-12 text-center">
			{value}
		</p>
		<SettingsButton onClick={onIncrement}>
			<svelte:fragment slot="icon">
				<IconPlus />
			</svelte:fragment>
		</SettingsButton>
		{#if reset}
			<SettingsButton onClick={reset} fitWidth={true}>
				<svelte:fragment slot="icon">
					<IconArrowBack />
				</svelte:fragment>
			</SettingsButton>
		{/if}
	</div>
</div>
