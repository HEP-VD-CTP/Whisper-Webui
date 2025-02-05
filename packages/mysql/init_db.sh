#!/bin/bash
set -e

echo "Updating privileges..."

# keep only crud privileges for the mysql user
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
  -- Revoke all privileges from ${MYSQL_USER}
  REVOKE ALL PRIVILEGES ON ${MYSQL_DATABASE}.* FROM '${MYSQL_USER}'@'%';

  -- Grant only CRUD privileges
  GRANT SELECT, INSERT, UPDATE, DELETE ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'%';

  -- Apply changes
  FLUSH PRIVILEGES;
EOSQL

echo "Privileges updated."

