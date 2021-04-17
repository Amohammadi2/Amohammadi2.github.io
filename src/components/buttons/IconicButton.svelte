<script>
    export let icon_class;
    export let text;
    export let class_list = [];
</script>

<button class="{class_list.join(' ')}">
    <span class="fa fa-{icon_class} btn-icon"></span>
    <span>{text}</span>
</button>

<style>

</style>