<script lang="ts">
	import {
		IconBook2,
		IconBooks,
		IconCheckbox,
		IconCircleArrowRight,
		IconSettings,
		IconFolders,
		IconBook
	} from '@tabler/icons-svelte';
	import SidebarItem from './SidebarItem.svelte';
	import Logo from '$lib/components/logo/Logo.svelte';
	import { page } from '$app/stores';
</script>

<div
	class="sidebar sticky top-0 z-50 w-full h-screen overflow-y-auto bg-[#e1e3e6] dark:bg-[#39393a] dark:text-white custom-scroll"
>
	<div class="flex flex-col gap-1 py-4 pl-3 pr-1">
		<div class="flex items-center gap-2">
			<Logo />
			<p class="py-2 text-2xl font-bold">Mikomi Reader</p>
		</div>

		<SidebarItem text="Home" href="/" active={$page.url.pathname === '/'}>
			<IconBook2 />
		</SidebarItem>

		<p class="text-lg font-bold">Library</p>
		<SidebarItem
			text="All"
			href="/books"
			active={$page.url.pathname + $page.url.search === '/books'}
		>
			<IconBooks />
		</SidebarItem>
		<SidebarItem
			text="Reading"
			href="/books?status=Reading"
			active={$page.url.pathname + $page.url.search === '/books?status=Reading'}
		>
			<IconBook />
		</SidebarItem>
		<SidebarItem
			text="Plan to Read"
			href={`/books?status=${encodeURIComponent('Plan to read').replace(/%20/g, '+')}`}
			active={$page.url.pathname + $page.url.search ===
				`/books?status=${encodeURIComponent('Plan to read').replace(/%20/g, '+')}`}
		>
			<IconCircleArrowRight />
		</SidebarItem>
		<SidebarItem
			text="Finished"
			href="/books?status=Finished"
			active={$page.url.pathname + $page.url.search === '/books?status=Finished'}
		>
			<IconCheckbox />
		</SidebarItem>
		<SidebarItem
			text="Collections"
			href="/collections"
			active={$page.url.pathname === '/collections'}
		>
			<IconFolders />
		</SidebarItem>
		<SidebarItem text="Settings" href="/settings" active={$page.url.pathname === '/settings'}>
			<IconSettings />
		</SidebarItem>
	</div>
</div>

<style>
	.sidebar {
		view-transition-name: sidebar;
	}
</style>
