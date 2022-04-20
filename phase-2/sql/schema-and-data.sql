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

DROP TABLE IF EXISTS `blog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog` (
  `idBlog` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `idComment` int DEFAULT NULL,
  `subject` varchar(45) NOT NULL,
  `description` varchar(45) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`idBlog`),
  UNIQUE KEY `idBlog_UNIQUE` (`idBlog`),
  KEY `fk_idUser_idx` (`idUser`),
  KEY `fk_idComment_idx` (`idComment`),
  CONSTRAINT `fk_idComment` FOREIGN KEY (`idComment`) REFERENCES `comment` (`idComment`),
  CONSTRAINT `fk_idUser` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog`
--

LOCK TABLES `blog` WRITE;
/*!40000 ALTER TABLE `blog` DISABLE KEYS */;
INSERT INTO `blog` VALUES (1,1,NULL,'a','s','2022-04-17 00:00:00'),(2,1,NULL,'a','s','2022-04-17 00:00:00'),(3,1,NULL,'a','s','2022-04-17 00:00:00'),(4,1,NULL,'a','s','2022-04-17 00:00:00'),(5,1,NULL,'a','s','2022-04-17 00:00:00'),(6,1,NULL,'a','s','2022-04-17 00:00:00'),(7,1,NULL,'a','s','2022-04-17 00:00:00'),(8,1,NULL,'a','s','2022-04-17 00:00:00'),(9,1,NULL,'a','s','2022-04-17 00:00:00'),(10,1,NULL,'a','s','2022-04-17 00:00:00'),(11,1,NULL,'a','s','2022-04-17 00:00:00'),(12,1,NULL,'a','s','2022-04-17 00:00:00'),(13,1,NULL,'a','s','2022-04-17 00:00:00'),(14,1,NULL,'a','s','2022-04-17 00:00:00'),(15,1,NULL,'a','s','2022-04-17 00:00:00'),(16,1,NULL,'a','s','2022-04-17 00:00:00'),(17,1,NULL,'a','s','2022-04-17 00:00:00'),(18,1,NULL,'ss','ggsa','2022-04-17 00:00:00'),(19,1,NULL,'ssffwwfgaw','12345','2022-04-17 00:00:00'),(20,1,NULL,'ssss','ssss','2022-04-18 00:00:00'),(21,3,NULL,'My Subject','This is my description','2022-04-20 00:00:00');
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
  `rate` int NOT NULL,
  PRIMARY KEY (`idComment`),
  UNIQUE KEY `idcomment_UNIQUE` (`idComment`),
  KEY `fk_userID_idx` (`idUser`),
  CONSTRAINT `fk_userID` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (1,'f',16),(2,'ff',16),(3,'ggg',16),(7,'f',18),(8,'abc',19),(9,'gef',19),(10,'ssfwa',19),(11,'sssss',20),(12,'apple',21),(13,'orange',21);
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
  PRIMARY KEY (`idUser`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  UNIQUE KEY `userID_UNIQUE` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'abc','abc','abc','abc','abc@abc.com'),(3,'cba','cba','cba','cba','cba@gmail.com');
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

-- Dump completed on 2022-04-20 13:55:42
