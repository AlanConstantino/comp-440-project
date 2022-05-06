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
  `subject` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`idBlog`),
  UNIQUE KEY `idBlog_UNIQUE` (`idBlog`),
  KEY `fk_idUser_idx` (`idUser`),
  CONSTRAINT `fk_idUser` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog`
--

LOCK TABLES `blog` WRITE;
/*!40000 ALTER TABLE `blog` DISABLE KEYS */;
INSERT INTO `blog` VALUES (1,1,'My first post ever!','My first ever description!','2022-05-01 00:00:00'),(18,7,'Hello I\'m Yosef!','I\'m introducing myself! Hello!','2022-05-01 00:00:00'),(19,1,'I like this website!','This webapp is really cool.','2022-04-20 00:00:00'),(20,3,'Snakes','Venomous snakes are my favorite reptiles.','2022-04-20 00:00:00'),(21,3,'New Phone','Should I get a new phone? Let me know in the comments guys!','2022-04-20 00:00:00'),(22,5,'Vinyl Music','I am a collector of vinyls.','2022-05-01 00:00:00'),(23,1,'Discord','Let me know in the comments if anyone uses discord.','2022-04-20 00:00:00'),(24,12,'Youtube Competitor','Someone should really make a webapp that competes with YouTube.','2022-04-24 00:00:00'),(25,1,'This is my important subject','My description!','2022-05-01 00:00:00'),(26,12,'This is another post!','This is a description','2022-04-25 00:00:00'),(27,9,'Rock music rocks!','I really like rock music!','2022-05-05 00:00:00'),(28,5,'Rap music rocks!','I really like rap music!','2022-05-05 00:00:00'),(29,11,'Really important post','Really important description.','2022-05-05 00:00:00'),(30,7,'Cakes are great!','I love cakes! They\'re easy to make and are delicious!','2022-05-05 00:00:00'),(31,7,'I hate running :(','Running hurts my feet.','2022-05-05 00:00:00'),(32,8,'My subject.','My description.','2022-05-05 00:00:00'),(33,3,'SQL is easy','SQL is pretty easy to learn, just saying.','2022-05-05 00:00:00'),(34,3,'Why is the sky blue?','I wonder why the sky is blue. Can someone explain why?','2022-05-05 00:00:00'),(35,12,'What kind of car do you drive?','I drive a Tesla model 3, what about you guys?','2022-05-05 00:00:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,15,'2022-04-17 00:00:00','This is my description',1,1),(5,14,'2022-04-20 00:00:00','This is my comment that is totally important!',20,0),(6,1,'2022-04-20 00:00:00','fffffaaa',19,1),(25,8,'2022-04-24 00:00:00','I like this post.',18,1),(26,8,'2022-04-24 00:00:00','mine',22,1),(27,11,'2022-05-01 00:00:00','This is an example comment!',22,1),(28,12,'2022-04-24 00:00:00','This is important! My comment.',23,0),(29,1,'2022-05-01 00:00:00','This is my comment!',22,0),(30,8,'2022-04-25 00:00:00','This is yet another comment!',22,1),(31,1,'2022-05-05 00:00:00','I like this post! Good job!',24,0),(32,9,'2022-05-05 00:00:00','my comment 1',31,1),(33,5,'2022-05-05 00:00:00','my comment 2',31,0);
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follow`
--

DROP TABLE IF EXISTS `follow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUser` int NOT NULL,
  `idFollower` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_idUser_idx` (`idUser`),
  KEY `fk_follow_idx` (`idUser`),
  KEY `fk_follower_idx` (`idFollower`),
  CONSTRAINT `fk_follow` FOREIGN KEY (`idUser`) REFERENCES `user` (`idUser`),
  CONSTRAINT `fk_follower` FOREIGN KEY (`idFollower`) REFERENCES `user` (`idUser`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follow`
--

LOCK TABLES `follow` WRITE;
/*!40000 ALTER TABLE `follow` DISABLE KEYS */;
INSERT INTO `follow` VALUES (34,3,7),(35,3,12),(36,4,12),(37,4,7),(38,4,11),(39,8,4),(40,8,12),(41,3,1),(42,12,1),(43,15,11),(44,15,12),(45,15,13),(46,15,14),(47,7,15);
/*!40000 ALTER TABLE `follow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag` (
  `idtag` int NOT NULL AUTO_INCREMENT,
  `tagName` varchar(100) NOT NULL,
  `idBlog` int NOT NULL,
  PRIMARY KEY (`idtag`),
  UNIQUE KEY `idtags_UNIQUE` (`idtag`),
  KEY `idBlog_idx` (`idBlog`),
  CONSTRAINT `idBlog` FOREIGN KEY (`idBlog`) REFERENCES `blog` (`idBlog`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (7,'cars',18),(8,'abc',19),(9,'gef',19),(10,'ssfwa',19),(11,'sssss',20),(12,'apple',21),(13,'orange',21),(14,'apple',23),(15,'orange',23),(16,'banana',23),(17,'apple',24),(18,'orange',24),(19,'banana',24),(20,'kiwi',24),(21,'apple',25),(22,'orange',25),(23,'banana',25),(24,'tags1',26),(25,'tags2',26),(26,'tags3',26),(27,'house',22),(28,'69',27),(29,'1',28),(30,'mytag apple',29),(31,'a',30),(32,'p',30),(33,'p',30),(34,'l',30),(35,'e',30),(36,'o',31),(37,'r',31),(38,'a',31),(39,'n',31),(40,'g',31),(41,'e',31),(42,'k',32),(43,'i',32),(44,'w',32),(45,'i',32),(46,'k',33),(47,'i',33),(48,'w',33),(49,'i',33),(50,'s',34),(51,'t',34),(52,'r',34),(53,'a',34),(54,'w',34),(55,'b',34),(56,'e',34),(57,'r',34),(58,'r',34),(59,'y',34),(60,'b',35),(61,'a',35),(62,'n',35),(63,'a',35),(64,'n',35),(65,'a',35);
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Taylor','123','Taylor','Avery','taylor@email.com','swimming'),(3,'Naima','123','Naima','Melendez','naima@email.com','swimming'),(4,'Savanah','123','Savanah','Pruitt','savanah@email.com','cooking'),(5,'Randy','123','Randy','Tate','randy@email.com','cooking'),(7,'Yosef','123','Yosef','Hoover','yosef@email.com','movie'),(8,'Akira','123','Akira','Crawford','akira@email.com','dancing'),(9,'Maddox','123','Maddox','McCarthy','maddox@email.com','calligraphy'),(11,'Keaton','123','Keaton','Noble','keaton@email.com','movie'),(12,'Kristen','123','Kristen','Booth','kristen@email.com','calligraphy'),(13,'Angelo','123','Angelo','Hill','angelo@email.com','bowling'),(14,'Elianna','123','Elianna','Sloan','elianna@email.com','bowling'),(15,'Carina','123','Carina','Blair','carina@email.com','dancing');
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

-- Dump completed on 2022-05-05 23:23:02
