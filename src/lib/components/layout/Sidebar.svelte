<script lang="ts">
	import {
		IconBook2,
		IconBooks,
		IconCheckbox,
		IconCircleArrowRight,
		IconSettings
	} from '@tabler/icons-svelte';
	import SidebarItem from './SidebarItem.svelte';
	import Logo from '$lib/components/logo/Logo.svelte';
	import { page } from '$app/stores';
</script>

<div class="sticky top-0 z-50 w-full h-screen overflow-y-auto bg-gray-500 scroll bg-opacity-20">
	<div class="flex flex-col gap-1 py-4 pl-3 pr-1">
		<div class="flex items-center gap-2">
			<Logo />
			<p class="py-2 text-2xl font-bold">Mikomi Reader</p>
		</div>

		<SidebarItem text="Home" href="/" active={$page.url.pathname === '/'}>
			<IconBook2 />
		</SidebarItem>

		<p class="text-lg font-bold">Library</p>
		<SidebarItem text="All" href="/books" active={$page.url.pathname === '/books'}>
			<IconBooks />
		</SidebarItem>
		<SidebarItem text="Plan to Read" href="/" active={false}>
			<IconCircleArrowRight />
		</SidebarItem>
		<SidebarItem text="Finished" href="/" active={false}>
			<IconCheckbox />
		</SidebarItem>
		<SidebarItem text="Settings" href="/settings" active={false}>
			<IconSettings />
		</SidebarItem>
	</div>
</div>

<style>
	.scroll {
		scrollbar-gutter: stable;
	}

	.scroll::-webkit-scrollbar {
		width: 8px;
	}

	.scroll::-webkit-scrollbar-track {
		background: transparent;
	}

	.scroll::-webkit-scrollbar-thumb {
		background-color: rgba(107, 114, 128, 0.5);
		border-radius: 20px;
		border: transparent;
		visibility: hidden;
	}

	.scroll:hover::-webkit-scrollbar-thumb {
		visibility: visible;
	}
</style>
