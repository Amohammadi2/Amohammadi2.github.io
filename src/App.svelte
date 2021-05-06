<script>
	import Router from "svelte-spa-router";
	import { wrap } from "svelte-spa-router/wrap";
	import Home from "./Home.svelte";
	import Contact from "./routes/Contact.svelte";
	import UnderDevelopment from "./routes/UnderDevelopment.svelte";
	import Loader from "./routes/Loader.svelte";
	import { cm_wrap_opts } from "./modules/common";

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

<Router {routes} />