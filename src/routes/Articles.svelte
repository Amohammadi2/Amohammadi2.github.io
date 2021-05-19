<script>
    import PostCard from "../components/cards/PostCard.svelte";

    async function getFeed() {
        const response = await fetch("https://virgool.io/feed/@mohammadiashkan1384", {
            mode: 'no-cors'
        });
        const text_rep = await response.text();
        if (!response.ok)
            return getFeed(); // repeat until one succeeds
        console.log("getting the feed was successfull");
        return text_rep;
    }
    let promise = getFeed();
</script>

{#await promise}
    loading the feed... please wait;
{:then feed} 
    {feed}
{/await}