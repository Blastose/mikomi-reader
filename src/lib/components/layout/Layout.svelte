<script lang="ts">
	import Header from './Header.svelte';
	import BottomNav from './BottomNav.svelte';
	import { windowSizeStore } from '$lib/stores/windowSizeStore';
	import Sidebar from './Sidebar.svelte';
</script>

<div class="grid grid-cols-[min-content_1fr] min-h-full">
	<div class="invisible w-64 -ml-64 lg:visible sidebar-animation lg:ml-0">
		<Sidebar />
	</div>

	<div class="flex flex-col min-h-full">
		<Header />

		<div class="flex-grow overflow-x-hidden">
			<slot />
		</div>

		{#if $windowSizeStore === 'small'}
			<BottomNav />
		{/if}
	</div>
</div>

<style>
	.sidebar-animation {
		transition-duration: 0.45s;
		transition-timing-function: cubic-bezier(0.17, 0.67, 0.23, 1.02);
	}
</style>
