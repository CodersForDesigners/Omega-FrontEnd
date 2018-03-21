<?php

extract( $_REQUEST );

?>

<?php if ( empty( $units ) ) : ?>
	<h3>No units found. :(</h3>
<?php else : ?>
	<?php foreach ( $units as $unit ) : ?>
		<li data-unit="<?php echo $unit[ 'Unit' ] ?>" class="unit-list-item js_unit_view">
			<span><?php echo $unit[ 'Unit' ] ?></span>
			<span><?php echo $unit[ 'Floor' ] ?> floor</span>
			<span><?php echo $unit[ 'Sft' ] ?> sqft</span>
		</li>
	<?php endforeach; ?>
<?php endif; ?>
