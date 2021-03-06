-- Before execute the file, ADD your database name here:
-- The database name should be the same as your database of your user table from step 1
use `comp440`; 

-- had to add this or else it'll throw a foreign key dependency error
SET FOREIGN_KEY_CHECKS = 0;
drop table if exists department;
drop table if exists course;
drop table if exists instructor;
SET FOREIGN_KEY_CHECKS = 1;

--
-- Table structure for table `department`
--
DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `dept_name` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `building` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`dept_name`),
  CONSTRAINT `department_chk_1` CHECK ((`budget` > 0))
);
--
-- Dumping data for table `department`
--
INSERT INTO `department` VALUES ('Accounting','Saucon',441840.92),('Astronomy','Taylor',617253.94),('Athletics','Bronfman',734550.70),('Biology','Candlestick',647610.55),('Civil Eng.','Chandler',255041.46),('Comp. Sci.','Lamberton',106378.69),('Cybernetics','Mercer',794541.46),('Elec. Eng.','Main',276527.61),('English','Palmer',611042.66),('Finance','Candlestick',866831.75),('Geology','Palmer',406557.93),('History','Taylor',699140.86),('Languages','Linderman',601283.60),('Marketing','Lambeau',210627.58),('Math','Brodhead',777605.11),('Mech. Eng.','Rauch',520350.65),('Physics','Wrigley',942162.76),('Pol. Sci.','Whitman',573745.09),('Psychology','Thompson',848175.04),('Statistics','Taylor',395051.74);

