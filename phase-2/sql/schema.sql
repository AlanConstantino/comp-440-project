-- Before execute the file, ADD your database name here:
-- The database name should be the same as your database of your user table from step 1
use `comp440`; 

-- had to add this or else it'll throw a foreign key dependency error
SET FOREIGN_KEY_CHECKS = 0;
drop table if exists comment;
drop table if exists blog;
SET FOREIGN_KEY_CHECKS = 1;

-- Table structure for user
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `firstName` varchar(45) NOT NULL,
  `lastName` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`idUser`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `userID_UNIQUE` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for tag
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
  `idtag` int NOT NULL AUTO_INCREMENT,
  `tagName` varchar(45) NOT NULL,
  PRIMARY KEY (`idtag`),
  UNIQUE KEY `idtags_UNIQUE` (`idtag`),
  UNIQUE KEY `tagName_UNIQUE` (`tagName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for comment
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `idComment` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `date` datetime NOT NULL,
  `description` varchar(100) NOT NULL,
  `rate` int NOT NULL,
  PRIMARY KEY (`idComment`),
  UNIQUE KEY `idcomment_UNIQUE` (`idComment`),
  KEY `fk_userID_idx` (`idUser`),
  CONSTRAINT `fk_userID` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for blog
DROP TABLE IF EXISTS `blog`;
CREATE TABLE `blog` (
  `idBlog` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `idComment` int NOT NULL,
  `idTag` int NOT NULL,
  `subject` varchar(45) NOT NULL,
  `description` varchar(45) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`idBlog`),
  UNIQUE KEY `idBlog_UNIQUE` (`idBlog`),
  KEY `fk_idUser_idx` (`idUser`),
  KEY `fk_idComment_idx` (`idComment`),
  KEY `fk_idTag_idx` (`idTag`),
  CONSTRAINT `fk_idComment` FOREIGN KEY (`idComment`) REFERENCES `comment` (`idComment`),
  CONSTRAINT `fk_idTag` FOREIGN KEY (`idTag`) REFERENCES `tag` (`idtag`),
  CONSTRAINT `fk_idUser` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;