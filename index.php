<?php

	// :: ONLY DURING DEVELOPMENT ::
	// debugging
	ini_set( "display_errors", "On" );
	ini_set( "error_reporting", E_ALL );

	// included external php files with functions.
	require ('inc/head.php');
	require ('inc/lazaro.php'); /* -- Lazaro disclaimer and footer -- */

?>

<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml"
	prefix="og: http://ogp.me/ns# fb: http://www.facebook.com/2008/fbml">

<head>


	<!-- Nothing Above This -->
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<!-- Page Title | Page Name -->
	<title>Project Name | Short phrase</title>

	<?php echo gethead(); ?>

</head>

<body id="body" class="body">

<!--  ★  MARKUP GOES HERE  ★  -->

<div id="page-wrapper"><!-- Page Wrapper -->

	<!-- Header Section -->
	<section class="header-section">
		<div class="container">
			<div class="header row">
				<div class="columns small-3">
					<a class="logo" href="/">
						<img src="/img/logo.svg">
					</a>
				</div>
			</div>
		</div>
	</section> <!-- END : Header Section -->


	<!-- Page Content -->
	<div id="page-content">

		<?php // require_once 'plugins/Omega/index.php' ?>

		<section class="container-unit-search">
			<div>
				<span>Type:</span>
				<select class="js_ui_input js_set_unit_type" name="unit-type">
					<option value="" disabled selected>Apartment Type</option>
					<option value="1">Studio</option>
					<option value="2">2BHK</option>
					<option value="3">3BHK</option>
				</select>
			</div>
			<div>
				<span>Floor(s):</span>
				<select class="js_ui_input js_set_floor" name="floor" disabled></select>
			</div>
		</section>

		<section class="container-units-list">

			<h1>Units</h1>

			<ol class="units-list js_units_list">
				<!--  -->
			</ol>

		</section>

		<section class="unit-info js_unit_info">

		</section>

		<section id="" class="js_spreadsheet_dump">
			<!-- <table id="spreadsheet_dump"></table> -->
		</section>

	</div> <!-- END : Page Content -->


	<!-- Lazaro Signature -->
	<?php lazaro_signature(); ?>
	<!-- END : Lazaro Signature -->

</div><!-- END : Page Wrapper -->







<!-- Templates -->

<script type="template" class="js_template_unit">
	<li data-unit="{{ unit }}">
		<span>{{ unit }}</span>
		<span>{{ floor }} floor</span>
		<span>{{ sft }} sqft</span>
		<!-- <span>₹ <?php // echo money_format( '%!i', $unit[ 'cost' ] ) ?></span> -->
		<span>₹{{ cost | INR }}</span>
		<button class="js_unit_view">view</button>
	</li>
</script>

<script type="template" class="js_template_floor_availability">
	<option value="{{ floor }}" {{ attrs }}>
		{{ floor }} ({{ available }})
	</option>
</script>

<script type="template" class="js_template_unit_information">
	<h1>#{{ unit }}</h1>
	<div>{{ bhk }} BHK</div>
	<div>{{ floor }} floor</div>
	<div>{{ sft }} sqft</div>
	<div>Basic cost: ₹{{ basiccost | INR }}</div>
	<div>Basic cost including car park: ₹{{ basiccost_carpark | INR }}</div>
	<div>Garden / Terrace: ₹{{ gardenterrace_charge | INR }}</div>
	<div>Floor rise: ₹{{ floorise_charge | INR }}</div>
	<div>Car parking: ₹{{ carkpark | INR }}</div>
	<div>Corner flat charge: ₹{{ cornerflat_charge | INR }}</div>
	<div>Cost: ₹{{ cost | INR }}</div>
</script>

<!-- END: Templates -->









<script type="text/javascript" src="js/modules/util.js"></script>
<script type="text/javascript" src="plugins/Omega/SheetJS/xlsx-core-v0.12.4.min.js"></script>
<script type="text/javascript" src="plugins/Omega/xlsx-calc/xlsx-calc-v20170729.min.js"></script>
<script type="text/javascript" src="plugins/Omega/pricing-engine.js"></script>



</body>

</html>
