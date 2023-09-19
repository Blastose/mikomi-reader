<script lang="ts">
	export let onClick: () => void;
	export let subText: string | null = null;
	export let active: boolean = false;
	export let fitWidth: boolean = false;
</script>

<button
	on:click={onClick}
	class="{fitWidth ? 'w-fit' : 'w-20'} p-2 rounded-md flex flex-col items-center duration-150
	{active ? 'bg-neutral-700' : 'hover:bg-neutral-500'}"
>
	<slot name="icon" />
	{#if subText}
		<span class="text-sm text-neutral-100">{subText}</span>
	{/if}
</button>
