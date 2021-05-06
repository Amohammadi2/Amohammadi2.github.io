<script>
	import { flip } from "svelte/animate";
	import { fly } from "svelte/transition";
	import Router from "svelte-spa-router";
	import { wrap } from "svelte-spa-router/wrap";
	import Home from "./Home.svelte";
	import Contact from "./routes/Contact.svelte";
	import UnderDevelopment from "./routes/UnderDevelopment.svelte";
	import Loader from "./routes/Loader.svelte";
	import Notification from "./components/notifications/Notification.svelte";
	import { cm_wrap_opts } from "./modules/common";
	import { notifications } from "./stores/store";
	const routes = {
		'/': Home,
		'/contact': wrap({
			...cm_wrap_opts,
			component: Contact,
		}),
		'/m_loader': wrap({
			...cm_wrap_opts,
			component: Loader
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