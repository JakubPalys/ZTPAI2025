<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250331221936 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE events DROP FOREIGN KEY fk_events_status
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_bet_results DROP FOREIGN KEY fk_user_bet_results_bet
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_bet_results DROP FOREIGN KEY fk_user_bet_results_result
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE event_results DROP FOREIGN KEY fk_event_results_event
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE event_results DROP FOREIGN KEY fk_event_results_result
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE bet_results
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE user_bet_results
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE event_results
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE event_statuses
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bets DROP bet_amount, DROP bet_choice, DROP bet_date, DROP potential_win
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bets RENAME INDEX fk_bets_user TO IDX_7C28752BA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bets RENAME INDEX fk_bets_event TO IDX_7C28752B71F7E88B
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX fk_events_status ON events
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events DROP status_id, DROP home_odds, DROP away_odds, DROP draw_odds
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX UNIQ_54FCD59FE09C0C92 ON user_roles (role_name)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users CHANGE points points INT DEFAULT 0 NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users RENAME INDEX username TO UNIQ_1483A5E9F85E0677
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users RENAME INDEX email TO UNIQ_1483A5E9E7927C74
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users RENAME INDEX fk_users_role TO IDX_1483A5E9D60322AC
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE bet_results (result_id INT AUTO_INCREMENT NOT NULL, result_name VARCHAR(50) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, PRIMARY KEY(result_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE user_bet_results (bet_id INT NOT NULL, result_id INT DEFAULT NULL, points_awarded INT DEFAULT 0, INDEX idx_user_bet_results (bet_id), INDEX fk_user_bet_results_result (result_id), PRIMARY KEY(bet_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE event_results (event_id INT NOT NULL, result_id INT DEFAULT NULL, INDEX idx_event_results (event_id), INDEX fk_event_results_result (result_id), PRIMARY KEY(event_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE event_statuses (status_id INT AUTO_INCREMENT NOT NULL, status_name VARCHAR(50) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, PRIMARY KEY(status_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_bet_results ADD CONSTRAINT fk_user_bet_results_bet FOREIGN KEY (bet_id) REFERENCES bets (bet_id) ON UPDATE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_bet_results ADD CONSTRAINT fk_user_bet_results_result FOREIGN KEY (result_id) REFERENCES bet_results (result_id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE event_results ADD CONSTRAINT fk_event_results_event FOREIGN KEY (event_id) REFERENCES events (event_id) ON UPDATE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE event_results ADD CONSTRAINT fk_event_results_result FOREIGN KEY (result_id) REFERENCES bet_results (result_id) ON UPDATE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users CHANGE points points INT DEFAULT 0
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users RENAME INDEX uniq_1483a5e9f85e0677 TO username
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users RENAME INDEX idx_1483a5e9d60322ac TO fk_users_role
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users RENAME INDEX uniq_1483a5e9e7927c74 TO email
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bets ADD bet_amount INT NOT NULL, ADD bet_choice VARCHAR(50) NOT NULL, ADD bet_date DATETIME DEFAULT CURRENT_TIMESTAMP, ADD potential_win NUMERIC(10, 2) DEFAULT '0.00' NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bets RENAME INDEX idx_7c28752ba76ed395 TO fk_bets_user
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE bets RENAME INDEX idx_7c28752b71f7e88b TO fk_bets_event
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX UNIQ_54FCD59FE09C0C92 ON user_roles
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events ADD status_id INT DEFAULT NULL, ADD home_odds NUMERIC(5, 2) DEFAULT '1.00' NOT NULL, ADD away_odds NUMERIC(5, 2) DEFAULT '1.00' NOT NULL, ADD draw_odds NUMERIC(5, 2) DEFAULT '1.00' NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE events ADD CONSTRAINT fk_events_status FOREIGN KEY (status_id) REFERENCES event_statuses (status_id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX fk_events_status ON events (status_id)
        SQL);
    }
}
