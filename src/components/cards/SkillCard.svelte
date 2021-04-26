<script>
    import IconicButton from "../buttons/IconicButton.svelte";
    export let vectorImg = "";
</script>

<div class="skill-card">
    <img src="./img/{vectorImg}" alt={vectorImg}>
    <main class="body">
        <slot name="body"></slot>
    </main>
    <footer>
        <IconicButton text="جزئیات" icon_class="tasks" style="width: 200px; margin: auto;"/>
    </footer>
</div>

<style>
    .skill-card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content:center;
        margin: 5px 8px;
        opacity: 0;
    }
    img {
        width: 200px;
        margin-left: auto;
        margin-right: auto; 
    }
    footer {
        display: flex;
        flex-direction: row;
        margin: 5px 20px;
        margin-top: 15px;
    }

</style>