--
-- Table structure for table `course`
--
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `course_id` varchar(8) COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `dept_name` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `credits` decimal(2,0) DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `dept_name` (`dept_name`),
  CONSTRAINT `course_ibfk_1` FOREIGN KEY (`dept_name`) REFERENCES `department` (`dept_name`) ON DELETE SET NULL,
  CONSTRAINT `course_chk_1` CHECK ((`credits` > 0))
);
--
-- Dumping data for table `course`
--
INSERT INTO `course` VALUES ('101','Diffusion and Phase Transformation','Mech. Eng.',4),('105','Image Processing','Astronomy',4),('123','Differential Equations','Mech. Eng.',4),('127','Thermodynamics','Geology',4),('130','Differential Geometry','Physics',4),('133','Antidisestablishmentarianism in Modern America','Biology',5),('137','Manufacturing','Finance',4),('139','Number Theory','English',5),('158','Elastic Structures','Cybernetics',4),('169','Marine Mammals','Elec. Eng.',4),('190','Romantic Literature','Civil Eng.',4),('192','Drama','Languages',5),('195','Numerical Methods','Geology',5),('200','The Music of the Ramones','Accounting',5),('209','International Trade','Cybernetics',5),('224','International Finance','Athletics',4),('227','Elastic Structures','Languages',5),('235','International Trade','Math',4),('236','Design and Analysis of Algorithms','Mech. Eng.',4),('237','Surfing','Cybernetics',4),('238','The Music of Donovan','Mech. Eng.',4),('239','The Music of the Ramones','Physics',5),('241','Biostatistics','Geology',4),('242','Rock and Roll','Marketing',4),('254','Security','Cybernetics',4),('258','Colloid and Surface Chemistry','Math',4),('265','Thermal Physics','Cybernetics',5),('267','Hydraulics','Physics',5),('270','Music of the 90s','Math',5),('272','Geology','Mech. Eng.',4),('274','Corporate Law','Comp. Sci.',5),('275','Romantic Literature','Languages',4),('276','Game Design','Comp. Sci.',5),('278','Greek Tragedy','Statistics',5),('284','Topology','Comp. Sci.',5),('292','Electron Microscopy','English',5),('304','Music 2 New for your Instructor','Finance',5),('313','International Trade','Marketing',7),('318','Geology','Cybernetics',4),('319','World History','Finance',5),('324','Ponzi Schemes','Civil Eng.',4),('328','Composition and Literature','Cybernetics',4),('334','International Trade','Athletics',4),('337','Differential Geometry','Statistics',4),('338','Graph Theory','Psychology',4),('340','Corporate Law','History',4),('341','Quantum Mechanics','Cybernetics',4),('344','Quantum Mechanics','Accounting',5),('345','Race Car Driving','Accounting',5),('348','Compiler Design','Elec. Eng.',4),('349','Networking','Finance',5),('352','Compiler Design','Psychology',5),('353','Operating Systems','Psychology',4),('359','Game Programming','Comp. Sci.',5),('362','Embedded Systems','Finance',5),('366','Computational Biology','English',4),('371','Milton','Finance',4),('376','Cost Accounting','Physics',5),('377','Differential Geometry','Astronomy',5),('391','Virology','Biology',4),('392','Recursive Function Theory','Astronomy',5),('393','Aerodynamics','Languages',4),('394','C  Programming','Athletics',4),('396','C  Programming','Languages',4),('399','RPG Programming','Pol. Sci.',5),('400','Visual BASIC','Psychology',5),('401','Sanitary Engineering','Athletics',5),('403','Immunology','Biology',4),('407','Industrial Organization','Languages',5),('408','Bankruptcy','Accounting',4),('411','Music of the 80s','Mech. Eng.',5),('415','Numerical Methods','Biology',7),('416','Data Mining','Accounting',4),('421','Aquatic Chemistry','Athletics',5),('426','Video Gaming','Finance',4),('436','Stream Processing','Physics',5),('442','Strength of Materials','Athletics',4),('443','Journalism','Physics',5),('445','Biostatistics','Finance',4),('451','Database System Concepts','Pol. Sci.',5),('456','Hebrew','Civil Eng.',4),('457','Systems Software','History',4),('458','The Renaissance','Civil Eng.',5),('461','Physical Chemistry','Math',4),('468','Fractal Geometry','Civil Eng.',5),('476','International Communication','Astronomy',8),('482','FOCAL Programming','Psychology',5),('486','Accounting','Geology',4),('487','Physical Chemistry','History',4),('489','Journalism','Astronomy',5),('493','Music of the 50s','Geology',4),('494','Automobile Mechanics','Pol. Sci.',5),('496','Aquatic Chemistry','Cybernetics',4),('500','Networking','Astronomy',4),('527','Graphics','Finance',4),('539','International Finance','Comp. Sci.',4),('544','Differential Geometry','Statistics',4),('545','International Practicum','History',4),('546','Creative Writing','Mech. Eng.',5),('549','Banking and Finance','Astronomy',4),('558','Environmental Law','Psychology',4),('559','Martian History','Biology',4),('561','The Music of Donovan','Elec. Eng.',5),('571','Plastics','Comp. Sci.',5),('577','The Music of Dave Edmunds','Elec. Eng.',4),('580','The Music of Dave Edmunds','Physics',5),('581','Calculus','Pol. Sci.',5),('582','Marine Mammals','Cybernetics',4),('584','Computability Theory','Comp. Sci.',4),('586','Image Processing','Finance',5),('591','Shakespeare','Pol. Sci.',5),('594','Cognitive Psychology','Finance',4),('598','Number Theory','Accounting',5),('599','Mechanics','Psychology',5),('603','Care and Feeding of Cats','Statistics',4),('604','UNIX System Programmming','Statistics',5),('608','Electron Microscopy','Mech. Eng.',4),('612','Mobile Computing','Physics',4),('618','Thermodynamics','English',5),('626','Multimedia Design','History',5),('628','Existentialism','Accounting',4),('629','Finite Element Analysis','Cybernetics',4),('630','Religion','English',4),('631','Plasma Physics','Elec. Eng.',5),('634','Astronomy','Cybernetics',5),('642','Video Gaming','Psychology',4),('647','Service-Oriented Architectures','Comp. Sci.',5),('656','Groups and Rings','Civil Eng.',5),('659','Geology','Math',5),('663','Geology','Psychology',4),('664','Elastic Structures','English',4),('666','Multivariable Calculus','Accounting',4),('679','The Beatles','Math',4),('680','Electricity and Magnetism','Civil Eng.',4),('681','Medieval Civilization or Lack Thereof','English',4),('692','Cat Herding','Athletics',4),('694','Optics','Math',4),('696','Heat Transfer','Marketing',5),('702','Arabic','Biology',4),('704','Marine Mammals','Geology',5),('716','Medieval Civilization or Lack Thereof','Languages',5),('730','Quantum Mechanics','Elec. Eng.',5),('731','The Music of Donovan','Physics',5),('735','Greek Tragedy','Geology',4),('747','International Practicum','Comp. Sci.',5),('748','Tort Law','Cybernetics',5),('760','How to Groom your Cat','Accounting',4),('761','Existentialism','Athletics',4),('762','The Monkeys','History',5),('769','Logic','Elec. Eng.',5),('770','European History','Pol. Sci.',4),('774','Game Programming','Cybernetics',5),('780','Geology','Psychology',4),('781','Compiler Design','Finance',5),('787','C  Programming','Mech. Eng.',5),('791','Operating Systems','Marketing',4),('792','Image Processing','Accounting',4),('793','Decison Support Systems','Civil Eng.',4),('795','Death and Taxes','Marketing',4),('802','African History','Cybernetics',4),('804','Introduction to Burglary','Cybernetics',5),('805','Composition and Literature','Statistics',5),('808','Organic Chemistry','English',5),('810','Mobile Computing','Geology',4),('814','Compiler Design','Elec. Eng.',4),('818','Environmental Law','Astronomy',5),('820','Assembly Language Programming','Cybernetics',4),('830','Sensor Networks','Astronomy',5),('841','Fractal Geometry','Mech. Eng.',5),('843','Environmental Law','Math',8),('852','World History','Athletics',5),('857','UNIX System Programmming','Geology',5),('858','Sailing','Math',5),('864','Heat Transfer','Geology',4),('867','The IBM 360 Architecture','History',7),('875','Bioinformatics','Cybernetics',4),('877','Composition and Literature','Biology',5),('887','Latin','Mech. Eng.',4),('893','Systems Software','Cybernetics',4),('897','How to Succeed in Business Without Really Trying','Languages',5),('898','Petroleum Engineering','Marketing',5),('902','Existentialism','Finance',4),('919','Computability Theory','Math',4),('922','Microeconomics','Finance',5),('927','Differential Geometry','Cybernetics',5),('947','Real-Time Database Systems','Accounting',4),('949','Japanese','Comp. Sci.',4),('958','Fiction Writing','Mech. Eng.',4),('959','Bacteriology','Physics',5),('960','Tort Law','Civil Eng.',4),('962','Animal Behavior','Psychology',4),('963','Groups and Rings','Languages',5),('966','Sanitary Engineering','History',4),('969','The Monkeys','Astronomy',5),('972','Greek Tragedy','Psychology',5),('974','Astronautics','Accounting',4),('983','Virology','Languages',5),('984','Music of the 50s','History',4),('991','Transaction Processing','Psychology',4),('998','Immunology','Civil Eng.',5);

