<?php

extract( $_REQUEST );

?>

<?php foreach ( $floorAvailabilityList as $currentFloor ) : ?>
	<option value="<?php echo $currentFloor[ 'floor' ] ?>" <?php echo $currentFloor[ 'attrs' ] ?>>
		<?php echo $currentFloor[ 'floor' ] ?> (<?php echo $currentFloor[ 'available' ] ?>)
	</option>
<?php endforeach; ?>
