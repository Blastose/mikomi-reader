<script lang="ts">
	import { page } from '$app/stores';
	import Fly from '$lib/components/layout/Fly.svelte';
	import '../app.css';
	import Layout from '$lib/components/layout/Layout.svelte';
	import { windowSizeStore } from '$lib/stores/windowSizeStore';

	const monitorScreenSize = (node: Window) => {
		const windowQuery = node.matchMedia('(min-width: 1024px)');
		const match = (e: MediaQueryListEvent) => {
			if (e.matches) {
				windowSizeStore.set('large');
			} else {
				windowSizeStore.set('small');
			}
		};

		if (!windowQuery.matches) {
			windowSizeStore.set('small');
		}

		windowQuery.addEventListener('change', match);

		return {
			destroy() {
				windowQuery.removeEventListener('change', match);
			}
		};
	};
</script>

<svelte:window use:monitorScreenSize />

<Layout>
	<slot />
</Layout>
