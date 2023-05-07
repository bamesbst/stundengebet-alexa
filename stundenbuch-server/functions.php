<?php

function loadIdHtml($id) {
	$a = file_get_contents('https://dli.institute/kalender/getpericope.php?id=' . $id . '&count=on&break=off');
	$b = html_entity_decode($a);
	
	// Return
	return $b;
}

function parsePsalm($text) {
    $array = array(); // Initialize array for the text elements

	// Find all <font> elements inside the table
	preg_match_all('/<font[^>]*>(.*?)<\/font>/', $text, $matches);

	// Concatenate the text of all <font> elements to create a single string
	$merged_text = implode('', $matches[1]);

    //Replace the + symbols by † symbols
    $merged_text = str_replace("+", "†", $merged_text);

	// Split the concatenated string into separate elements using the separator "<br/><br/>"
	$parts = explode('<br/><br/>', $merged_text);

	// Create an array that contains the number of elements and the individual elements. Remove any line breaks from the elements
	$array[0] = count($parts);
    $array[1] = preg_replace('/<br\s*\/?>/', '', $parts);
	
	// Return
	return $array;
}

function parseReading($text) {
    $combined_text = ""; // Initialize combined text with an empty string

    // Find all <text> elements and combine the text
    preg_match_all('/<text>(.*?)<\/text>/', $text, $matches);
    foreach ($matches[1] as $match) {
        $combined_text .= $match . " "; // Add the text and a space to the combined text
    }

    // Return
    return $combined_text;
}

function parseResponsorium($text) {
    $split_text = array(); // Initialize array for the split text
    $split_text2 = array(); // Initialize array for the second split text

    // Find the text inside the <text> element
    preg_match('/<text>(.*?)<\/text>/', $text, $match);
    $match_text = $match[1]; // Extract the text from the match

    // Remove the "R " section at the beginning
    $match_text = preg_replace('/^R\s+/', '', $match_text);

    // Split the text with " - R V " as the separator and fill the array
    $split_text = explode(" - R V ", $match_text);

    // Remove the " Ehre sei dem Vater. - R" section at the end of the second array element
    $split_text[1] = preg_replace('/\s+Ehre\s+sei\s+dem\s+Vater\.\s+-\s+R\s*$/', '', $split_text[1]);

    // Check for incomplete Responsorium (e.g. Halleluja-Responsorium)
    if ($split_text[1] === "") {
        //$split_text[1] = $split_text[0]; //-> In this case, the Responsorium should only be repeated one time.
        $split_text[1] = "";
        $split_text[2] = "";
    } else {
        // Split the second part of the Responsorium
        $split_text2 = explode('*', $split_text[1]);
        $split_text[1] = $split_text2[0];
        $split_text[2] = trim($split_text2[1]);
    }

    // Return
    return $split_text;
}

function parseIntercessions($text) {
    $array = array(); // Initialize array for the text elements

    // Find all <text> elements
    preg_match_all('/<text>(.*?)<\/text>/', $text, $matches);
    $match_texts = $matches[1]; // Extract all text elements

    $count = 0; // Initialize counter for element count
    $array[0] = 0; // Prepare the first element for the counter value.

    // Add the first text element without modification
    $array[1] = $match_texts[0];

    // Add the second element with removing "R " at the beginning
    if (strpos($match_texts[1], "R ") === 0) {
        $match_texts[1] = substr($match_texts[1], 2); // Remove "R " at the beginning
    }
    $array[2] = $match_texts[1];

    // Loop through the remaining text elements and add them modified if applicable
    for ($i = 2; $i < count($match_texts) - 2; $i++) {
        $match_text = $match_texts[$i];
        if (strpos($match_text, " N. ") === false) {
            if (strpos($match_text, "R ") === 0) {
                $match_text = substr($match_text, 2); // Remove "R " at the beginning
            }
            $array[3][] = $match_text;
            $count++;
        }
    }

    $array[0] = $count; // Add the element count at the end of the array

    // Return
    return $array;
}

function parseHymnus($text) {
    $array = array(); // Initialize array for the text elements
    $array[] = ""; // Prepare the first element for the full text

    // Find all <text> elements
    preg_match_all('/<text>(.*?)<\/text>/', $text, $matches);
    $match_texts = $matches[1]; // Extract all text elements

    // Write the full text in Element 0
    foreach ($match_texts as $match_text) {
        $array[0] = $array[0] . $match_text . " ";
    }

    // Write text party in Element 1
    $array[] = $match_texts;

    // Return
    return $array;
}

function parseText($text) {
    // Find the text inside the <text> element
    preg_match('/<text>(.*?)<\/text>/', $text, $match);
    $match_text = $match[1]; // Extract the text from the match

    // Return
    return $match_text;
}