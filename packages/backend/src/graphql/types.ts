import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  EmailAddress: { input: any; output: any; }
  UID: { input: any; output: any; }
};

export type AuthMutation = {
  __typename?: 'AuthMutation';
  login: User;
};


export type AuthMutationLoginArgs = {
  email: Scalars['EmailAddress']['input'];
  pwd: Scalars['String']['input'];
};

export type CreateUser = {
  admin: Scalars['Boolean']['input'];
  email: Scalars['EmailAddress']['input'];
  firstname: Scalars['String']['input'];
  lastname: Scalars['String']['input'];
  pwd: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  Auth?: Maybe<AuthMutation>;
  Users?: Maybe<UsersMutation>;
};

export type Query = {
  __typename?: 'Query';
  Users?: Maybe<UsersQuery>;
  add?: Maybe<Scalars['Int']['output']>;
};


export type QueryAddArgs = {
  x?: InputMaybe<Scalars['Int']['input']>;
  y?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  admin?: Maybe<Scalars['Boolean']['output']>;
  archived?: Maybe<Scalars['Boolean']['output']>;
  blocked?: Maybe<Scalars['Boolean']['output']>;
  created?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['EmailAddress']['output']>;
  firstname?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['UID']['output']>;
  lastname?: Maybe<Scalars['String']['output']>;
};

export type UsersMutation = {
  __typename?: 'UsersMutation';
  insert: Scalars['Boolean']['output'];
};


export type UsersMutationInsertArgs = {
  user: CreateUser;
};

export type UsersQuery = {
  __typename?: 'UsersQuery';
  findById: User;
};


export type UsersQueryFindByIdArgs = {
  id: Scalars['UID']['input'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AuthMutation: ResolverTypeWrapper<AuthMutation>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateUser: CreateUser;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  EmailAddress: ResolverTypeWrapper<Scalars['EmailAddress']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  UID: ResolverTypeWrapper<Scalars['UID']['output']>;
  User: ResolverTypeWrapper<User>;
  UsersMutation: ResolverTypeWrapper<UsersMutation>;
  UsersQuery: ResolverTypeWrapper<UsersQuery>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AuthMutation: AuthMutation;
  Boolean: Scalars['Boolean']['output'];
  CreateUser: CreateUser;
  Date: Scalars['Date']['output'];
  DateTime: Scalars['DateTime']['output'];
  EmailAddress: Scalars['EmailAddress']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Query: {};
  String: Scalars['String']['output'];
  UID: Scalars['UID']['output'];
  User: User;
  UsersMutation: UsersMutation;
  UsersQuery: UsersQuery;
};

export type AuthMutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthMutation'] = ResolversParentTypes['AuthMutation']> = {
  login?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<AuthMutationLoginArgs, 'email' | 'pwd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export interface EmailAddressScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['EmailAddress'], any> {
  name: 'EmailAddress';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  Auth?: Resolver<Maybe<ResolversTypes['AuthMutation']>, ParentType, ContextType>;
  Users?: Resolver<Maybe<ResolversTypes['UsersMutation']>, ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  Users?: Resolver<Maybe<ResolversTypes['UsersQuery']>, ParentType, ContextType>;
  add?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType, Partial<QueryAddArgs>>;
};

export interface UidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UID'], any> {
  name: 'UID';
}

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  admin?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  archived?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  blocked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  created?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['EmailAddress']>, ParentType, ContextType>;
  firstname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['UID']>, ParentType, ContextType>;
  lastname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UsersMutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['UsersMutation'] = ResolversParentTypes['UsersMutation']> = {
  insert?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<UsersMutationInsertArgs, 'user'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UsersQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['UsersQuery'] = ResolversParentTypes['UsersQuery']> = {
  findById?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<UsersQueryFindByIdArgs, 'id'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AuthMutation?: AuthMutationResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  EmailAddress?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  UID?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  UsersMutation?: UsersMutationResolvers<ContextType>;
  UsersQuery?: UsersQueryResolvers<ContextType>;
};

