<script lang="ts">
	import { setTitle } from '$lib/window/title';
	import { onMount } from 'svelte';

	onMount(async () => {
		await setTitle('Main');
	});
</script>

<h1>asdlajsd Welcome to SvelteKit</h1>
<p>asdasd ad dshe documentation</p>
<a href="/">main</a>
