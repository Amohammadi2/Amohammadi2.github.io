<script>
    export let icon_class;
    export let text;
    export let style;
</script>

<button class="iconic-btn" style={style}>
    <span class="fa fa-{icon_class} btn-icon"></span>
    <span class="btn-text">{text}</span>
</button>

<style>
    .iconic-btn {
        display: flex;
        align-items: center;
        flex-direction: row;
        background-color: rgba(68, 255, 193, 0.397);
        border: 0;
        outline: none;
        color: white;
        cursor: pointer;
        padding: 5px 8px;
        border-radius: 8px;
        transition: all .09s ease-out;
    }
    .iconic-btn:hover {
        background-color: rgb(9, 218, 187);
    }
    .btn-icon {
        font-size: 30px;
        margin-right: 8px;
    }
</style>