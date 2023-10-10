<script lang="ts">
	export let handleClick: () => void;
	export let subText: string;
</script>

<button
	class="flex flex-col items-center p-2 text-gray-700 dark:text-neutral-300 duration-300 rounded-md hover:text-black hover:bg-gray-200 dark:hover:bg-neutral-700"
	on:click={handleClick}
	aria-label={subText}
>
	<slot />
	<span class="hidden sm:block text-xs">{subText}</span>
</button>
