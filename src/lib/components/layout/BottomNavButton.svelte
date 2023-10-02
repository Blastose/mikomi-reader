<script lang="ts">
	export let text: string;
	export let href: string;
	export let active = false;
</script>

<a
	{href}
	class="duration-300 flex flex-col items-center justify-center {active
		? 'text-black dark:text-white'
		: 'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300'}"
>
	<slot />
	<span class="text-xs font-bold">{text}</span>
</a>
