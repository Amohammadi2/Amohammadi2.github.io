<script>
    import Loader from "./Loader.svelte";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    let loading = true;

    onMount(() => {
        setTimeout(() => {loading = false}, 1000);
    })
</script>

{#if loading}
    <div out:fade={{duration: 200}}>
        <Loader/>
    </div>
{/if}

<p>
    email: mohammadiashkan1384@gmail.com
</p>