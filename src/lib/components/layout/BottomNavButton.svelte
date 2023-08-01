<script lang="ts">
	export let text: string;
	export let href: string;
	export let active = false;
</script>

<a
	{href}
	class="flex flex-col items-center justify-center {active ? 'text-black' : 'text-gray-500'}"
>
	<slot />
	<span class="text-xs font-bold">{text}</span>
</a>
