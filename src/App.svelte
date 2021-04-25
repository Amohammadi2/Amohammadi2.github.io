<script>
	import { onMount } from "svelte";
	import anime from "animejs/lib/anime.es";
	import Splide from "@splidejs/splide";
	import IconicButton from "./components/buttons/IconicButton.svelte";
	import SoroushIcon from "./components/icons/SoroushIcon.svelte";
	import RubikaIcon from "./components/icons/RubikaIcon.svelte";
	import VirgoolIcon from "./components/icons/VirgoolIcon.svelte";
	import Biography from "./components/static/Biography.svelte";
	import SkillCard from "./components/cards/SkillCard.svelte";

	function playStartAnimation() {
		anime({
			targets: "#s-icon",
			duration: 200,
			translateX: "-=50px",
			easing: "easeInOutSine",
		});
		anime({
			targets: "#r-icon",
			duration: 200,
			translateX: "+=50px",
			easing: "easeInOutSine",
		});
	}

	function InitSliders() {
		new Splide(".splide", {
			type: "slide",
			perPage: 5,
			focus: "center",
			gap: "2rem",
			pagination: false,
			breakpoints: {
				'1100': {
					perPage: 3,
				},
				'850': {
					perPage: 1,
				},
			}
		}).mount();
	}

	function displayCards() {
		anime({
			targets: ".skill-card",
			duration: 600,
			opacity: 1,
		})
	}

	window.onscroll = event => {
		if (window.scrollY > 380) displayCards();
	}

	onMount(() => {
		playStartAnimation();
		InitSliders();
	});
</script>

<div class="main-grid">
	<header class="header">
		<div class="user-profile">
			<img src="./img/profile.jpg" alt="prof"/>
		</div>
		<div class="link-list">
			<span id="s-icon" style="transform: translateX(50px);">
				<SoroushIcon />
			</span>
			<span id="v-icon">
				<VirgoolIcon />
			</span>
			<span id="r-icon" style="transform: translateX(-50px);">
				<RubikaIcon />
			</span>
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
	<section class="green-box">
		<div class="container rtl">
			<Biography />
		</div>
	</section>
	<!-- <section class="skill-card-container container grid row-3">
		<SkillCard vectorImg="Backend.svg">
			<section slot="body">
				<h3 align="center" class="card-header">توسعه Back-end</h3>
			</section>
		</SkillCard>
		<SkillCard vectorImg="Backend.svg">
			<section slot="body">
				<h3 align="center" class="card-header">توسعه Front-end</h3>
			</section>
		</SkillCard>
		<SkillCard vectorImg="Backend.svg">
			<section slot="body">
				<h3 align="center" class="card-header">ML & AI</h3>
			</section>
		</SkillCard>
	</section> -->
</div>

<section>
	<h1 align="center">خدماتی که ارائه میدم</h1>
</section>

<div class="splide">
	<div class="splide__track">
		<ul class="splide__list">
			<li class="splide__slide">
				<SkillCard vectorImg="Backend.svg">
					<section slot="body">
						<h3 align="center" class="card-header">توسعه Back-end</h3>
					</section>
				</SkillCard>
			</li>
			<li class="splide__slide">
				<SkillCard vectorImg="Backend.svg">
					<section slot="body">
						<h3 align="center" class="card-header">توسعه Back-end</h3>
					</section>
				</SkillCard>
			</li>
			<li class="splide__slide">
				<SkillCard vectorImg="Backend.svg">
					<section slot="body">
						<h3 align="center" class="card-header">توسعه Back-end</h3>
					</section>
				</SkillCard>
			</li>
			<li class="splide__slide">
				<SkillCard vectorImg="Backend.svg">
					<section slot="body">
						<h3 align="center" class="card-header">توسعه Back-end</h3>
					</section>
				</SkillCard>
			</li>
			<li class="splide__slide">
				<SkillCard vectorImg="Backend.svg">
					<section slot="body">
						<h3 align="center" class="card-header">توسعه Back-end</h3>
					</section>
				</SkillCard>
			</li>
			<li class="splide__slide">
				<SkillCard vectorImg="Backend.svg">
					<section slot="body">
						<h3 align="center" class="card-header">توسعه Back-end</h3>
					</section>
				</SkillCard>
			</li>
		</ul>
	</div>
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
		min-height: 100vh;
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

	.container {
		width: 60%;
		margin-top: 30px;
		margin-bottom: 30px;
		margin-left: 20%;
		text-align: justify;
	}
	.rtl {
		direction: rtl;
	}
	.green-box {
		background-color:rgb(32, 204, 147);
		color: white;
	}

	.grid {
		display: grid;
	}
	
	.row-3 {
		grid-template-columns: 1fr 1fr 1fr;
	}

	.card-header {
		margin: 0 !important;
	}

	@media only screen and (max-width: 825px) {
		.skill-card-container {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media only screen and (max-width: 750px) {
		.main-grid {
			grid-template-columns: 1fr;
		}
		.btn-group {
			flex-direction: column-reverse;
		}
			.container {
			width: 90%;
			margin-left: 5%;
		}
	}

	@media only screen and (max-width: 600px) {
		.skill-card-container {
			grid-template-columns: 1fr;
		}
	}
</style>