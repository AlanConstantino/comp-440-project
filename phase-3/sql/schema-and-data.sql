-- MySQL dump 10.13  Distrib 8.0.28, for macos11 (x86_64)
--
-- Host: 127.0.0.1    Database: comp440
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blog`
--
use `comp440`;
DROP TABLE IF EXISTS `blog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog` (
  `idBlog` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `subject` varchar(45) NOT NULL,
  `description` varchar(45) NOT NULL,
  `date` datetime NOT NULL,
  `rate` bigint NOT NULL,
  PRIMARY KEY (`idBlog`),
  UNIQUE KEY `idBlog_UNIQUE` (`idBlog`),
  KEY `fk_idUser_idx` (`idUser`),
  CONSTRAINT `fk_idUser` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog`
--

LOCK TABLES `blog` WRITE;
/*!40000 ALTER TABLE `blog` DISABLE KEYS */;
INSERT INTO `blog` VALUES (1,1,'a','s','2022-04-17 00:00:00',0),(18,1,'ss','ggsa','2022-04-17 00:00:00',0),(19,1,'ssffwwfgaw','12345','2022-04-17 00:00:00',-1),(20,1,'ssss','ssss','2022-04-18 00:00:00',2),(21,3,'My Subject','This is my description','2022-04-20 00:00:00',16),(22,5,'My Subject','My Description','2022-04-20 00:00:00',0),(23,1,'This is my subject','This is my totally important description!','2022-04-24 00:00:00',0),(24,12,'This is my first post!','Description important!','2022-04-24 00:00:00',0);
/*!40000 ALTER TABLE `blog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `idComment` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `date` datetime NOT NULL,
  `description` varchar(100) NOT NULL,
  `idBlog` int NOT NULL,
  `sentiment` tinyint(1) unsigned zerofill NOT NULL,
  PRIMARY KEY (`idComment`),
  UNIQUE KEY `idcomment_UNIQUE` (`idComment`),
  KEY `fk_userID_idx` (`idUser`),
  KEY `fk_blogID_idx` (`idBlog`),
  CONSTRAINT `fk_blogID` FOREIGN KEY (`idBlog`) REFERENCES `blog` (`idBlog`),
  CONSTRAINT `fk_userID` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,1,'2022-04-17 00:00:00','This is my description',1,1),(5,1,'2022-04-20 00:00:00','This is my comment that is totally important!',20,0),(6,1,'2022-04-20 00:00:00','fffffaaa',19,1),(25,8,'2022-04-24 00:00:00','I like this post.',18,1),(26,8,'2022-04-24 00:00:00','mine',22,1),(27,1,'2022-04-24 00:00:00','This is an example comment!',22,1),(28,12,'2022-04-24 00:00:00','This is important! My comment.',23,0);
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag` (
  `idtag` int NOT NULL AUTO_INCREMENT,
  `tagName` varchar(45) NOT NULL,
  `idBlog` int NOT NULL,
  PRIMARY KEY (`idtag`),
  UNIQUE KEY `idtags_UNIQUE` (`idtag`),
  KEY `idBlog_idx` (`idBlog`),
  CONSTRAINT `idBlog` FOREIGN KEY (`idBlog`) REFERENCES `blog` (`idBlog`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (1,'f',16),(2,'ff',16),(3,'ggg',16),(7,'f',18),(8,'abc',19),(9,'gef',19),(10,'ssfwa',19),(11,'sssss',20),(12,'apple',21),(13,'orange',21),(14,'apple',23),(15,'orange',23),(16,'banana',23),(17,'apple',24),(18,'orange',24),(19,'banana',24),(20,'kiwi',24);
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `idUser` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `firstName` varchar(45) NOT NULL,
  `lastName` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `hobby` varchar(45) NOT NULL,
  PRIMARY KEY (`idUser`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `userID_UNIQUE` (`idUser`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'abc','abc','abc','abc','abc@abc.com','swimming'),(3,'cba','cba','cba','cba','cba@gmail.com','swimming'),(4,'12','12','12','12','12@gmail.com','cooking'),(5,'6','6','6','6','6@gmail.com','cooking'),(7,'Alan','Alan','Alan','Constantino','alan@gmail.com','movie'),(8,'a','a','a','a','a@gmail.com','dancing'),(9,'b','b','b','b','b@gmail.com','calligraphy'),(11,'123','123','123','123','123@gmail.com','movie'),(12,'name','name','name','name','name@gmail.com','calligraphy');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-04-25  0:42:03
