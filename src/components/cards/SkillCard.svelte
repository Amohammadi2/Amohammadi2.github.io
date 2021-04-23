<script>
    import IconicButton from "../buttons/IconicButton.svelte";
    export let vectorImg = "";
</script>

<div class="skill-card">
    <img src="/img/{vectorImg}" alt={vectorImg}>
    <main class="body">
        <slot name="body"></slot>
    </main>
    <footer>
        <IconicButton text="جزئیات" icon_class="tasks" style="width: 100%"/>
    </footer>
</div>

<style>
    .skill-card {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content:center;
        box-shadow: 0px 2px 30px 1px rgb(230, 230, 230);
        margin: 5px 8px;
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

    @media only screen and (max-width:600px) {
        .skill-card {
            width: 60%;
            margin: 10px auto;
        }
    }
</style>