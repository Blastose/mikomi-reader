<script lang="ts">
	export let active: boolean;
	export let text: string;
	export let href: string;
</script>

<a
	{href}
	class="{active
		? 'text-white bg-neutral-800 dark:bg-primary-500'
		: 'hover:bg-neutral-600 hover:text-white'} 
		background-transition-duration rounded-md"
>
	<div class="flex w-full gap-2 p-1">
		<slot />
		{text}
	</div>
</a>

<style>
	.background-transition-duration {
		transition: background-color 300ms;
	}
</style>
