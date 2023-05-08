<html>

<!-- Halleluja -->
<?php
$text = "";
if ( count(explode("Aschermittwoch", $lit_comment)) > 1 || count(explode("Fastenzeit", $lit_comment)) > 1 || count(explode("Karwoche", $lit_comment)) > 1  || count(explode("Fastenzeit", $area_lit)) > 1 ){
    $text = "";
} else {
    $text = ". Halleluja.";
}
?>
<halleluja><?php echo $text; ?></halleluja>


<!-- Hymnus -->
<?php
$text = loadIdHtml($stb_lauds_hymnus);
$parsed = parseHymnus($text);
?>
<hymnus_full><?php echo $parsed[0]; ?></hymnus_full>
<?php
foreach ($parsed[1] as $item) {
    ?>
<hymnus_item><?php echo $item; ?></hymnus_item>
<?php
}
unset($item);
?>


<!-- Psalm 1 Antiphon -->
<?php
$text = loadIdHtml($stb_lauds_ant1);
$parsed = parseText($text);
?>
<ant1><?php echo $parsed; ?></ant1>
<!-- Psalm 1 Title -->
<ps1-title><?php echo $stb_lauds_ps1_text; ?></ps1-title>
<!-- Psalm 1 Text -->
<?php
$text = loadIdHtml($stb_lauds_ps1);
$parsed = parsePsalm($text);
?>
<?php
foreach ($parsed[1] as $item) {
    ?>
<ps1><?php echo $item; ?></ps1>
<?php
}
unset($item);
?>
<ps1>Ehre sei dem Vater und dem Sohn * und dem heiligen Geist.</ps1>
<ps1>Wie im Anfang so auch jetzt und alle Zeit * und in Ewigkeit. Amen.</ps1>
<ps1-length><?php echo $parsed[0]; ?></ps1-length>


<!-- Psalm 2 Antiphon -->
<?php
$text = loadIdHtml($stb_lauds_ant2);
$parsed = parseText($text);
?>
<ant2><?php echo $parsed; ?></ant2>
<!-- Psalm 2 Title -->
<ps2-title><?php echo $stb_lauds_ps2_text; ?></ps2-title>
<!-- Psalm 2 Text -->
<?php
$text = loadIdHtml($stb_lauds_ps2);
$parsed = parsePsalm($text);
?>
<?php
foreach ($parsed[1] as $item) {
    ?>
<ps2><?php echo $item; ?></ps2>
<?php
}
unset($item);
?>
<ps2>Ehre sei dem Vater und dem Sohn * und dem heiligen Geist.</ps2>
<ps2>Wie im Anfang so auch jetzt und alle Zeit * und in Ewigkeit. Amen.</ps2>
<ps2-length><?php echo $parsed[0]; ?></ps2-length>


<!-- Psalm 3 Antiphon -->
<?php
$text = loadIdHtml($stb_lauds_ant3);
$parsed = parseText($text);
?>
<ant3><?php echo $parsed; ?></ant3>
<!-- Psalm 3 Title -->
<ps3-title><?php echo $stb_lauds_ps3_text; ?></ps3-title>
<!-- Psalm 3 Text -->
<?php
$text = loadIdHtml($stb_lauds_ps3);
$parsed = parsePsalm($text);
?>
<?php
foreach ($parsed[1] as $item) {
    ?>
<ps3><?php echo $item; ?></ps3>
<?php
}
unset($item);
?>
<ps3>Ehre sei dem Vater und dem Sohn * und dem heiligen Geist.</ps3>
<ps3>Wie im Anfang so auch jetzt und alle Zeit * und in Ewigkeit. Amen.</ps3>
<ps3-length><?php echo $parsed[0]; ?></ps3-length>


<!-- Reading -->
<reading-title><?php echo $stb_lauds_l_text; ?></reading-title>
<?php
$text = loadIdHtml($stb_lauds_l);
$parsed = parseReading($text);
?>
<reading><?php echo $parsed; ?></reading>


<!-- Responsorium -->
<?php
$text = loadIdHtml($stb_lauds_resp);
$parsed = parseResponsorium($text);
?>
<resp1><?php echo $parsed[0]; ?></resp1>
<resp2><?php echo $parsed[1]; ?></resp2>
<resp3><?php echo $parsed[2]; ?></resp3>


<!-- Canticum Antiphon -->
<?php
$text = loadIdHtml($stb_lauds_antc);
$parsed = parseText($text);
?>
<antC><?php echo $parsed; ?></antC>
<!-- Canticum Title -->
<c-title><?php echo $stb_lauds_canticum_text; ?></c-title>
<!-- Canticum Text -->
<?php
$text = loadIdHtml($stb_lauds_canticum);
$parsed = parsePsalm($text);
?>
<?php
foreach ($parsed[1] as $item) {
    ?>
<c><?php echo $item; ?></c>
<?php
}
unset($item);
?>
<c-length><?php echo $parsed[0]; ?></c-length>


<!-- Intercessions -->
<?php
$text = loadIdHtml($stb_lauds_intercessions);
$parsed = parseIntercessions($text);
?>
<ic-prayer><?php echo $parsed[1]; ?></ic-prayer>
<ic-response><?php echo $parsed[2]; ?></ic-response>
<?php
foreach ($parsed[3] as $item) {
?>
<ic><?php echo $item; ?></ic>
<?php
}
unset($item);
?>
<ic-length><?php echo $parsed[0]; ?></ic-length>


<!-- Oration -->
<?php
$text = loadIdHtml($stb_lauds_oration);
$parsed = parseText($text);
?>
<oration><?php echo $parsed; ?></oration>


</html>