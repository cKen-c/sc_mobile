<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260305002833 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment_likes DROP FOREIGN KEY `FK_E050D68CA76ED395`');
        $this->addSql('ALTER TABLE comment_likes DROP FOREIGN KEY `FK_E050D68CF8697D13`');
        $this->addSql('ALTER TABLE comment_likes ADD CONSTRAINT FK_E050D68CA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE comment_likes ADD CONSTRAINT FK_E050D68CF8697D13 FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE favorite_teams DROP FOREIGN KEY `FK_204A097CA76ED395`');
        $this->addSql('ALTER TABLE favorite_teams ADD CONSTRAINT FK_204A097CA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comment_likes DROP FOREIGN KEY FK_E050D68CA76ED395');
        $this->addSql('ALTER TABLE comment_likes DROP FOREIGN KEY FK_E050D68CF8697D13');
        $this->addSql('ALTER TABLE comment_likes ADD CONSTRAINT `FK_E050D68CA76ED395` FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE comment_likes ADD CONSTRAINT `FK_E050D68CF8697D13` FOREIGN KEY (comment_id) REFERENCES comments (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE favorite_teams DROP FOREIGN KEY FK_204A097CA76ED395');
        $this->addSql('ALTER TABLE favorite_teams ADD CONSTRAINT `FK_204A097CA76ED395` FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