--
-- Table structure for table `instructor`
--
DROP TABLE IF EXISTS `instructor`;
CREATE TABLE `instructor` (
  `ID` varchar(5) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `dept_name` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `salary` decimal(8,2) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `dept_name` (`dept_name`),
  CONSTRAINT `instructor_ibfk_1` FOREIGN KEY (`dept_name`) REFERENCES `department` (`dept_name`) ON DELETE SET NULL,
  CONSTRAINT `instructor_chk_1` CHECK ((`salary` > 29000))
);
--
-- Dumping data for table `instructor`
--
INSERT INTO `instructor` VALUES ('14365','Lembr','Accounting',32241.56),('15347','Bawa','Athletics',72140.88),('19368','Wieland','Pol. Sci.',124651.41),('22591','DAgostino','Psychology',59706.49),('25946','Liley','Languages',90891.69),('28097','Kean','English',35023.18),('28400','Atanassov','Statistics',84982.92),('3199','Gustafsson','Elec. Eng.',82534.37),('3335','Bourrier','Comp. Sci.',80797.83),('34175','Bondi','Comp. Sci.',115469.11),('36897','Morris','Marketing',43770.36),('41930','Tung','Athletics',50482.03),('4233','Luo','English',88791.45),('42782','Vicentino','Elec. Eng.',34272.67),('43779','Romero','Astronomy',79070.08),('48507','Lent','Mech. Eng.',107978.47),('48570','Sarkar','Pol. Sci.',87549.80),('50330','Shuming','Physics',108011.81),('63287','Jaekel','Athletics',103146.87),('6569','Mingoz','Finance',105311.38),('65931','Pimenta','Cybernetics',79866.95),('73623','Sullivan','Elec. Eng.',90038.09),('74420','Voronina','Physics',121141.99),('77346','Mahmoud','Geology',99382.59),('79081','Ullman ','Accounting',47307.10),('80759','Queiroz','Biology',45538.32),('81991','Valtchev','Biology',77036.18),('90376','Bietzk','Cybernetics',117836.50),('90643','Choll','Statistics',57807.09),('95709','Sakurai','English',118143.98),('99052','Dale','Cybernetics',93348.83);