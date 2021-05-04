<script>
    import NotificationAPI from "../../modules/notificationAPI";

    export let msg;
    export let type;
    export let pk;
</script>

<div class="notification {type}">
    <span class="dismiss" on:click={() => NotificationAPI.delete(pk)}>X</span>
    <span> {msg} </span>
</div>

<style>
    .notification {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 8px;
        margin: 5px 0px;
    }

    .notification.alert {
        background-color: rgb(255, 146, 134);
    }

    .notification.warning {
        background-color:rgb(250, 252, 147);
    }

    .notification.success {
        background-color:rgb(156, 253, 189);
    }

    .dismiss {
        background-color: rgba(255, 255, 255, 0.411);
        display: inline-block;
        padding: 5px 11px;
        margin-right: 3px;
        margin-left: 3px;
        cursor: pointer;
    }
</style>