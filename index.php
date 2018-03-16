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

		<section class="container container-unit-search">

			<h3>1. Find an Apartment</h3>

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

		<section class="container container-units-list">

			<!-- <h3>2. Learn more</h3> -->

			<ol class="units-list js_units_list"></ol>

		</section>

		<section class="container section-unit-info">

			<div class="unit-info js_unit_info"></div>

			<form class="unit-mods js_unit_mods">
				<div class="js_unit_mod hidden">
					<label>
						<span>Discount:</span>
						<input class="js_rate_per_sqft_discount" type="number" name="enquiry-discount">
					</label>
				</div>
				<div class="js_unit_mod js_mod_toggle_collapsable_bedroom_wall hidden">
					<label>
						<span>Collapsible Third Bedroom</span>
						<input type="checkbox" name="enquiry-mods">
					</label>
				</div>
				<div class="js_unit_mod js_mod_toggle_living_dining_room_swap hidden">
					<label>
						<span>Living Dining Swap</span>
						<input type="checkbox" name="enquiry-mods">
					</label>
				</div>
				<div class="js_unit_mod hidden">
					<label>
						<span>Multi-purpose Space</span>
						<select name="enquiry-mods">
							<option value="e">Open</option>
							<option class="js_mod_toggle_pooja_room" value="f">Pooja Room</option>
							<option class="js_mod_toggle_store_room" value="g">Store Room</option>
						</select>
					</label>
				</div>
			</form>

		</section>

		<!-- Section: Enquiry Form -->
		<section class="container container-enquiry-form">

			<h3>2. Get a Pricing Sheet</h3>

			<form class="lead-query-form js_lead_query_form">

				<label for="form-enquiry-phone">Please enter your phone number:</label>
				<input id="form-enquiry-phone" type="text" name="enquiry-phone">
				<button type="submit">Go</button>

				<div class="loading-indicator la-pacman hidden js_loading_indicator js_lead_fetch"><div></div><div></div><div></div><div></div><div></div><div></div></div>

			</form>

			<form class="enquiry-form js_enquiry_form">

				<label for="form-enquiry-name">Name:</label>
				<input id="form-enquiry-name" type="text" name="enquiry-name">
				<br>

				<label for="form-enquiry-email">Email:</label>
				<input id="form-enquiry-email" type="email" name="enquiry-email">
				<br>

				<label for="form-enquiry-unit">Unit:</label>
				<input id="form-enquiry-unit" type="text" name="enquiry-unit">
				<br>

				<br>
				<label for="form-enquiry-user">User:</label>
				<select id="form-enquiry-user" name="enquiry-user">
					<option value="customer">customer</option>
					<option value="executive">executive</option>
				</select>

				<br>
				<button type="submit">Send</button>

				<div class="loading-indicator la-pacman hidden js_loading_indicator js_lead_fetch"><div></div><div></div><div></div><div></div><div></div><div></div></div>

			</form>

		</section>

	</div> <!-- END : Page Content -->


	<!-- Lazaro Signature -->
	<?php lazaro_signature(); ?>
	<!-- END : Lazaro Signature -->

</div><!-- END : Page Wrapper -->







<!-- Templates -->

<script type="template" class="js_template_unit">
	<li data-unit="{{ Unit }}" class="unit-list-item js_unit_view">
		<span>{{ Unit }}</span>
		<span>{{ Floor }} floor</span>
		<span>{{ Sft }} sqft</span>
	</li>
</script>

<script type="template" class="js_template_floor_availability">
	<option value="{{ floor }}" {{ attrs }}>
		{{ floor }} ({{ available }})
	</option>
</script>

<template type="template" class="js_template_unit_information">
	<h3>#{{ unit }}</h3>
	<br>

	<h4>Specs</h4>
	<div>{{ bhk }} BHK</div>
	<div>{{ floor }} floor</div>
	<div>Super Built-up Area: {{ sft }} sqft</div>
	<div>Garden / Terrace Area: {{ gardenterrace }} sqft</div>
	<div>Corner Flat: {{ corner_flat }}</div>
	<div>Car Park: {{ carpark_type }}</div>

	<h4>Costs</h4>
	<div>Rate per sqft: ₹{{ discounted_rate | INR }}</div>
	<div>Basic cost: ₹{{ basiccost | INR }}</div>
	<div>Car park: ₹{{ carkpark | INR }}</div>
	<div>Basic cost including car park: ₹{{ basiccost_carpark | INR }}</div>
	<div>Garden / Terrace: ₹{{ gardenterrace_charge | INR }}</div>
	<div>Floor rise: ₹{{ floorise_charge | INR }}</div>
	<div>Corner flat charge: ₹{{ cornerflat_charge | INR }}</div>
	<div>Maintenance charges: ₹{{ maintenance_charges | INR }}</div>
	<div>Statutory deposit: ₹{{ statutory_deposit | INR }}</div>
	<div>Generator and STP: ₹{{ generator_stp | INR }}</div>
	<div>Club membership: ₹{{ club_membership | INR }}</div>
	<div>Legal charges: ₹{{ legal_charges | INR }}</div>
	<div>Gross Total: ₹{{ total_gross | INR }}</div>
	<div>GST: ₹{{ gst | INR }}</div>
	<div>Grand Total: ₹{{ total_grand | INR }}</div>
</template>

<!-- END: Templates -->









<script type="text/javascript" src="js/modules/util.js"></script>
<script type="text/javascript" src="plugins/Omega/SheetJS/xlsx-core-v0.12.4.min.js"></script>
<!-- <script type="text/javascript" src="plugins/Omega/FormulaParser/formula-parser-v2.3.2.min.js"></script> -->
<script type="text/javascript" src="plugins/Omega/xlsx-calc/xlsx-calc-v20170729.min.js"></script>
<script type="text/javascript" src="plugins/Omega/pricing-engine.js"></script>



</body>

</html>
