<script lang="ts">
	import ModeSwitcher from './lib/ModeSwitcher.svelte';
	import { hostSession, joinSession, Session } from './channels/p2p';
  import type { Readable } from 'svelte/store';
	let log: string[] = [];

	let session: Session | undefined;
	let id: string = '';
	let name: string = '';
	let txtField: HTMLInputElement | undefined;
	let sid: Readable<string>;
	function handleData(ev: Event) {
		const evt = ev as CustomEvent<{name: string, data: any}>;
		console.log(evt);
		log.push(`[${evt.detail.name}]: ${evt.detail.data}`);
		log = log;
	}
	function handleStatus(ev: Event) {
		const evt = ev as CustomEvent<string>;
		console.log(evt);
		log.push(`[${evt.detail}]`);
		log = log;
	}
	function create() {
		session = hostSession();
		sid = session.id;
		session.addEventListener('data', handleData);
		session.addEventListener('status', handleStatus);
	}
	function join() {
		session = joinSession(id, name);
		sid = session.id;
		session.addEventListener('data', handleData);
	}
	let msg = '';
	function send() {
		session?.send(msg);
		msg = '';
		txtField?.focus();
	}
</script>

<ModeSwitcher />
<main class="p-4 mx-auto text-center max-w-3xl">
	<h1 class="uppercase text-6xl leading-normal font-thin text-svelte">Narrator</h1>
	{#if session}
	<div class="vstack gap-4 mb-4">
		{#if session.gm}
		<div>I am GM</div>
		{/if}
		<div>{$sid}</div>
		<form class="hstack gap-4" on:submit|preventDefault={send}>
			<input type="text" class="py-2 px-3 rounded-sm dark:bg-gray-700 flex-1" bind:value={msg} bind:this={txtField}>
			<button type="submit" class="py-2 px-3 rounded-sm bg-svelte">Send</button>
		</form>
	</div>	
	{:else}
	<div class="vstack gap-4 mb-4">
		<button type="button" class="py-2 px-3 rounded-sm bg-svelte" on:click={create}>Create Session</button>
		<p>or</p>
		<div class="hstack gap-4 items-center">
			<input type="text" class="py-2 px-3 rounded-sm dark:bg-gray-700 flex-1" bind:value={id} placeholder="Session ID">
			<input type="text" class="py-2 px-3 rounded-sm dark:bg-gray-700" bind:value={name} placeholder="Your Name">
			<button type="button" class="py-2 px-3 rounded-sm bg-svelte" on:click={join}>Join Session</button>
		</div>
	</div>
	{/if}
	<section class="border-t pt-4 text-left">
		{#each log as entry}
			<div>{entry}</div>
		{/each}
	</section>
</main>
