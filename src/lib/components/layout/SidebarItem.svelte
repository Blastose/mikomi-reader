<script lang="ts">
	export let active: boolean;
	export let text: string;
	export let href: string;
</script>

<a
	{href}
	class="{active
		? 'text-white bg-black'
		: 'hover:bg-gray-500 hover:text-white'} duration-300 rounded-md"
>
	<button class="flex w-full gap-2 p-1">
		<slot />
		{text}
	</button>
</a>
