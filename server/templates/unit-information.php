<?php

require_once '../lib/util.php';

extract( $_REQUEST );

?>

<h3>#<?php echo $unit ?></h3>
<br>

<h4>Specs</h4>
<div><?php echo $bhk ?> BHK</div>
<div><?php echo $floor ?> floor</div>
<div>Super Built-up Area: <?php echo $sft ?> sqft</div>
<div>Garden / Terrace Area: <?php echo $gardenterrace ?> sqft</div>
<div>Corner Flat: <?php echo $corner_flat ? 'Yes' : 'No' ?></div>
<div>Car Park: <?php echo $carpark_type == 'c' ? 'covered' : 'semi-covered' ?></div>

<h4>Costs</h4>
<div>Rate per sqft: ₹<?php echo Util\formatToINR( $discounted_rate ) ?></div>
<div>Basic cost: ₹<?php echo Util\formatToINR( $basiccost ) ?></div>
<div>Car park: ₹<?php echo Util\formatToINR( $carkpark ) ?></div>
<div>Basic cost including car park: ₹<?php echo Util\formatToINR( $basiccost_carpark ) ?></div>
<div>Garden / Terrace: ₹<?php echo Util\formatToINR( $gardenterrace_charge ) ?></div>
<div>Floor rise: ₹<?php echo Util\formatToINR( $floorise_charge ) ?></div>
<div>Corner flat charge: ₹<?php echo Util\formatToINR( $cornerflat_charge ) ?></div>
<div>Maintenance charges: ₹<?php echo Util\formatToINR( $maintenance_charges ) ?></div>
<div>Statutory deposit: ₹<?php echo Util\formatToINR( $statutory_deposit ) ?></div>
<div>Generator and STP: ₹<?php echo Util\formatToINR( $generator_stp ) ?></div>
<div>Club membership: ₹<?php echo Util\formatToINR( $club_membership ) ?></div>
<div>Legal charges: ₹<?php echo Util\formatToINR( $legal_charges ) ?></div>
<div>Gross Total: ₹<?php echo Util\formatToINR( $total_gross ) ?></div>
<div>GST: ₹<?php echo Util\formatToINR( $gst ) ?></div>
<div>Grand Total: ₹<?php echo Util\formatToINR( $total_grand ) ?></div>

<h4>Modifications</h4>
<div class="unit-mods js_unit_mods">
	<?php if ( $Mod_Toggle_A ) : ?>
		<div class="js_unit_mod js_mod_toggle_collapsable_bedroom_wall">
			<label>
				<input type="checkbox" name="enquiry-mods" <?php if ( $collapsibleBedroomWall == 'true' ) echo 'checked'; ?>>
				<span>Collapsible Third Bedroom</span>
				<span>: ₹<?php echo Util\formatToINR( $mod_collapsable_bedroom_wall ?? 0 ) ?></span>
			</label>
		</div>
	<?php endif; ?>
	<?php if ( $Mod_Toggle_B ) : ?>
		<div class="js_unit_mod js_mod_toggle_living_dining_room_swap">
			<label>
				<input type="checkbox" name="enquiry-mods" <?php if ( $livingDiningSwap == 'true' ) echo 'checked'; ?>>
				<span>Living Dining Swap</span>
				<span>: ₹<?php echo Util\formatToINR( $mod_living_dining_room_swap ?? 0 ) ?></span>
			</label>
		</div>
	<?php endif; ?>
	<?php if ( $Mod_Toggle_C || $Mod_Toggle_D ) : ?>
		<div class="js_unit_mod js_multipurpose_space">
			<label>
				<span>Multi-purpose Space</span>
				<select name="enquiry-mods">
					<option value="open">Open</option>
					<?php if ( $Mod_Toggle_C ) : ?>
						<option class="js_mod_toggle_pooja_room" value="pooja room" <?php if ( $poojaRoom == 'true' ) echo 'selected'; ?>>Pooja Room</option>
					<?php endif; ?>
					<?php if ( $Mod_Toggle_D ) : ?>
						<option class="js_mod_toggle_store_room" value="store room" <?php if ( $storeRoom == 'true' ) echo 'selected'; ?>>Store Room</option>
					<?php endif; ?>
				</select>
				<span>
					<?php if ( $mod_pooja_room ) : ?>
						: ₹<?php echo Util\formatToINR( $mod_pooja_room ) ?>
					<?php elseif ( $mod_store_room ) : ?>
						: ₹<?php echo Util\formatToINR( $mod_store_room ) ?>
					<?php else : ?>
						: ₹0
					<?php endif; ?>
				</span>
			</label>
		</div>
	<?php endif; ?>
	<?php if ( $Mod_Toggle_E ) : ?>
		<div class="js_unit_mod js_mod_car_park_switch">
			<label>
				<input type="checkbox" name="enquiry-mods" <?php if ( $carParkSwitch == 'true' ) echo 'checked'; ?>>
				<?php if ( $carpark_type == 'sc' ) : ?>
					<span>Upgrade to a Covered Car-Park</span>
				<?php else : ?>
					<span>Downgrade to a Semi-Covered Car-Park</span>
				<?php endif; ?>
				<span>: ₹<?php echo Util\formatToINR( $carpark_premium_bonus ?? 0 ) ?></span>
			</label>
		</div>
	<?php endif; ?>
</div>
<form class="js_unit_discount">
	<label>
		<span>Discount:</span>
		<input class="js_rate_per_sqft_discount" type="text" name="enquiry-discount" value="<?php echo $discount ?>">
	</label>
	<button type="submit">Go</button>
</form>
