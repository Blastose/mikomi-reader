<script lang="ts">
	import { IconLoader2 } from '@tabler/icons-svelte';

	export let loading: boolean;
	export let handleClick: () => void;
	export let buttonText: string;
</script>

<button
	on:click={handleClick}
	disabled={loading}
	class="flex justify-center bg-neutral-600 hover:bg-neutral-700 duration-300 rounded-md p-2"
>
	{#if loading}
		<IconLoader2 class="animate-spin" />
	{:else}
		{buttonText}
	{/if}
</button>
