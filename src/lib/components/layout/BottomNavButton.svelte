<script lang="ts">
	export let text: string;
</script>

<button class="flex flex-col items-center justify-center">
	<slot />
	<span class="text-xs font-bold">{text}</span>
</button>
