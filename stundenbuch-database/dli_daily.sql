-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: 10.35.249.157:3306
-- Erstellungszeit: 21. Dez 2022 um 03:06
-- Server-Version: 8.0.30
-- PHP-Version: 7.4.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `k47082_mag1_alexa`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `dli_daily`
--

CREATE TABLE IF NOT EXISTS `dli_daily` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `week` int NOT NULL,
  `day_lit` varchar(1500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Liturgischer Tag',
  `day_stb` varchar(500) NOT NULL COMMENT 'Texte Stundenbuch',
  `area_lit` varchar(500) NOT NULL COMMENT 'Liturgie Bereich',
  `title_festive` varchar(500) NOT NULL,
  `lit_lecture1` int NOT NULL,
  `lit_lecture2` int NOT NULL,
  `lit_ps` int NOT NULL,
  `lit_gospel` int NOT NULL,
  `lit_comment` varchar(1500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'Liturgische Informationen',
  `stb_readings_hymnus` int NOT NULL,
  `stb_readings_ant1` int NOT NULL,
  `stb_readings_ps1` int NOT NULL,
  `stb_readings_ps1_text` varchar(300) NOT NULL,
  `stb_readings_ant2` int NOT NULL,
  `stb_readings_ps2` int NOT NULL,
  `stb_readings_ps2_text` varchar(300) NOT NULL,
  `stb_readings_ant3` int NOT NULL,
  `stb_readings_ps3` int NOT NULL,
  `stb_readings_ps3_text` varchar(300) NOT NULL,
  `stb_readings_versikel` int NOT NULL,
  `stb_readings_l1` int NOT NULL,
  `stb_readings_resp1` int NOT NULL,
  `stb_readings_l2` int NOT NULL,
  `stb_readings_resp2` int NOT NULL,
  `stb_readings_tedeum` int NOT NULL,
  `stb_readings_oration` int NOT NULL,
  `stb_inv_ant` int NOT NULL,
  `stb_inv_ps` int NOT NULL,
  `stb_lauds_hymnus` int NOT NULL,
  `stb_lauds_ant1` int NOT NULL,
  `stb_lauds_ps1` int NOT NULL,
  `stb_lauds_ps1_text` varchar(300) NOT NULL,
  `stb_lauds_ant2` int NOT NULL,
  `stb_lauds_ps2` int NOT NULL,
  `stb_lauds_ps2_text` varchar(300) NOT NULL,
  `stb_lauds_ant3` int NOT NULL,
  `stb_lauds_ps3` int NOT NULL,
  `stb_lauds_ps3_text` varchar(300) NOT NULL,
  `stb_lauds_l` int NOT NULL,
  `stb_lauds_l_text` varchar(300) NOT NULL,
  `stb_lauds_resp` int NOT NULL,
  `stb_lauds_antc` int NOT NULL,
  `stb_lauds_canticum` int NOT NULL,
  `stb_lauds_canticum_text` varchar(300) NOT NULL,
  `stb_lauds_intercessions` int NOT NULL,
  `stb_lauds_oration` int NOT NULL,
  `stb_vespers_hymnus` int NOT NULL,
  `stb_vespers_ant1` int NOT NULL,
  `stb_vespers_ps1` int NOT NULL,
  `stb_vespers_ps1_text` varchar(300) NOT NULL,
  `stb_vespers_ant2` int NOT NULL,
  `stb_vespers_ps2` int NOT NULL,
  `stb_vespers_ps2_text` varchar(300) NOT NULL,
  `stb_vespers_ant3` int NOT NULL,
  `stb_vespers_ps3` int NOT NULL,
  `stb_vespers_ps3_text` varchar(300) NOT NULL,
  `stb_vespers_l` int NOT NULL,
  `stb_vespers_l_text` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `stb_vespers_resp` int NOT NULL,
  `stb_vespers_antcanticum` int NOT NULL,
  `stb_vespers_canticum` int NOT NULL,
  `stb_vespers_canticum_text` varchar(300) NOT NULL,
  `stb_vespers_intercessions` int NOT NULL,
  `stb_vespers_oration` int NOT NULL,
  `stb_3_hymnus` int NOT NULL,
  `stb_3_ant1` int NOT NULL,
  `stb_3_ps1` int NOT NULL,
  `stb_3_ps1_text` varchar(300) NOT NULL,
  `stb_3_ant2` int NOT NULL,
  `stb_3_ps2` int NOT NULL,
  `stb_3_ps2_text` varchar(300) NOT NULL,
  `stb_3_ant3` int NOT NULL,
  `stb_3_ps3` int NOT NULL,
  `stb_3_ps3_text` varchar(300) NOT NULL,
  `stb_3_l` int NOT NULL,
  `stb_3_l_text` varchar(300) NOT NULL,
  `stb_3_resp` int NOT NULL,
  `stb_3_oration` int NOT NULL,
  `stb_6_hymnus` int NOT NULL,
  `stb_6_ant1` int NOT NULL,
  `stb_6_ps1` int NOT NULL,
  `stb_6_ps1_text` varchar(300) NOT NULL,
  `stb_6_ant2` int NOT NULL,
  `stb_6_ps2` int NOT NULL,
  `stb_6_ps2_text` varchar(300) NOT NULL,
  `stb_6_ant3` int NOT NULL,
  `stb_6_ps3` int NOT NULL,
  `stb_6_ps3_text` varchar(300) NOT NULL,
  `stb_6_l` int NOT NULL,
  `stb_6_l_text` varchar(300) NOT NULL,
  `stb_6_resp` int NOT NULL,
  `stb_6_oration` int NOT NULL,
  `stb_9_hymnus` int NOT NULL,
  `stb_9_ant1` int NOT NULL,
  `stb_9_ps1` int NOT NULL,
  `stb_9_ps1_text` varchar(300) NOT NULL,
  `stb_9_ant2` int NOT NULL,
  `stb_9_ps2` int NOT NULL,
  `stb_9_ps2_text` varchar(300) NOT NULL,
  `stb_9_ant3` int NOT NULL,
  `stb_9_ps3` int NOT NULL,
  `stb_9_ps3_text` varchar(300) NOT NULL,
  `stb_9_l` int NOT NULL,
  `stb_9_l_text` varchar(300) NOT NULL,
  `stb_9_resp` int NOT NULL,
  `stb_9_oration` int NOT NULL,
  `stb_compline_exa` int NOT NULL,
  `stb_compline_req` int NOT NULL,
  `stb_compline_hymnus` int NOT NULL,
  `stb_compline_ant1` int NOT NULL,
  `stb_compline_ps1` int NOT NULL,
  `stb_compline_ps1_text` varchar(300) NOT NULL,
  `stb_compline_ant2` int NOT NULL,
  `stb_compline_ps2` int NOT NULL,
  `stb_compline_ps2_text` varchar(300) NOT NULL,
  `stb_compline_ant3` int NOT NULL,
  `stb_compline_ps3` int NOT NULL,
  `stb_compline_ps3_text` varchar(300) NOT NULL,
  `stb_compline_l` int NOT NULL,
  `stb_compline_l_text` varchar(300) NOT NULL,
  `stb_compline_resp` int NOT NULL,
  `stb_compline_antcanticum` int NOT NULL,
  `stb_compline_canticum` int NOT NULL,
  `stb_compline_canticum_text` varchar(300) NOT NULL,
  `stb_compline_oration` int NOT NULL,
  `stb_compline_marian` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
