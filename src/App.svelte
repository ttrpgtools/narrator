<script lang="ts">
	import ModeSwitcher from './lib/ModeSwitcher.svelte';
	import { hostSession, joinSession, Session } from './channels/p2p';
  import type { Readable } from 'svelte/store';
	let log: string[] = [];

	let session: Session | undefined;
	let id: string = '';
	let name: string = '';
	let sid: Readable<string>;
	function handleData(ev: Event) {
		const evt = ev as CustomEvent<{name: string, data: any}>;
		console.log(evt);
		log.push(`[${evt.detail.name}]: ${evt.detail.data}`);
		log = log;
	}
	function create() {
		session = hostSession();
		sid = session.id;
		session.addEventListener('data', handleData);
	}
	function join() {
		session = joinSession(id, name);
		session.addEventListener('data', handleData);
	}
	let msg = '';
	function send() {
		session?.send(msg);
		msg = '';
	}
</script>

<ModeSwitcher />
<main class="p-4 mx-auto text-center max-w-xl">
	<h1 class="uppercase text-6xl leading-normal font-thin text-svelte">Narrator</h1>
	{#if session}
	<div class="vstack gap-4 mb-4">
		{#if session.gm}
			<div>{$sid}</div>
		{/if}
		<div class="hstack gap-4">
			<input type="text" class="py-2 px-3 rounded-sm dark:bg-gray-700 flex-1" bind:value={msg}>
			<button type="button" class="py-2 px-3 rounded-sm bg-svelte" on:click={send}>Send</button>
		</div>
	</div>	
	{:else}
	<div class="vstack gap-4 mb-4">
		<button type="button" class="py-2 px-3 rounded-sm bg-svelte" on:click={create}>Create Session</button>
		<p>or</p>
		<div class="hstack gap-4 items-center">
			<input type="text" class="py-2 px-3 rounded-sm dark:bg-gray-700" bind:value={id} placeholder="Session ID">
			<input type="text" class="py-2 px-3 rounded-sm dark:bg-gray-700" bind:value={name} placeholder="Your Name">
			<button type="button" class="py-2 px-3 rounded-sm bg-svelte" on:click={join}>Join Session</button>
		</div>
	</div>
	{/if}
	<section class="border-t pt-4">
		{#each log as entry}
			<div>{entry}</div>
		{/each}
	</section>
</main>
