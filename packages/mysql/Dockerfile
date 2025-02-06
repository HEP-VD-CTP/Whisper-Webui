FROM mysql:8.0-oraclelinux9

# Copy our init script into the special init directory
COPY ./packages/mysql/init_db.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init_db.sh

