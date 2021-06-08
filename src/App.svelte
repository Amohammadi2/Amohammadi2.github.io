<script>
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";
	import Router from "svelte-spa-router";
	import { wrap } from "svelte-spa-router/wrap";
	import { cm_wrap_opts } from "./modules/common";
	import { notifications } from "./stores/store";import Home from "./Home.svelte";
	import Contact from "./routes/Contact.svelte";
	import Projects from "./routes/Projects.svelte";
	import Notification from "./components/notifications/Notification.svelte";

	const routes = {
		'/': Home,
		'/contact': wrap({
			...cm_wrap_opts,
			component: Contact,
		}),
		'/projects': wrap({
			...cm_wrap_opts,
			component: Projects,
		}),
	};
</script>

<div class="notification-box">
	{#each $notifications as n (n.pk)}
		<div animate:flip="{{duration: 500}}" transition:fly={{duration: 500, x: 200}}>
			<Notification type={n.type} msg={n.msg} pk={n.pk}/>
		</div>
	{/each}
</div>

<Router {routes} />

<style>
	.notification-box {
		position: fixed;
		top: 10px;
		left: 20px;
		direction: rtl;
		width: 300px;
		z-index: 9999;
	}
</style>