<script lang="ts">
	export let active: boolean;
	export let text: string;
	export let href: string;
</script>

<a
	{href}
	class="{active
		? 'text-white bg-neutral-800 dark:bg-primary-100 dark:text-black'
		: 'hover:bg-neutral-600 hover:text-white'} 
		rounded-md duration-300"
>
	<div class="flex w-full gap-2 p-1">
		<slot />
		{text}
	</div>
</a>
