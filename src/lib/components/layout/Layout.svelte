<script lang="ts">
	import Header from './Header.svelte';
	import BottomNav from './BottomNav.svelte';
	import { windowSizeStore } from '$lib/stores/windowSizeStore';
</script>

<div class="flex flex-col min-h-full">
	<Header />

	<div class="flex-grow grid grid-cols-1 gap-4 lg:grid-cols-[256px_1fr]">
		<!-- Sidebar -->
		{#if $windowSizeStore === 'large'}
			<div class="sticky top-[64px] h-[calc(100vh_-_64px)] bg-red-300">
				<div>Home</div>
				<div>Library</div>
				<div>Settings</div>
			</div>
		{/if}
		<slot />
	</div>

	{#if $windowSizeStore === 'small'}
		<BottomNav />
	{/if}
</div>
