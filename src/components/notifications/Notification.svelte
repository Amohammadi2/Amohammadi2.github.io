<script>
    import { onMount } from "svelte";
    import NotificationAPI from "../../modules/notificationAPI";

    export let msg;
    export let type;
    export let pk;

    onMount(() => {
        setTimeout(() => {
            NotificationAPI.delete(pk);
        }, 3000);
    });
</script>

<div class="notification {type}">
    <span class="dismiss" on:click={() => NotificationAPI.delete(pk)}>X</span>
    <span> {msg} </span>
    <div class="not-progress"></div>
</div>

<style>
    .notification {
        width: 100%;
        box-sizing: border-box;
        padding: 10px 8px;
        margin: 5px 0px;
        position: relative;
        box-shadow: 2px 2px 20px 1px rgba(255, 255, 255, 0.452);
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

    .not-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right:0;
        height: 3px; 
    }
    .not-progress::after {
        content: '';
        display: block;
        height: 3px;
        animation: progress_animation 3000ms linear forwards;
        background-color: orange;
    }

    @keyframes progress_animation {
        from { 
            width: 0%;
        }
        to {
            width: 100%;
        }
    }
</style>