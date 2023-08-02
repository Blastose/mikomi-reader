<script lang="ts">
	import { IconHome, IconSettings, IconBook } from '@tabler/icons-svelte';
	import BottomNavButton from './BottomNavButton.svelte';
	import { fade } from 'svelte/transition';
</script>

<div in:fade out:fade class="sticky bottom-0 z-10 h-12 bg-gray-100 bg-opacity-70 backdrop-blur-lg">
	<div class="flex items-center justify-between h-full gap-2 px-12 container-mi">
		<BottomNavButton text="Home" href="/" active={true}>
			<IconHome />
		</BottomNavButton>
		<BottomNavButton text="Library" href="/books">
			<IconBook />
		</BottomNavButton>
		<BottomNavButton text="Settings" href="/">
			<IconSettings />
		</BottomNavButton>
	</div>
</div>
