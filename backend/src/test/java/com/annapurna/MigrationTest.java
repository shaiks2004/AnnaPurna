package com.annapurna;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.ResultSet;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@Testcontainers(disabledWithoutDocker = true)
class MigrationTest {
    @Container
    static final PostgreSQLContainer<?> database = new PostgreSQLContainer<>(
            DockerImageName.parse("postgis/postgis:17-3.5").asCompatibleSubstituteFor("postgres"));

    @Test
    void migrationsApplyToPostgis() throws Exception {
        Flyway flyway = Flyway.configure()
                .dataSource(database.getJdbcUrl(), database.getUsername(), database.getPassword())
                .locations("classpath:db/migration")
                .load();

        assertThat(flyway.migrate().migrationsExecuted).isEqualTo(7);

        try (Connection connection = DriverManager.getConnection(
                        database.getJdbcUrl(), database.getUsername(), database.getPassword());
                var statement = connection.createStatement();
                ResultSet result = statement.executeQuery(
                        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' "
                                + "AND table_name IN ('commodity', 'market', 'market_price', 'lot', 'lot_location', 'lot_document', "
                                + "'user_role_assignment', 'refresh_token', 'buyer_requirement')")) {
            result.next();
            assertThat(result.getInt(1)).isEqualTo(9);

                        UUID userA = UUID.randomUUID();
                        UUID userB = UUID.randomUUID();
                        UUID organization = UUID.randomUUID();
                        UUID membership = UUID.randomUUID();
                        UUID validAssignment = UUID.randomUUID();
                        UUID invalidAssignment = UUID.randomUUID();
                        try (var insert = connection.prepareStatement(
                                        "INSERT INTO app_user (id) VALUES (?), (?)")) {
                                insert.setObject(1, userA);
                                insert.setObject(2, userB);
                                insert.executeUpdate();
                        }
                        try (var insert = connection.prepareStatement(
                                        "INSERT INTO organization (id, name) VALUES (?, 'Test organization')")) {
                                insert.setObject(1, organization);
                                insert.executeUpdate();
                        }
                        try (var insert = connection.prepareStatement(
                                        "INSERT INTO organization_membership (id, organization_id, user_id) VALUES (?, ?, ?)")) {
                                insert.setObject(1, membership);
                                insert.setObject(2, organization);
                                insert.setObject(3, userA);
                                insert.executeUpdate();
                        }
                        try (var insert = connection.prepareStatement(
                                        "INSERT INTO user_role_assignment (id, user_id, organization_membership_id, role_code) "
                                                        + "VALUES (?, ?, ?, 'BUYER_USER')")) {
                                insert.setObject(1, validAssignment);
                                insert.setObject(2, userA);
                                insert.setObject(3, membership);
                                insert.executeUpdate();

                                insert.setObject(1, invalidAssignment);
                                insert.setObject(2, userB);
                                insert.setObject(3, membership);
                                assertThatThrownBy(insert::executeUpdate)
                                                .isInstanceOf(SQLException.class);
                        }
        }
    }
}
