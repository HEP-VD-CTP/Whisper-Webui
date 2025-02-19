


To generate typescript types from scheme.graphql
`
npx graphql-codegen
`
Find a way to call it:
`
ALTER TABLE `users`
  ADD FULLTEXT INDEX `fulltext_users` (`firstname`, `lastname`, `email`);
`