<script>
    export let icon;
    export let text;
    export let iconWidth = 120;
</script>

<div class="icon">
    <div class="img">
        <img src="./img/{icon}.svg" alt="{icon}" style="width: {iconWidth}px" />
    </div>
    <div class="text">
        {text}
    </div>
</div>

<style>
    .icon {
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        cursor: pointer;
    }

    .img {
        transition: all 0.11s ease-out;
    }
    .img:hover {
        border-radius: 20px;
        background-color: rgb(205, 255, 238);
    }
</style>