<script lang="ts">
	import ColorPicker from '$lib/components/settings/ColorPicker.svelte';
	// export let data;

	let backgroundColor: string;
</script>

<div class="container-mi">
	<div class="flex flex-col gap-2">
		<h2 class="font-bold text-lg">Theme</h2>

		<div />
	</div>

	<ColorPicker label={'Background color'} bind:color={backgroundColor} />
</div>
