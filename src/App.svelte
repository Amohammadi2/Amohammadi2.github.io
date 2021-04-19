<script>
	import { onMount } from "svelte";
	import anime from "animejs/lib/anime.es";
	import IconicButton from "./components/buttons/IconicButton.svelte";
	import SoroushIcon from "./components/icons/SoroushIcon.svelte";
	import RubikaIcon from "./components/icons/RubikaIcon.svelte";
	import VirgoolIcon from "./components/icons/VirgoolIcon.svelte";

	function playStartAnimation() {
		anime({
			targets: "header",
			translateY: "-=50px",
			duration: 800,
		});
		anime({
			targets: ".card",
			opacity: 1,
			translateY: "-=50px",
			duration: 800,
			delay: anime.stagger(100),
		});
	}

	onMount(() => {
		playStartAnimation();
	});
</script>

<div class="main-grid">
	<header class="header">
		<div class="user-profile">
			<img src="./img/profile.jpg" alt="prof"/>
		</div>
		<div class="link-list">
			<SoroushIcon />
			<VirgoolIcon />
			<RubikaIcon />
		</div>
		<h1 class="title">
			اشکان محمدی
		</h1>
		<p class="description">
			توسعه دهنده وب، علاقه مند به هوش مصنوعی و نویسندگی
		</p>
		<div class="btn-group">
			<IconicButton text="مقالات" icon_class="file-text"
				style="background-color: rgba(256, 256, 256, 0.3); color: rgb(32, 204, 147); border: 1px solid rgb(32, 204, 147);"/>
			<IconicButton text="پروژه ها" icon_class="tasks"/>
			<IconicButton text="ارتباط با من" icon_class="phone-square"/>
		</div>
	</header>
</div>

<style>
	:global(body) {
		padding: 0;
		margin: 0;
		background: url(/img/background.png);
		background-size: cover;
		background-attachment: fixed;
	}

	:global(.p-icon) {
		cursor: pointer;
	}

	h1 { 
		position: relative;
	}

	h1::after {
		content: "";
		display: block;
		position: absolute;
		bottom: -15px;
		height: 3px;
		margin-left: 50%;
		transform: translateX(-50%);
		width: 50px;
		background-color: rgb(32, 204, 147);
	}

	.main-grid {
		display: grid;
		grid-template-columns: 1fr;
	}

	.link-list {
		font-size: 32px;
		margin-top: 20px;
		display: flex;
		flex-direction: row;
		justify-content:space-between;
		width: 130px;
		color: rgb(44, 44, 44);
	}

	.link-list * {
		user-select: none;
		cursor: pointer;
	}

	.user-profile{
		width: 150px;
		height: 150px;
		overflow: hidden;
		border-radius: 50%;
	}

	.user-profile img {
		width: 150px;
		height: 180px;
	}

	.header {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		color: black;
	}
	.header .title {
		font-size: 45px;
		margin-bottom: 5px;
		margin-top: -2px;
	}
	.header .description {
		direction: rtl;
	}

	.btn-group {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		width: 360px;
	}

	@media only screen and (max-width: 750px) {
		.main-grid {
			grid-template-columns: 1fr;
		}
		.btn-group {
			flex-direction: column-reverse;
		}
	}
</style>