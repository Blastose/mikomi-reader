<script lang="ts">
	export let color: string;
	export let label: string;
</script>

<label class="flex gap-2 justify-between">
	<span class="font-medium">{label}</span>

	<div
		class="w-6 h-6 overflow-hidden rounded-full border border-gray-500 focus-within:ring-2 focus-within:ring-white"
	>
		<input type="color" bind:value={color} />
	</div>
</label>

<style>
	input[type='color'] {
		width: 100%;
		height: 100%;
		transform: scale(3);
	}
</style>
