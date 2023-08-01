<script lang="ts">
	import { IconHome, IconSettings, IconBook } from '@tabler/icons-svelte';
	import BottomNavButton from './BottomNavButton.svelte';
	import { fade } from 'svelte/transition';
</script>

<div in:fade out:fade class="sticky bottom-0 z-10 h-12 bg-slate-400 bg-opacity-20 backdrop-blur-lg">
	<div class="container flex items-center justify-between h-full gap-2 px-12 mx-auto">
		<BottomNavButton text="Home">
			<IconHome />
		</BottomNavButton>
		<BottomNavButton text="Library">
			<IconBook />
		</BottomNavButton>
		<BottomNavButton text="Settings">
			<IconSettings />
		</BottomNavButton>
	</div>
</div>
