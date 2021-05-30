<script>



</script>

<section class="post">
    Hello world
</section>
<section class="post" style="display: none"></section>

<style>
    .post {
        min-width: 200px;
        height: 300px;
        background-color: white;
        border-radius: 23px;
        box-sizing: border-box;
        padding: 10px 20px;
        box-shadow: -5px 2px 15px 1px rgb(226, 226, 226);
        margin: 10px 0px 10px -28px;
        transition: all 0.2s ease-out;
    }

    .post:hover {
        transform: scale(1.12);
        box-shadow: 0px 2px 15px 1px rgb(202, 202, 202);
    }

    .post:hover ~ .post {
        margin-left: 5px;
    }

    .post:first-child {
        margin-left: 6px;
    }
</style>