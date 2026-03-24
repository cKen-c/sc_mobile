<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260304235820 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE api_cache (id INT AUTO_INCREMENT NOT NULL, cache_key VARCHAR(64) NOT NULL, endpoint VARCHAR(255) NOT NULL, response_data LONGTEXT NOT NULL, created_at DATETIME NOT NULL, expires_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_65D23F37763247D7 (cache_key), INDEX idx_cache_key (cache_key), INDEX idx_expires_at (expires_at), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE comment_likes (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, comment_id INT NOT NULL, INDEX IDX_E050D68CA76ED395 (user_id), INDEX IDX_E050D68CF8697D13 (comment_id), UNIQUE INDEX unique_user_comment_like (user_id, comment_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE comments (id INT AUTO_INCREMENT NOT NULL, content LONGTEXT NOT NULL, match_api_id INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, edited TINYINT NOT NULL, user_id INT NOT NULL, parent_id INT DEFAULT NULL, INDEX IDX_5F9E962AA76ED395 (user_id), INDEX IDX_5F9E962A727ACA70 (parent_id), INDEX idx_match_api_id (match_api_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE favorite_teams (id INT AUTO_INCREMENT NOT NULL, team_api_id INT NOT NULL, team_name VARCHAR(255) NOT NULL, team_tla VARCHAR(10) DEFAULT NULL, team_crest VARCHAR(500) DEFAULT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_204A097CA76ED395 (user_id), UNIQUE INDEX unique_user_team (user_id, team_api_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE leagues (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(150) NOT NULL, code VARCHAR(10) NOT NULL, country VARCHAR(100) DEFAULT NULL, emblem VARCHAR(500) DEFAULT NULL, external_id INT DEFAULT NULL, sport_id INT NOT NULL, INDEX IDX_85CE39EAC78BCF8 (sport_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE matches (id INT AUTO_INCREMENT NOT NULL, external_id INT DEFAULT NULL, home_team VARCHAR(150) NOT NULL, away_team VARCHAR(150) NOT NULL, home_team_crest VARCHAR(500) DEFAULT NULL, away_team_crest VARCHAR(500) DEFAULT NULL, home_score INT DEFAULT NULL, away_score INT DEFAULT NULL, half_time_home INT DEFAULT NULL, half_time_away INT DEFAULT NULL, status VARCHAR(30) NOT NULL, matchday INT DEFAULT NULL, `utc_date` DATETIME NOT NULL, venue VARCHAR(100) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, league_id INT NOT NULL, INDEX IDX_62615BA58AFC4DE (league_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE sports (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(100) NOT NULL, slug VARCHAR(50) NOT NULL, icon VARCHAR(10) DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, username VARCHAR(100) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), UNIQUE INDEX UNIQ_1483A5E9F85E0677 (username), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 (queue_name, available_at, delivered_at, id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE comment_likes ADD CONSTRAINT FK_E050D68CA76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE comment_likes ADD CONSTRAINT FK_E050D68CF8697D13 FOREIGN KEY (comment_id) REFERENCES comments (id)');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962AA76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962A727ACA70 FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE favorite_teams ADD CONSTRAINT FK_204A097CA76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE leagues ADD CONSTRAINT FK_85CE39EAC78BCF8 FOREIGN KEY (sport_id) REFERENCES sports (id)');
        $this->addSql('ALTER TABLE matches ADD CONSTRAINT FK_62615BA58AFC4DE FOREIGN KEY (league_id) REFERENCES leagues (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment_likes DROP FOREIGN KEY FK_E050D68CA76ED395');
        $this->addSql('ALTER TABLE comment_likes DROP FOREIGN KEY FK_E050D68CF8697D13');
        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962AA76ED395');
        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962A727ACA70');
        $this->addSql('ALTER TABLE favorite_teams DROP FOREIGN KEY FK_204A097CA76ED395');
        $this->addSql('ALTER TABLE leagues DROP FOREIGN KEY FK_85CE39EAC78BCF8');
        $this->addSql('ALTER TABLE matches DROP FOREIGN KEY FK_62615BA58AFC4DE');
        $this->addSql('DROP TABLE api_cache');
        $this->addSql('DROP TABLE comment_likes');
        $this->addSql('DROP TABLE comments');
        $this->addSql('DROP TABLE favorite_teams');
        $this->addSql('DROP TABLE leagues');
        $this->addSql('DROP TABLE matches');
        $this->addSql('DROP TABLE sports');
        $this->addSql('DROP TABLE users');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
