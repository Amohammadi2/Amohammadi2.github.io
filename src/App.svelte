<script>
	import IconicButton from "./components/buttons/IconicButton.svelte";
</script>

<header class="header">
	<h1 class="title">
		اشکان محمدی
	</h1>
	<p class="description">
		توسعه دهنده وب و علاقه مند به تکنولوژی
	</p>
	<div class="btn-group">
		<IconicButton text="پروژه ها" icon_class="tasks"/>
		<IconicButton text="ارتباط با من" icon_class="phone-square"/>
	</div>
</header>

<style>
	:global(body) {
		padding: 0;
		margin: 0;
	}

	.header {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.header .title {
		font-size: 45px;
		margin-bottom: 5px;
	}
	.header .description {
		color: rgb(45, 45, 45);
	}
</style>