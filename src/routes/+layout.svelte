<script lang="ts">
	import '../app.css';
	import Layout from '$lib/components/layout/Layout.svelte';
	import { windowSizeStore } from '$lib/stores/windowSizeStore';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { appWindow } from '@tauri-apps/api/window';
	import { themeStore } from '$lib/stores/themeStore';
	import { page } from '$app/stores';

	// Show window after it has loaded to prevent white page flash
	// See https://github.com/tauri-apps/tauri/issues/1564
	onMount(() => {
		setTimeout(() => {
			appWindow.show();
		}, 1);
		if (!$page.url.pathname.startsWith('/reader')) {
			themeStore; // import themeStore to initialize it
		}
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

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

	// TODO remove later
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key !== 'l') return;

		if ($themeStore === 'light') {
			themeStore.set('dark');
		} else if ($themeStore === 'dark') {
			themeStore.set('light');
		}
	}
</script>

<svelte:window use:monitorScreenSize />
<svelte:document on:keydown={handleKeyDown} />

<Layout>
	<slot />
</Layout>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}

	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-from-right {
		from {
			transform: translateX(30px);
		}
	}

	@keyframes slide-to-left {
		to {
			transform: translateX(-30px);
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		:root::view-transition-old(root) {
			animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
				300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
		}

		:root::view-transition-new(root) {
			animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in,
				300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
		}
	}
</style>
