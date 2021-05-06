<script>
    import IconicButton from "../buttons/IconicButton.svelte";
    export let vectorImg = "";
    export let text= "";
</script>

<div class="skill-card">
    <img src="./img/{vectorImg}" alt={vectorImg}>
    <main class="body">
        <slot name="body"></slot>
    </main>
    <footer>
        <IconicButton text={text} icon_class="angle-left" style="width: 250px; margin: auto; text-align: center"/>
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
        transition: all 0.15s ease-out;
        margin: 30px 0;
    }
    .skill-card:hover {
        box-shadow: 0px 2px 15px 1px rgb(226, 226, 226);
    }
    img {
        width: 250px;
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