

```
drop table if exists transcriptions_users;
DROP TABLE IF EXISTS transcriptions;

CREATE TABLE transcriptions (
  id BINARY(12) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file VARCHAR(255) NOT NULL,
  lang CHAR(2) NOT NULL,
  status ENUM('waiting', 'processing', 'error') NOT NULL,
  created DATETIME NOT NULL,
  processed DATETIME DEFAULT NULL,
  done DATETIME DEFAULT NULL,
  deleted TINYINT DEFAULT 0,
  text TEXT DEFAULT NULL,
  duration FLOAT DEFAULT NULL,
  metadata TEXT DEFAULT NULL,
  comment TEXT DEFAULT NULL,
  FULLTEXT INDEX ft_index_name_file (name, file)
);

create table transcriptions_users (
	id binary(12) not null,
    idx_transcription binary(12) not null,
    idx_user binary(12) not null,
	primary key (id, idx_transcription, idx_user),
    foreign key (idx_transcription) references transcriptions(id) on update cascade on delete cascade,
    foreign key (idx_user) references users(id) on update cascade on delete cascade
);

```
