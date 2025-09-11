
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Session
 * 
 */
export type Session = $Result.DefaultSelection<Prisma.$SessionPayload>
/**
 * Model Brand
 * 
 */
export type Brand = $Result.DefaultSelection<Prisma.$BrandPayload>
/**
 * Model BrandContacts
 * 
 */
export type BrandContacts = $Result.DefaultSelection<Prisma.$BrandContactsPayload>
/**
 * Model BrandTerms
 * 
 */
export type BrandTerms = $Result.DefaultSelection<Prisma.$BrandTermsPayload>
/**
 * Model Vouchers
 * 
 */
export type Vouchers = $Result.DefaultSelection<Prisma.$VouchersPayload>
/**
 * Model BrandBanking
 * 
 */
export type BrandBanking = $Result.DefaultSelection<Prisma.$BrandBankingPayload>
/**
 * Model Occasion
 * 
 */
export type Occasion = $Result.DefaultSelection<Prisma.$OccasionPayload>
/**
 * Model OccasionCategory
 * 
 */
export type OccasionCategory = $Result.DefaultSelection<Prisma.$OccasionCategoryPayload>
/**
 * Model Categories
 * 
 */
export type Categories = $Result.DefaultSelection<Prisma.$CategoriesPayload>
/**
 * Model ReceiverDetail
 * 
 */
export type ReceiverDetail = $Result.DefaultSelection<Prisma.$ReceiverDetailPayload>
/**
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model Settlements
 * 
 */
export type Settlements = $Result.DefaultSelection<Prisma.$SettlementsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Status: {
  Pending: 'Pending',
  Paid: 'Paid',
  InReview: 'InReview'
};

export type Status = (typeof Status)[keyof typeof Status]


export const deliveryMethodStatus: {
  whatsup: 'whatsup',
  email: 'email',
  print: 'print'
};

export type deliveryMethodStatus = (typeof deliveryMethodStatus)[keyof typeof deliveryMethodStatus]


export const RedemptionStatus: {
  Issued: 'Issued',
  Redeemed: 'Redeemed',
  Exparied: 'Exparied',
  NotRedeemed: 'NotRedeemed'
};

export type RedemptionStatus = (typeof RedemptionStatus)[keyof typeof RedemptionStatus]


export const paymentStatus: {
  COD: 'COD',
  Stripe: 'Stripe'
};

export type paymentStatus = (typeof paymentStatus)[keyof typeof paymentStatus]


export const SendStatus: {
  sendImmediately: 'sendImmediately',
  scheduleLater: 'scheduleLater'
};

export type SendStatus = (typeof SendStatus)[keyof typeof SendStatus]


export const SettelmentStatus: {
  onRedemption: 'onRedemption',
  onPurchase: 'onPurchase'
};

export type SettelmentStatus = (typeof SettelmentStatus)[keyof typeof SettelmentStatus]


export const CommissionStatus: {
  Fixed: 'Fixed',
  Percentage: 'Percentage'
};

export type CommissionStatus = (typeof CommissionStatus)[keyof typeof CommissionStatus]


export const PolicyStatus: {
  Retain: 'Retain',
  Share: 'Share'
};

export type PolicyStatus = (typeof PolicyStatus)[keyof typeof PolicyStatus]


export const DenominationStatus: {
  staticDenominations: 'staticDenominations',
  amountRange: 'amountRange'
};

export type DenominationStatus = (typeof DenominationStatus)[keyof typeof DenominationStatus]


export const expiryPolicyStatus: {
  fixedDay: 'fixedDay',
  endOfMonth: 'endOfMonth',
  absoluteDate: 'absoluteDate'
};

export type expiryPolicyStatus = (typeof expiryPolicyStatus)[keyof typeof expiryPolicyStatus]


export const SettlementFrequencyStatus: {
  monthly: 'monthly',
  weekly: 'weekly'
};

export type SettlementFrequencyStatus = (typeof SettlementFrequencyStatus)[keyof typeof SettlementFrequencyStatus]


export const payoutMethodStatus: {
  EFT: 'EFT',
  ManualProcessing: 'ManualProcessing'
};

export type payoutMethodStatus = (typeof payoutMethodStatus)[keyof typeof payoutMethodStatus]

}

export type Status = $Enums.Status

export const Status: typeof $Enums.Status

export type deliveryMethodStatus = $Enums.deliveryMethodStatus

export const deliveryMethodStatus: typeof $Enums.deliveryMethodStatus

export type RedemptionStatus = $Enums.RedemptionStatus

export const RedemptionStatus: typeof $Enums.RedemptionStatus

export type paymentStatus = $Enums.paymentStatus

export const paymentStatus: typeof $Enums.paymentStatus

export type SendStatus = $Enums.SendStatus

export const SendStatus: typeof $Enums.SendStatus

export type SettelmentStatus = $Enums.SettelmentStatus

export const SettelmentStatus: typeof $Enums.SettelmentStatus

export type CommissionStatus = $Enums.CommissionStatus

export const CommissionStatus: typeof $Enums.CommissionStatus

export type PolicyStatus = $Enums.PolicyStatus

export const PolicyStatus: typeof $Enums.PolicyStatus

export type DenominationStatus = $Enums.DenominationStatus

export const DenominationStatus: typeof $Enums.DenominationStatus

export type expiryPolicyStatus = $Enums.expiryPolicyStatus

export const expiryPolicyStatus: typeof $Enums.expiryPolicyStatus

export type SettlementFrequencyStatus = $Enums.SettlementFrequencyStatus

export const SettlementFrequencyStatus: typeof $Enums.SettlementFrequencyStatus

export type payoutMethodStatus = $Enums.payoutMethodStatus

export const payoutMethodStatus: typeof $Enums.payoutMethodStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.session`: Exposes CRUD operations for the **Session** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Sessions
    * const sessions = await prisma.session.findMany()
    * ```
    */
  get session(): Prisma.SessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.brand`: Exposes CRUD operations for the **Brand** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Brands
    * const brands = await prisma.brand.findMany()
    * ```
    */
  get brand(): Prisma.BrandDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.brandContacts`: Exposes CRUD operations for the **BrandContacts** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BrandContacts
    * const brandContacts = await prisma.brandContacts.findMany()
    * ```
    */
  get brandContacts(): Prisma.BrandContactsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.brandTerms`: Exposes CRUD operations for the **BrandTerms** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BrandTerms
    * const brandTerms = await prisma.brandTerms.findMany()
    * ```
    */
  get brandTerms(): Prisma.BrandTermsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.vouchers`: Exposes CRUD operations for the **Vouchers** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Vouchers
    * const vouchers = await prisma.vouchers.findMany()
    * ```
    */
  get vouchers(): Prisma.VouchersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.brandBanking`: Exposes CRUD operations for the **BrandBanking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BrandBankings
    * const brandBankings = await prisma.brandBanking.findMany()
    * ```
    */
  get brandBanking(): Prisma.BrandBankingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.occasion`: Exposes CRUD operations for the **Occasion** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Occasions
    * const occasions = await prisma.occasion.findMany()
    * ```
    */
  get occasion(): Prisma.OccasionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.occasionCategory`: Exposes CRUD operations for the **OccasionCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OccasionCategories
    * const occasionCategories = await prisma.occasionCategory.findMany()
    * ```
    */
  get occasionCategory(): Prisma.OccasionCategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.categories`: Exposes CRUD operations for the **Categories** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.categories.findMany()
    * ```
    */
  get categories(): Prisma.CategoriesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.receiverDetail`: Exposes CRUD operations for the **ReceiverDetail** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ReceiverDetails
    * const receiverDetails = await prisma.receiverDetail.findMany()
    * ```
    */
  get receiverDetail(): Prisma.ReceiverDetailDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.settlements`: Exposes CRUD operations for the **Settlements** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Settlements
    * const settlements = await prisma.settlements.findMany()
    * ```
    */
  get settlements(): Prisma.SettlementsDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.0
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Session: 'Session',
    Brand: 'Brand',
    BrandContacts: 'BrandContacts',
    BrandTerms: 'BrandTerms',
    Vouchers: 'Vouchers',
    BrandBanking: 'BrandBanking',
    Occasion: 'Occasion',
    OccasionCategory: 'OccasionCategory',
    Categories: 'Categories',
    ReceiverDetail: 'ReceiverDetail',
    Order: 'Order',
    Settlements: 'Settlements'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "session" | "brand" | "brandContacts" | "brandTerms" | "vouchers" | "brandBanking" | "occasion" | "occasionCategory" | "categories" | "receiverDetail" | "order" | "settlements"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Session: {
        payload: Prisma.$SessionPayload<ExtArgs>
        fields: Prisma.SessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findFirst: {
            args: Prisma.SessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          findMany: {
            args: Prisma.SessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          create: {
            args: Prisma.SessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          createMany: {
            args: Prisma.SessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          delete: {
            args: Prisma.SessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          update: {
            args: Prisma.SessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          deleteMany: {
            args: Prisma.SessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>[]
          }
          upsert: {
            args: Prisma.SessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionPayload>
          }
          aggregate: {
            args: Prisma.SessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSession>
          }
          groupBy: {
            args: Prisma.SessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCountAggregateOutputType> | number
          }
        }
      }
      Brand: {
        payload: Prisma.$BrandPayload<ExtArgs>
        fields: Prisma.BrandFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BrandFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BrandFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          findFirst: {
            args: Prisma.BrandFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BrandFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          findMany: {
            args: Prisma.BrandFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>[]
          }
          create: {
            args: Prisma.BrandCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          createMany: {
            args: Prisma.BrandCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BrandCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>[]
          }
          delete: {
            args: Prisma.BrandDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          update: {
            args: Prisma.BrandUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          deleteMany: {
            args: Prisma.BrandDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BrandUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BrandUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>[]
          }
          upsert: {
            args: Prisma.BrandUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandPayload>
          }
          aggregate: {
            args: Prisma.BrandAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBrand>
          }
          groupBy: {
            args: Prisma.BrandGroupByArgs<ExtArgs>
            result: $Utils.Optional<BrandGroupByOutputType>[]
          }
          count: {
            args: Prisma.BrandCountArgs<ExtArgs>
            result: $Utils.Optional<BrandCountAggregateOutputType> | number
          }
        }
      }
      BrandContacts: {
        payload: Prisma.$BrandContactsPayload<ExtArgs>
        fields: Prisma.BrandContactsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BrandContactsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BrandContactsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>
          }
          findFirst: {
            args: Prisma.BrandContactsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BrandContactsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>
          }
          findMany: {
            args: Prisma.BrandContactsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>[]
          }
          create: {
            args: Prisma.BrandContactsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>
          }
          createMany: {
            args: Prisma.BrandContactsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BrandContactsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>[]
          }
          delete: {
            args: Prisma.BrandContactsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>
          }
          update: {
            args: Prisma.BrandContactsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>
          }
          deleteMany: {
            args: Prisma.BrandContactsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BrandContactsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BrandContactsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>[]
          }
          upsert: {
            args: Prisma.BrandContactsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandContactsPayload>
          }
          aggregate: {
            args: Prisma.BrandContactsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBrandContacts>
          }
          groupBy: {
            args: Prisma.BrandContactsGroupByArgs<ExtArgs>
            result: $Utils.Optional<BrandContactsGroupByOutputType>[]
          }
          count: {
            args: Prisma.BrandContactsCountArgs<ExtArgs>
            result: $Utils.Optional<BrandContactsCountAggregateOutputType> | number
          }
        }
      }
      BrandTerms: {
        payload: Prisma.$BrandTermsPayload<ExtArgs>
        fields: Prisma.BrandTermsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BrandTermsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BrandTermsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>
          }
          findFirst: {
            args: Prisma.BrandTermsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BrandTermsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>
          }
          findMany: {
            args: Prisma.BrandTermsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>[]
          }
          create: {
            args: Prisma.BrandTermsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>
          }
          createMany: {
            args: Prisma.BrandTermsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BrandTermsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>[]
          }
          delete: {
            args: Prisma.BrandTermsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>
          }
          update: {
            args: Prisma.BrandTermsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>
          }
          deleteMany: {
            args: Prisma.BrandTermsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BrandTermsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BrandTermsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>[]
          }
          upsert: {
            args: Prisma.BrandTermsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandTermsPayload>
          }
          aggregate: {
            args: Prisma.BrandTermsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBrandTerms>
          }
          groupBy: {
            args: Prisma.BrandTermsGroupByArgs<ExtArgs>
            result: $Utils.Optional<BrandTermsGroupByOutputType>[]
          }
          count: {
            args: Prisma.BrandTermsCountArgs<ExtArgs>
            result: $Utils.Optional<BrandTermsCountAggregateOutputType> | number
          }
        }
      }
      Vouchers: {
        payload: Prisma.$VouchersPayload<ExtArgs>
        fields: Prisma.VouchersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VouchersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VouchersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>
          }
          findFirst: {
            args: Prisma.VouchersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VouchersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>
          }
          findMany: {
            args: Prisma.VouchersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>[]
          }
          create: {
            args: Prisma.VouchersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>
          }
          createMany: {
            args: Prisma.VouchersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VouchersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>[]
          }
          delete: {
            args: Prisma.VouchersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>
          }
          update: {
            args: Prisma.VouchersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>
          }
          deleteMany: {
            args: Prisma.VouchersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VouchersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VouchersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>[]
          }
          upsert: {
            args: Prisma.VouchersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VouchersPayload>
          }
          aggregate: {
            args: Prisma.VouchersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVouchers>
          }
          groupBy: {
            args: Prisma.VouchersGroupByArgs<ExtArgs>
            result: $Utils.Optional<VouchersGroupByOutputType>[]
          }
          count: {
            args: Prisma.VouchersCountArgs<ExtArgs>
            result: $Utils.Optional<VouchersCountAggregateOutputType> | number
          }
        }
      }
      BrandBanking: {
        payload: Prisma.$BrandBankingPayload<ExtArgs>
        fields: Prisma.BrandBankingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BrandBankingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BrandBankingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>
          }
          findFirst: {
            args: Prisma.BrandBankingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BrandBankingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>
          }
          findMany: {
            args: Prisma.BrandBankingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>[]
          }
          create: {
            args: Prisma.BrandBankingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>
          }
          createMany: {
            args: Prisma.BrandBankingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BrandBankingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>[]
          }
          delete: {
            args: Prisma.BrandBankingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>
          }
          update: {
            args: Prisma.BrandBankingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>
          }
          deleteMany: {
            args: Prisma.BrandBankingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BrandBankingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BrandBankingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>[]
          }
          upsert: {
            args: Prisma.BrandBankingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BrandBankingPayload>
          }
          aggregate: {
            args: Prisma.BrandBankingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBrandBanking>
          }
          groupBy: {
            args: Prisma.BrandBankingGroupByArgs<ExtArgs>
            result: $Utils.Optional<BrandBankingGroupByOutputType>[]
          }
          count: {
            args: Prisma.BrandBankingCountArgs<ExtArgs>
            result: $Utils.Optional<BrandBankingCountAggregateOutputType> | number
          }
        }
      }
      Occasion: {
        payload: Prisma.$OccasionPayload<ExtArgs>
        fields: Prisma.OccasionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OccasionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OccasionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>
          }
          findFirst: {
            args: Prisma.OccasionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OccasionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>
          }
          findMany: {
            args: Prisma.OccasionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>[]
          }
          create: {
            args: Prisma.OccasionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>
          }
          createMany: {
            args: Prisma.OccasionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OccasionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>[]
          }
          delete: {
            args: Prisma.OccasionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>
          }
          update: {
            args: Prisma.OccasionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>
          }
          deleteMany: {
            args: Prisma.OccasionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OccasionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OccasionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>[]
          }
          upsert: {
            args: Prisma.OccasionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionPayload>
          }
          aggregate: {
            args: Prisma.OccasionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOccasion>
          }
          groupBy: {
            args: Prisma.OccasionGroupByArgs<ExtArgs>
            result: $Utils.Optional<OccasionGroupByOutputType>[]
          }
          count: {
            args: Prisma.OccasionCountArgs<ExtArgs>
            result: $Utils.Optional<OccasionCountAggregateOutputType> | number
          }
        }
      }
      OccasionCategory: {
        payload: Prisma.$OccasionCategoryPayload<ExtArgs>
        fields: Prisma.OccasionCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OccasionCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OccasionCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>
          }
          findFirst: {
            args: Prisma.OccasionCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OccasionCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>
          }
          findMany: {
            args: Prisma.OccasionCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>[]
          }
          create: {
            args: Prisma.OccasionCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>
          }
          createMany: {
            args: Prisma.OccasionCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OccasionCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>[]
          }
          delete: {
            args: Prisma.OccasionCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>
          }
          update: {
            args: Prisma.OccasionCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>
          }
          deleteMany: {
            args: Prisma.OccasionCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OccasionCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OccasionCategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>[]
          }
          upsert: {
            args: Prisma.OccasionCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OccasionCategoryPayload>
          }
          aggregate: {
            args: Prisma.OccasionCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOccasionCategory>
          }
          groupBy: {
            args: Prisma.OccasionCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<OccasionCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.OccasionCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<OccasionCategoryCountAggregateOutputType> | number
          }
        }
      }
      Categories: {
        payload: Prisma.$CategoriesPayload<ExtArgs>
        fields: Prisma.CategoriesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoriesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoriesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>
          }
          findFirst: {
            args: Prisma.CategoriesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoriesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>
          }
          findMany: {
            args: Prisma.CategoriesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>[]
          }
          create: {
            args: Prisma.CategoriesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>
          }
          createMany: {
            args: Prisma.CategoriesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CategoriesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>[]
          }
          delete: {
            args: Prisma.CategoriesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>
          }
          update: {
            args: Prisma.CategoriesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>
          }
          deleteMany: {
            args: Prisma.CategoriesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoriesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CategoriesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>[]
          }
          upsert: {
            args: Prisma.CategoriesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoriesPayload>
          }
          aggregate: {
            args: Prisma.CategoriesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategories>
          }
          groupBy: {
            args: Prisma.CategoriesGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoriesGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoriesCountArgs<ExtArgs>
            result: $Utils.Optional<CategoriesCountAggregateOutputType> | number
          }
        }
      }
      ReceiverDetail: {
        payload: Prisma.$ReceiverDetailPayload<ExtArgs>
        fields: Prisma.ReceiverDetailFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReceiverDetailFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReceiverDetailFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>
          }
          findFirst: {
            args: Prisma.ReceiverDetailFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReceiverDetailFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>
          }
          findMany: {
            args: Prisma.ReceiverDetailFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>[]
          }
          create: {
            args: Prisma.ReceiverDetailCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>
          }
          createMany: {
            args: Prisma.ReceiverDetailCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReceiverDetailCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>[]
          }
          delete: {
            args: Prisma.ReceiverDetailDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>
          }
          update: {
            args: Prisma.ReceiverDetailUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>
          }
          deleteMany: {
            args: Prisma.ReceiverDetailDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReceiverDetailUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReceiverDetailUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>[]
          }
          upsert: {
            args: Prisma.ReceiverDetailUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReceiverDetailPayload>
          }
          aggregate: {
            args: Prisma.ReceiverDetailAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReceiverDetail>
          }
          groupBy: {
            args: Prisma.ReceiverDetailGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReceiverDetailGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReceiverDetailCountArgs<ExtArgs>
            result: $Utils.Optional<ReceiverDetailCountAggregateOutputType> | number
          }
        }
      }
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      Settlements: {
        payload: Prisma.$SettlementsPayload<ExtArgs>
        fields: Prisma.SettlementsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SettlementsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SettlementsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>
          }
          findFirst: {
            args: Prisma.SettlementsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SettlementsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>
          }
          findMany: {
            args: Prisma.SettlementsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>[]
          }
          create: {
            args: Prisma.SettlementsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>
          }
          createMany: {
            args: Prisma.SettlementsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SettlementsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>[]
          }
          delete: {
            args: Prisma.SettlementsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>
          }
          update: {
            args: Prisma.SettlementsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>
          }
          deleteMany: {
            args: Prisma.SettlementsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SettlementsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SettlementsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>[]
          }
          upsert: {
            args: Prisma.SettlementsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SettlementsPayload>
          }
          aggregate: {
            args: Prisma.SettlementsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSettlements>
          }
          groupBy: {
            args: Prisma.SettlementsGroupByArgs<ExtArgs>
            result: $Utils.Optional<SettlementsGroupByOutputType>[]
          }
          count: {
            args: Prisma.SettlementsCountArgs<ExtArgs>
            result: $Utils.Optional<SettlementsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    session?: SessionOmit
    brand?: BrandOmit
    brandContacts?: BrandContactsOmit
    brandTerms?: BrandTermsOmit
    vouchers?: VouchersOmit
    brandBanking?: BrandBankingOmit
    occasion?: OccasionOmit
    occasionCategory?: OccasionCategoryOmit
    categories?: CategoriesOmit
    receiverDetail?: ReceiverDetailOmit
    order?: OrderOmit
    settlements?: SettlementsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    sessions: number
    order: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | UserCountOutputTypeCountSessionsArgs
    order?: boolean | UserCountOutputTypeCountOrderArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }


  /**
   * Count Type BrandCountOutputType
   */

  export type BrandCountOutputType = {
    brandcontacts: number
    brandTerms: number
    brandBankings: number
    vouchers: number
    order: number
    settlements: number
  }

  export type BrandCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brandcontacts?: boolean | BrandCountOutputTypeCountBrandcontactsArgs
    brandTerms?: boolean | BrandCountOutputTypeCountBrandTermsArgs
    brandBankings?: boolean | BrandCountOutputTypeCountBrandBankingsArgs
    vouchers?: boolean | BrandCountOutputTypeCountVouchersArgs
    order?: boolean | BrandCountOutputTypeCountOrderArgs
    settlements?: boolean | BrandCountOutputTypeCountSettlementsArgs
  }

  // Custom InputTypes
  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandCountOutputType
     */
    select?: BrandCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeCountBrandcontactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandContactsWhereInput
  }

  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeCountBrandTermsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandTermsWhereInput
  }

  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeCountBrandBankingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandBankingWhereInput
  }

  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeCountVouchersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VouchersWhereInput
  }

  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeCountOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }

  /**
   * BrandCountOutputType without action
   */
  export type BrandCountOutputTypeCountSettlementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SettlementsWhereInput
  }


  /**
   * Count Type OccasionCountOutputType
   */

  export type OccasionCountOutputType = {
    occasionCategory: number
    order: number
  }

  export type OccasionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    occasionCategory?: boolean | OccasionCountOutputTypeCountOccasionCategoryArgs
    order?: boolean | OccasionCountOutputTypeCountOrderArgs
  }

  // Custom InputTypes
  /**
   * OccasionCountOutputType without action
   */
  export type OccasionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCountOutputType
     */
    select?: OccasionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OccasionCountOutputType without action
   */
  export type OccasionCountOutputTypeCountOccasionCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OccasionCategoryWhereInput
  }

  /**
   * OccasionCountOutputType without action
   */
  export type OccasionCountOutputTypeCountOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }


  /**
   * Count Type CategoriesCountOutputType
   */

  export type CategoriesCountOutputType = {
    brands: number
  }

  export type CategoriesCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | CategoriesCountOutputTypeCountBrandsArgs
  }

  // Custom InputTypes
  /**
   * CategoriesCountOutputType without action
   */
  export type CategoriesCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoriesCountOutputType
     */
    select?: CategoriesCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CategoriesCountOutputType without action
   */
  export type CategoriesCountOutputTypeCountBrandsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandWhereInput
  }


  /**
   * Count Type ReceiverDetailCountOutputType
   */

  export type ReceiverDetailCountOutputType = {
    order: number
  }

  export type ReceiverDetailCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | ReceiverDetailCountOutputTypeCountOrderArgs
  }

  // Custom InputTypes
  /**
   * ReceiverDetailCountOutputType without action
   */
  export type ReceiverDetailCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetailCountOutputType
     */
    select?: ReceiverDetailCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ReceiverDetailCountOutputType without action
   */
  export type ReceiverDetailCountOutputTypeCountOrderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    phone: string | null
    firstName: string | null
    lastName: string | null
    password: string | null
    avatar: string | null
    role: string | null
    isActive: boolean | null
    isVerify: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    phone: string | null
    firstName: string | null
    lastName: string | null
    password: string | null
    avatar: string | null
    role: string | null
    isActive: boolean | null
    isVerify: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    phone: number
    firstName: number
    lastName: number
    password: number
    avatar: number
    role: number
    isActive: number
    isVerify: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    phone?: true
    firstName?: true
    lastName?: true
    password?: true
    avatar?: true
    role?: true
    isActive?: true
    isVerify?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    phone?: true
    firstName?: true
    lastName?: true
    password?: true
    avatar?: true
    role?: true
    isActive?: true
    isVerify?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    phone?: true
    firstName?: true
    lastName?: true
    password?: true
    avatar?: true
    role?: true
    isActive?: true
    isVerify?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    avatar: string | null
    role: string | null
    isActive: boolean
    isVerify: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    phone?: boolean
    firstName?: boolean
    lastName?: boolean
    password?: boolean
    avatar?: boolean
    role?: boolean
    isActive?: boolean
    isVerify?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    order?: boolean | User$orderArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    phone?: boolean
    firstName?: boolean
    lastName?: boolean
    password?: boolean
    avatar?: boolean
    role?: boolean
    isActive?: boolean
    isVerify?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    phone?: boolean
    firstName?: boolean
    lastName?: boolean
    password?: boolean
    avatar?: boolean
    role?: boolean
    isActive?: boolean
    isVerify?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    phone?: boolean
    firstName?: boolean
    lastName?: boolean
    password?: boolean
    avatar?: boolean
    role?: boolean
    isActive?: boolean
    isVerify?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "phone" | "firstName" | "lastName" | "password" | "avatar" | "role" | "isActive" | "isVerify" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sessions?: boolean | User$sessionsArgs<ExtArgs>
    order?: boolean | User$orderArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      sessions: Prisma.$SessionPayload<ExtArgs>[]
      order: Prisma.$OrderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      phone: string
      firstName: string
      lastName: string
      password: string
      avatar: string | null
      role: string | null
      isActive: boolean
      isVerify: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    sessions<T extends User$sessionsArgs<ExtArgs> = {}>(args?: Subset<T, User$sessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    order<T extends User$orderArgs<ExtArgs> = {}>(args?: Subset<T, User$orderArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly avatar: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly isVerify: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.sessions
   */
  export type User$sessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    cursor?: SessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * User.order
   */
  export type User$orderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Session
   */

  export type AggregateSession = {
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  export type SessionMinAggregateOutputType = {
    id: string | null
    sessionToken: string | null
    userId: string | null
    expires: Date | null
  }

  export type SessionMaxAggregateOutputType = {
    id: string | null
    sessionToken: string | null
    userId: string | null
    expires: Date | null
  }

  export type SessionCountAggregateOutputType = {
    id: number
    sessionToken: number
    userId: number
    expires: number
    _all: number
  }


  export type SessionMinAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
  }

  export type SessionMaxAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
  }

  export type SessionCountAggregateInputType = {
    id?: true
    sessionToken?: true
    userId?: true
    expires?: true
    _all?: true
  }

  export type SessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Session to aggregate.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Sessions
    **/
    _count?: true | SessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionMaxAggregateInputType
  }

  export type GetSessionAggregateType<T extends SessionAggregateArgs> = {
        [P in keyof T & keyof AggregateSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSession[P]>
      : GetScalarType<T[P], AggregateSession[P]>
  }




  export type SessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionWhereInput
    orderBy?: SessionOrderByWithAggregationInput | SessionOrderByWithAggregationInput[]
    by: SessionScalarFieldEnum[] | SessionScalarFieldEnum
    having?: SessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCountAggregateInputType | true
    _min?: SessionMinAggregateInputType
    _max?: SessionMaxAggregateInputType
  }

  export type SessionGroupByOutputType = {
    id: string
    sessionToken: string
    userId: string
    expires: Date
    _count: SessionCountAggregateOutputType | null
    _min: SessionMinAggregateOutputType | null
    _max: SessionMaxAggregateOutputType | null
  }

  type GetSessionGroupByPayload<T extends SessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionGroupByOutputType[P]>
            : GetScalarType<T[P], SessionGroupByOutputType[P]>
        }
      >
    >


  export type SessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["session"]>

  export type SessionSelectScalar = {
    id?: boolean
    sessionToken?: boolean
    userId?: boolean
    expires?: boolean
  }

  export type SessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "sessionToken" | "userId" | "expires", ExtArgs["result"]["session"]>
  export type SessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type SessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $SessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Session"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionToken: string
      userId: string
      expires: Date
    }, ExtArgs["result"]["session"]>
    composites: {}
  }

  type SessionGetPayload<S extends boolean | null | undefined | SessionDefaultArgs> = $Result.GetResult<Prisma.$SessionPayload, S>

  type SessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SessionCountAggregateInputType | true
    }

  export interface SessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Session'], meta: { name: 'Session' } }
    /**
     * Find zero or one Session that matches the filter.
     * @param {SessionFindUniqueArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionFindUniqueArgs>(args: SelectSubset<T, SessionFindUniqueArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Session that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SessionFindUniqueOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionFindFirstArgs>(args?: SelectSubset<T, SessionFindFirstArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Session that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindFirstOrThrowArgs} args - Arguments to find a Session
     * @example
     * // Get one Session
     * const session = await prisma.session.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Sessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Sessions
     * const sessions = await prisma.session.findMany()
     * 
     * // Get first 10 Sessions
     * const sessions = await prisma.session.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionWithIdOnly = await prisma.session.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionFindManyArgs>(args?: SelectSubset<T, SessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Session.
     * @param {SessionCreateArgs} args - Arguments to create a Session.
     * @example
     * // Create one Session
     * const Session = await prisma.session.create({
     *   data: {
     *     // ... data to create a Session
     *   }
     * })
     * 
     */
    create<T extends SessionCreateArgs>(args: SelectSubset<T, SessionCreateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Sessions.
     * @param {SessionCreateManyArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCreateManyArgs>(args?: SelectSubset<T, SessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Sessions and returns the data saved in the database.
     * @param {SessionCreateManyAndReturnArgs} args - Arguments to create many Sessions.
     * @example
     * // Create many Sessions
     * const session = await prisma.session.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Session.
     * @param {SessionDeleteArgs} args - Arguments to delete one Session.
     * @example
     * // Delete one Session
     * const Session = await prisma.session.delete({
     *   where: {
     *     // ... filter to delete one Session
     *   }
     * })
     * 
     */
    delete<T extends SessionDeleteArgs>(args: SelectSubset<T, SessionDeleteArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Session.
     * @param {SessionUpdateArgs} args - Arguments to update one Session.
     * @example
     * // Update one Session
     * const session = await prisma.session.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionUpdateArgs>(args: SelectSubset<T, SessionUpdateArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Sessions.
     * @param {SessionDeleteManyArgs} args - Arguments to filter Sessions to delete.
     * @example
     * // Delete a few Sessions
     * const { count } = await prisma.session.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionDeleteManyArgs>(args?: SelectSubset<T, SessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionUpdateManyArgs>(args: SelectSubset<T, SessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Sessions and returns the data updated in the database.
     * @param {SessionUpdateManyAndReturnArgs} args - Arguments to update many Sessions.
     * @example
     * // Update many Sessions
     * const session = await prisma.session.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Sessions and only return the `id`
     * const sessionWithIdOnly = await prisma.session.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SessionUpdateManyAndReturnArgs>(args: SelectSubset<T, SessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Session.
     * @param {SessionUpsertArgs} args - Arguments to update or create a Session.
     * @example
     * // Update or create a Session
     * const session = await prisma.session.upsert({
     *   create: {
     *     // ... data to create a Session
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Session we want to update
     *   }
     * })
     */
    upsert<T extends SessionUpsertArgs>(args: SelectSubset<T, SessionUpsertArgs<ExtArgs>>): Prisma__SessionClient<$Result.GetResult<Prisma.$SessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Sessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCountArgs} args - Arguments to filter Sessions to count.
     * @example
     * // Count the number of Sessions
     * const count = await prisma.session.count({
     *   where: {
     *     // ... the filter for the Sessions we want to count
     *   }
     * })
    **/
    count<T extends SessionCountArgs>(
      args?: Subset<T, SessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionAggregateArgs>(args: Subset<T, SessionAggregateArgs>): Prisma.PrismaPromise<GetSessionAggregateType<T>>

    /**
     * Group by Session.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionGroupByArgs['orderBy'] }
        : { orderBy?: SessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Session model
   */
  readonly fields: SessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Session.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Session model
   */
  interface SessionFieldRefs {
    readonly id: FieldRef<"Session", 'String'>
    readonly sessionToken: FieldRef<"Session", 'String'>
    readonly userId: FieldRef<"Session", 'String'>
    readonly expires: FieldRef<"Session", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Session findUnique
   */
  export type SessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findUniqueOrThrow
   */
  export type SessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session findFirst
   */
  export type SessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findFirstOrThrow
   */
  export type SessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Session to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Sessions.
     */
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session findMany
   */
  export type SessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter, which Sessions to fetch.
     */
    where?: SessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Sessions to fetch.
     */
    orderBy?: SessionOrderByWithRelationInput | SessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Sessions.
     */
    cursor?: SessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Sessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Sessions.
     */
    skip?: number
    distinct?: SessionScalarFieldEnum | SessionScalarFieldEnum[]
  }

  /**
   * Session create
   */
  export type SessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to create a Session.
     */
    data: XOR<SessionCreateInput, SessionUncheckedCreateInput>
  }

  /**
   * Session createMany
   */
  export type SessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Session createManyAndReturn
   */
  export type SessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to create many Sessions.
     */
    data: SessionCreateManyInput | SessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session update
   */
  export type SessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The data needed to update a Session.
     */
    data: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
    /**
     * Choose, which Session to update.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session updateMany
   */
  export type SessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
  }

  /**
   * Session updateManyAndReturn
   */
  export type SessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * The data used to update Sessions.
     */
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyInput>
    /**
     * Filter which Sessions to update
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Session upsert
   */
  export type SessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * The filter to search for the Session to update in case it exists.
     */
    where: SessionWhereUniqueInput
    /**
     * In case the Session found by the `where` argument doesn't exist, create a new Session with this data.
     */
    create: XOR<SessionCreateInput, SessionUncheckedCreateInput>
    /**
     * In case the Session was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionUpdateInput, SessionUncheckedUpdateInput>
  }

  /**
   * Session delete
   */
  export type SessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
    /**
     * Filter which Session to delete.
     */
    where: SessionWhereUniqueInput
  }

  /**
   * Session deleteMany
   */
  export type SessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Sessions to delete
     */
    where?: SessionWhereInput
    /**
     * Limit how many Sessions to delete.
     */
    limit?: number
  }

  /**
   * Session without action
   */
  export type SessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Session
     */
    select?: SessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Session
     */
    omit?: SessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionInclude<ExtArgs> | null
  }


  /**
   * Model Brand
   */

  export type AggregateBrand = {
    _count: BrandCountAggregateOutputType | null
    _min: BrandMinAggregateOutputType | null
    _max: BrandMaxAggregateOutputType | null
  }

  export type BrandMinAggregateOutputType = {
    id: string | null
    brandName: string | null
    logo: string | null
    description: string | null
    website: string | null
    contact: string | null
    tagline: string | null
    color: string | null
    categoryId: string | null
    isActive: boolean | null
    isFeature: boolean | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandMaxAggregateOutputType = {
    id: string | null
    brandName: string | null
    logo: string | null
    description: string | null
    website: string | null
    contact: string | null
    tagline: string | null
    color: string | null
    categoryId: string | null
    isActive: boolean | null
    isFeature: boolean | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandCountAggregateOutputType = {
    id: number
    brandName: number
    logo: number
    description: number
    website: number
    contact: number
    tagline: number
    color: number
    categoryId: number
    isActive: number
    isFeature: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BrandMinAggregateInputType = {
    id?: true
    brandName?: true
    logo?: true
    description?: true
    website?: true
    contact?: true
    tagline?: true
    color?: true
    categoryId?: true
    isActive?: true
    isFeature?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandMaxAggregateInputType = {
    id?: true
    brandName?: true
    logo?: true
    description?: true
    website?: true
    contact?: true
    tagline?: true
    color?: true
    categoryId?: true
    isActive?: true
    isFeature?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandCountAggregateInputType = {
    id?: true
    brandName?: true
    logo?: true
    description?: true
    website?: true
    contact?: true
    tagline?: true
    color?: true
    categoryId?: true
    isActive?: true
    isFeature?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BrandAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Brand to aggregate.
     */
    where?: BrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Brands to fetch.
     */
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Brands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Brands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Brands
    **/
    _count?: true | BrandCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BrandMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BrandMaxAggregateInputType
  }

  export type GetBrandAggregateType<T extends BrandAggregateArgs> = {
        [P in keyof T & keyof AggregateBrand]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBrand[P]>
      : GetScalarType<T[P], AggregateBrand[P]>
  }




  export type BrandGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandWhereInput
    orderBy?: BrandOrderByWithAggregationInput | BrandOrderByWithAggregationInput[]
    by: BrandScalarFieldEnum[] | BrandScalarFieldEnum
    having?: BrandScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BrandCountAggregateInputType | true
    _min?: BrandMinAggregateInputType
    _max?: BrandMaxAggregateInputType
  }

  export type BrandGroupByOutputType = {
    id: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive: boolean
    isFeature: boolean
    notes: string
    createdAt: Date
    updatedAt: Date
    _count: BrandCountAggregateOutputType | null
    _min: BrandMinAggregateOutputType | null
    _max: BrandMaxAggregateOutputType | null
  }

  type GetBrandGroupByPayload<T extends BrandGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BrandGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BrandGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BrandGroupByOutputType[P]>
            : GetScalarType<T[P], BrandGroupByOutputType[P]>
        }
      >
    >


  export type BrandSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandName?: boolean
    logo?: boolean
    description?: boolean
    website?: boolean
    contact?: boolean
    tagline?: boolean
    color?: boolean
    categoryId?: boolean
    isActive?: boolean
    isFeature?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    categories?: boolean | CategoriesDefaultArgs<ExtArgs>
    brandcontacts?: boolean | Brand$brandcontactsArgs<ExtArgs>
    brandTerms?: boolean | Brand$brandTermsArgs<ExtArgs>
    brandBankings?: boolean | Brand$brandBankingsArgs<ExtArgs>
    vouchers?: boolean | Brand$vouchersArgs<ExtArgs>
    order?: boolean | Brand$orderArgs<ExtArgs>
    settlements?: boolean | Brand$settlementsArgs<ExtArgs>
    _count?: boolean | BrandCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brand"]>

  export type BrandSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandName?: boolean
    logo?: boolean
    description?: boolean
    website?: boolean
    contact?: boolean
    tagline?: boolean
    color?: boolean
    categoryId?: boolean
    isActive?: boolean
    isFeature?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    categories?: boolean | CategoriesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brand"]>

  export type BrandSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandName?: boolean
    logo?: boolean
    description?: boolean
    website?: boolean
    contact?: boolean
    tagline?: boolean
    color?: boolean
    categoryId?: boolean
    isActive?: boolean
    isFeature?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    categories?: boolean | CategoriesDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brand"]>

  export type BrandSelectScalar = {
    id?: boolean
    brandName?: boolean
    logo?: boolean
    description?: boolean
    website?: boolean
    contact?: boolean
    tagline?: boolean
    color?: boolean
    categoryId?: boolean
    isActive?: boolean
    isFeature?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BrandOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "brandName" | "logo" | "description" | "website" | "contact" | "tagline" | "color" | "categoryId" | "isActive" | "isFeature" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["brand"]>
  export type BrandInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    categories?: boolean | CategoriesDefaultArgs<ExtArgs>
    brandcontacts?: boolean | Brand$brandcontactsArgs<ExtArgs>
    brandTerms?: boolean | Brand$brandTermsArgs<ExtArgs>
    brandBankings?: boolean | Brand$brandBankingsArgs<ExtArgs>
    vouchers?: boolean | Brand$vouchersArgs<ExtArgs>
    order?: boolean | Brand$orderArgs<ExtArgs>
    settlements?: boolean | Brand$settlementsArgs<ExtArgs>
    _count?: boolean | BrandCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BrandIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    categories?: boolean | CategoriesDefaultArgs<ExtArgs>
  }
  export type BrandIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    categories?: boolean | CategoriesDefaultArgs<ExtArgs>
  }

  export type $BrandPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Brand"
    objects: {
      categories: Prisma.$CategoriesPayload<ExtArgs>
      brandcontacts: Prisma.$BrandContactsPayload<ExtArgs>[]
      brandTerms: Prisma.$BrandTermsPayload<ExtArgs>[]
      brandBankings: Prisma.$BrandBankingPayload<ExtArgs>[]
      vouchers: Prisma.$VouchersPayload<ExtArgs>[]
      order: Prisma.$OrderPayload<ExtArgs>[]
      settlements: Prisma.$SettlementsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      brandName: string
      logo: string
      description: string
      website: string
      contact: string
      tagline: string
      color: string
      categoryId: string
      isActive: boolean
      isFeature: boolean
      notes: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["brand"]>
    composites: {}
  }

  type BrandGetPayload<S extends boolean | null | undefined | BrandDefaultArgs> = $Result.GetResult<Prisma.$BrandPayload, S>

  type BrandCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BrandFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BrandCountAggregateInputType | true
    }

  export interface BrandDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Brand'], meta: { name: 'Brand' } }
    /**
     * Find zero or one Brand that matches the filter.
     * @param {BrandFindUniqueArgs} args - Arguments to find a Brand
     * @example
     * // Get one Brand
     * const brand = await prisma.brand.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BrandFindUniqueArgs>(args: SelectSubset<T, BrandFindUniqueArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Brand that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BrandFindUniqueOrThrowArgs} args - Arguments to find a Brand
     * @example
     * // Get one Brand
     * const brand = await prisma.brand.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BrandFindUniqueOrThrowArgs>(args: SelectSubset<T, BrandFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Brand that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandFindFirstArgs} args - Arguments to find a Brand
     * @example
     * // Get one Brand
     * const brand = await prisma.brand.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BrandFindFirstArgs>(args?: SelectSubset<T, BrandFindFirstArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Brand that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandFindFirstOrThrowArgs} args - Arguments to find a Brand
     * @example
     * // Get one Brand
     * const brand = await prisma.brand.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BrandFindFirstOrThrowArgs>(args?: SelectSubset<T, BrandFindFirstOrThrowArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Brands that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Brands
     * const brands = await prisma.brand.findMany()
     * 
     * // Get first 10 Brands
     * const brands = await prisma.brand.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const brandWithIdOnly = await prisma.brand.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BrandFindManyArgs>(args?: SelectSubset<T, BrandFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Brand.
     * @param {BrandCreateArgs} args - Arguments to create a Brand.
     * @example
     * // Create one Brand
     * const Brand = await prisma.brand.create({
     *   data: {
     *     // ... data to create a Brand
     *   }
     * })
     * 
     */
    create<T extends BrandCreateArgs>(args: SelectSubset<T, BrandCreateArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Brands.
     * @param {BrandCreateManyArgs} args - Arguments to create many Brands.
     * @example
     * // Create many Brands
     * const brand = await prisma.brand.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BrandCreateManyArgs>(args?: SelectSubset<T, BrandCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Brands and returns the data saved in the database.
     * @param {BrandCreateManyAndReturnArgs} args - Arguments to create many Brands.
     * @example
     * // Create many Brands
     * const brand = await prisma.brand.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Brands and only return the `id`
     * const brandWithIdOnly = await prisma.brand.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BrandCreateManyAndReturnArgs>(args?: SelectSubset<T, BrandCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Brand.
     * @param {BrandDeleteArgs} args - Arguments to delete one Brand.
     * @example
     * // Delete one Brand
     * const Brand = await prisma.brand.delete({
     *   where: {
     *     // ... filter to delete one Brand
     *   }
     * })
     * 
     */
    delete<T extends BrandDeleteArgs>(args: SelectSubset<T, BrandDeleteArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Brand.
     * @param {BrandUpdateArgs} args - Arguments to update one Brand.
     * @example
     * // Update one Brand
     * const brand = await prisma.brand.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BrandUpdateArgs>(args: SelectSubset<T, BrandUpdateArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Brands.
     * @param {BrandDeleteManyArgs} args - Arguments to filter Brands to delete.
     * @example
     * // Delete a few Brands
     * const { count } = await prisma.brand.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BrandDeleteManyArgs>(args?: SelectSubset<T, BrandDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Brands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Brands
     * const brand = await prisma.brand.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BrandUpdateManyArgs>(args: SelectSubset<T, BrandUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Brands and returns the data updated in the database.
     * @param {BrandUpdateManyAndReturnArgs} args - Arguments to update many Brands.
     * @example
     * // Update many Brands
     * const brand = await prisma.brand.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Brands and only return the `id`
     * const brandWithIdOnly = await prisma.brand.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BrandUpdateManyAndReturnArgs>(args: SelectSubset<T, BrandUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Brand.
     * @param {BrandUpsertArgs} args - Arguments to update or create a Brand.
     * @example
     * // Update or create a Brand
     * const brand = await prisma.brand.upsert({
     *   create: {
     *     // ... data to create a Brand
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Brand we want to update
     *   }
     * })
     */
    upsert<T extends BrandUpsertArgs>(args: SelectSubset<T, BrandUpsertArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Brands.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandCountArgs} args - Arguments to filter Brands to count.
     * @example
     * // Count the number of Brands
     * const count = await prisma.brand.count({
     *   where: {
     *     // ... the filter for the Brands we want to count
     *   }
     * })
    **/
    count<T extends BrandCountArgs>(
      args?: Subset<T, BrandCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BrandCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Brand.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BrandAggregateArgs>(args: Subset<T, BrandAggregateArgs>): Prisma.PrismaPromise<GetBrandAggregateType<T>>

    /**
     * Group by Brand.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BrandGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BrandGroupByArgs['orderBy'] }
        : { orderBy?: BrandGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BrandGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBrandGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Brand model
   */
  readonly fields: BrandFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Brand.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BrandClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    categories<T extends CategoriesDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CategoriesDefaultArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    brandcontacts<T extends Brand$brandcontactsArgs<ExtArgs> = {}>(args?: Subset<T, Brand$brandcontactsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    brandTerms<T extends Brand$brandTermsArgs<ExtArgs> = {}>(args?: Subset<T, Brand$brandTermsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    brandBankings<T extends Brand$brandBankingsArgs<ExtArgs> = {}>(args?: Subset<T, Brand$brandBankingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    vouchers<T extends Brand$vouchersArgs<ExtArgs> = {}>(args?: Subset<T, Brand$vouchersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    order<T extends Brand$orderArgs<ExtArgs> = {}>(args?: Subset<T, Brand$orderArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    settlements<T extends Brand$settlementsArgs<ExtArgs> = {}>(args?: Subset<T, Brand$settlementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Brand model
   */
  interface BrandFieldRefs {
    readonly id: FieldRef<"Brand", 'String'>
    readonly brandName: FieldRef<"Brand", 'String'>
    readonly logo: FieldRef<"Brand", 'String'>
    readonly description: FieldRef<"Brand", 'String'>
    readonly website: FieldRef<"Brand", 'String'>
    readonly contact: FieldRef<"Brand", 'String'>
    readonly tagline: FieldRef<"Brand", 'String'>
    readonly color: FieldRef<"Brand", 'String'>
    readonly categoryId: FieldRef<"Brand", 'String'>
    readonly isActive: FieldRef<"Brand", 'Boolean'>
    readonly isFeature: FieldRef<"Brand", 'Boolean'>
    readonly notes: FieldRef<"Brand", 'String'>
    readonly createdAt: FieldRef<"Brand", 'DateTime'>
    readonly updatedAt: FieldRef<"Brand", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Brand findUnique
   */
  export type BrandFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brand to fetch.
     */
    where: BrandWhereUniqueInput
  }

  /**
   * Brand findUniqueOrThrow
   */
  export type BrandFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brand to fetch.
     */
    where: BrandWhereUniqueInput
  }

  /**
   * Brand findFirst
   */
  export type BrandFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brand to fetch.
     */
    where?: BrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Brands to fetch.
     */
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Brands.
     */
    cursor?: BrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Brands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Brands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Brands.
     */
    distinct?: BrandScalarFieldEnum | BrandScalarFieldEnum[]
  }

  /**
   * Brand findFirstOrThrow
   */
  export type BrandFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brand to fetch.
     */
    where?: BrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Brands to fetch.
     */
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Brands.
     */
    cursor?: BrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Brands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Brands.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Brands.
     */
    distinct?: BrandScalarFieldEnum | BrandScalarFieldEnum[]
  }

  /**
   * Brand findMany
   */
  export type BrandFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter, which Brands to fetch.
     */
    where?: BrandWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Brands to fetch.
     */
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Brands.
     */
    cursor?: BrandWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Brands from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Brands.
     */
    skip?: number
    distinct?: BrandScalarFieldEnum | BrandScalarFieldEnum[]
  }

  /**
   * Brand create
   */
  export type BrandCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * The data needed to create a Brand.
     */
    data: XOR<BrandCreateInput, BrandUncheckedCreateInput>
  }

  /**
   * Brand createMany
   */
  export type BrandCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Brands.
     */
    data: BrandCreateManyInput | BrandCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Brand createManyAndReturn
   */
  export type BrandCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * The data used to create many Brands.
     */
    data: BrandCreateManyInput | BrandCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Brand update
   */
  export type BrandUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * The data needed to update a Brand.
     */
    data: XOR<BrandUpdateInput, BrandUncheckedUpdateInput>
    /**
     * Choose, which Brand to update.
     */
    where: BrandWhereUniqueInput
  }

  /**
   * Brand updateMany
   */
  export type BrandUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Brands.
     */
    data: XOR<BrandUpdateManyMutationInput, BrandUncheckedUpdateManyInput>
    /**
     * Filter which Brands to update
     */
    where?: BrandWhereInput
    /**
     * Limit how many Brands to update.
     */
    limit?: number
  }

  /**
   * Brand updateManyAndReturn
   */
  export type BrandUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * The data used to update Brands.
     */
    data: XOR<BrandUpdateManyMutationInput, BrandUncheckedUpdateManyInput>
    /**
     * Filter which Brands to update
     */
    where?: BrandWhereInput
    /**
     * Limit how many Brands to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Brand upsert
   */
  export type BrandUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * The filter to search for the Brand to update in case it exists.
     */
    where: BrandWhereUniqueInput
    /**
     * In case the Brand found by the `where` argument doesn't exist, create a new Brand with this data.
     */
    create: XOR<BrandCreateInput, BrandUncheckedCreateInput>
    /**
     * In case the Brand was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BrandUpdateInput, BrandUncheckedUpdateInput>
  }

  /**
   * Brand delete
   */
  export type BrandDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    /**
     * Filter which Brand to delete.
     */
    where: BrandWhereUniqueInput
  }

  /**
   * Brand deleteMany
   */
  export type BrandDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Brands to delete
     */
    where?: BrandWhereInput
    /**
     * Limit how many Brands to delete.
     */
    limit?: number
  }

  /**
   * Brand.brandcontacts
   */
  export type Brand$brandcontactsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    where?: BrandContactsWhereInput
    orderBy?: BrandContactsOrderByWithRelationInput | BrandContactsOrderByWithRelationInput[]
    cursor?: BrandContactsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BrandContactsScalarFieldEnum | BrandContactsScalarFieldEnum[]
  }

  /**
   * Brand.brandTerms
   */
  export type Brand$brandTermsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    where?: BrandTermsWhereInput
    orderBy?: BrandTermsOrderByWithRelationInput | BrandTermsOrderByWithRelationInput[]
    cursor?: BrandTermsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BrandTermsScalarFieldEnum | BrandTermsScalarFieldEnum[]
  }

  /**
   * Brand.brandBankings
   */
  export type Brand$brandBankingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    where?: BrandBankingWhereInput
    orderBy?: BrandBankingOrderByWithRelationInput | BrandBankingOrderByWithRelationInput[]
    cursor?: BrandBankingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BrandBankingScalarFieldEnum | BrandBankingScalarFieldEnum[]
  }

  /**
   * Brand.vouchers
   */
  export type Brand$vouchersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    where?: VouchersWhereInput
    orderBy?: VouchersOrderByWithRelationInput | VouchersOrderByWithRelationInput[]
    cursor?: VouchersWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VouchersScalarFieldEnum | VouchersScalarFieldEnum[]
  }

  /**
   * Brand.order
   */
  export type Brand$orderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Brand.settlements
   */
  export type Brand$settlementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    where?: SettlementsWhereInput
    orderBy?: SettlementsOrderByWithRelationInput | SettlementsOrderByWithRelationInput[]
    cursor?: SettlementsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SettlementsScalarFieldEnum | SettlementsScalarFieldEnum[]
  }

  /**
   * Brand without action
   */
  export type BrandDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
  }


  /**
   * Model BrandContacts
   */

  export type AggregateBrandContacts = {
    _count: BrandContactsCountAggregateOutputType | null
    _min: BrandContactsMinAggregateOutputType | null
    _max: BrandContactsMaxAggregateOutputType | null
  }

  export type BrandContactsMinAggregateOutputType = {
    id: string | null
    name: string | null
    role: string | null
    email: string | null
    phone: string | null
    brandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandContactsMaxAggregateOutputType = {
    id: string | null
    name: string | null
    role: string | null
    email: string | null
    phone: string | null
    brandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandContactsCountAggregateOutputType = {
    id: number
    name: number
    role: number
    email: number
    phone: number
    brandId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BrandContactsMinAggregateInputType = {
    id?: true
    name?: true
    role?: true
    email?: true
    phone?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandContactsMaxAggregateInputType = {
    id?: true
    name?: true
    role?: true
    email?: true
    phone?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandContactsCountAggregateInputType = {
    id?: true
    name?: true
    role?: true
    email?: true
    phone?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BrandContactsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BrandContacts to aggregate.
     */
    where?: BrandContactsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandContacts to fetch.
     */
    orderBy?: BrandContactsOrderByWithRelationInput | BrandContactsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BrandContactsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandContacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandContacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BrandContacts
    **/
    _count?: true | BrandContactsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BrandContactsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BrandContactsMaxAggregateInputType
  }

  export type GetBrandContactsAggregateType<T extends BrandContactsAggregateArgs> = {
        [P in keyof T & keyof AggregateBrandContacts]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBrandContacts[P]>
      : GetScalarType<T[P], AggregateBrandContacts[P]>
  }




  export type BrandContactsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandContactsWhereInput
    orderBy?: BrandContactsOrderByWithAggregationInput | BrandContactsOrderByWithAggregationInput[]
    by: BrandContactsScalarFieldEnum[] | BrandContactsScalarFieldEnum
    having?: BrandContactsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BrandContactsCountAggregateInputType | true
    _min?: BrandContactsMinAggregateInputType
    _max?: BrandContactsMaxAggregateInputType
  }

  export type BrandContactsGroupByOutputType = {
    id: string
    name: string
    role: string
    email: string
    phone: string
    brandId: string
    createdAt: Date
    updatedAt: Date
    _count: BrandContactsCountAggregateOutputType | null
    _min: BrandContactsMinAggregateOutputType | null
    _max: BrandContactsMaxAggregateOutputType | null
  }

  type GetBrandContactsGroupByPayload<T extends BrandContactsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BrandContactsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BrandContactsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BrandContactsGroupByOutputType[P]>
            : GetScalarType<T[P], BrandContactsGroupByOutputType[P]>
        }
      >
    >


  export type BrandContactsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    role?: boolean
    email?: boolean
    phone?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandContacts"]>

  export type BrandContactsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    role?: boolean
    email?: boolean
    phone?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandContacts"]>

  export type BrandContactsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    role?: boolean
    email?: boolean
    phone?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandContacts"]>

  export type BrandContactsSelectScalar = {
    id?: boolean
    name?: boolean
    role?: boolean
    email?: boolean
    phone?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BrandContactsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "role" | "email" | "phone" | "brandId" | "createdAt" | "updatedAt", ExtArgs["result"]["brandContacts"]>
  export type BrandContactsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type BrandContactsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type BrandContactsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }

  export type $BrandContactsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BrandContacts"
    objects: {
      brands: Prisma.$BrandPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      role: string
      email: string
      phone: string
      brandId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["brandContacts"]>
    composites: {}
  }

  type BrandContactsGetPayload<S extends boolean | null | undefined | BrandContactsDefaultArgs> = $Result.GetResult<Prisma.$BrandContactsPayload, S>

  type BrandContactsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BrandContactsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BrandContactsCountAggregateInputType | true
    }

  export interface BrandContactsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BrandContacts'], meta: { name: 'BrandContacts' } }
    /**
     * Find zero or one BrandContacts that matches the filter.
     * @param {BrandContactsFindUniqueArgs} args - Arguments to find a BrandContacts
     * @example
     * // Get one BrandContacts
     * const brandContacts = await prisma.brandContacts.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BrandContactsFindUniqueArgs>(args: SelectSubset<T, BrandContactsFindUniqueArgs<ExtArgs>>): Prisma__BrandContactsClient<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BrandContacts that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BrandContactsFindUniqueOrThrowArgs} args - Arguments to find a BrandContacts
     * @example
     * // Get one BrandContacts
     * const brandContacts = await prisma.brandContacts.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BrandContactsFindUniqueOrThrowArgs>(args: SelectSubset<T, BrandContactsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BrandContactsClient<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BrandContacts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandContactsFindFirstArgs} args - Arguments to find a BrandContacts
     * @example
     * // Get one BrandContacts
     * const brandContacts = await prisma.brandContacts.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BrandContactsFindFirstArgs>(args?: SelectSubset<T, BrandContactsFindFirstArgs<ExtArgs>>): Prisma__BrandContactsClient<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BrandContacts that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandContactsFindFirstOrThrowArgs} args - Arguments to find a BrandContacts
     * @example
     * // Get one BrandContacts
     * const brandContacts = await prisma.brandContacts.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BrandContactsFindFirstOrThrowArgs>(args?: SelectSubset<T, BrandContactsFindFirstOrThrowArgs<ExtArgs>>): Prisma__BrandContactsClient<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BrandContacts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandContactsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BrandContacts
     * const brandContacts = await prisma.brandContacts.findMany()
     * 
     * // Get first 10 BrandContacts
     * const brandContacts = await prisma.brandContacts.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const brandContactsWithIdOnly = await prisma.brandContacts.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BrandContactsFindManyArgs>(args?: SelectSubset<T, BrandContactsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BrandContacts.
     * @param {BrandContactsCreateArgs} args - Arguments to create a BrandContacts.
     * @example
     * // Create one BrandContacts
     * const BrandContacts = await prisma.brandContacts.create({
     *   data: {
     *     // ... data to create a BrandContacts
     *   }
     * })
     * 
     */
    create<T extends BrandContactsCreateArgs>(args: SelectSubset<T, BrandContactsCreateArgs<ExtArgs>>): Prisma__BrandContactsClient<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BrandContacts.
     * @param {BrandContactsCreateManyArgs} args - Arguments to create many BrandContacts.
     * @example
     * // Create many BrandContacts
     * const brandContacts = await prisma.brandContacts.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BrandContactsCreateManyArgs>(args?: SelectSubset<T, BrandContactsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BrandContacts and returns the data saved in the database.
     * @param {BrandContactsCreateManyAndReturnArgs} args - Arguments to create many BrandContacts.
     * @example
     * // Create many BrandContacts
     * const brandContacts = await prisma.brandContacts.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BrandContacts and only return the `id`
     * const brandContactsWithIdOnly = await prisma.brandContacts.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BrandContactsCreateManyAndReturnArgs>(args?: SelectSubset<T, BrandContactsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BrandContacts.
     * @param {BrandContactsDeleteArgs} args - Arguments to delete one BrandContacts.
     * @example
     * // Delete one BrandContacts
     * const BrandContacts = await prisma.brandContacts.delete({
     *   where: {
     *     // ... filter to delete one BrandContacts
     *   }
     * })
     * 
     */
    delete<T extends BrandContactsDeleteArgs>(args: SelectSubset<T, BrandContactsDeleteArgs<ExtArgs>>): Prisma__BrandContactsClient<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BrandContacts.
     * @param {BrandContactsUpdateArgs} args - Arguments to update one BrandContacts.
     * @example
     * // Update one BrandContacts
     * const brandContacts = await prisma.brandContacts.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BrandContactsUpdateArgs>(args: SelectSubset<T, BrandContactsUpdateArgs<ExtArgs>>): Prisma__BrandContactsClient<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BrandContacts.
     * @param {BrandContactsDeleteManyArgs} args - Arguments to filter BrandContacts to delete.
     * @example
     * // Delete a few BrandContacts
     * const { count } = await prisma.brandContacts.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BrandContactsDeleteManyArgs>(args?: SelectSubset<T, BrandContactsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BrandContacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandContactsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BrandContacts
     * const brandContacts = await prisma.brandContacts.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BrandContactsUpdateManyArgs>(args: SelectSubset<T, BrandContactsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BrandContacts and returns the data updated in the database.
     * @param {BrandContactsUpdateManyAndReturnArgs} args - Arguments to update many BrandContacts.
     * @example
     * // Update many BrandContacts
     * const brandContacts = await prisma.brandContacts.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BrandContacts and only return the `id`
     * const brandContactsWithIdOnly = await prisma.brandContacts.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BrandContactsUpdateManyAndReturnArgs>(args: SelectSubset<T, BrandContactsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BrandContacts.
     * @param {BrandContactsUpsertArgs} args - Arguments to update or create a BrandContacts.
     * @example
     * // Update or create a BrandContacts
     * const brandContacts = await prisma.brandContacts.upsert({
     *   create: {
     *     // ... data to create a BrandContacts
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BrandContacts we want to update
     *   }
     * })
     */
    upsert<T extends BrandContactsUpsertArgs>(args: SelectSubset<T, BrandContactsUpsertArgs<ExtArgs>>): Prisma__BrandContactsClient<$Result.GetResult<Prisma.$BrandContactsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BrandContacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandContactsCountArgs} args - Arguments to filter BrandContacts to count.
     * @example
     * // Count the number of BrandContacts
     * const count = await prisma.brandContacts.count({
     *   where: {
     *     // ... the filter for the BrandContacts we want to count
     *   }
     * })
    **/
    count<T extends BrandContactsCountArgs>(
      args?: Subset<T, BrandContactsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BrandContactsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BrandContacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandContactsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BrandContactsAggregateArgs>(args: Subset<T, BrandContactsAggregateArgs>): Prisma.PrismaPromise<GetBrandContactsAggregateType<T>>

    /**
     * Group by BrandContacts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandContactsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BrandContactsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BrandContactsGroupByArgs['orderBy'] }
        : { orderBy?: BrandContactsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BrandContactsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBrandContactsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BrandContacts model
   */
  readonly fields: BrandContactsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BrandContacts.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BrandContactsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    brands<T extends BrandDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BrandDefaultArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BrandContacts model
   */
  interface BrandContactsFieldRefs {
    readonly id: FieldRef<"BrandContacts", 'String'>
    readonly name: FieldRef<"BrandContacts", 'String'>
    readonly role: FieldRef<"BrandContacts", 'String'>
    readonly email: FieldRef<"BrandContacts", 'String'>
    readonly phone: FieldRef<"BrandContacts", 'String'>
    readonly brandId: FieldRef<"BrandContacts", 'String'>
    readonly createdAt: FieldRef<"BrandContacts", 'DateTime'>
    readonly updatedAt: FieldRef<"BrandContacts", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BrandContacts findUnique
   */
  export type BrandContactsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * Filter, which BrandContacts to fetch.
     */
    where: BrandContactsWhereUniqueInput
  }

  /**
   * BrandContacts findUniqueOrThrow
   */
  export type BrandContactsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * Filter, which BrandContacts to fetch.
     */
    where: BrandContactsWhereUniqueInput
  }

  /**
   * BrandContacts findFirst
   */
  export type BrandContactsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * Filter, which BrandContacts to fetch.
     */
    where?: BrandContactsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandContacts to fetch.
     */
    orderBy?: BrandContactsOrderByWithRelationInput | BrandContactsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BrandContacts.
     */
    cursor?: BrandContactsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandContacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandContacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BrandContacts.
     */
    distinct?: BrandContactsScalarFieldEnum | BrandContactsScalarFieldEnum[]
  }

  /**
   * BrandContacts findFirstOrThrow
   */
  export type BrandContactsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * Filter, which BrandContacts to fetch.
     */
    where?: BrandContactsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandContacts to fetch.
     */
    orderBy?: BrandContactsOrderByWithRelationInput | BrandContactsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BrandContacts.
     */
    cursor?: BrandContactsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandContacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandContacts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BrandContacts.
     */
    distinct?: BrandContactsScalarFieldEnum | BrandContactsScalarFieldEnum[]
  }

  /**
   * BrandContacts findMany
   */
  export type BrandContactsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * Filter, which BrandContacts to fetch.
     */
    where?: BrandContactsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandContacts to fetch.
     */
    orderBy?: BrandContactsOrderByWithRelationInput | BrandContactsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BrandContacts.
     */
    cursor?: BrandContactsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandContacts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandContacts.
     */
    skip?: number
    distinct?: BrandContactsScalarFieldEnum | BrandContactsScalarFieldEnum[]
  }

  /**
   * BrandContacts create
   */
  export type BrandContactsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * The data needed to create a BrandContacts.
     */
    data: XOR<BrandContactsCreateInput, BrandContactsUncheckedCreateInput>
  }

  /**
   * BrandContacts createMany
   */
  export type BrandContactsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BrandContacts.
     */
    data: BrandContactsCreateManyInput | BrandContactsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BrandContacts createManyAndReturn
   */
  export type BrandContactsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * The data used to create many BrandContacts.
     */
    data: BrandContactsCreateManyInput | BrandContactsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BrandContacts update
   */
  export type BrandContactsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * The data needed to update a BrandContacts.
     */
    data: XOR<BrandContactsUpdateInput, BrandContactsUncheckedUpdateInput>
    /**
     * Choose, which BrandContacts to update.
     */
    where: BrandContactsWhereUniqueInput
  }

  /**
   * BrandContacts updateMany
   */
  export type BrandContactsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BrandContacts.
     */
    data: XOR<BrandContactsUpdateManyMutationInput, BrandContactsUncheckedUpdateManyInput>
    /**
     * Filter which BrandContacts to update
     */
    where?: BrandContactsWhereInput
    /**
     * Limit how many BrandContacts to update.
     */
    limit?: number
  }

  /**
   * BrandContacts updateManyAndReturn
   */
  export type BrandContactsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * The data used to update BrandContacts.
     */
    data: XOR<BrandContactsUpdateManyMutationInput, BrandContactsUncheckedUpdateManyInput>
    /**
     * Filter which BrandContacts to update
     */
    where?: BrandContactsWhereInput
    /**
     * Limit how many BrandContacts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BrandContacts upsert
   */
  export type BrandContactsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * The filter to search for the BrandContacts to update in case it exists.
     */
    where: BrandContactsWhereUniqueInput
    /**
     * In case the BrandContacts found by the `where` argument doesn't exist, create a new BrandContacts with this data.
     */
    create: XOR<BrandContactsCreateInput, BrandContactsUncheckedCreateInput>
    /**
     * In case the BrandContacts was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BrandContactsUpdateInput, BrandContactsUncheckedUpdateInput>
  }

  /**
   * BrandContacts delete
   */
  export type BrandContactsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
    /**
     * Filter which BrandContacts to delete.
     */
    where: BrandContactsWhereUniqueInput
  }

  /**
   * BrandContacts deleteMany
   */
  export type BrandContactsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BrandContacts to delete
     */
    where?: BrandContactsWhereInput
    /**
     * Limit how many BrandContacts to delete.
     */
    limit?: number
  }

  /**
   * BrandContacts without action
   */
  export type BrandContactsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandContacts
     */
    select?: BrandContactsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandContacts
     */
    omit?: BrandContactsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandContactsInclude<ExtArgs> | null
  }


  /**
   * Model BrandTerms
   */

  export type AggregateBrandTerms = {
    _count: BrandTermsCountAggregateOutputType | null
    _avg: BrandTermsAvgAggregateOutputType | null
    _sum: BrandTermsSumAggregateOutputType | null
    _min: BrandTermsMinAggregateOutputType | null
    _max: BrandTermsMaxAggregateOutputType | null
  }

  export type BrandTermsAvgAggregateOutputType = {
    commissionValue: number | null
    discount: number | null
    orderValue: number | null
    brackingShare: number | null
    vatRate: number | null
  }

  export type BrandTermsSumAggregateOutputType = {
    commissionValue: number | null
    discount: number | null
    orderValue: number | null
    brackingShare: number | null
    vatRate: number | null
  }

  export type BrandTermsMinAggregateOutputType = {
    id: string | null
    settelementTrigger: $Enums.SettelmentStatus | null
    commissionType: $Enums.CommissionStatus | null
    commissionValue: number | null
    currency: string | null
    discount: number | null
    orderValue: number | null
    contractStart: Date | null
    contractEnd: Date | null
    goLiveDate: Date | null
    renewContract: boolean | null
    brackingPolicy: $Enums.PolicyStatus | null
    brackingShare: number | null
    vatRate: number | null
    internalNotes: string | null
    brandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandTermsMaxAggregateOutputType = {
    id: string | null
    settelementTrigger: $Enums.SettelmentStatus | null
    commissionType: $Enums.CommissionStatus | null
    commissionValue: number | null
    currency: string | null
    discount: number | null
    orderValue: number | null
    contractStart: Date | null
    contractEnd: Date | null
    goLiveDate: Date | null
    renewContract: boolean | null
    brackingPolicy: $Enums.PolicyStatus | null
    brackingShare: number | null
    vatRate: number | null
    internalNotes: string | null
    brandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandTermsCountAggregateOutputType = {
    id: number
    settelementTrigger: number
    commissionType: number
    commissionValue: number
    currency: number
    discount: number
    orderValue: number
    contractStart: number
    contractEnd: number
    goLiveDate: number
    renewContract: number
    brackingPolicy: number
    brackingShare: number
    vatRate: number
    internalNotes: number
    brandId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BrandTermsAvgAggregateInputType = {
    commissionValue?: true
    discount?: true
    orderValue?: true
    brackingShare?: true
    vatRate?: true
  }

  export type BrandTermsSumAggregateInputType = {
    commissionValue?: true
    discount?: true
    orderValue?: true
    brackingShare?: true
    vatRate?: true
  }

  export type BrandTermsMinAggregateInputType = {
    id?: true
    settelementTrigger?: true
    commissionType?: true
    commissionValue?: true
    currency?: true
    discount?: true
    orderValue?: true
    contractStart?: true
    contractEnd?: true
    goLiveDate?: true
    renewContract?: true
    brackingPolicy?: true
    brackingShare?: true
    vatRate?: true
    internalNotes?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandTermsMaxAggregateInputType = {
    id?: true
    settelementTrigger?: true
    commissionType?: true
    commissionValue?: true
    currency?: true
    discount?: true
    orderValue?: true
    contractStart?: true
    contractEnd?: true
    goLiveDate?: true
    renewContract?: true
    brackingPolicy?: true
    brackingShare?: true
    vatRate?: true
    internalNotes?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandTermsCountAggregateInputType = {
    id?: true
    settelementTrigger?: true
    commissionType?: true
    commissionValue?: true
    currency?: true
    discount?: true
    orderValue?: true
    contractStart?: true
    contractEnd?: true
    goLiveDate?: true
    renewContract?: true
    brackingPolicy?: true
    brackingShare?: true
    vatRate?: true
    internalNotes?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BrandTermsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BrandTerms to aggregate.
     */
    where?: BrandTermsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandTerms to fetch.
     */
    orderBy?: BrandTermsOrderByWithRelationInput | BrandTermsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BrandTermsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandTerms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandTerms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BrandTerms
    **/
    _count?: true | BrandTermsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BrandTermsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BrandTermsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BrandTermsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BrandTermsMaxAggregateInputType
  }

  export type GetBrandTermsAggregateType<T extends BrandTermsAggregateArgs> = {
        [P in keyof T & keyof AggregateBrandTerms]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBrandTerms[P]>
      : GetScalarType<T[P], AggregateBrandTerms[P]>
  }




  export type BrandTermsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandTermsWhereInput
    orderBy?: BrandTermsOrderByWithAggregationInput | BrandTermsOrderByWithAggregationInput[]
    by: BrandTermsScalarFieldEnum[] | BrandTermsScalarFieldEnum
    having?: BrandTermsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BrandTermsCountAggregateInputType | true
    _avg?: BrandTermsAvgAggregateInputType
    _sum?: BrandTermsSumAggregateInputType
    _min?: BrandTermsMinAggregateInputType
    _max?: BrandTermsMaxAggregateInputType
  }

  export type BrandTermsGroupByOutputType = {
    id: string
    settelementTrigger: $Enums.SettelmentStatus
    commissionType: $Enums.CommissionStatus
    commissionValue: number
    currency: string
    discount: number | null
    orderValue: number | null
    contractStart: Date
    contractEnd: Date
    goLiveDate: Date
    renewContract: boolean
    brackingPolicy: $Enums.PolicyStatus
    brackingShare: number | null
    vatRate: number | null
    internalNotes: string
    brandId: string
    createdAt: Date
    updatedAt: Date
    _count: BrandTermsCountAggregateOutputType | null
    _avg: BrandTermsAvgAggregateOutputType | null
    _sum: BrandTermsSumAggregateOutputType | null
    _min: BrandTermsMinAggregateOutputType | null
    _max: BrandTermsMaxAggregateOutputType | null
  }

  type GetBrandTermsGroupByPayload<T extends BrandTermsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BrandTermsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BrandTermsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BrandTermsGroupByOutputType[P]>
            : GetScalarType<T[P], BrandTermsGroupByOutputType[P]>
        }
      >
    >


  export type BrandTermsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    settelementTrigger?: boolean
    commissionType?: boolean
    commissionValue?: boolean
    currency?: boolean
    discount?: boolean
    orderValue?: boolean
    contractStart?: boolean
    contractEnd?: boolean
    goLiveDate?: boolean
    renewContract?: boolean
    brackingPolicy?: boolean
    brackingShare?: boolean
    vatRate?: boolean
    internalNotes?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandTerms"]>

  export type BrandTermsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    settelementTrigger?: boolean
    commissionType?: boolean
    commissionValue?: boolean
    currency?: boolean
    discount?: boolean
    orderValue?: boolean
    contractStart?: boolean
    contractEnd?: boolean
    goLiveDate?: boolean
    renewContract?: boolean
    brackingPolicy?: boolean
    brackingShare?: boolean
    vatRate?: boolean
    internalNotes?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandTerms"]>

  export type BrandTermsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    settelementTrigger?: boolean
    commissionType?: boolean
    commissionValue?: boolean
    currency?: boolean
    discount?: boolean
    orderValue?: boolean
    contractStart?: boolean
    contractEnd?: boolean
    goLiveDate?: boolean
    renewContract?: boolean
    brackingPolicy?: boolean
    brackingShare?: boolean
    vatRate?: boolean
    internalNotes?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandTerms"]>

  export type BrandTermsSelectScalar = {
    id?: boolean
    settelementTrigger?: boolean
    commissionType?: boolean
    commissionValue?: boolean
    currency?: boolean
    discount?: boolean
    orderValue?: boolean
    contractStart?: boolean
    contractEnd?: boolean
    goLiveDate?: boolean
    renewContract?: boolean
    brackingPolicy?: boolean
    brackingShare?: boolean
    vatRate?: boolean
    internalNotes?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BrandTermsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "settelementTrigger" | "commissionType" | "commissionValue" | "currency" | "discount" | "orderValue" | "contractStart" | "contractEnd" | "goLiveDate" | "renewContract" | "brackingPolicy" | "brackingShare" | "vatRate" | "internalNotes" | "brandId" | "createdAt" | "updatedAt", ExtArgs["result"]["brandTerms"]>
  export type BrandTermsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type BrandTermsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type BrandTermsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }

  export type $BrandTermsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BrandTerms"
    objects: {
      brands: Prisma.$BrandPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      settelementTrigger: $Enums.SettelmentStatus
      commissionType: $Enums.CommissionStatus
      commissionValue: number
      currency: string
      discount: number | null
      orderValue: number | null
      contractStart: Date
      contractEnd: Date
      goLiveDate: Date
      renewContract: boolean
      brackingPolicy: $Enums.PolicyStatus
      brackingShare: number | null
      vatRate: number | null
      internalNotes: string
      brandId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["brandTerms"]>
    composites: {}
  }

  type BrandTermsGetPayload<S extends boolean | null | undefined | BrandTermsDefaultArgs> = $Result.GetResult<Prisma.$BrandTermsPayload, S>

  type BrandTermsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BrandTermsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BrandTermsCountAggregateInputType | true
    }

  export interface BrandTermsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BrandTerms'], meta: { name: 'BrandTerms' } }
    /**
     * Find zero or one BrandTerms that matches the filter.
     * @param {BrandTermsFindUniqueArgs} args - Arguments to find a BrandTerms
     * @example
     * // Get one BrandTerms
     * const brandTerms = await prisma.brandTerms.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BrandTermsFindUniqueArgs>(args: SelectSubset<T, BrandTermsFindUniqueArgs<ExtArgs>>): Prisma__BrandTermsClient<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BrandTerms that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BrandTermsFindUniqueOrThrowArgs} args - Arguments to find a BrandTerms
     * @example
     * // Get one BrandTerms
     * const brandTerms = await prisma.brandTerms.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BrandTermsFindUniqueOrThrowArgs>(args: SelectSubset<T, BrandTermsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BrandTermsClient<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BrandTerms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandTermsFindFirstArgs} args - Arguments to find a BrandTerms
     * @example
     * // Get one BrandTerms
     * const brandTerms = await prisma.brandTerms.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BrandTermsFindFirstArgs>(args?: SelectSubset<T, BrandTermsFindFirstArgs<ExtArgs>>): Prisma__BrandTermsClient<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BrandTerms that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandTermsFindFirstOrThrowArgs} args - Arguments to find a BrandTerms
     * @example
     * // Get one BrandTerms
     * const brandTerms = await prisma.brandTerms.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BrandTermsFindFirstOrThrowArgs>(args?: SelectSubset<T, BrandTermsFindFirstOrThrowArgs<ExtArgs>>): Prisma__BrandTermsClient<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BrandTerms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandTermsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BrandTerms
     * const brandTerms = await prisma.brandTerms.findMany()
     * 
     * // Get first 10 BrandTerms
     * const brandTerms = await prisma.brandTerms.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const brandTermsWithIdOnly = await prisma.brandTerms.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BrandTermsFindManyArgs>(args?: SelectSubset<T, BrandTermsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BrandTerms.
     * @param {BrandTermsCreateArgs} args - Arguments to create a BrandTerms.
     * @example
     * // Create one BrandTerms
     * const BrandTerms = await prisma.brandTerms.create({
     *   data: {
     *     // ... data to create a BrandTerms
     *   }
     * })
     * 
     */
    create<T extends BrandTermsCreateArgs>(args: SelectSubset<T, BrandTermsCreateArgs<ExtArgs>>): Prisma__BrandTermsClient<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BrandTerms.
     * @param {BrandTermsCreateManyArgs} args - Arguments to create many BrandTerms.
     * @example
     * // Create many BrandTerms
     * const brandTerms = await prisma.brandTerms.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BrandTermsCreateManyArgs>(args?: SelectSubset<T, BrandTermsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BrandTerms and returns the data saved in the database.
     * @param {BrandTermsCreateManyAndReturnArgs} args - Arguments to create many BrandTerms.
     * @example
     * // Create many BrandTerms
     * const brandTerms = await prisma.brandTerms.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BrandTerms and only return the `id`
     * const brandTermsWithIdOnly = await prisma.brandTerms.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BrandTermsCreateManyAndReturnArgs>(args?: SelectSubset<T, BrandTermsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BrandTerms.
     * @param {BrandTermsDeleteArgs} args - Arguments to delete one BrandTerms.
     * @example
     * // Delete one BrandTerms
     * const BrandTerms = await prisma.brandTerms.delete({
     *   where: {
     *     // ... filter to delete one BrandTerms
     *   }
     * })
     * 
     */
    delete<T extends BrandTermsDeleteArgs>(args: SelectSubset<T, BrandTermsDeleteArgs<ExtArgs>>): Prisma__BrandTermsClient<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BrandTerms.
     * @param {BrandTermsUpdateArgs} args - Arguments to update one BrandTerms.
     * @example
     * // Update one BrandTerms
     * const brandTerms = await prisma.brandTerms.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BrandTermsUpdateArgs>(args: SelectSubset<T, BrandTermsUpdateArgs<ExtArgs>>): Prisma__BrandTermsClient<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BrandTerms.
     * @param {BrandTermsDeleteManyArgs} args - Arguments to filter BrandTerms to delete.
     * @example
     * // Delete a few BrandTerms
     * const { count } = await prisma.brandTerms.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BrandTermsDeleteManyArgs>(args?: SelectSubset<T, BrandTermsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BrandTerms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandTermsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BrandTerms
     * const brandTerms = await prisma.brandTerms.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BrandTermsUpdateManyArgs>(args: SelectSubset<T, BrandTermsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BrandTerms and returns the data updated in the database.
     * @param {BrandTermsUpdateManyAndReturnArgs} args - Arguments to update many BrandTerms.
     * @example
     * // Update many BrandTerms
     * const brandTerms = await prisma.brandTerms.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BrandTerms and only return the `id`
     * const brandTermsWithIdOnly = await prisma.brandTerms.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BrandTermsUpdateManyAndReturnArgs>(args: SelectSubset<T, BrandTermsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BrandTerms.
     * @param {BrandTermsUpsertArgs} args - Arguments to update or create a BrandTerms.
     * @example
     * // Update or create a BrandTerms
     * const brandTerms = await prisma.brandTerms.upsert({
     *   create: {
     *     // ... data to create a BrandTerms
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BrandTerms we want to update
     *   }
     * })
     */
    upsert<T extends BrandTermsUpsertArgs>(args: SelectSubset<T, BrandTermsUpsertArgs<ExtArgs>>): Prisma__BrandTermsClient<$Result.GetResult<Prisma.$BrandTermsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BrandTerms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandTermsCountArgs} args - Arguments to filter BrandTerms to count.
     * @example
     * // Count the number of BrandTerms
     * const count = await prisma.brandTerms.count({
     *   where: {
     *     // ... the filter for the BrandTerms we want to count
     *   }
     * })
    **/
    count<T extends BrandTermsCountArgs>(
      args?: Subset<T, BrandTermsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BrandTermsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BrandTerms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandTermsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BrandTermsAggregateArgs>(args: Subset<T, BrandTermsAggregateArgs>): Prisma.PrismaPromise<GetBrandTermsAggregateType<T>>

    /**
     * Group by BrandTerms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandTermsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BrandTermsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BrandTermsGroupByArgs['orderBy'] }
        : { orderBy?: BrandTermsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BrandTermsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBrandTermsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BrandTerms model
   */
  readonly fields: BrandTermsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BrandTerms.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BrandTermsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    brands<T extends BrandDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BrandDefaultArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BrandTerms model
   */
  interface BrandTermsFieldRefs {
    readonly id: FieldRef<"BrandTerms", 'String'>
    readonly settelementTrigger: FieldRef<"BrandTerms", 'SettelmentStatus'>
    readonly commissionType: FieldRef<"BrandTerms", 'CommissionStatus'>
    readonly commissionValue: FieldRef<"BrandTerms", 'Int'>
    readonly currency: FieldRef<"BrandTerms", 'String'>
    readonly discount: FieldRef<"BrandTerms", 'Int'>
    readonly orderValue: FieldRef<"BrandTerms", 'Int'>
    readonly contractStart: FieldRef<"BrandTerms", 'DateTime'>
    readonly contractEnd: FieldRef<"BrandTerms", 'DateTime'>
    readonly goLiveDate: FieldRef<"BrandTerms", 'DateTime'>
    readonly renewContract: FieldRef<"BrandTerms", 'Boolean'>
    readonly brackingPolicy: FieldRef<"BrandTerms", 'PolicyStatus'>
    readonly brackingShare: FieldRef<"BrandTerms", 'Int'>
    readonly vatRate: FieldRef<"BrandTerms", 'Int'>
    readonly internalNotes: FieldRef<"BrandTerms", 'String'>
    readonly brandId: FieldRef<"BrandTerms", 'String'>
    readonly createdAt: FieldRef<"BrandTerms", 'DateTime'>
    readonly updatedAt: FieldRef<"BrandTerms", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BrandTerms findUnique
   */
  export type BrandTermsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * Filter, which BrandTerms to fetch.
     */
    where: BrandTermsWhereUniqueInput
  }

  /**
   * BrandTerms findUniqueOrThrow
   */
  export type BrandTermsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * Filter, which BrandTerms to fetch.
     */
    where: BrandTermsWhereUniqueInput
  }

  /**
   * BrandTerms findFirst
   */
  export type BrandTermsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * Filter, which BrandTerms to fetch.
     */
    where?: BrandTermsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandTerms to fetch.
     */
    orderBy?: BrandTermsOrderByWithRelationInput | BrandTermsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BrandTerms.
     */
    cursor?: BrandTermsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandTerms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandTerms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BrandTerms.
     */
    distinct?: BrandTermsScalarFieldEnum | BrandTermsScalarFieldEnum[]
  }

  /**
   * BrandTerms findFirstOrThrow
   */
  export type BrandTermsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * Filter, which BrandTerms to fetch.
     */
    where?: BrandTermsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandTerms to fetch.
     */
    orderBy?: BrandTermsOrderByWithRelationInput | BrandTermsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BrandTerms.
     */
    cursor?: BrandTermsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandTerms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandTerms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BrandTerms.
     */
    distinct?: BrandTermsScalarFieldEnum | BrandTermsScalarFieldEnum[]
  }

  /**
   * BrandTerms findMany
   */
  export type BrandTermsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * Filter, which BrandTerms to fetch.
     */
    where?: BrandTermsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandTerms to fetch.
     */
    orderBy?: BrandTermsOrderByWithRelationInput | BrandTermsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BrandTerms.
     */
    cursor?: BrandTermsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandTerms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandTerms.
     */
    skip?: number
    distinct?: BrandTermsScalarFieldEnum | BrandTermsScalarFieldEnum[]
  }

  /**
   * BrandTerms create
   */
  export type BrandTermsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * The data needed to create a BrandTerms.
     */
    data: XOR<BrandTermsCreateInput, BrandTermsUncheckedCreateInput>
  }

  /**
   * BrandTerms createMany
   */
  export type BrandTermsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BrandTerms.
     */
    data: BrandTermsCreateManyInput | BrandTermsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BrandTerms createManyAndReturn
   */
  export type BrandTermsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * The data used to create many BrandTerms.
     */
    data: BrandTermsCreateManyInput | BrandTermsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BrandTerms update
   */
  export type BrandTermsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * The data needed to update a BrandTerms.
     */
    data: XOR<BrandTermsUpdateInput, BrandTermsUncheckedUpdateInput>
    /**
     * Choose, which BrandTerms to update.
     */
    where: BrandTermsWhereUniqueInput
  }

  /**
   * BrandTerms updateMany
   */
  export type BrandTermsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BrandTerms.
     */
    data: XOR<BrandTermsUpdateManyMutationInput, BrandTermsUncheckedUpdateManyInput>
    /**
     * Filter which BrandTerms to update
     */
    where?: BrandTermsWhereInput
    /**
     * Limit how many BrandTerms to update.
     */
    limit?: number
  }

  /**
   * BrandTerms updateManyAndReturn
   */
  export type BrandTermsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * The data used to update BrandTerms.
     */
    data: XOR<BrandTermsUpdateManyMutationInput, BrandTermsUncheckedUpdateManyInput>
    /**
     * Filter which BrandTerms to update
     */
    where?: BrandTermsWhereInput
    /**
     * Limit how many BrandTerms to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BrandTerms upsert
   */
  export type BrandTermsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * The filter to search for the BrandTerms to update in case it exists.
     */
    where: BrandTermsWhereUniqueInput
    /**
     * In case the BrandTerms found by the `where` argument doesn't exist, create a new BrandTerms with this data.
     */
    create: XOR<BrandTermsCreateInput, BrandTermsUncheckedCreateInput>
    /**
     * In case the BrandTerms was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BrandTermsUpdateInput, BrandTermsUncheckedUpdateInput>
  }

  /**
   * BrandTerms delete
   */
  export type BrandTermsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
    /**
     * Filter which BrandTerms to delete.
     */
    where: BrandTermsWhereUniqueInput
  }

  /**
   * BrandTerms deleteMany
   */
  export type BrandTermsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BrandTerms to delete
     */
    where?: BrandTermsWhereInput
    /**
     * Limit how many BrandTerms to delete.
     */
    limit?: number
  }

  /**
   * BrandTerms without action
   */
  export type BrandTermsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandTerms
     */
    select?: BrandTermsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandTerms
     */
    omit?: BrandTermsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandTermsInclude<ExtArgs> | null
  }


  /**
   * Model Vouchers
   */

  export type AggregateVouchers = {
    _count: VouchersCountAggregateOutputType | null
    _avg: VouchersAvgAggregateOutputType | null
    _sum: VouchersSumAggregateOutputType | null
    _min: VouchersMinAggregateOutputType | null
    _max: VouchersMaxAggregateOutputType | null
  }

  export type VouchersAvgAggregateOutputType = {
    maxAmount: number | null
    minAmount: number | null
    graceDays: number | null
    userPerDay: number | null
  }

  export type VouchersSumAggregateOutputType = {
    maxAmount: number | null
    minAmount: number | null
    graceDays: number | null
    userPerDay: number | null
  }

  export type VouchersMinAggregateOutputType = {
    id: string | null
    denominationype: $Enums.DenominationStatus | null
    maxAmount: number | null
    minAmount: number | null
    expiryPolicy: $Enums.expiryPolicyStatus | null
    expiryValue: string | null
    graceDays: number | null
    redemptionChannels: string | null
    partialRedemption: boolean | null
    Stackable: boolean | null
    userPerDay: number | null
    termsConditionsURL: string | null
    brandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VouchersMaxAggregateOutputType = {
    id: string | null
    denominationype: $Enums.DenominationStatus | null
    maxAmount: number | null
    minAmount: number | null
    expiryPolicy: $Enums.expiryPolicyStatus | null
    expiryValue: string | null
    graceDays: number | null
    redemptionChannels: string | null
    partialRedemption: boolean | null
    Stackable: boolean | null
    userPerDay: number | null
    termsConditionsURL: string | null
    brandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VouchersCountAggregateOutputType = {
    id: number
    denominationype: number
    addDenomination: number
    maxAmount: number
    minAmount: number
    expiryPolicy: number
    expiryValue: number
    graceDays: number
    redemptionChannels: number
    partialRedemption: number
    Stackable: number
    userPerDay: number
    termsConditionsURL: number
    brandId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VouchersAvgAggregateInputType = {
    maxAmount?: true
    minAmount?: true
    graceDays?: true
    userPerDay?: true
  }

  export type VouchersSumAggregateInputType = {
    maxAmount?: true
    minAmount?: true
    graceDays?: true
    userPerDay?: true
  }

  export type VouchersMinAggregateInputType = {
    id?: true
    denominationype?: true
    maxAmount?: true
    minAmount?: true
    expiryPolicy?: true
    expiryValue?: true
    graceDays?: true
    redemptionChannels?: true
    partialRedemption?: true
    Stackable?: true
    userPerDay?: true
    termsConditionsURL?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VouchersMaxAggregateInputType = {
    id?: true
    denominationype?: true
    maxAmount?: true
    minAmount?: true
    expiryPolicy?: true
    expiryValue?: true
    graceDays?: true
    redemptionChannels?: true
    partialRedemption?: true
    Stackable?: true
    userPerDay?: true
    termsConditionsURL?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VouchersCountAggregateInputType = {
    id?: true
    denominationype?: true
    addDenomination?: true
    maxAmount?: true
    minAmount?: true
    expiryPolicy?: true
    expiryValue?: true
    graceDays?: true
    redemptionChannels?: true
    partialRedemption?: true
    Stackable?: true
    userPerDay?: true
    termsConditionsURL?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VouchersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vouchers to aggregate.
     */
    where?: VouchersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vouchers to fetch.
     */
    orderBy?: VouchersOrderByWithRelationInput | VouchersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VouchersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vouchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vouchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Vouchers
    **/
    _count?: true | VouchersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VouchersAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VouchersSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VouchersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VouchersMaxAggregateInputType
  }

  export type GetVouchersAggregateType<T extends VouchersAggregateArgs> = {
        [P in keyof T & keyof AggregateVouchers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVouchers[P]>
      : GetScalarType<T[P], AggregateVouchers[P]>
  }




  export type VouchersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VouchersWhereInput
    orderBy?: VouchersOrderByWithAggregationInput | VouchersOrderByWithAggregationInput[]
    by: VouchersScalarFieldEnum[] | VouchersScalarFieldEnum
    having?: VouchersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VouchersCountAggregateInputType | true
    _avg?: VouchersAvgAggregateInputType
    _sum?: VouchersSumAggregateInputType
    _min?: VouchersMinAggregateInputType
    _max?: VouchersMaxAggregateInputType
  }

  export type VouchersGroupByOutputType = {
    id: string
    denominationype: $Enums.DenominationStatus
    addDenomination: JsonValue | null
    maxAmount: number | null
    minAmount: number | null
    expiryPolicy: $Enums.expiryPolicyStatus
    expiryValue: string
    graceDays: number | null
    redemptionChannels: string | null
    partialRedemption: boolean
    Stackable: boolean
    userPerDay: number | null
    termsConditionsURL: string | null
    brandId: string
    createdAt: Date
    updatedAt: Date
    _count: VouchersCountAggregateOutputType | null
    _avg: VouchersAvgAggregateOutputType | null
    _sum: VouchersSumAggregateOutputType | null
    _min: VouchersMinAggregateOutputType | null
    _max: VouchersMaxAggregateOutputType | null
  }

  type GetVouchersGroupByPayload<T extends VouchersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VouchersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VouchersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VouchersGroupByOutputType[P]>
            : GetScalarType<T[P], VouchersGroupByOutputType[P]>
        }
      >
    >


  export type VouchersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    denominationype?: boolean
    addDenomination?: boolean
    maxAmount?: boolean
    minAmount?: boolean
    expiryPolicy?: boolean
    expiryValue?: boolean
    graceDays?: boolean
    redemptionChannels?: boolean
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: boolean
    termsConditionsURL?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vouchers"]>

  export type VouchersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    denominationype?: boolean
    addDenomination?: boolean
    maxAmount?: boolean
    minAmount?: boolean
    expiryPolicy?: boolean
    expiryValue?: boolean
    graceDays?: boolean
    redemptionChannels?: boolean
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: boolean
    termsConditionsURL?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vouchers"]>

  export type VouchersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    denominationype?: boolean
    addDenomination?: boolean
    maxAmount?: boolean
    minAmount?: boolean
    expiryPolicy?: boolean
    expiryValue?: boolean
    graceDays?: boolean
    redemptionChannels?: boolean
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: boolean
    termsConditionsURL?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vouchers"]>

  export type VouchersSelectScalar = {
    id?: boolean
    denominationype?: boolean
    addDenomination?: boolean
    maxAmount?: boolean
    minAmount?: boolean
    expiryPolicy?: boolean
    expiryValue?: boolean
    graceDays?: boolean
    redemptionChannels?: boolean
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: boolean
    termsConditionsURL?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VouchersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "denominationype" | "addDenomination" | "maxAmount" | "minAmount" | "expiryPolicy" | "expiryValue" | "graceDays" | "redemptionChannels" | "partialRedemption" | "Stackable" | "userPerDay" | "termsConditionsURL" | "brandId" | "createdAt" | "updatedAt", ExtArgs["result"]["vouchers"]>
  export type VouchersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type VouchersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type VouchersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }

  export type $VouchersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Vouchers"
    objects: {
      brands: Prisma.$BrandPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      denominationype: $Enums.DenominationStatus
      addDenomination: Prisma.JsonValue | null
      maxAmount: number | null
      minAmount: number | null
      expiryPolicy: $Enums.expiryPolicyStatus
      expiryValue: string
      graceDays: number | null
      redemptionChannels: string | null
      partialRedemption: boolean
      Stackable: boolean
      userPerDay: number | null
      termsConditionsURL: string | null
      brandId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["vouchers"]>
    composites: {}
  }

  type VouchersGetPayload<S extends boolean | null | undefined | VouchersDefaultArgs> = $Result.GetResult<Prisma.$VouchersPayload, S>

  type VouchersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VouchersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VouchersCountAggregateInputType | true
    }

  export interface VouchersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Vouchers'], meta: { name: 'Vouchers' } }
    /**
     * Find zero or one Vouchers that matches the filter.
     * @param {VouchersFindUniqueArgs} args - Arguments to find a Vouchers
     * @example
     * // Get one Vouchers
     * const vouchers = await prisma.vouchers.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VouchersFindUniqueArgs>(args: SelectSubset<T, VouchersFindUniqueArgs<ExtArgs>>): Prisma__VouchersClient<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Vouchers that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VouchersFindUniqueOrThrowArgs} args - Arguments to find a Vouchers
     * @example
     * // Get one Vouchers
     * const vouchers = await prisma.vouchers.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VouchersFindUniqueOrThrowArgs>(args: SelectSubset<T, VouchersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VouchersClient<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Vouchers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VouchersFindFirstArgs} args - Arguments to find a Vouchers
     * @example
     * // Get one Vouchers
     * const vouchers = await prisma.vouchers.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VouchersFindFirstArgs>(args?: SelectSubset<T, VouchersFindFirstArgs<ExtArgs>>): Prisma__VouchersClient<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Vouchers that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VouchersFindFirstOrThrowArgs} args - Arguments to find a Vouchers
     * @example
     * // Get one Vouchers
     * const vouchers = await prisma.vouchers.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VouchersFindFirstOrThrowArgs>(args?: SelectSubset<T, VouchersFindFirstOrThrowArgs<ExtArgs>>): Prisma__VouchersClient<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Vouchers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VouchersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Vouchers
     * const vouchers = await prisma.vouchers.findMany()
     * 
     * // Get first 10 Vouchers
     * const vouchers = await prisma.vouchers.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vouchersWithIdOnly = await prisma.vouchers.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VouchersFindManyArgs>(args?: SelectSubset<T, VouchersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Vouchers.
     * @param {VouchersCreateArgs} args - Arguments to create a Vouchers.
     * @example
     * // Create one Vouchers
     * const Vouchers = await prisma.vouchers.create({
     *   data: {
     *     // ... data to create a Vouchers
     *   }
     * })
     * 
     */
    create<T extends VouchersCreateArgs>(args: SelectSubset<T, VouchersCreateArgs<ExtArgs>>): Prisma__VouchersClient<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Vouchers.
     * @param {VouchersCreateManyArgs} args - Arguments to create many Vouchers.
     * @example
     * // Create many Vouchers
     * const vouchers = await prisma.vouchers.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VouchersCreateManyArgs>(args?: SelectSubset<T, VouchersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Vouchers and returns the data saved in the database.
     * @param {VouchersCreateManyAndReturnArgs} args - Arguments to create many Vouchers.
     * @example
     * // Create many Vouchers
     * const vouchers = await prisma.vouchers.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Vouchers and only return the `id`
     * const vouchersWithIdOnly = await prisma.vouchers.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VouchersCreateManyAndReturnArgs>(args?: SelectSubset<T, VouchersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Vouchers.
     * @param {VouchersDeleteArgs} args - Arguments to delete one Vouchers.
     * @example
     * // Delete one Vouchers
     * const Vouchers = await prisma.vouchers.delete({
     *   where: {
     *     // ... filter to delete one Vouchers
     *   }
     * })
     * 
     */
    delete<T extends VouchersDeleteArgs>(args: SelectSubset<T, VouchersDeleteArgs<ExtArgs>>): Prisma__VouchersClient<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Vouchers.
     * @param {VouchersUpdateArgs} args - Arguments to update one Vouchers.
     * @example
     * // Update one Vouchers
     * const vouchers = await prisma.vouchers.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VouchersUpdateArgs>(args: SelectSubset<T, VouchersUpdateArgs<ExtArgs>>): Prisma__VouchersClient<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Vouchers.
     * @param {VouchersDeleteManyArgs} args - Arguments to filter Vouchers to delete.
     * @example
     * // Delete a few Vouchers
     * const { count } = await prisma.vouchers.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VouchersDeleteManyArgs>(args?: SelectSubset<T, VouchersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vouchers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VouchersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Vouchers
     * const vouchers = await prisma.vouchers.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VouchersUpdateManyArgs>(args: SelectSubset<T, VouchersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vouchers and returns the data updated in the database.
     * @param {VouchersUpdateManyAndReturnArgs} args - Arguments to update many Vouchers.
     * @example
     * // Update many Vouchers
     * const vouchers = await prisma.vouchers.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Vouchers and only return the `id`
     * const vouchersWithIdOnly = await prisma.vouchers.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VouchersUpdateManyAndReturnArgs>(args: SelectSubset<T, VouchersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Vouchers.
     * @param {VouchersUpsertArgs} args - Arguments to update or create a Vouchers.
     * @example
     * // Update or create a Vouchers
     * const vouchers = await prisma.vouchers.upsert({
     *   create: {
     *     // ... data to create a Vouchers
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Vouchers we want to update
     *   }
     * })
     */
    upsert<T extends VouchersUpsertArgs>(args: SelectSubset<T, VouchersUpsertArgs<ExtArgs>>): Prisma__VouchersClient<$Result.GetResult<Prisma.$VouchersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Vouchers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VouchersCountArgs} args - Arguments to filter Vouchers to count.
     * @example
     * // Count the number of Vouchers
     * const count = await prisma.vouchers.count({
     *   where: {
     *     // ... the filter for the Vouchers we want to count
     *   }
     * })
    **/
    count<T extends VouchersCountArgs>(
      args?: Subset<T, VouchersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VouchersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Vouchers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VouchersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VouchersAggregateArgs>(args: Subset<T, VouchersAggregateArgs>): Prisma.PrismaPromise<GetVouchersAggregateType<T>>

    /**
     * Group by Vouchers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VouchersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VouchersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VouchersGroupByArgs['orderBy'] }
        : { orderBy?: VouchersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VouchersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVouchersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Vouchers model
   */
  readonly fields: VouchersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Vouchers.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VouchersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    brands<T extends BrandDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BrandDefaultArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Vouchers model
   */
  interface VouchersFieldRefs {
    readonly id: FieldRef<"Vouchers", 'String'>
    readonly denominationype: FieldRef<"Vouchers", 'DenominationStatus'>
    readonly addDenomination: FieldRef<"Vouchers", 'Json'>
    readonly maxAmount: FieldRef<"Vouchers", 'Int'>
    readonly minAmount: FieldRef<"Vouchers", 'Int'>
    readonly expiryPolicy: FieldRef<"Vouchers", 'expiryPolicyStatus'>
    readonly expiryValue: FieldRef<"Vouchers", 'String'>
    readonly graceDays: FieldRef<"Vouchers", 'Int'>
    readonly redemptionChannels: FieldRef<"Vouchers", 'String'>
    readonly partialRedemption: FieldRef<"Vouchers", 'Boolean'>
    readonly Stackable: FieldRef<"Vouchers", 'Boolean'>
    readonly userPerDay: FieldRef<"Vouchers", 'Int'>
    readonly termsConditionsURL: FieldRef<"Vouchers", 'String'>
    readonly brandId: FieldRef<"Vouchers", 'String'>
    readonly createdAt: FieldRef<"Vouchers", 'DateTime'>
    readonly updatedAt: FieldRef<"Vouchers", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Vouchers findUnique
   */
  export type VouchersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * Filter, which Vouchers to fetch.
     */
    where: VouchersWhereUniqueInput
  }

  /**
   * Vouchers findUniqueOrThrow
   */
  export type VouchersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * Filter, which Vouchers to fetch.
     */
    where: VouchersWhereUniqueInput
  }

  /**
   * Vouchers findFirst
   */
  export type VouchersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * Filter, which Vouchers to fetch.
     */
    where?: VouchersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vouchers to fetch.
     */
    orderBy?: VouchersOrderByWithRelationInput | VouchersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vouchers.
     */
    cursor?: VouchersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vouchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vouchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vouchers.
     */
    distinct?: VouchersScalarFieldEnum | VouchersScalarFieldEnum[]
  }

  /**
   * Vouchers findFirstOrThrow
   */
  export type VouchersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * Filter, which Vouchers to fetch.
     */
    where?: VouchersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vouchers to fetch.
     */
    orderBy?: VouchersOrderByWithRelationInput | VouchersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vouchers.
     */
    cursor?: VouchersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vouchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vouchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vouchers.
     */
    distinct?: VouchersScalarFieldEnum | VouchersScalarFieldEnum[]
  }

  /**
   * Vouchers findMany
   */
  export type VouchersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * Filter, which Vouchers to fetch.
     */
    where?: VouchersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vouchers to fetch.
     */
    orderBy?: VouchersOrderByWithRelationInput | VouchersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Vouchers.
     */
    cursor?: VouchersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vouchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vouchers.
     */
    skip?: number
    distinct?: VouchersScalarFieldEnum | VouchersScalarFieldEnum[]
  }

  /**
   * Vouchers create
   */
  export type VouchersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * The data needed to create a Vouchers.
     */
    data: XOR<VouchersCreateInput, VouchersUncheckedCreateInput>
  }

  /**
   * Vouchers createMany
   */
  export type VouchersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Vouchers.
     */
    data: VouchersCreateManyInput | VouchersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Vouchers createManyAndReturn
   */
  export type VouchersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * The data used to create many Vouchers.
     */
    data: VouchersCreateManyInput | VouchersCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Vouchers update
   */
  export type VouchersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * The data needed to update a Vouchers.
     */
    data: XOR<VouchersUpdateInput, VouchersUncheckedUpdateInput>
    /**
     * Choose, which Vouchers to update.
     */
    where: VouchersWhereUniqueInput
  }

  /**
   * Vouchers updateMany
   */
  export type VouchersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Vouchers.
     */
    data: XOR<VouchersUpdateManyMutationInput, VouchersUncheckedUpdateManyInput>
    /**
     * Filter which Vouchers to update
     */
    where?: VouchersWhereInput
    /**
     * Limit how many Vouchers to update.
     */
    limit?: number
  }

  /**
   * Vouchers updateManyAndReturn
   */
  export type VouchersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * The data used to update Vouchers.
     */
    data: XOR<VouchersUpdateManyMutationInput, VouchersUncheckedUpdateManyInput>
    /**
     * Filter which Vouchers to update
     */
    where?: VouchersWhereInput
    /**
     * Limit how many Vouchers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Vouchers upsert
   */
  export type VouchersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * The filter to search for the Vouchers to update in case it exists.
     */
    where: VouchersWhereUniqueInput
    /**
     * In case the Vouchers found by the `where` argument doesn't exist, create a new Vouchers with this data.
     */
    create: XOR<VouchersCreateInput, VouchersUncheckedCreateInput>
    /**
     * In case the Vouchers was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VouchersUpdateInput, VouchersUncheckedUpdateInput>
  }

  /**
   * Vouchers delete
   */
  export type VouchersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
    /**
     * Filter which Vouchers to delete.
     */
    where: VouchersWhereUniqueInput
  }

  /**
   * Vouchers deleteMany
   */
  export type VouchersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vouchers to delete
     */
    where?: VouchersWhereInput
    /**
     * Limit how many Vouchers to delete.
     */
    limit?: number
  }

  /**
   * Vouchers without action
   */
  export type VouchersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Vouchers
     */
    select?: VouchersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Vouchers
     */
    omit?: VouchersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VouchersInclude<ExtArgs> | null
  }


  /**
   * Model BrandBanking
   */

  export type AggregateBrandBanking = {
    _count: BrandBankingCountAggregateOutputType | null
    _avg: BrandBankingAvgAggregateOutputType | null
    _sum: BrandBankingSumAggregateOutputType | null
    _min: BrandBankingMinAggregateOutputType | null
    _max: BrandBankingMaxAggregateOutputType | null
  }

  export type BrandBankingAvgAggregateOutputType = {
    dayOfMonth: number | null
  }

  export type BrandBankingSumAggregateOutputType = {
    dayOfMonth: number | null
  }

  export type BrandBankingMinAggregateOutputType = {
    id: string | null
    settlementFrequency: $Enums.SettlementFrequencyStatus | null
    dayOfMonth: number | null
    payoutMethod: $Enums.payoutMethodStatus | null
    invoiceRequired: boolean | null
    remittanceEmail: string | null
    accountHolder: string | null
    accountNumber: string | null
    branchCode: string | null
    bankName: string | null
    SWIFTCode: string | null
    country: string | null
    brandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandBankingMaxAggregateOutputType = {
    id: string | null
    settlementFrequency: $Enums.SettlementFrequencyStatus | null
    dayOfMonth: number | null
    payoutMethod: $Enums.payoutMethodStatus | null
    invoiceRequired: boolean | null
    remittanceEmail: string | null
    accountHolder: string | null
    accountNumber: string | null
    branchCode: string | null
    bankName: string | null
    SWIFTCode: string | null
    country: string | null
    brandId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BrandBankingCountAggregateOutputType = {
    id: number
    settlementFrequency: number
    dayOfMonth: number
    payoutMethod: number
    invoiceRequired: number
    remittanceEmail: number
    accountHolder: number
    accountNumber: number
    branchCode: number
    bankName: number
    SWIFTCode: number
    country: number
    brandId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BrandBankingAvgAggregateInputType = {
    dayOfMonth?: true
  }

  export type BrandBankingSumAggregateInputType = {
    dayOfMonth?: true
  }

  export type BrandBankingMinAggregateInputType = {
    id?: true
    settlementFrequency?: true
    dayOfMonth?: true
    payoutMethod?: true
    invoiceRequired?: true
    remittanceEmail?: true
    accountHolder?: true
    accountNumber?: true
    branchCode?: true
    bankName?: true
    SWIFTCode?: true
    country?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandBankingMaxAggregateInputType = {
    id?: true
    settlementFrequency?: true
    dayOfMonth?: true
    payoutMethod?: true
    invoiceRequired?: true
    remittanceEmail?: true
    accountHolder?: true
    accountNumber?: true
    branchCode?: true
    bankName?: true
    SWIFTCode?: true
    country?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BrandBankingCountAggregateInputType = {
    id?: true
    settlementFrequency?: true
    dayOfMonth?: true
    payoutMethod?: true
    invoiceRequired?: true
    remittanceEmail?: true
    accountHolder?: true
    accountNumber?: true
    branchCode?: true
    bankName?: true
    SWIFTCode?: true
    country?: true
    brandId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BrandBankingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BrandBanking to aggregate.
     */
    where?: BrandBankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandBankings to fetch.
     */
    orderBy?: BrandBankingOrderByWithRelationInput | BrandBankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BrandBankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandBankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandBankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BrandBankings
    **/
    _count?: true | BrandBankingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BrandBankingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BrandBankingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BrandBankingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BrandBankingMaxAggregateInputType
  }

  export type GetBrandBankingAggregateType<T extends BrandBankingAggregateArgs> = {
        [P in keyof T & keyof AggregateBrandBanking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBrandBanking[P]>
      : GetScalarType<T[P], AggregateBrandBanking[P]>
  }




  export type BrandBankingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BrandBankingWhereInput
    orderBy?: BrandBankingOrderByWithAggregationInput | BrandBankingOrderByWithAggregationInput[]
    by: BrandBankingScalarFieldEnum[] | BrandBankingScalarFieldEnum
    having?: BrandBankingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BrandBankingCountAggregateInputType | true
    _avg?: BrandBankingAvgAggregateInputType
    _sum?: BrandBankingSumAggregateInputType
    _min?: BrandBankingMinAggregateInputType
    _max?: BrandBankingMaxAggregateInputType
  }

  export type BrandBankingGroupByOutputType = {
    id: string
    settlementFrequency: $Enums.SettlementFrequencyStatus
    dayOfMonth: number | null
    payoutMethod: $Enums.payoutMethodStatus
    invoiceRequired: boolean
    remittanceEmail: string
    accountHolder: string
    accountNumber: string
    branchCode: string
    bankName: string
    SWIFTCode: string
    country: string
    brandId: string
    createdAt: Date
    updatedAt: Date
    _count: BrandBankingCountAggregateOutputType | null
    _avg: BrandBankingAvgAggregateOutputType | null
    _sum: BrandBankingSumAggregateOutputType | null
    _min: BrandBankingMinAggregateOutputType | null
    _max: BrandBankingMaxAggregateOutputType | null
  }

  type GetBrandBankingGroupByPayload<T extends BrandBankingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BrandBankingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BrandBankingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BrandBankingGroupByOutputType[P]>
            : GetScalarType<T[P], BrandBankingGroupByOutputType[P]>
        }
      >
    >


  export type BrandBankingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    settlementFrequency?: boolean
    dayOfMonth?: boolean
    payoutMethod?: boolean
    invoiceRequired?: boolean
    remittanceEmail?: boolean
    accountHolder?: boolean
    accountNumber?: boolean
    branchCode?: boolean
    bankName?: boolean
    SWIFTCode?: boolean
    country?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandBanking"]>

  export type BrandBankingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    settlementFrequency?: boolean
    dayOfMonth?: boolean
    payoutMethod?: boolean
    invoiceRequired?: boolean
    remittanceEmail?: boolean
    accountHolder?: boolean
    accountNumber?: boolean
    branchCode?: boolean
    bankName?: boolean
    SWIFTCode?: boolean
    country?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandBanking"]>

  export type BrandBankingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    settlementFrequency?: boolean
    dayOfMonth?: boolean
    payoutMethod?: boolean
    invoiceRequired?: boolean
    remittanceEmail?: boolean
    accountHolder?: boolean
    accountNumber?: boolean
    branchCode?: boolean
    bankName?: boolean
    SWIFTCode?: boolean
    country?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["brandBanking"]>

  export type BrandBankingSelectScalar = {
    id?: boolean
    settlementFrequency?: boolean
    dayOfMonth?: boolean
    payoutMethod?: boolean
    invoiceRequired?: boolean
    remittanceEmail?: boolean
    accountHolder?: boolean
    accountNumber?: boolean
    branchCode?: boolean
    bankName?: boolean
    SWIFTCode?: boolean
    country?: boolean
    brandId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BrandBankingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "settlementFrequency" | "dayOfMonth" | "payoutMethod" | "invoiceRequired" | "remittanceEmail" | "accountHolder" | "accountNumber" | "branchCode" | "bankName" | "SWIFTCode" | "country" | "brandId" | "createdAt" | "updatedAt", ExtArgs["result"]["brandBanking"]>
  export type BrandBankingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type BrandBankingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type BrandBankingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }

  export type $BrandBankingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BrandBanking"
    objects: {
      brands: Prisma.$BrandPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      settlementFrequency: $Enums.SettlementFrequencyStatus
      dayOfMonth: number | null
      payoutMethod: $Enums.payoutMethodStatus
      invoiceRequired: boolean
      remittanceEmail: string
      accountHolder: string
      accountNumber: string
      branchCode: string
      bankName: string
      SWIFTCode: string
      country: string
      brandId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["brandBanking"]>
    composites: {}
  }

  type BrandBankingGetPayload<S extends boolean | null | undefined | BrandBankingDefaultArgs> = $Result.GetResult<Prisma.$BrandBankingPayload, S>

  type BrandBankingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BrandBankingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BrandBankingCountAggregateInputType | true
    }

  export interface BrandBankingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BrandBanking'], meta: { name: 'BrandBanking' } }
    /**
     * Find zero or one BrandBanking that matches the filter.
     * @param {BrandBankingFindUniqueArgs} args - Arguments to find a BrandBanking
     * @example
     * // Get one BrandBanking
     * const brandBanking = await prisma.brandBanking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BrandBankingFindUniqueArgs>(args: SelectSubset<T, BrandBankingFindUniqueArgs<ExtArgs>>): Prisma__BrandBankingClient<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BrandBanking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BrandBankingFindUniqueOrThrowArgs} args - Arguments to find a BrandBanking
     * @example
     * // Get one BrandBanking
     * const brandBanking = await prisma.brandBanking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BrandBankingFindUniqueOrThrowArgs>(args: SelectSubset<T, BrandBankingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BrandBankingClient<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BrandBanking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandBankingFindFirstArgs} args - Arguments to find a BrandBanking
     * @example
     * // Get one BrandBanking
     * const brandBanking = await prisma.brandBanking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BrandBankingFindFirstArgs>(args?: SelectSubset<T, BrandBankingFindFirstArgs<ExtArgs>>): Prisma__BrandBankingClient<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BrandBanking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandBankingFindFirstOrThrowArgs} args - Arguments to find a BrandBanking
     * @example
     * // Get one BrandBanking
     * const brandBanking = await prisma.brandBanking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BrandBankingFindFirstOrThrowArgs>(args?: SelectSubset<T, BrandBankingFindFirstOrThrowArgs<ExtArgs>>): Prisma__BrandBankingClient<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BrandBankings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandBankingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BrandBankings
     * const brandBankings = await prisma.brandBanking.findMany()
     * 
     * // Get first 10 BrandBankings
     * const brandBankings = await prisma.brandBanking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const brandBankingWithIdOnly = await prisma.brandBanking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BrandBankingFindManyArgs>(args?: SelectSubset<T, BrandBankingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BrandBanking.
     * @param {BrandBankingCreateArgs} args - Arguments to create a BrandBanking.
     * @example
     * // Create one BrandBanking
     * const BrandBanking = await prisma.brandBanking.create({
     *   data: {
     *     // ... data to create a BrandBanking
     *   }
     * })
     * 
     */
    create<T extends BrandBankingCreateArgs>(args: SelectSubset<T, BrandBankingCreateArgs<ExtArgs>>): Prisma__BrandBankingClient<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BrandBankings.
     * @param {BrandBankingCreateManyArgs} args - Arguments to create many BrandBankings.
     * @example
     * // Create many BrandBankings
     * const brandBanking = await prisma.brandBanking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BrandBankingCreateManyArgs>(args?: SelectSubset<T, BrandBankingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BrandBankings and returns the data saved in the database.
     * @param {BrandBankingCreateManyAndReturnArgs} args - Arguments to create many BrandBankings.
     * @example
     * // Create many BrandBankings
     * const brandBanking = await prisma.brandBanking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BrandBankings and only return the `id`
     * const brandBankingWithIdOnly = await prisma.brandBanking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BrandBankingCreateManyAndReturnArgs>(args?: SelectSubset<T, BrandBankingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BrandBanking.
     * @param {BrandBankingDeleteArgs} args - Arguments to delete one BrandBanking.
     * @example
     * // Delete one BrandBanking
     * const BrandBanking = await prisma.brandBanking.delete({
     *   where: {
     *     // ... filter to delete one BrandBanking
     *   }
     * })
     * 
     */
    delete<T extends BrandBankingDeleteArgs>(args: SelectSubset<T, BrandBankingDeleteArgs<ExtArgs>>): Prisma__BrandBankingClient<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BrandBanking.
     * @param {BrandBankingUpdateArgs} args - Arguments to update one BrandBanking.
     * @example
     * // Update one BrandBanking
     * const brandBanking = await prisma.brandBanking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BrandBankingUpdateArgs>(args: SelectSubset<T, BrandBankingUpdateArgs<ExtArgs>>): Prisma__BrandBankingClient<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BrandBankings.
     * @param {BrandBankingDeleteManyArgs} args - Arguments to filter BrandBankings to delete.
     * @example
     * // Delete a few BrandBankings
     * const { count } = await prisma.brandBanking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BrandBankingDeleteManyArgs>(args?: SelectSubset<T, BrandBankingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BrandBankings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandBankingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BrandBankings
     * const brandBanking = await prisma.brandBanking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BrandBankingUpdateManyArgs>(args: SelectSubset<T, BrandBankingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BrandBankings and returns the data updated in the database.
     * @param {BrandBankingUpdateManyAndReturnArgs} args - Arguments to update many BrandBankings.
     * @example
     * // Update many BrandBankings
     * const brandBanking = await prisma.brandBanking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BrandBankings and only return the `id`
     * const brandBankingWithIdOnly = await prisma.brandBanking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BrandBankingUpdateManyAndReturnArgs>(args: SelectSubset<T, BrandBankingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BrandBanking.
     * @param {BrandBankingUpsertArgs} args - Arguments to update or create a BrandBanking.
     * @example
     * // Update or create a BrandBanking
     * const brandBanking = await prisma.brandBanking.upsert({
     *   create: {
     *     // ... data to create a BrandBanking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BrandBanking we want to update
     *   }
     * })
     */
    upsert<T extends BrandBankingUpsertArgs>(args: SelectSubset<T, BrandBankingUpsertArgs<ExtArgs>>): Prisma__BrandBankingClient<$Result.GetResult<Prisma.$BrandBankingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BrandBankings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandBankingCountArgs} args - Arguments to filter BrandBankings to count.
     * @example
     * // Count the number of BrandBankings
     * const count = await prisma.brandBanking.count({
     *   where: {
     *     // ... the filter for the BrandBankings we want to count
     *   }
     * })
    **/
    count<T extends BrandBankingCountArgs>(
      args?: Subset<T, BrandBankingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BrandBankingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BrandBanking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandBankingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BrandBankingAggregateArgs>(args: Subset<T, BrandBankingAggregateArgs>): Prisma.PrismaPromise<GetBrandBankingAggregateType<T>>

    /**
     * Group by BrandBanking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BrandBankingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BrandBankingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BrandBankingGroupByArgs['orderBy'] }
        : { orderBy?: BrandBankingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BrandBankingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBrandBankingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BrandBanking model
   */
  readonly fields: BrandBankingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BrandBanking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BrandBankingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    brands<T extends BrandDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BrandDefaultArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BrandBanking model
   */
  interface BrandBankingFieldRefs {
    readonly id: FieldRef<"BrandBanking", 'String'>
    readonly settlementFrequency: FieldRef<"BrandBanking", 'SettlementFrequencyStatus'>
    readonly dayOfMonth: FieldRef<"BrandBanking", 'Int'>
    readonly payoutMethod: FieldRef<"BrandBanking", 'payoutMethodStatus'>
    readonly invoiceRequired: FieldRef<"BrandBanking", 'Boolean'>
    readonly remittanceEmail: FieldRef<"BrandBanking", 'String'>
    readonly accountHolder: FieldRef<"BrandBanking", 'String'>
    readonly accountNumber: FieldRef<"BrandBanking", 'String'>
    readonly branchCode: FieldRef<"BrandBanking", 'String'>
    readonly bankName: FieldRef<"BrandBanking", 'String'>
    readonly SWIFTCode: FieldRef<"BrandBanking", 'String'>
    readonly country: FieldRef<"BrandBanking", 'String'>
    readonly brandId: FieldRef<"BrandBanking", 'String'>
    readonly createdAt: FieldRef<"BrandBanking", 'DateTime'>
    readonly updatedAt: FieldRef<"BrandBanking", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BrandBanking findUnique
   */
  export type BrandBankingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * Filter, which BrandBanking to fetch.
     */
    where: BrandBankingWhereUniqueInput
  }

  /**
   * BrandBanking findUniqueOrThrow
   */
  export type BrandBankingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * Filter, which BrandBanking to fetch.
     */
    where: BrandBankingWhereUniqueInput
  }

  /**
   * BrandBanking findFirst
   */
  export type BrandBankingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * Filter, which BrandBanking to fetch.
     */
    where?: BrandBankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandBankings to fetch.
     */
    orderBy?: BrandBankingOrderByWithRelationInput | BrandBankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BrandBankings.
     */
    cursor?: BrandBankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandBankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandBankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BrandBankings.
     */
    distinct?: BrandBankingScalarFieldEnum | BrandBankingScalarFieldEnum[]
  }

  /**
   * BrandBanking findFirstOrThrow
   */
  export type BrandBankingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * Filter, which BrandBanking to fetch.
     */
    where?: BrandBankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandBankings to fetch.
     */
    orderBy?: BrandBankingOrderByWithRelationInput | BrandBankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BrandBankings.
     */
    cursor?: BrandBankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandBankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandBankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BrandBankings.
     */
    distinct?: BrandBankingScalarFieldEnum | BrandBankingScalarFieldEnum[]
  }

  /**
   * BrandBanking findMany
   */
  export type BrandBankingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * Filter, which BrandBankings to fetch.
     */
    where?: BrandBankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BrandBankings to fetch.
     */
    orderBy?: BrandBankingOrderByWithRelationInput | BrandBankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BrandBankings.
     */
    cursor?: BrandBankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BrandBankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BrandBankings.
     */
    skip?: number
    distinct?: BrandBankingScalarFieldEnum | BrandBankingScalarFieldEnum[]
  }

  /**
   * BrandBanking create
   */
  export type BrandBankingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * The data needed to create a BrandBanking.
     */
    data: XOR<BrandBankingCreateInput, BrandBankingUncheckedCreateInput>
  }

  /**
   * BrandBanking createMany
   */
  export type BrandBankingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BrandBankings.
     */
    data: BrandBankingCreateManyInput | BrandBankingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BrandBanking createManyAndReturn
   */
  export type BrandBankingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * The data used to create many BrandBankings.
     */
    data: BrandBankingCreateManyInput | BrandBankingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BrandBanking update
   */
  export type BrandBankingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * The data needed to update a BrandBanking.
     */
    data: XOR<BrandBankingUpdateInput, BrandBankingUncheckedUpdateInput>
    /**
     * Choose, which BrandBanking to update.
     */
    where: BrandBankingWhereUniqueInput
  }

  /**
   * BrandBanking updateMany
   */
  export type BrandBankingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BrandBankings.
     */
    data: XOR<BrandBankingUpdateManyMutationInput, BrandBankingUncheckedUpdateManyInput>
    /**
     * Filter which BrandBankings to update
     */
    where?: BrandBankingWhereInput
    /**
     * Limit how many BrandBankings to update.
     */
    limit?: number
  }

  /**
   * BrandBanking updateManyAndReturn
   */
  export type BrandBankingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * The data used to update BrandBankings.
     */
    data: XOR<BrandBankingUpdateManyMutationInput, BrandBankingUncheckedUpdateManyInput>
    /**
     * Filter which BrandBankings to update
     */
    where?: BrandBankingWhereInput
    /**
     * Limit how many BrandBankings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BrandBanking upsert
   */
  export type BrandBankingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * The filter to search for the BrandBanking to update in case it exists.
     */
    where: BrandBankingWhereUniqueInput
    /**
     * In case the BrandBanking found by the `where` argument doesn't exist, create a new BrandBanking with this data.
     */
    create: XOR<BrandBankingCreateInput, BrandBankingUncheckedCreateInput>
    /**
     * In case the BrandBanking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BrandBankingUpdateInput, BrandBankingUncheckedUpdateInput>
  }

  /**
   * BrandBanking delete
   */
  export type BrandBankingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
    /**
     * Filter which BrandBanking to delete.
     */
    where: BrandBankingWhereUniqueInput
  }

  /**
   * BrandBanking deleteMany
   */
  export type BrandBankingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BrandBankings to delete
     */
    where?: BrandBankingWhereInput
    /**
     * Limit how many BrandBankings to delete.
     */
    limit?: number
  }

  /**
   * BrandBanking without action
   */
  export type BrandBankingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BrandBanking
     */
    select?: BrandBankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BrandBanking
     */
    omit?: BrandBankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandBankingInclude<ExtArgs> | null
  }


  /**
   * Model Occasion
   */

  export type AggregateOccasion = {
    _count: OccasionCountAggregateOutputType | null
    _min: OccasionMinAggregateOutputType | null
    _max: OccasionMaxAggregateOutputType | null
  }

  export type OccasionMinAggregateOutputType = {
    id: string | null
    name: string | null
    emoji: string | null
    description: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OccasionMaxAggregateOutputType = {
    id: string | null
    name: string | null
    emoji: string | null
    description: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OccasionCountAggregateOutputType = {
    id: number
    name: number
    emoji: number
    description: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OccasionMinAggregateInputType = {
    id?: true
    name?: true
    emoji?: true
    description?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OccasionMaxAggregateInputType = {
    id?: true
    name?: true
    emoji?: true
    description?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OccasionCountAggregateInputType = {
    id?: true
    name?: true
    emoji?: true
    description?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OccasionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Occasion to aggregate.
     */
    where?: OccasionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Occasions to fetch.
     */
    orderBy?: OccasionOrderByWithRelationInput | OccasionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OccasionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Occasions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Occasions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Occasions
    **/
    _count?: true | OccasionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OccasionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OccasionMaxAggregateInputType
  }

  export type GetOccasionAggregateType<T extends OccasionAggregateArgs> = {
        [P in keyof T & keyof AggregateOccasion]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOccasion[P]>
      : GetScalarType<T[P], AggregateOccasion[P]>
  }




  export type OccasionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OccasionWhereInput
    orderBy?: OccasionOrderByWithAggregationInput | OccasionOrderByWithAggregationInput[]
    by: OccasionScalarFieldEnum[] | OccasionScalarFieldEnum
    having?: OccasionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OccasionCountAggregateInputType | true
    _min?: OccasionMinAggregateInputType
    _max?: OccasionMaxAggregateInputType
  }

  export type OccasionGroupByOutputType = {
    id: string
    name: string
    emoji: string
    description: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: OccasionCountAggregateOutputType | null
    _min: OccasionMinAggregateOutputType | null
    _max: OccasionMaxAggregateOutputType | null
  }

  type GetOccasionGroupByPayload<T extends OccasionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OccasionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OccasionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OccasionGroupByOutputType[P]>
            : GetScalarType<T[P], OccasionGroupByOutputType[P]>
        }
      >
    >


  export type OccasionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    emoji?: boolean
    description?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    occasionCategory?: boolean | Occasion$occasionCategoryArgs<ExtArgs>
    order?: boolean | Occasion$orderArgs<ExtArgs>
    _count?: boolean | OccasionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["occasion"]>

  export type OccasionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    emoji?: boolean
    description?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["occasion"]>

  export type OccasionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    emoji?: boolean
    description?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["occasion"]>

  export type OccasionSelectScalar = {
    id?: boolean
    name?: boolean
    emoji?: boolean
    description?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OccasionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "emoji" | "description" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["occasion"]>
  export type OccasionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    occasionCategory?: boolean | Occasion$occasionCategoryArgs<ExtArgs>
    order?: boolean | Occasion$orderArgs<ExtArgs>
    _count?: boolean | OccasionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OccasionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OccasionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OccasionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Occasion"
    objects: {
      occasionCategory: Prisma.$OccasionCategoryPayload<ExtArgs>[]
      order: Prisma.$OrderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      emoji: string
      description: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["occasion"]>
    composites: {}
  }

  type OccasionGetPayload<S extends boolean | null | undefined | OccasionDefaultArgs> = $Result.GetResult<Prisma.$OccasionPayload, S>

  type OccasionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OccasionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OccasionCountAggregateInputType | true
    }

  export interface OccasionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Occasion'], meta: { name: 'Occasion' } }
    /**
     * Find zero or one Occasion that matches the filter.
     * @param {OccasionFindUniqueArgs} args - Arguments to find a Occasion
     * @example
     * // Get one Occasion
     * const occasion = await prisma.occasion.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OccasionFindUniqueArgs>(args: SelectSubset<T, OccasionFindUniqueArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Occasion that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OccasionFindUniqueOrThrowArgs} args - Arguments to find a Occasion
     * @example
     * // Get one Occasion
     * const occasion = await prisma.occasion.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OccasionFindUniqueOrThrowArgs>(args: SelectSubset<T, OccasionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Occasion that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionFindFirstArgs} args - Arguments to find a Occasion
     * @example
     * // Get one Occasion
     * const occasion = await prisma.occasion.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OccasionFindFirstArgs>(args?: SelectSubset<T, OccasionFindFirstArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Occasion that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionFindFirstOrThrowArgs} args - Arguments to find a Occasion
     * @example
     * // Get one Occasion
     * const occasion = await prisma.occasion.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OccasionFindFirstOrThrowArgs>(args?: SelectSubset<T, OccasionFindFirstOrThrowArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Occasions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Occasions
     * const occasions = await prisma.occasion.findMany()
     * 
     * // Get first 10 Occasions
     * const occasions = await prisma.occasion.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const occasionWithIdOnly = await prisma.occasion.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OccasionFindManyArgs>(args?: SelectSubset<T, OccasionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Occasion.
     * @param {OccasionCreateArgs} args - Arguments to create a Occasion.
     * @example
     * // Create one Occasion
     * const Occasion = await prisma.occasion.create({
     *   data: {
     *     // ... data to create a Occasion
     *   }
     * })
     * 
     */
    create<T extends OccasionCreateArgs>(args: SelectSubset<T, OccasionCreateArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Occasions.
     * @param {OccasionCreateManyArgs} args - Arguments to create many Occasions.
     * @example
     * // Create many Occasions
     * const occasion = await prisma.occasion.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OccasionCreateManyArgs>(args?: SelectSubset<T, OccasionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Occasions and returns the data saved in the database.
     * @param {OccasionCreateManyAndReturnArgs} args - Arguments to create many Occasions.
     * @example
     * // Create many Occasions
     * const occasion = await prisma.occasion.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Occasions and only return the `id`
     * const occasionWithIdOnly = await prisma.occasion.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OccasionCreateManyAndReturnArgs>(args?: SelectSubset<T, OccasionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Occasion.
     * @param {OccasionDeleteArgs} args - Arguments to delete one Occasion.
     * @example
     * // Delete one Occasion
     * const Occasion = await prisma.occasion.delete({
     *   where: {
     *     // ... filter to delete one Occasion
     *   }
     * })
     * 
     */
    delete<T extends OccasionDeleteArgs>(args: SelectSubset<T, OccasionDeleteArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Occasion.
     * @param {OccasionUpdateArgs} args - Arguments to update one Occasion.
     * @example
     * // Update one Occasion
     * const occasion = await prisma.occasion.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OccasionUpdateArgs>(args: SelectSubset<T, OccasionUpdateArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Occasions.
     * @param {OccasionDeleteManyArgs} args - Arguments to filter Occasions to delete.
     * @example
     * // Delete a few Occasions
     * const { count } = await prisma.occasion.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OccasionDeleteManyArgs>(args?: SelectSubset<T, OccasionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Occasions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Occasions
     * const occasion = await prisma.occasion.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OccasionUpdateManyArgs>(args: SelectSubset<T, OccasionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Occasions and returns the data updated in the database.
     * @param {OccasionUpdateManyAndReturnArgs} args - Arguments to update many Occasions.
     * @example
     * // Update many Occasions
     * const occasion = await prisma.occasion.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Occasions and only return the `id`
     * const occasionWithIdOnly = await prisma.occasion.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OccasionUpdateManyAndReturnArgs>(args: SelectSubset<T, OccasionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Occasion.
     * @param {OccasionUpsertArgs} args - Arguments to update or create a Occasion.
     * @example
     * // Update or create a Occasion
     * const occasion = await prisma.occasion.upsert({
     *   create: {
     *     // ... data to create a Occasion
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Occasion we want to update
     *   }
     * })
     */
    upsert<T extends OccasionUpsertArgs>(args: SelectSubset<T, OccasionUpsertArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Occasions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionCountArgs} args - Arguments to filter Occasions to count.
     * @example
     * // Count the number of Occasions
     * const count = await prisma.occasion.count({
     *   where: {
     *     // ... the filter for the Occasions we want to count
     *   }
     * })
    **/
    count<T extends OccasionCountArgs>(
      args?: Subset<T, OccasionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OccasionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Occasion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OccasionAggregateArgs>(args: Subset<T, OccasionAggregateArgs>): Prisma.PrismaPromise<GetOccasionAggregateType<T>>

    /**
     * Group by Occasion.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OccasionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OccasionGroupByArgs['orderBy'] }
        : { orderBy?: OccasionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OccasionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOccasionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Occasion model
   */
  readonly fields: OccasionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Occasion.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OccasionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    occasionCategory<T extends Occasion$occasionCategoryArgs<ExtArgs> = {}>(args?: Subset<T, Occasion$occasionCategoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    order<T extends Occasion$orderArgs<ExtArgs> = {}>(args?: Subset<T, Occasion$orderArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Occasion model
   */
  interface OccasionFieldRefs {
    readonly id: FieldRef<"Occasion", 'String'>
    readonly name: FieldRef<"Occasion", 'String'>
    readonly emoji: FieldRef<"Occasion", 'String'>
    readonly description: FieldRef<"Occasion", 'String'>
    readonly isActive: FieldRef<"Occasion", 'Boolean'>
    readonly createdAt: FieldRef<"Occasion", 'DateTime'>
    readonly updatedAt: FieldRef<"Occasion", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Occasion findUnique
   */
  export type OccasionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * Filter, which Occasion to fetch.
     */
    where: OccasionWhereUniqueInput
  }

  /**
   * Occasion findUniqueOrThrow
   */
  export type OccasionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * Filter, which Occasion to fetch.
     */
    where: OccasionWhereUniqueInput
  }

  /**
   * Occasion findFirst
   */
  export type OccasionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * Filter, which Occasion to fetch.
     */
    where?: OccasionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Occasions to fetch.
     */
    orderBy?: OccasionOrderByWithRelationInput | OccasionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Occasions.
     */
    cursor?: OccasionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Occasions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Occasions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Occasions.
     */
    distinct?: OccasionScalarFieldEnum | OccasionScalarFieldEnum[]
  }

  /**
   * Occasion findFirstOrThrow
   */
  export type OccasionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * Filter, which Occasion to fetch.
     */
    where?: OccasionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Occasions to fetch.
     */
    orderBy?: OccasionOrderByWithRelationInput | OccasionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Occasions.
     */
    cursor?: OccasionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Occasions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Occasions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Occasions.
     */
    distinct?: OccasionScalarFieldEnum | OccasionScalarFieldEnum[]
  }

  /**
   * Occasion findMany
   */
  export type OccasionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * Filter, which Occasions to fetch.
     */
    where?: OccasionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Occasions to fetch.
     */
    orderBy?: OccasionOrderByWithRelationInput | OccasionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Occasions.
     */
    cursor?: OccasionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Occasions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Occasions.
     */
    skip?: number
    distinct?: OccasionScalarFieldEnum | OccasionScalarFieldEnum[]
  }

  /**
   * Occasion create
   */
  export type OccasionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * The data needed to create a Occasion.
     */
    data: XOR<OccasionCreateInput, OccasionUncheckedCreateInput>
  }

  /**
   * Occasion createMany
   */
  export type OccasionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Occasions.
     */
    data: OccasionCreateManyInput | OccasionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Occasion createManyAndReturn
   */
  export type OccasionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * The data used to create many Occasions.
     */
    data: OccasionCreateManyInput | OccasionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Occasion update
   */
  export type OccasionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * The data needed to update a Occasion.
     */
    data: XOR<OccasionUpdateInput, OccasionUncheckedUpdateInput>
    /**
     * Choose, which Occasion to update.
     */
    where: OccasionWhereUniqueInput
  }

  /**
   * Occasion updateMany
   */
  export type OccasionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Occasions.
     */
    data: XOR<OccasionUpdateManyMutationInput, OccasionUncheckedUpdateManyInput>
    /**
     * Filter which Occasions to update
     */
    where?: OccasionWhereInput
    /**
     * Limit how many Occasions to update.
     */
    limit?: number
  }

  /**
   * Occasion updateManyAndReturn
   */
  export type OccasionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * The data used to update Occasions.
     */
    data: XOR<OccasionUpdateManyMutationInput, OccasionUncheckedUpdateManyInput>
    /**
     * Filter which Occasions to update
     */
    where?: OccasionWhereInput
    /**
     * Limit how many Occasions to update.
     */
    limit?: number
  }

  /**
   * Occasion upsert
   */
  export type OccasionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * The filter to search for the Occasion to update in case it exists.
     */
    where: OccasionWhereUniqueInput
    /**
     * In case the Occasion found by the `where` argument doesn't exist, create a new Occasion with this data.
     */
    create: XOR<OccasionCreateInput, OccasionUncheckedCreateInput>
    /**
     * In case the Occasion was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OccasionUpdateInput, OccasionUncheckedUpdateInput>
  }

  /**
   * Occasion delete
   */
  export type OccasionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
    /**
     * Filter which Occasion to delete.
     */
    where: OccasionWhereUniqueInput
  }

  /**
   * Occasion deleteMany
   */
  export type OccasionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Occasions to delete
     */
    where?: OccasionWhereInput
    /**
     * Limit how many Occasions to delete.
     */
    limit?: number
  }

  /**
   * Occasion.occasionCategory
   */
  export type Occasion$occasionCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    where?: OccasionCategoryWhereInput
    orderBy?: OccasionCategoryOrderByWithRelationInput | OccasionCategoryOrderByWithRelationInput[]
    cursor?: OccasionCategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OccasionCategoryScalarFieldEnum | OccasionCategoryScalarFieldEnum[]
  }

  /**
   * Occasion.order
   */
  export type Occasion$orderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Occasion without action
   */
  export type OccasionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Occasion
     */
    select?: OccasionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Occasion
     */
    omit?: OccasionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionInclude<ExtArgs> | null
  }


  /**
   * Model OccasionCategory
   */

  export type AggregateOccasionCategory = {
    _count: OccasionCategoryCountAggregateOutputType | null
    _min: OccasionCategoryMinAggregateOutputType | null
    _max: OccasionCategoryMaxAggregateOutputType | null
  }

  export type OccasionCategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    emoji: string | null
    image: string | null
    isActive: boolean | null
    occasionId: string | null
  }

  export type OccasionCategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    emoji: string | null
    image: string | null
    isActive: boolean | null
    occasionId: string | null
  }

  export type OccasionCategoryCountAggregateOutputType = {
    id: number
    name: number
    description: number
    emoji: number
    image: number
    isActive: number
    occasionId: number
    _all: number
  }


  export type OccasionCategoryMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    emoji?: true
    image?: true
    isActive?: true
    occasionId?: true
  }

  export type OccasionCategoryMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    emoji?: true
    image?: true
    isActive?: true
    occasionId?: true
  }

  export type OccasionCategoryCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    emoji?: true
    image?: true
    isActive?: true
    occasionId?: true
    _all?: true
  }

  export type OccasionCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OccasionCategory to aggregate.
     */
    where?: OccasionCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OccasionCategories to fetch.
     */
    orderBy?: OccasionCategoryOrderByWithRelationInput | OccasionCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OccasionCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OccasionCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OccasionCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OccasionCategories
    **/
    _count?: true | OccasionCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OccasionCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OccasionCategoryMaxAggregateInputType
  }

  export type GetOccasionCategoryAggregateType<T extends OccasionCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateOccasionCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOccasionCategory[P]>
      : GetScalarType<T[P], AggregateOccasionCategory[P]>
  }




  export type OccasionCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OccasionCategoryWhereInput
    orderBy?: OccasionCategoryOrderByWithAggregationInput | OccasionCategoryOrderByWithAggregationInput[]
    by: OccasionCategoryScalarFieldEnum[] | OccasionCategoryScalarFieldEnum
    having?: OccasionCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OccasionCategoryCountAggregateInputType | true
    _min?: OccasionCategoryMinAggregateInputType
    _max?: OccasionCategoryMaxAggregateInputType
  }

  export type OccasionCategoryGroupByOutputType = {
    id: string
    name: string
    description: string
    emoji: string
    image: string
    isActive: boolean
    occasionId: string
    _count: OccasionCategoryCountAggregateOutputType | null
    _min: OccasionCategoryMinAggregateOutputType | null
    _max: OccasionCategoryMaxAggregateOutputType | null
  }

  type GetOccasionCategoryGroupByPayload<T extends OccasionCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OccasionCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OccasionCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OccasionCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], OccasionCategoryGroupByOutputType[P]>
        }
      >
    >


  export type OccasionCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    emoji?: boolean
    image?: boolean
    isActive?: boolean
    occasionId?: boolean
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["occasionCategory"]>

  export type OccasionCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    emoji?: boolean
    image?: boolean
    isActive?: boolean
    occasionId?: boolean
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["occasionCategory"]>

  export type OccasionCategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    emoji?: boolean
    image?: boolean
    isActive?: boolean
    occasionId?: boolean
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["occasionCategory"]>

  export type OccasionCategorySelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    emoji?: boolean
    image?: boolean
    isActive?: boolean
    occasionId?: boolean
  }

  export type OccasionCategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "emoji" | "image" | "isActive" | "occasionId", ExtArgs["result"]["occasionCategory"]>
  export type OccasionCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
  }
  export type OccasionCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
  }
  export type OccasionCategoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
  }

  export type $OccasionCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OccasionCategory"
    objects: {
      occasions: Prisma.$OccasionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string
      emoji: string
      image: string
      isActive: boolean
      occasionId: string
    }, ExtArgs["result"]["occasionCategory"]>
    composites: {}
  }

  type OccasionCategoryGetPayload<S extends boolean | null | undefined | OccasionCategoryDefaultArgs> = $Result.GetResult<Prisma.$OccasionCategoryPayload, S>

  type OccasionCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OccasionCategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OccasionCategoryCountAggregateInputType | true
    }

  export interface OccasionCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OccasionCategory'], meta: { name: 'OccasionCategory' } }
    /**
     * Find zero or one OccasionCategory that matches the filter.
     * @param {OccasionCategoryFindUniqueArgs} args - Arguments to find a OccasionCategory
     * @example
     * // Get one OccasionCategory
     * const occasionCategory = await prisma.occasionCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OccasionCategoryFindUniqueArgs>(args: SelectSubset<T, OccasionCategoryFindUniqueArgs<ExtArgs>>): Prisma__OccasionCategoryClient<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OccasionCategory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OccasionCategoryFindUniqueOrThrowArgs} args - Arguments to find a OccasionCategory
     * @example
     * // Get one OccasionCategory
     * const occasionCategory = await prisma.occasionCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OccasionCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, OccasionCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OccasionCategoryClient<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OccasionCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionCategoryFindFirstArgs} args - Arguments to find a OccasionCategory
     * @example
     * // Get one OccasionCategory
     * const occasionCategory = await prisma.occasionCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OccasionCategoryFindFirstArgs>(args?: SelectSubset<T, OccasionCategoryFindFirstArgs<ExtArgs>>): Prisma__OccasionCategoryClient<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OccasionCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionCategoryFindFirstOrThrowArgs} args - Arguments to find a OccasionCategory
     * @example
     * // Get one OccasionCategory
     * const occasionCategory = await prisma.occasionCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OccasionCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, OccasionCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__OccasionCategoryClient<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OccasionCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OccasionCategories
     * const occasionCategories = await prisma.occasionCategory.findMany()
     * 
     * // Get first 10 OccasionCategories
     * const occasionCategories = await prisma.occasionCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const occasionCategoryWithIdOnly = await prisma.occasionCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OccasionCategoryFindManyArgs>(args?: SelectSubset<T, OccasionCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OccasionCategory.
     * @param {OccasionCategoryCreateArgs} args - Arguments to create a OccasionCategory.
     * @example
     * // Create one OccasionCategory
     * const OccasionCategory = await prisma.occasionCategory.create({
     *   data: {
     *     // ... data to create a OccasionCategory
     *   }
     * })
     * 
     */
    create<T extends OccasionCategoryCreateArgs>(args: SelectSubset<T, OccasionCategoryCreateArgs<ExtArgs>>): Prisma__OccasionCategoryClient<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OccasionCategories.
     * @param {OccasionCategoryCreateManyArgs} args - Arguments to create many OccasionCategories.
     * @example
     * // Create many OccasionCategories
     * const occasionCategory = await prisma.occasionCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OccasionCategoryCreateManyArgs>(args?: SelectSubset<T, OccasionCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OccasionCategories and returns the data saved in the database.
     * @param {OccasionCategoryCreateManyAndReturnArgs} args - Arguments to create many OccasionCategories.
     * @example
     * // Create many OccasionCategories
     * const occasionCategory = await prisma.occasionCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OccasionCategories and only return the `id`
     * const occasionCategoryWithIdOnly = await prisma.occasionCategory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OccasionCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, OccasionCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OccasionCategory.
     * @param {OccasionCategoryDeleteArgs} args - Arguments to delete one OccasionCategory.
     * @example
     * // Delete one OccasionCategory
     * const OccasionCategory = await prisma.occasionCategory.delete({
     *   where: {
     *     // ... filter to delete one OccasionCategory
     *   }
     * })
     * 
     */
    delete<T extends OccasionCategoryDeleteArgs>(args: SelectSubset<T, OccasionCategoryDeleteArgs<ExtArgs>>): Prisma__OccasionCategoryClient<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OccasionCategory.
     * @param {OccasionCategoryUpdateArgs} args - Arguments to update one OccasionCategory.
     * @example
     * // Update one OccasionCategory
     * const occasionCategory = await prisma.occasionCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OccasionCategoryUpdateArgs>(args: SelectSubset<T, OccasionCategoryUpdateArgs<ExtArgs>>): Prisma__OccasionCategoryClient<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OccasionCategories.
     * @param {OccasionCategoryDeleteManyArgs} args - Arguments to filter OccasionCategories to delete.
     * @example
     * // Delete a few OccasionCategories
     * const { count } = await prisma.occasionCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OccasionCategoryDeleteManyArgs>(args?: SelectSubset<T, OccasionCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OccasionCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OccasionCategories
     * const occasionCategory = await prisma.occasionCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OccasionCategoryUpdateManyArgs>(args: SelectSubset<T, OccasionCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OccasionCategories and returns the data updated in the database.
     * @param {OccasionCategoryUpdateManyAndReturnArgs} args - Arguments to update many OccasionCategories.
     * @example
     * // Update many OccasionCategories
     * const occasionCategory = await prisma.occasionCategory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OccasionCategories and only return the `id`
     * const occasionCategoryWithIdOnly = await prisma.occasionCategory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OccasionCategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, OccasionCategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OccasionCategory.
     * @param {OccasionCategoryUpsertArgs} args - Arguments to update or create a OccasionCategory.
     * @example
     * // Update or create a OccasionCategory
     * const occasionCategory = await prisma.occasionCategory.upsert({
     *   create: {
     *     // ... data to create a OccasionCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OccasionCategory we want to update
     *   }
     * })
     */
    upsert<T extends OccasionCategoryUpsertArgs>(args: SelectSubset<T, OccasionCategoryUpsertArgs<ExtArgs>>): Prisma__OccasionCategoryClient<$Result.GetResult<Prisma.$OccasionCategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OccasionCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionCategoryCountArgs} args - Arguments to filter OccasionCategories to count.
     * @example
     * // Count the number of OccasionCategories
     * const count = await prisma.occasionCategory.count({
     *   where: {
     *     // ... the filter for the OccasionCategories we want to count
     *   }
     * })
    **/
    count<T extends OccasionCategoryCountArgs>(
      args?: Subset<T, OccasionCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OccasionCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OccasionCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OccasionCategoryAggregateArgs>(args: Subset<T, OccasionCategoryAggregateArgs>): Prisma.PrismaPromise<GetOccasionCategoryAggregateType<T>>

    /**
     * Group by OccasionCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OccasionCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OccasionCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OccasionCategoryGroupByArgs['orderBy'] }
        : { orderBy?: OccasionCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OccasionCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOccasionCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OccasionCategory model
   */
  readonly fields: OccasionCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OccasionCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OccasionCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    occasions<T extends OccasionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OccasionDefaultArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OccasionCategory model
   */
  interface OccasionCategoryFieldRefs {
    readonly id: FieldRef<"OccasionCategory", 'String'>
    readonly name: FieldRef<"OccasionCategory", 'String'>
    readonly description: FieldRef<"OccasionCategory", 'String'>
    readonly emoji: FieldRef<"OccasionCategory", 'String'>
    readonly image: FieldRef<"OccasionCategory", 'String'>
    readonly isActive: FieldRef<"OccasionCategory", 'Boolean'>
    readonly occasionId: FieldRef<"OccasionCategory", 'String'>
  }
    

  // Custom InputTypes
  /**
   * OccasionCategory findUnique
   */
  export type OccasionCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * Filter, which OccasionCategory to fetch.
     */
    where: OccasionCategoryWhereUniqueInput
  }

  /**
   * OccasionCategory findUniqueOrThrow
   */
  export type OccasionCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * Filter, which OccasionCategory to fetch.
     */
    where: OccasionCategoryWhereUniqueInput
  }

  /**
   * OccasionCategory findFirst
   */
  export type OccasionCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * Filter, which OccasionCategory to fetch.
     */
    where?: OccasionCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OccasionCategories to fetch.
     */
    orderBy?: OccasionCategoryOrderByWithRelationInput | OccasionCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OccasionCategories.
     */
    cursor?: OccasionCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OccasionCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OccasionCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OccasionCategories.
     */
    distinct?: OccasionCategoryScalarFieldEnum | OccasionCategoryScalarFieldEnum[]
  }

  /**
   * OccasionCategory findFirstOrThrow
   */
  export type OccasionCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * Filter, which OccasionCategory to fetch.
     */
    where?: OccasionCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OccasionCategories to fetch.
     */
    orderBy?: OccasionCategoryOrderByWithRelationInput | OccasionCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OccasionCategories.
     */
    cursor?: OccasionCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OccasionCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OccasionCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OccasionCategories.
     */
    distinct?: OccasionCategoryScalarFieldEnum | OccasionCategoryScalarFieldEnum[]
  }

  /**
   * OccasionCategory findMany
   */
  export type OccasionCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * Filter, which OccasionCategories to fetch.
     */
    where?: OccasionCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OccasionCategories to fetch.
     */
    orderBy?: OccasionCategoryOrderByWithRelationInput | OccasionCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OccasionCategories.
     */
    cursor?: OccasionCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OccasionCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OccasionCategories.
     */
    skip?: number
    distinct?: OccasionCategoryScalarFieldEnum | OccasionCategoryScalarFieldEnum[]
  }

  /**
   * OccasionCategory create
   */
  export type OccasionCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a OccasionCategory.
     */
    data: XOR<OccasionCategoryCreateInput, OccasionCategoryUncheckedCreateInput>
  }

  /**
   * OccasionCategory createMany
   */
  export type OccasionCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OccasionCategories.
     */
    data: OccasionCategoryCreateManyInput | OccasionCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OccasionCategory createManyAndReturn
   */
  export type OccasionCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * The data used to create many OccasionCategories.
     */
    data: OccasionCategoryCreateManyInput | OccasionCategoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OccasionCategory update
   */
  export type OccasionCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a OccasionCategory.
     */
    data: XOR<OccasionCategoryUpdateInput, OccasionCategoryUncheckedUpdateInput>
    /**
     * Choose, which OccasionCategory to update.
     */
    where: OccasionCategoryWhereUniqueInput
  }

  /**
   * OccasionCategory updateMany
   */
  export type OccasionCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OccasionCategories.
     */
    data: XOR<OccasionCategoryUpdateManyMutationInput, OccasionCategoryUncheckedUpdateManyInput>
    /**
     * Filter which OccasionCategories to update
     */
    where?: OccasionCategoryWhereInput
    /**
     * Limit how many OccasionCategories to update.
     */
    limit?: number
  }

  /**
   * OccasionCategory updateManyAndReturn
   */
  export type OccasionCategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * The data used to update OccasionCategories.
     */
    data: XOR<OccasionCategoryUpdateManyMutationInput, OccasionCategoryUncheckedUpdateManyInput>
    /**
     * Filter which OccasionCategories to update
     */
    where?: OccasionCategoryWhereInput
    /**
     * Limit how many OccasionCategories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OccasionCategory upsert
   */
  export type OccasionCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the OccasionCategory to update in case it exists.
     */
    where: OccasionCategoryWhereUniqueInput
    /**
     * In case the OccasionCategory found by the `where` argument doesn't exist, create a new OccasionCategory with this data.
     */
    create: XOR<OccasionCategoryCreateInput, OccasionCategoryUncheckedCreateInput>
    /**
     * In case the OccasionCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OccasionCategoryUpdateInput, OccasionCategoryUncheckedUpdateInput>
  }

  /**
   * OccasionCategory delete
   */
  export type OccasionCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
    /**
     * Filter which OccasionCategory to delete.
     */
    where: OccasionCategoryWhereUniqueInput
  }

  /**
   * OccasionCategory deleteMany
   */
  export type OccasionCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OccasionCategories to delete
     */
    where?: OccasionCategoryWhereInput
    /**
     * Limit how many OccasionCategories to delete.
     */
    limit?: number
  }

  /**
   * OccasionCategory without action
   */
  export type OccasionCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OccasionCategory
     */
    select?: OccasionCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OccasionCategory
     */
    omit?: OccasionCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OccasionCategoryInclude<ExtArgs> | null
  }


  /**
   * Model Categories
   */

  export type AggregateCategories = {
    _count: CategoriesCountAggregateOutputType | null
    _min: CategoriesMinAggregateOutputType | null
    _max: CategoriesMaxAggregateOutputType | null
  }

  export type CategoriesMinAggregateOutputType = {
    id: string | null
    name: string | null
  }

  export type CategoriesMaxAggregateOutputType = {
    id: string | null
    name: string | null
  }

  export type CategoriesCountAggregateOutputType = {
    id: number
    name: number
    _all: number
  }


  export type CategoriesMinAggregateInputType = {
    id?: true
    name?: true
  }

  export type CategoriesMaxAggregateInputType = {
    id?: true
    name?: true
  }

  export type CategoriesCountAggregateInputType = {
    id?: true
    name?: true
    _all?: true
  }

  export type CategoriesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to aggregate.
     */
    where?: CategoriesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoriesOrderByWithRelationInput | CategoriesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoriesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Categories
    **/
    _count?: true | CategoriesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoriesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoriesMaxAggregateInputType
  }

  export type GetCategoriesAggregateType<T extends CategoriesAggregateArgs> = {
        [P in keyof T & keyof AggregateCategories]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategories[P]>
      : GetScalarType<T[P], AggregateCategories[P]>
  }




  export type CategoriesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoriesWhereInput
    orderBy?: CategoriesOrderByWithAggregationInput | CategoriesOrderByWithAggregationInput[]
    by: CategoriesScalarFieldEnum[] | CategoriesScalarFieldEnum
    having?: CategoriesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoriesCountAggregateInputType | true
    _min?: CategoriesMinAggregateInputType
    _max?: CategoriesMaxAggregateInputType
  }

  export type CategoriesGroupByOutputType = {
    id: string
    name: string
    _count: CategoriesCountAggregateOutputType | null
    _min: CategoriesMinAggregateOutputType | null
    _max: CategoriesMaxAggregateOutputType | null
  }

  type GetCategoriesGroupByPayload<T extends CategoriesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoriesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoriesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoriesGroupByOutputType[P]>
            : GetScalarType<T[P], CategoriesGroupByOutputType[P]>
        }
      >
    >


  export type CategoriesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    brands?: boolean | Categories$brandsArgs<ExtArgs>
    _count?: boolean | CategoriesCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["categories"]>

  export type CategoriesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["categories"]>

  export type CategoriesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
  }, ExtArgs["result"]["categories"]>

  export type CategoriesSelectScalar = {
    id?: boolean
    name?: boolean
  }

  export type CategoriesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name", ExtArgs["result"]["categories"]>
  export type CategoriesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | Categories$brandsArgs<ExtArgs>
    _count?: boolean | CategoriesCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CategoriesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CategoriesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CategoriesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Categories"
    objects: {
      brands: Prisma.$BrandPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
    }, ExtArgs["result"]["categories"]>
    composites: {}
  }

  type CategoriesGetPayload<S extends boolean | null | undefined | CategoriesDefaultArgs> = $Result.GetResult<Prisma.$CategoriesPayload, S>

  type CategoriesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CategoriesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CategoriesCountAggregateInputType | true
    }

  export interface CategoriesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Categories'], meta: { name: 'Categories' } }
    /**
     * Find zero or one Categories that matches the filter.
     * @param {CategoriesFindUniqueArgs} args - Arguments to find a Categories
     * @example
     * // Get one Categories
     * const categories = await prisma.categories.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoriesFindUniqueArgs>(args: SelectSubset<T, CategoriesFindUniqueArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Categories that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CategoriesFindUniqueOrThrowArgs} args - Arguments to find a Categories
     * @example
     * // Get one Categories
     * const categories = await prisma.categories.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoriesFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoriesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriesFindFirstArgs} args - Arguments to find a Categories
     * @example
     * // Get one Categories
     * const categories = await prisma.categories.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoriesFindFirstArgs>(args?: SelectSubset<T, CategoriesFindFirstArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Categories that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriesFindFirstOrThrowArgs} args - Arguments to find a Categories
     * @example
     * // Get one Categories
     * const categories = await prisma.categories.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoriesFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoriesFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.categories.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.categories.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoriesWithIdOnly = await prisma.categories.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoriesFindManyArgs>(args?: SelectSubset<T, CategoriesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Categories.
     * @param {CategoriesCreateArgs} args - Arguments to create a Categories.
     * @example
     * // Create one Categories
     * const Categories = await prisma.categories.create({
     *   data: {
     *     // ... data to create a Categories
     *   }
     * })
     * 
     */
    create<T extends CategoriesCreateArgs>(args: SelectSubset<T, CategoriesCreateArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Categories.
     * @param {CategoriesCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const categories = await prisma.categories.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoriesCreateManyArgs>(args?: SelectSubset<T, CategoriesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Categories and returns the data saved in the database.
     * @param {CategoriesCreateManyAndReturnArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const categories = await prisma.categories.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Categories and only return the `id`
     * const categoriesWithIdOnly = await prisma.categories.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CategoriesCreateManyAndReturnArgs>(args?: SelectSubset<T, CategoriesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Categories.
     * @param {CategoriesDeleteArgs} args - Arguments to delete one Categories.
     * @example
     * // Delete one Categories
     * const Categories = await prisma.categories.delete({
     *   where: {
     *     // ... filter to delete one Categories
     *   }
     * })
     * 
     */
    delete<T extends CategoriesDeleteArgs>(args: SelectSubset<T, CategoriesDeleteArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Categories.
     * @param {CategoriesUpdateArgs} args - Arguments to update one Categories.
     * @example
     * // Update one Categories
     * const categories = await prisma.categories.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoriesUpdateArgs>(args: SelectSubset<T, CategoriesUpdateArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Categories.
     * @param {CategoriesDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.categories.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoriesDeleteManyArgs>(args?: SelectSubset<T, CategoriesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const categories = await prisma.categories.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoriesUpdateManyArgs>(args: SelectSubset<T, CategoriesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories and returns the data updated in the database.
     * @param {CategoriesUpdateManyAndReturnArgs} args - Arguments to update many Categories.
     * @example
     * // Update many Categories
     * const categories = await prisma.categories.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Categories and only return the `id`
     * const categoriesWithIdOnly = await prisma.categories.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CategoriesUpdateManyAndReturnArgs>(args: SelectSubset<T, CategoriesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Categories.
     * @param {CategoriesUpsertArgs} args - Arguments to update or create a Categories.
     * @example
     * // Update or create a Categories
     * const categories = await prisma.categories.upsert({
     *   create: {
     *     // ... data to create a Categories
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Categories we want to update
     *   }
     * })
     */
    upsert<T extends CategoriesUpsertArgs>(args: SelectSubset<T, CategoriesUpsertArgs<ExtArgs>>): Prisma__CategoriesClient<$Result.GetResult<Prisma.$CategoriesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriesCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.categories.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends CategoriesCountArgs>(
      args?: Subset<T, CategoriesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoriesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoriesAggregateArgs>(args: Subset<T, CategoriesAggregateArgs>): Prisma.PrismaPromise<GetCategoriesAggregateType<T>>

    /**
     * Group by Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoriesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CategoriesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoriesGroupByArgs['orderBy'] }
        : { orderBy?: CategoriesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CategoriesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoriesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Categories model
   */
  readonly fields: CategoriesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Categories.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoriesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    brands<T extends Categories$brandsArgs<ExtArgs> = {}>(args?: Subset<T, Categories$brandsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Categories model
   */
  interface CategoriesFieldRefs {
    readonly id: FieldRef<"Categories", 'String'>
    readonly name: FieldRef<"Categories", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Categories findUnique
   */
  export type CategoriesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where: CategoriesWhereUniqueInput
  }

  /**
   * Categories findUniqueOrThrow
   */
  export type CategoriesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where: CategoriesWhereUniqueInput
  }

  /**
   * Categories findFirst
   */
  export type CategoriesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoriesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoriesOrderByWithRelationInput | CategoriesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoriesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoriesScalarFieldEnum | CategoriesScalarFieldEnum[]
  }

  /**
   * Categories findFirstOrThrow
   */
  export type CategoriesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoriesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoriesOrderByWithRelationInput | CategoriesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoriesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoriesScalarFieldEnum | CategoriesScalarFieldEnum[]
  }

  /**
   * Categories findMany
   */
  export type CategoriesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoriesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoriesOrderByWithRelationInput | CategoriesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Categories.
     */
    cursor?: CategoriesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    distinct?: CategoriesScalarFieldEnum | CategoriesScalarFieldEnum[]
  }

  /**
   * Categories create
   */
  export type CategoriesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * The data needed to create a Categories.
     */
    data: XOR<CategoriesCreateInput, CategoriesUncheckedCreateInput>
  }

  /**
   * Categories createMany
   */
  export type CategoriesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Categories.
     */
    data: CategoriesCreateManyInput | CategoriesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Categories createManyAndReturn
   */
  export type CategoriesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * The data used to create many Categories.
     */
    data: CategoriesCreateManyInput | CategoriesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Categories update
   */
  export type CategoriesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * The data needed to update a Categories.
     */
    data: XOR<CategoriesUpdateInput, CategoriesUncheckedUpdateInput>
    /**
     * Choose, which Categories to update.
     */
    where: CategoriesWhereUniqueInput
  }

  /**
   * Categories updateMany
   */
  export type CategoriesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoriesUpdateManyMutationInput, CategoriesUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoriesWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Categories updateManyAndReturn
   */
  export type CategoriesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoriesUpdateManyMutationInput, CategoriesUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoriesWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Categories upsert
   */
  export type CategoriesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * The filter to search for the Categories to update in case it exists.
     */
    where: CategoriesWhereUniqueInput
    /**
     * In case the Categories found by the `where` argument doesn't exist, create a new Categories with this data.
     */
    create: XOR<CategoriesCreateInput, CategoriesUncheckedCreateInput>
    /**
     * In case the Categories was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoriesUpdateInput, CategoriesUncheckedUpdateInput>
  }

  /**
   * Categories delete
   */
  export type CategoriesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
    /**
     * Filter which Categories to delete.
     */
    where: CategoriesWhereUniqueInput
  }

  /**
   * Categories deleteMany
   */
  export type CategoriesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoriesWhereInput
    /**
     * Limit how many Categories to delete.
     */
    limit?: number
  }

  /**
   * Categories.brands
   */
  export type Categories$brandsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Brand
     */
    select?: BrandSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Brand
     */
    omit?: BrandOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BrandInclude<ExtArgs> | null
    where?: BrandWhereInput
    orderBy?: BrandOrderByWithRelationInput | BrandOrderByWithRelationInput[]
    cursor?: BrandWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BrandScalarFieldEnum | BrandScalarFieldEnum[]
  }

  /**
   * Categories without action
   */
  export type CategoriesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Categories
     */
    select?: CategoriesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Categories
     */
    omit?: CategoriesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoriesInclude<ExtArgs> | null
  }


  /**
   * Model ReceiverDetail
   */

  export type AggregateReceiverDetail = {
    _count: ReceiverDetailCountAggregateOutputType | null
    _min: ReceiverDetailMinAggregateOutputType | null
    _max: ReceiverDetailMaxAggregateOutputType | null
  }

  export type ReceiverDetailMinAggregateOutputType = {
    id: string | null
    name: string | null
    phone: string | null
    email: string | null
  }

  export type ReceiverDetailMaxAggregateOutputType = {
    id: string | null
    name: string | null
    phone: string | null
    email: string | null
  }

  export type ReceiverDetailCountAggregateOutputType = {
    id: number
    name: number
    phone: number
    email: number
    _all: number
  }


  export type ReceiverDetailMinAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    email?: true
  }

  export type ReceiverDetailMaxAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    email?: true
  }

  export type ReceiverDetailCountAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    email?: true
    _all?: true
  }

  export type ReceiverDetailAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiverDetail to aggregate.
     */
    where?: ReceiverDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiverDetails to fetch.
     */
    orderBy?: ReceiverDetailOrderByWithRelationInput | ReceiverDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReceiverDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiverDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiverDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ReceiverDetails
    **/
    _count?: true | ReceiverDetailCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReceiverDetailMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReceiverDetailMaxAggregateInputType
  }

  export type GetReceiverDetailAggregateType<T extends ReceiverDetailAggregateArgs> = {
        [P in keyof T & keyof AggregateReceiverDetail]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReceiverDetail[P]>
      : GetScalarType<T[P], AggregateReceiverDetail[P]>
  }




  export type ReceiverDetailGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReceiverDetailWhereInput
    orderBy?: ReceiverDetailOrderByWithAggregationInput | ReceiverDetailOrderByWithAggregationInput[]
    by: ReceiverDetailScalarFieldEnum[] | ReceiverDetailScalarFieldEnum
    having?: ReceiverDetailScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReceiverDetailCountAggregateInputType | true
    _min?: ReceiverDetailMinAggregateInputType
    _max?: ReceiverDetailMaxAggregateInputType
  }

  export type ReceiverDetailGroupByOutputType = {
    id: string
    name: string
    phone: string
    email: string
    _count: ReceiverDetailCountAggregateOutputType | null
    _min: ReceiverDetailMinAggregateOutputType | null
    _max: ReceiverDetailMaxAggregateOutputType | null
  }

  type GetReceiverDetailGroupByPayload<T extends ReceiverDetailGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReceiverDetailGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReceiverDetailGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReceiverDetailGroupByOutputType[P]>
            : GetScalarType<T[P], ReceiverDetailGroupByOutputType[P]>
        }
      >
    >


  export type ReceiverDetailSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    email?: boolean
    order?: boolean | ReceiverDetail$orderArgs<ExtArgs>
    _count?: boolean | ReceiverDetailCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["receiverDetail"]>

  export type ReceiverDetailSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    email?: boolean
  }, ExtArgs["result"]["receiverDetail"]>

  export type ReceiverDetailSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    email?: boolean
  }, ExtArgs["result"]["receiverDetail"]>

  export type ReceiverDetailSelectScalar = {
    id?: boolean
    name?: boolean
    phone?: boolean
    email?: boolean
  }

  export type ReceiverDetailOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "phone" | "email", ExtArgs["result"]["receiverDetail"]>
  export type ReceiverDetailInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | ReceiverDetail$orderArgs<ExtArgs>
    _count?: boolean | ReceiverDetailCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ReceiverDetailIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ReceiverDetailIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ReceiverDetailPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ReceiverDetail"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      phone: string
      email: string
    }, ExtArgs["result"]["receiverDetail"]>
    composites: {}
  }

  type ReceiverDetailGetPayload<S extends boolean | null | undefined | ReceiverDetailDefaultArgs> = $Result.GetResult<Prisma.$ReceiverDetailPayload, S>

  type ReceiverDetailCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReceiverDetailFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReceiverDetailCountAggregateInputType | true
    }

  export interface ReceiverDetailDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ReceiverDetail'], meta: { name: 'ReceiverDetail' } }
    /**
     * Find zero or one ReceiverDetail that matches the filter.
     * @param {ReceiverDetailFindUniqueArgs} args - Arguments to find a ReceiverDetail
     * @example
     * // Get one ReceiverDetail
     * const receiverDetail = await prisma.receiverDetail.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReceiverDetailFindUniqueArgs>(args: SelectSubset<T, ReceiverDetailFindUniqueArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ReceiverDetail that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReceiverDetailFindUniqueOrThrowArgs} args - Arguments to find a ReceiverDetail
     * @example
     * // Get one ReceiverDetail
     * const receiverDetail = await prisma.receiverDetail.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReceiverDetailFindUniqueOrThrowArgs>(args: SelectSubset<T, ReceiverDetailFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiverDetail that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiverDetailFindFirstArgs} args - Arguments to find a ReceiverDetail
     * @example
     * // Get one ReceiverDetail
     * const receiverDetail = await prisma.receiverDetail.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReceiverDetailFindFirstArgs>(args?: SelectSubset<T, ReceiverDetailFindFirstArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ReceiverDetail that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiverDetailFindFirstOrThrowArgs} args - Arguments to find a ReceiverDetail
     * @example
     * // Get one ReceiverDetail
     * const receiverDetail = await prisma.receiverDetail.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReceiverDetailFindFirstOrThrowArgs>(args?: SelectSubset<T, ReceiverDetailFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ReceiverDetails that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiverDetailFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ReceiverDetails
     * const receiverDetails = await prisma.receiverDetail.findMany()
     * 
     * // Get first 10 ReceiverDetails
     * const receiverDetails = await prisma.receiverDetail.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const receiverDetailWithIdOnly = await prisma.receiverDetail.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReceiverDetailFindManyArgs>(args?: SelectSubset<T, ReceiverDetailFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ReceiverDetail.
     * @param {ReceiverDetailCreateArgs} args - Arguments to create a ReceiverDetail.
     * @example
     * // Create one ReceiverDetail
     * const ReceiverDetail = await prisma.receiverDetail.create({
     *   data: {
     *     // ... data to create a ReceiverDetail
     *   }
     * })
     * 
     */
    create<T extends ReceiverDetailCreateArgs>(args: SelectSubset<T, ReceiverDetailCreateArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ReceiverDetails.
     * @param {ReceiverDetailCreateManyArgs} args - Arguments to create many ReceiverDetails.
     * @example
     * // Create many ReceiverDetails
     * const receiverDetail = await prisma.receiverDetail.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReceiverDetailCreateManyArgs>(args?: SelectSubset<T, ReceiverDetailCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ReceiverDetails and returns the data saved in the database.
     * @param {ReceiverDetailCreateManyAndReturnArgs} args - Arguments to create many ReceiverDetails.
     * @example
     * // Create many ReceiverDetails
     * const receiverDetail = await prisma.receiverDetail.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ReceiverDetails and only return the `id`
     * const receiverDetailWithIdOnly = await prisma.receiverDetail.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReceiverDetailCreateManyAndReturnArgs>(args?: SelectSubset<T, ReceiverDetailCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ReceiverDetail.
     * @param {ReceiverDetailDeleteArgs} args - Arguments to delete one ReceiverDetail.
     * @example
     * // Delete one ReceiverDetail
     * const ReceiverDetail = await prisma.receiverDetail.delete({
     *   where: {
     *     // ... filter to delete one ReceiverDetail
     *   }
     * })
     * 
     */
    delete<T extends ReceiverDetailDeleteArgs>(args: SelectSubset<T, ReceiverDetailDeleteArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ReceiverDetail.
     * @param {ReceiverDetailUpdateArgs} args - Arguments to update one ReceiverDetail.
     * @example
     * // Update one ReceiverDetail
     * const receiverDetail = await prisma.receiverDetail.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReceiverDetailUpdateArgs>(args: SelectSubset<T, ReceiverDetailUpdateArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ReceiverDetails.
     * @param {ReceiverDetailDeleteManyArgs} args - Arguments to filter ReceiverDetails to delete.
     * @example
     * // Delete a few ReceiverDetails
     * const { count } = await prisma.receiverDetail.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReceiverDetailDeleteManyArgs>(args?: SelectSubset<T, ReceiverDetailDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiverDetails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiverDetailUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ReceiverDetails
     * const receiverDetail = await prisma.receiverDetail.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReceiverDetailUpdateManyArgs>(args: SelectSubset<T, ReceiverDetailUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ReceiverDetails and returns the data updated in the database.
     * @param {ReceiverDetailUpdateManyAndReturnArgs} args - Arguments to update many ReceiverDetails.
     * @example
     * // Update many ReceiverDetails
     * const receiverDetail = await prisma.receiverDetail.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ReceiverDetails and only return the `id`
     * const receiverDetailWithIdOnly = await prisma.receiverDetail.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReceiverDetailUpdateManyAndReturnArgs>(args: SelectSubset<T, ReceiverDetailUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ReceiverDetail.
     * @param {ReceiverDetailUpsertArgs} args - Arguments to update or create a ReceiverDetail.
     * @example
     * // Update or create a ReceiverDetail
     * const receiverDetail = await prisma.receiverDetail.upsert({
     *   create: {
     *     // ... data to create a ReceiverDetail
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ReceiverDetail we want to update
     *   }
     * })
     */
    upsert<T extends ReceiverDetailUpsertArgs>(args: SelectSubset<T, ReceiverDetailUpsertArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ReceiverDetails.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiverDetailCountArgs} args - Arguments to filter ReceiverDetails to count.
     * @example
     * // Count the number of ReceiverDetails
     * const count = await prisma.receiverDetail.count({
     *   where: {
     *     // ... the filter for the ReceiverDetails we want to count
     *   }
     * })
    **/
    count<T extends ReceiverDetailCountArgs>(
      args?: Subset<T, ReceiverDetailCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReceiverDetailCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ReceiverDetail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiverDetailAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReceiverDetailAggregateArgs>(args: Subset<T, ReceiverDetailAggregateArgs>): Prisma.PrismaPromise<GetReceiverDetailAggregateType<T>>

    /**
     * Group by ReceiverDetail.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReceiverDetailGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReceiverDetailGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReceiverDetailGroupByArgs['orderBy'] }
        : { orderBy?: ReceiverDetailGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReceiverDetailGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReceiverDetailGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ReceiverDetail model
   */
  readonly fields: ReceiverDetailFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ReceiverDetail.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReceiverDetailClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends ReceiverDetail$orderArgs<ExtArgs> = {}>(args?: Subset<T, ReceiverDetail$orderArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ReceiverDetail model
   */
  interface ReceiverDetailFieldRefs {
    readonly id: FieldRef<"ReceiverDetail", 'String'>
    readonly name: FieldRef<"ReceiverDetail", 'String'>
    readonly phone: FieldRef<"ReceiverDetail", 'String'>
    readonly email: FieldRef<"ReceiverDetail", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ReceiverDetail findUnique
   */
  export type ReceiverDetailFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * Filter, which ReceiverDetail to fetch.
     */
    where: ReceiverDetailWhereUniqueInput
  }

  /**
   * ReceiverDetail findUniqueOrThrow
   */
  export type ReceiverDetailFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * Filter, which ReceiverDetail to fetch.
     */
    where: ReceiverDetailWhereUniqueInput
  }

  /**
   * ReceiverDetail findFirst
   */
  export type ReceiverDetailFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * Filter, which ReceiverDetail to fetch.
     */
    where?: ReceiverDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiverDetails to fetch.
     */
    orderBy?: ReceiverDetailOrderByWithRelationInput | ReceiverDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiverDetails.
     */
    cursor?: ReceiverDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiverDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiverDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiverDetails.
     */
    distinct?: ReceiverDetailScalarFieldEnum | ReceiverDetailScalarFieldEnum[]
  }

  /**
   * ReceiverDetail findFirstOrThrow
   */
  export type ReceiverDetailFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * Filter, which ReceiverDetail to fetch.
     */
    where?: ReceiverDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiverDetails to fetch.
     */
    orderBy?: ReceiverDetailOrderByWithRelationInput | ReceiverDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ReceiverDetails.
     */
    cursor?: ReceiverDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiverDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiverDetails.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ReceiverDetails.
     */
    distinct?: ReceiverDetailScalarFieldEnum | ReceiverDetailScalarFieldEnum[]
  }

  /**
   * ReceiverDetail findMany
   */
  export type ReceiverDetailFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * Filter, which ReceiverDetails to fetch.
     */
    where?: ReceiverDetailWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ReceiverDetails to fetch.
     */
    orderBy?: ReceiverDetailOrderByWithRelationInput | ReceiverDetailOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ReceiverDetails.
     */
    cursor?: ReceiverDetailWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ReceiverDetails from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ReceiverDetails.
     */
    skip?: number
    distinct?: ReceiverDetailScalarFieldEnum | ReceiverDetailScalarFieldEnum[]
  }

  /**
   * ReceiverDetail create
   */
  export type ReceiverDetailCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * The data needed to create a ReceiverDetail.
     */
    data: XOR<ReceiverDetailCreateInput, ReceiverDetailUncheckedCreateInput>
  }

  /**
   * ReceiverDetail createMany
   */
  export type ReceiverDetailCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ReceiverDetails.
     */
    data: ReceiverDetailCreateManyInput | ReceiverDetailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReceiverDetail createManyAndReturn
   */
  export type ReceiverDetailCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * The data used to create many ReceiverDetails.
     */
    data: ReceiverDetailCreateManyInput | ReceiverDetailCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ReceiverDetail update
   */
  export type ReceiverDetailUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * The data needed to update a ReceiverDetail.
     */
    data: XOR<ReceiverDetailUpdateInput, ReceiverDetailUncheckedUpdateInput>
    /**
     * Choose, which ReceiverDetail to update.
     */
    where: ReceiverDetailWhereUniqueInput
  }

  /**
   * ReceiverDetail updateMany
   */
  export type ReceiverDetailUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ReceiverDetails.
     */
    data: XOR<ReceiverDetailUpdateManyMutationInput, ReceiverDetailUncheckedUpdateManyInput>
    /**
     * Filter which ReceiverDetails to update
     */
    where?: ReceiverDetailWhereInput
    /**
     * Limit how many ReceiverDetails to update.
     */
    limit?: number
  }

  /**
   * ReceiverDetail updateManyAndReturn
   */
  export type ReceiverDetailUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * The data used to update ReceiverDetails.
     */
    data: XOR<ReceiverDetailUpdateManyMutationInput, ReceiverDetailUncheckedUpdateManyInput>
    /**
     * Filter which ReceiverDetails to update
     */
    where?: ReceiverDetailWhereInput
    /**
     * Limit how many ReceiverDetails to update.
     */
    limit?: number
  }

  /**
   * ReceiverDetail upsert
   */
  export type ReceiverDetailUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * The filter to search for the ReceiverDetail to update in case it exists.
     */
    where: ReceiverDetailWhereUniqueInput
    /**
     * In case the ReceiverDetail found by the `where` argument doesn't exist, create a new ReceiverDetail with this data.
     */
    create: XOR<ReceiverDetailCreateInput, ReceiverDetailUncheckedCreateInput>
    /**
     * In case the ReceiverDetail was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReceiverDetailUpdateInput, ReceiverDetailUncheckedUpdateInput>
  }

  /**
   * ReceiverDetail delete
   */
  export type ReceiverDetailDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
    /**
     * Filter which ReceiverDetail to delete.
     */
    where: ReceiverDetailWhereUniqueInput
  }

  /**
   * ReceiverDetail deleteMany
   */
  export type ReceiverDetailDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ReceiverDetails to delete
     */
    where?: ReceiverDetailWhereInput
    /**
     * Limit how many ReceiverDetails to delete.
     */
    limit?: number
  }

  /**
   * ReceiverDetail.order
   */
  export type ReceiverDetail$orderArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    cursor?: OrderWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * ReceiverDetail without action
   */
  export type ReceiverDetailDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ReceiverDetail
     */
    select?: ReceiverDetailSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ReceiverDetail
     */
    omit?: ReceiverDetailOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReceiverDetailInclude<ExtArgs> | null
  }


  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    amount: number | null
    totalAmount: number | null
  }

  export type OrderSumAggregateOutputType = {
    amount: number | null
    totalAmount: number | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    brandId: string | null
    occasionId: string | null
    amount: number | null
    message: string | null
    isActive: boolean | null
    sendType: $Enums.SendStatus | null
    deliveryMethod: $Enums.deliveryMethodStatus | null
    receiverId: string | null
    senderId: string | null
    giftCode: string | null
    orderNumber: string | null
    paymentMethod: $Enums.paymentStatus | null
    totalAmount: number | null
    redemptionStatus: $Enums.RedemptionStatus | null
    timeStemp: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    brandId: string | null
    occasionId: string | null
    amount: number | null
    message: string | null
    isActive: boolean | null
    sendType: $Enums.SendStatus | null
    deliveryMethod: $Enums.deliveryMethodStatus | null
    receiverId: string | null
    senderId: string | null
    giftCode: string | null
    orderNumber: string | null
    paymentMethod: $Enums.paymentStatus | null
    totalAmount: number | null
    redemptionStatus: $Enums.RedemptionStatus | null
    timeStemp: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    brandId: number
    occasionId: number
    amount: number
    message: number
    isActive: number
    sendType: number
    deliveryMethod: number
    receiverId: number
    senderId: number
    giftCode: number
    orderNumber: number
    paymentMethod: number
    totalAmount: number
    redemptionStatus: number
    timeStemp: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    amount?: true
    totalAmount?: true
  }

  export type OrderSumAggregateInputType = {
    amount?: true
    totalAmount?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    brandId?: true
    occasionId?: true
    amount?: true
    message?: true
    isActive?: true
    sendType?: true
    deliveryMethod?: true
    receiverId?: true
    senderId?: true
    giftCode?: true
    orderNumber?: true
    paymentMethod?: true
    totalAmount?: true
    redemptionStatus?: true
    timeStemp?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    brandId?: true
    occasionId?: true
    amount?: true
    message?: true
    isActive?: true
    sendType?: true
    deliveryMethod?: true
    receiverId?: true
    senderId?: true
    giftCode?: true
    orderNumber?: true
    paymentMethod?: true
    totalAmount?: true
    redemptionStatus?: true
    timeStemp?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    brandId?: true
    occasionId?: true
    amount?: true
    message?: true
    isActive?: true
    sendType?: true
    deliveryMethod?: true
    receiverId?: true
    senderId?: true
    giftCode?: true
    orderNumber?: true
    paymentMethod?: true
    totalAmount?: true
    redemptionStatus?: true
    timeStemp?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    brandId: string
    occasionId: string
    amount: number
    message: string
    isActive: boolean
    sendType: $Enums.SendStatus
    deliveryMethod: $Enums.deliveryMethodStatus
    receiverId: string
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod: $Enums.paymentStatus
    totalAmount: number | null
    redemptionStatus: $Enums.RedemptionStatus
    timeStemp: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandId?: boolean
    occasionId?: boolean
    amount?: boolean
    message?: boolean
    isActive?: boolean
    sendType?: boolean
    deliveryMethod?: boolean
    receiverId?: boolean
    senderId?: boolean
    giftCode?: boolean
    orderNumber?: boolean
    paymentMethod?: boolean
    totalAmount?: boolean
    redemptionStatus?: boolean
    timeStemp?: boolean
    receiverDetails?: boolean | ReceiverDetailDefaultArgs<ExtArgs>
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
    brands?: boolean | BrandDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandId?: boolean
    occasionId?: boolean
    amount?: boolean
    message?: boolean
    isActive?: boolean
    sendType?: boolean
    deliveryMethod?: boolean
    receiverId?: boolean
    senderId?: boolean
    giftCode?: boolean
    orderNumber?: boolean
    paymentMethod?: boolean
    totalAmount?: boolean
    redemptionStatus?: boolean
    timeStemp?: boolean
    receiverDetails?: boolean | ReceiverDetailDefaultArgs<ExtArgs>
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
    brands?: boolean | BrandDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandId?: boolean
    occasionId?: boolean
    amount?: boolean
    message?: boolean
    isActive?: boolean
    sendType?: boolean
    deliveryMethod?: boolean
    receiverId?: boolean
    senderId?: boolean
    giftCode?: boolean
    orderNumber?: boolean
    paymentMethod?: boolean
    totalAmount?: boolean
    redemptionStatus?: boolean
    timeStemp?: boolean
    receiverDetails?: boolean | ReceiverDetailDefaultArgs<ExtArgs>
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
    brands?: boolean | BrandDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectScalar = {
    id?: boolean
    brandId?: boolean
    occasionId?: boolean
    amount?: boolean
    message?: boolean
    isActive?: boolean
    sendType?: boolean
    deliveryMethod?: boolean
    receiverId?: boolean
    senderId?: boolean
    giftCode?: boolean
    orderNumber?: boolean
    paymentMethod?: boolean
    totalAmount?: boolean
    redemptionStatus?: boolean
    timeStemp?: boolean
  }

  export type OrderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "brandId" | "occasionId" | "amount" | "message" | "isActive" | "sendType" | "deliveryMethod" | "receiverId" | "senderId" | "giftCode" | "orderNumber" | "paymentMethod" | "totalAmount" | "redemptionStatus" | "timeStemp", ExtArgs["result"]["order"]>
  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receiverDetails?: boolean | ReceiverDetailDefaultArgs<ExtArgs>
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
    brands?: boolean | BrandDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receiverDetails?: boolean | ReceiverDetailDefaultArgs<ExtArgs>
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
    brands?: boolean | BrandDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type OrderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    receiverDetails?: boolean | ReceiverDetailDefaultArgs<ExtArgs>
    occasions?: boolean | OccasionDefaultArgs<ExtArgs>
    brands?: boolean | BrandDefaultArgs<ExtArgs>
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      receiverDetails: Prisma.$ReceiverDetailPayload<ExtArgs>
      occasions: Prisma.$OccasionPayload<ExtArgs>
      brands: Prisma.$BrandPayload<ExtArgs>
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      brandId: string
      occasionId: string
      amount: number
      message: string
      isActive: boolean
      sendType: $Enums.SendStatus
      deliveryMethod: $Enums.deliveryMethodStatus
      receiverId: string
      senderId: string
      giftCode: string
      orderNumber: string
      paymentMethod: $Enums.paymentStatus
      totalAmount: number | null
      redemptionStatus: $Enums.RedemptionStatus
      timeStemp: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders and returns the data updated in the database.
     * @param {OrderUpdateManyAndReturnArgs} args - Arguments to update many Orders.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    receiverDetails<T extends ReceiverDetailDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ReceiverDetailDefaultArgs<ExtArgs>>): Prisma__ReceiverDetailClient<$Result.GetResult<Prisma.$ReceiverDetailPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    occasions<T extends OccasionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OccasionDefaultArgs<ExtArgs>>): Prisma__OccasionClient<$Result.GetResult<Prisma.$OccasionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    brands<T extends BrandDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BrandDefaultArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Order model
   */
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly brandId: FieldRef<"Order", 'String'>
    readonly occasionId: FieldRef<"Order", 'String'>
    readonly amount: FieldRef<"Order", 'Int'>
    readonly message: FieldRef<"Order", 'String'>
    readonly isActive: FieldRef<"Order", 'Boolean'>
    readonly sendType: FieldRef<"Order", 'SendStatus'>
    readonly deliveryMethod: FieldRef<"Order", 'deliveryMethodStatus'>
    readonly receiverId: FieldRef<"Order", 'String'>
    readonly senderId: FieldRef<"Order", 'String'>
    readonly giftCode: FieldRef<"Order", 'String'>
    readonly orderNumber: FieldRef<"Order", 'String'>
    readonly paymentMethod: FieldRef<"Order", 'paymentStatus'>
    readonly totalAmount: FieldRef<"Order", 'Int'>
    readonly redemptionStatus: FieldRef<"Order", 'RedemptionStatus'>
    readonly timeStemp: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
  }

  /**
   * Order updateManyAndReturn
   */
  export type OrderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to delete.
     */
    limit?: number
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model Settlements
   */

  export type AggregateSettlements = {
    _count: SettlementsCountAggregateOutputType | null
    _avg: SettlementsAvgAggregateOutputType | null
    _sum: SettlementsSumAggregateOutputType | null
    _min: SettlementsMinAggregateOutputType | null
    _max: SettlementsMaxAggregateOutputType | null
  }

  export type SettlementsAvgAggregateOutputType = {
    totalSold: number | null
    Outstanding: number | null
    Amount: number | null
  }

  export type SettlementsSumAggregateOutputType = {
    totalSold: number | null
    Outstanding: number | null
    Amount: number | null
  }

  export type SettlementsMinAggregateOutputType = {
    id: string | null
    brandId: string | null
    totalSold: number | null
    Redeemed: string | null
    Outstanding: number | null
    settlementTerms: string | null
    Amount: number | null
    lastPayment: Date | null
    status: $Enums.Status | null
  }

  export type SettlementsMaxAggregateOutputType = {
    id: string | null
    brandId: string | null
    totalSold: number | null
    Redeemed: string | null
    Outstanding: number | null
    settlementTerms: string | null
    Amount: number | null
    lastPayment: Date | null
    status: $Enums.Status | null
  }

  export type SettlementsCountAggregateOutputType = {
    id: number
    brandId: number
    totalSold: number
    Redeemed: number
    Outstanding: number
    settlementTerms: number
    Amount: number
    lastPayment: number
    status: number
    _all: number
  }


  export type SettlementsAvgAggregateInputType = {
    totalSold?: true
    Outstanding?: true
    Amount?: true
  }

  export type SettlementsSumAggregateInputType = {
    totalSold?: true
    Outstanding?: true
    Amount?: true
  }

  export type SettlementsMinAggregateInputType = {
    id?: true
    brandId?: true
    totalSold?: true
    Redeemed?: true
    Outstanding?: true
    settlementTerms?: true
    Amount?: true
    lastPayment?: true
    status?: true
  }

  export type SettlementsMaxAggregateInputType = {
    id?: true
    brandId?: true
    totalSold?: true
    Redeemed?: true
    Outstanding?: true
    settlementTerms?: true
    Amount?: true
    lastPayment?: true
    status?: true
  }

  export type SettlementsCountAggregateInputType = {
    id?: true
    brandId?: true
    totalSold?: true
    Redeemed?: true
    Outstanding?: true
    settlementTerms?: true
    Amount?: true
    lastPayment?: true
    status?: true
    _all?: true
  }

  export type SettlementsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settlements to aggregate.
     */
    where?: SettlementsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settlements to fetch.
     */
    orderBy?: SettlementsOrderByWithRelationInput | SettlementsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SettlementsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settlements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settlements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Settlements
    **/
    _count?: true | SettlementsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SettlementsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SettlementsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SettlementsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SettlementsMaxAggregateInputType
  }

  export type GetSettlementsAggregateType<T extends SettlementsAggregateArgs> = {
        [P in keyof T & keyof AggregateSettlements]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSettlements[P]>
      : GetScalarType<T[P], AggregateSettlements[P]>
  }




  export type SettlementsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SettlementsWhereInput
    orderBy?: SettlementsOrderByWithAggregationInput | SettlementsOrderByWithAggregationInput[]
    by: SettlementsScalarFieldEnum[] | SettlementsScalarFieldEnum
    having?: SettlementsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SettlementsCountAggregateInputType | true
    _avg?: SettlementsAvgAggregateInputType
    _sum?: SettlementsSumAggregateInputType
    _min?: SettlementsMinAggregateInputType
    _max?: SettlementsMaxAggregateInputType
  }

  export type SettlementsGroupByOutputType = {
    id: string
    brandId: string
    totalSold: number
    Redeemed: string
    Outstanding: number | null
    settlementTerms: string
    Amount: number | null
    lastPayment: Date
    status: $Enums.Status
    _count: SettlementsCountAggregateOutputType | null
    _avg: SettlementsAvgAggregateOutputType | null
    _sum: SettlementsSumAggregateOutputType | null
    _min: SettlementsMinAggregateOutputType | null
    _max: SettlementsMaxAggregateOutputType | null
  }

  type GetSettlementsGroupByPayload<T extends SettlementsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SettlementsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SettlementsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SettlementsGroupByOutputType[P]>
            : GetScalarType<T[P], SettlementsGroupByOutputType[P]>
        }
      >
    >


  export type SettlementsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandId?: boolean
    totalSold?: boolean
    Redeemed?: boolean
    Outstanding?: boolean
    settlementTerms?: boolean
    Amount?: boolean
    lastPayment?: boolean
    status?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["settlements"]>

  export type SettlementsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandId?: boolean
    totalSold?: boolean
    Redeemed?: boolean
    Outstanding?: boolean
    settlementTerms?: boolean
    Amount?: boolean
    lastPayment?: boolean
    status?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["settlements"]>

  export type SettlementsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brandId?: boolean
    totalSold?: boolean
    Redeemed?: boolean
    Outstanding?: boolean
    settlementTerms?: boolean
    Amount?: boolean
    lastPayment?: boolean
    status?: boolean
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["settlements"]>

  export type SettlementsSelectScalar = {
    id?: boolean
    brandId?: boolean
    totalSold?: boolean
    Redeemed?: boolean
    Outstanding?: boolean
    settlementTerms?: boolean
    Amount?: boolean
    lastPayment?: boolean
    status?: boolean
  }

  export type SettlementsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "brandId" | "totalSold" | "Redeemed" | "Outstanding" | "settlementTerms" | "Amount" | "lastPayment" | "status", ExtArgs["result"]["settlements"]>
  export type SettlementsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type SettlementsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }
  export type SettlementsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    brands?: boolean | BrandDefaultArgs<ExtArgs>
  }

  export type $SettlementsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Settlements"
    objects: {
      brands: Prisma.$BrandPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      brandId: string
      totalSold: number
      Redeemed: string
      Outstanding: number | null
      settlementTerms: string
      Amount: number | null
      lastPayment: Date
      status: $Enums.Status
    }, ExtArgs["result"]["settlements"]>
    composites: {}
  }

  type SettlementsGetPayload<S extends boolean | null | undefined | SettlementsDefaultArgs> = $Result.GetResult<Prisma.$SettlementsPayload, S>

  type SettlementsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SettlementsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SettlementsCountAggregateInputType | true
    }

  export interface SettlementsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Settlements'], meta: { name: 'Settlements' } }
    /**
     * Find zero or one Settlements that matches the filter.
     * @param {SettlementsFindUniqueArgs} args - Arguments to find a Settlements
     * @example
     * // Get one Settlements
     * const settlements = await prisma.settlements.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SettlementsFindUniqueArgs>(args: SelectSubset<T, SettlementsFindUniqueArgs<ExtArgs>>): Prisma__SettlementsClient<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Settlements that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SettlementsFindUniqueOrThrowArgs} args - Arguments to find a Settlements
     * @example
     * // Get one Settlements
     * const settlements = await prisma.settlements.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SettlementsFindUniqueOrThrowArgs>(args: SelectSubset<T, SettlementsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SettlementsClient<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settlements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettlementsFindFirstArgs} args - Arguments to find a Settlements
     * @example
     * // Get one Settlements
     * const settlements = await prisma.settlements.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SettlementsFindFirstArgs>(args?: SelectSubset<T, SettlementsFindFirstArgs<ExtArgs>>): Prisma__SettlementsClient<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Settlements that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettlementsFindFirstOrThrowArgs} args - Arguments to find a Settlements
     * @example
     * // Get one Settlements
     * const settlements = await prisma.settlements.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SettlementsFindFirstOrThrowArgs>(args?: SelectSubset<T, SettlementsFindFirstOrThrowArgs<ExtArgs>>): Prisma__SettlementsClient<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Settlements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettlementsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Settlements
     * const settlements = await prisma.settlements.findMany()
     * 
     * // Get first 10 Settlements
     * const settlements = await prisma.settlements.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const settlementsWithIdOnly = await prisma.settlements.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SettlementsFindManyArgs>(args?: SelectSubset<T, SettlementsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Settlements.
     * @param {SettlementsCreateArgs} args - Arguments to create a Settlements.
     * @example
     * // Create one Settlements
     * const Settlements = await prisma.settlements.create({
     *   data: {
     *     // ... data to create a Settlements
     *   }
     * })
     * 
     */
    create<T extends SettlementsCreateArgs>(args: SelectSubset<T, SettlementsCreateArgs<ExtArgs>>): Prisma__SettlementsClient<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Settlements.
     * @param {SettlementsCreateManyArgs} args - Arguments to create many Settlements.
     * @example
     * // Create many Settlements
     * const settlements = await prisma.settlements.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SettlementsCreateManyArgs>(args?: SelectSubset<T, SettlementsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Settlements and returns the data saved in the database.
     * @param {SettlementsCreateManyAndReturnArgs} args - Arguments to create many Settlements.
     * @example
     * // Create many Settlements
     * const settlements = await prisma.settlements.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Settlements and only return the `id`
     * const settlementsWithIdOnly = await prisma.settlements.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SettlementsCreateManyAndReturnArgs>(args?: SelectSubset<T, SettlementsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Settlements.
     * @param {SettlementsDeleteArgs} args - Arguments to delete one Settlements.
     * @example
     * // Delete one Settlements
     * const Settlements = await prisma.settlements.delete({
     *   where: {
     *     // ... filter to delete one Settlements
     *   }
     * })
     * 
     */
    delete<T extends SettlementsDeleteArgs>(args: SelectSubset<T, SettlementsDeleteArgs<ExtArgs>>): Prisma__SettlementsClient<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Settlements.
     * @param {SettlementsUpdateArgs} args - Arguments to update one Settlements.
     * @example
     * // Update one Settlements
     * const settlements = await prisma.settlements.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SettlementsUpdateArgs>(args: SelectSubset<T, SettlementsUpdateArgs<ExtArgs>>): Prisma__SettlementsClient<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Settlements.
     * @param {SettlementsDeleteManyArgs} args - Arguments to filter Settlements to delete.
     * @example
     * // Delete a few Settlements
     * const { count } = await prisma.settlements.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SettlementsDeleteManyArgs>(args?: SelectSubset<T, SettlementsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settlements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettlementsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Settlements
     * const settlements = await prisma.settlements.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SettlementsUpdateManyArgs>(args: SelectSubset<T, SettlementsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Settlements and returns the data updated in the database.
     * @param {SettlementsUpdateManyAndReturnArgs} args - Arguments to update many Settlements.
     * @example
     * // Update many Settlements
     * const settlements = await prisma.settlements.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Settlements and only return the `id`
     * const settlementsWithIdOnly = await prisma.settlements.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SettlementsUpdateManyAndReturnArgs>(args: SelectSubset<T, SettlementsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Settlements.
     * @param {SettlementsUpsertArgs} args - Arguments to update or create a Settlements.
     * @example
     * // Update or create a Settlements
     * const settlements = await prisma.settlements.upsert({
     *   create: {
     *     // ... data to create a Settlements
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Settlements we want to update
     *   }
     * })
     */
    upsert<T extends SettlementsUpsertArgs>(args: SelectSubset<T, SettlementsUpsertArgs<ExtArgs>>): Prisma__SettlementsClient<$Result.GetResult<Prisma.$SettlementsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Settlements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettlementsCountArgs} args - Arguments to filter Settlements to count.
     * @example
     * // Count the number of Settlements
     * const count = await prisma.settlements.count({
     *   where: {
     *     // ... the filter for the Settlements we want to count
     *   }
     * })
    **/
    count<T extends SettlementsCountArgs>(
      args?: Subset<T, SettlementsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SettlementsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Settlements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettlementsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SettlementsAggregateArgs>(args: Subset<T, SettlementsAggregateArgs>): Prisma.PrismaPromise<GetSettlementsAggregateType<T>>

    /**
     * Group by Settlements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SettlementsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SettlementsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SettlementsGroupByArgs['orderBy'] }
        : { orderBy?: SettlementsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SettlementsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSettlementsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Settlements model
   */
  readonly fields: SettlementsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Settlements.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SettlementsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    brands<T extends BrandDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BrandDefaultArgs<ExtArgs>>): Prisma__BrandClient<$Result.GetResult<Prisma.$BrandPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Settlements model
   */
  interface SettlementsFieldRefs {
    readonly id: FieldRef<"Settlements", 'String'>
    readonly brandId: FieldRef<"Settlements", 'String'>
    readonly totalSold: FieldRef<"Settlements", 'Int'>
    readonly Redeemed: FieldRef<"Settlements", 'String'>
    readonly Outstanding: FieldRef<"Settlements", 'Int'>
    readonly settlementTerms: FieldRef<"Settlements", 'String'>
    readonly Amount: FieldRef<"Settlements", 'Int'>
    readonly lastPayment: FieldRef<"Settlements", 'DateTime'>
    readonly status: FieldRef<"Settlements", 'Status'>
  }
    

  // Custom InputTypes
  /**
   * Settlements findUnique
   */
  export type SettlementsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * Filter, which Settlements to fetch.
     */
    where: SettlementsWhereUniqueInput
  }

  /**
   * Settlements findUniqueOrThrow
   */
  export type SettlementsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * Filter, which Settlements to fetch.
     */
    where: SettlementsWhereUniqueInput
  }

  /**
   * Settlements findFirst
   */
  export type SettlementsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * Filter, which Settlements to fetch.
     */
    where?: SettlementsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settlements to fetch.
     */
    orderBy?: SettlementsOrderByWithRelationInput | SettlementsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settlements.
     */
    cursor?: SettlementsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settlements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settlements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settlements.
     */
    distinct?: SettlementsScalarFieldEnum | SettlementsScalarFieldEnum[]
  }

  /**
   * Settlements findFirstOrThrow
   */
  export type SettlementsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * Filter, which Settlements to fetch.
     */
    where?: SettlementsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settlements to fetch.
     */
    orderBy?: SettlementsOrderByWithRelationInput | SettlementsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Settlements.
     */
    cursor?: SettlementsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settlements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settlements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Settlements.
     */
    distinct?: SettlementsScalarFieldEnum | SettlementsScalarFieldEnum[]
  }

  /**
   * Settlements findMany
   */
  export type SettlementsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * Filter, which Settlements to fetch.
     */
    where?: SettlementsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Settlements to fetch.
     */
    orderBy?: SettlementsOrderByWithRelationInput | SettlementsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Settlements.
     */
    cursor?: SettlementsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Settlements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Settlements.
     */
    skip?: number
    distinct?: SettlementsScalarFieldEnum | SettlementsScalarFieldEnum[]
  }

  /**
   * Settlements create
   */
  export type SettlementsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * The data needed to create a Settlements.
     */
    data: XOR<SettlementsCreateInput, SettlementsUncheckedCreateInput>
  }

  /**
   * Settlements createMany
   */
  export type SettlementsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Settlements.
     */
    data: SettlementsCreateManyInput | SettlementsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Settlements createManyAndReturn
   */
  export type SettlementsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * The data used to create many Settlements.
     */
    data: SettlementsCreateManyInput | SettlementsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Settlements update
   */
  export type SettlementsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * The data needed to update a Settlements.
     */
    data: XOR<SettlementsUpdateInput, SettlementsUncheckedUpdateInput>
    /**
     * Choose, which Settlements to update.
     */
    where: SettlementsWhereUniqueInput
  }

  /**
   * Settlements updateMany
   */
  export type SettlementsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Settlements.
     */
    data: XOR<SettlementsUpdateManyMutationInput, SettlementsUncheckedUpdateManyInput>
    /**
     * Filter which Settlements to update
     */
    where?: SettlementsWhereInput
    /**
     * Limit how many Settlements to update.
     */
    limit?: number
  }

  /**
   * Settlements updateManyAndReturn
   */
  export type SettlementsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * The data used to update Settlements.
     */
    data: XOR<SettlementsUpdateManyMutationInput, SettlementsUncheckedUpdateManyInput>
    /**
     * Filter which Settlements to update
     */
    where?: SettlementsWhereInput
    /**
     * Limit how many Settlements to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Settlements upsert
   */
  export type SettlementsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * The filter to search for the Settlements to update in case it exists.
     */
    where: SettlementsWhereUniqueInput
    /**
     * In case the Settlements found by the `where` argument doesn't exist, create a new Settlements with this data.
     */
    create: XOR<SettlementsCreateInput, SettlementsUncheckedCreateInput>
    /**
     * In case the Settlements was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SettlementsUpdateInput, SettlementsUncheckedUpdateInput>
  }

  /**
   * Settlements delete
   */
  export type SettlementsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
    /**
     * Filter which Settlements to delete.
     */
    where: SettlementsWhereUniqueInput
  }

  /**
   * Settlements deleteMany
   */
  export type SettlementsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Settlements to delete
     */
    where?: SettlementsWhereInput
    /**
     * Limit how many Settlements to delete.
     */
    limit?: number
  }

  /**
   * Settlements without action
   */
  export type SettlementsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Settlements
     */
    select?: SettlementsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Settlements
     */
    omit?: SettlementsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SettlementsInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    phone: 'phone',
    firstName: 'firstName',
    lastName: 'lastName',
    password: 'password',
    avatar: 'avatar',
    role: 'role',
    isActive: 'isActive',
    isVerify: 'isVerify',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SessionScalarFieldEnum: {
    id: 'id',
    sessionToken: 'sessionToken',
    userId: 'userId',
    expires: 'expires'
  };

  export type SessionScalarFieldEnum = (typeof SessionScalarFieldEnum)[keyof typeof SessionScalarFieldEnum]


  export const BrandScalarFieldEnum: {
    id: 'id',
    brandName: 'brandName',
    logo: 'logo',
    description: 'description',
    website: 'website',
    contact: 'contact',
    tagline: 'tagline',
    color: 'color',
    categoryId: 'categoryId',
    isActive: 'isActive',
    isFeature: 'isFeature',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BrandScalarFieldEnum = (typeof BrandScalarFieldEnum)[keyof typeof BrandScalarFieldEnum]


  export const BrandContactsScalarFieldEnum: {
    id: 'id',
    name: 'name',
    role: 'role',
    email: 'email',
    phone: 'phone',
    brandId: 'brandId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BrandContactsScalarFieldEnum = (typeof BrandContactsScalarFieldEnum)[keyof typeof BrandContactsScalarFieldEnum]


  export const BrandTermsScalarFieldEnum: {
    id: 'id',
    settelementTrigger: 'settelementTrigger',
    commissionType: 'commissionType',
    commissionValue: 'commissionValue',
    currency: 'currency',
    discount: 'discount',
    orderValue: 'orderValue',
    contractStart: 'contractStart',
    contractEnd: 'contractEnd',
    goLiveDate: 'goLiveDate',
    renewContract: 'renewContract',
    brackingPolicy: 'brackingPolicy',
    brackingShare: 'brackingShare',
    vatRate: 'vatRate',
    internalNotes: 'internalNotes',
    brandId: 'brandId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BrandTermsScalarFieldEnum = (typeof BrandTermsScalarFieldEnum)[keyof typeof BrandTermsScalarFieldEnum]


  export const VouchersScalarFieldEnum: {
    id: 'id',
    denominationype: 'denominationype',
    addDenomination: 'addDenomination',
    maxAmount: 'maxAmount',
    minAmount: 'minAmount',
    expiryPolicy: 'expiryPolicy',
    expiryValue: 'expiryValue',
    graceDays: 'graceDays',
    redemptionChannels: 'redemptionChannels',
    partialRedemption: 'partialRedemption',
    Stackable: 'Stackable',
    userPerDay: 'userPerDay',
    termsConditionsURL: 'termsConditionsURL',
    brandId: 'brandId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VouchersScalarFieldEnum = (typeof VouchersScalarFieldEnum)[keyof typeof VouchersScalarFieldEnum]


  export const BrandBankingScalarFieldEnum: {
    id: 'id',
    settlementFrequency: 'settlementFrequency',
    dayOfMonth: 'dayOfMonth',
    payoutMethod: 'payoutMethod',
    invoiceRequired: 'invoiceRequired',
    remittanceEmail: 'remittanceEmail',
    accountHolder: 'accountHolder',
    accountNumber: 'accountNumber',
    branchCode: 'branchCode',
    bankName: 'bankName',
    SWIFTCode: 'SWIFTCode',
    country: 'country',
    brandId: 'brandId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BrandBankingScalarFieldEnum = (typeof BrandBankingScalarFieldEnum)[keyof typeof BrandBankingScalarFieldEnum]


  export const OccasionScalarFieldEnum: {
    id: 'id',
    name: 'name',
    emoji: 'emoji',
    description: 'description',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OccasionScalarFieldEnum = (typeof OccasionScalarFieldEnum)[keyof typeof OccasionScalarFieldEnum]


  export const OccasionCategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    emoji: 'emoji',
    image: 'image',
    isActive: 'isActive',
    occasionId: 'occasionId'
  };

  export type OccasionCategoryScalarFieldEnum = (typeof OccasionCategoryScalarFieldEnum)[keyof typeof OccasionCategoryScalarFieldEnum]


  export const CategoriesScalarFieldEnum: {
    id: 'id',
    name: 'name'
  };

  export type CategoriesScalarFieldEnum = (typeof CategoriesScalarFieldEnum)[keyof typeof CategoriesScalarFieldEnum]


  export const ReceiverDetailScalarFieldEnum: {
    id: 'id',
    name: 'name',
    phone: 'phone',
    email: 'email'
  };

  export type ReceiverDetailScalarFieldEnum = (typeof ReceiverDetailScalarFieldEnum)[keyof typeof ReceiverDetailScalarFieldEnum]


  export const OrderScalarFieldEnum: {
    id: 'id',
    brandId: 'brandId',
    occasionId: 'occasionId',
    amount: 'amount',
    message: 'message',
    isActive: 'isActive',
    sendType: 'sendType',
    deliveryMethod: 'deliveryMethod',
    receiverId: 'receiverId',
    senderId: 'senderId',
    giftCode: 'giftCode',
    orderNumber: 'orderNumber',
    paymentMethod: 'paymentMethod',
    totalAmount: 'totalAmount',
    redemptionStatus: 'redemptionStatus',
    timeStemp: 'timeStemp'
  };

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const SettlementsScalarFieldEnum: {
    id: 'id',
    brandId: 'brandId',
    totalSold: 'totalSold',
    Redeemed: 'Redeemed',
    Outstanding: 'Outstanding',
    settlementTerms: 'settlementTerms',
    Amount: 'Amount',
    lastPayment: 'lastPayment',
    status: 'status'
  };

  export type SettlementsScalarFieldEnum = (typeof SettlementsScalarFieldEnum)[keyof typeof SettlementsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'SettelmentStatus'
   */
  export type EnumSettelmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SettelmentStatus'>
    


  /**
   * Reference to a field of type 'SettelmentStatus[]'
   */
  export type ListEnumSettelmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SettelmentStatus[]'>
    


  /**
   * Reference to a field of type 'CommissionStatus'
   */
  export type EnumCommissionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommissionStatus'>
    


  /**
   * Reference to a field of type 'CommissionStatus[]'
   */
  export type ListEnumCommissionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CommissionStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'PolicyStatus'
   */
  export type EnumPolicyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PolicyStatus'>
    


  /**
   * Reference to a field of type 'PolicyStatus[]'
   */
  export type ListEnumPolicyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PolicyStatus[]'>
    


  /**
   * Reference to a field of type 'DenominationStatus'
   */
  export type EnumDenominationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DenominationStatus'>
    


  /**
   * Reference to a field of type 'DenominationStatus[]'
   */
  export type ListEnumDenominationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DenominationStatus[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'expiryPolicyStatus'
   */
  export type EnumexpiryPolicyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'expiryPolicyStatus'>
    


  /**
   * Reference to a field of type 'expiryPolicyStatus[]'
   */
  export type ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'expiryPolicyStatus[]'>
    


  /**
   * Reference to a field of type 'SettlementFrequencyStatus'
   */
  export type EnumSettlementFrequencyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SettlementFrequencyStatus'>
    


  /**
   * Reference to a field of type 'SettlementFrequencyStatus[]'
   */
  export type ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SettlementFrequencyStatus[]'>
    


  /**
   * Reference to a field of type 'payoutMethodStatus'
   */
  export type EnumpayoutMethodStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'payoutMethodStatus'>
    


  /**
   * Reference to a field of type 'payoutMethodStatus[]'
   */
  export type ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'payoutMethodStatus[]'>
    


  /**
   * Reference to a field of type 'SendStatus'
   */
  export type EnumSendStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SendStatus'>
    


  /**
   * Reference to a field of type 'SendStatus[]'
   */
  export type ListEnumSendStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SendStatus[]'>
    


  /**
   * Reference to a field of type 'deliveryMethodStatus'
   */
  export type EnumdeliveryMethodStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'deliveryMethodStatus'>
    


  /**
   * Reference to a field of type 'deliveryMethodStatus[]'
   */
  export type ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'deliveryMethodStatus[]'>
    


  /**
   * Reference to a field of type 'paymentStatus'
   */
  export type EnumpaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'paymentStatus'>
    


  /**
   * Reference to a field of type 'paymentStatus[]'
   */
  export type ListEnumpaymentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'paymentStatus[]'>
    


  /**
   * Reference to a field of type 'RedemptionStatus'
   */
  export type EnumRedemptionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RedemptionStatus'>
    


  /**
   * Reference to a field of type 'RedemptionStatus[]'
   */
  export type ListEnumRedemptionStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RedemptionStatus[]'>
    


  /**
   * Reference to a field of type 'Status'
   */
  export type EnumStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Status'>
    


  /**
   * Reference to a field of type 'Status[]'
   */
  export type ListEnumStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Status[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    phone?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    avatar?: StringNullableFilter<"User"> | string | null
    role?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    isVerify?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    sessions?: SessionListRelationFilter
    order?: OrderListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    password?: SortOrder
    avatar?: SortOrderInput | SortOrder
    role?: SortOrderInput | SortOrder
    isActive?: SortOrder
    isVerify?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    sessions?: SessionOrderByRelationAggregateInput
    order?: OrderOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    phone?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    avatar?: StringNullableFilter<"User"> | string | null
    role?: StringNullableFilter<"User"> | string | null
    isActive?: BoolFilter<"User"> | boolean
    isVerify?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    sessions?: SessionListRelationFilter
    order?: OrderListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    password?: SortOrder
    avatar?: SortOrderInput | SortOrder
    role?: SortOrderInput | SortOrder
    isActive?: SortOrder
    isVerify?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    phone?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    avatar?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringNullableWithAggregatesFilter<"User"> | string | null
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    isVerify?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type SessionWhereInput = {
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    id?: StringFilter<"Session"> | string
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type SessionOrderByWithRelationInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type SessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sessionToken?: string
    AND?: SessionWhereInput | SessionWhereInput[]
    OR?: SessionWhereInput[]
    NOT?: SessionWhereInput | SessionWhereInput[]
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "sessionToken">

  export type SessionOrderByWithAggregationInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
    _count?: SessionCountOrderByAggregateInput
    _max?: SessionMaxOrderByAggregateInput
    _min?: SessionMinOrderByAggregateInput
  }

  export type SessionScalarWhereWithAggregatesInput = {
    AND?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    OR?: SessionScalarWhereWithAggregatesInput[]
    NOT?: SessionScalarWhereWithAggregatesInput | SessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Session"> | string
    sessionToken?: StringWithAggregatesFilter<"Session"> | string
    userId?: StringWithAggregatesFilter<"Session"> | string
    expires?: DateTimeWithAggregatesFilter<"Session"> | Date | string
  }

  export type BrandWhereInput = {
    AND?: BrandWhereInput | BrandWhereInput[]
    OR?: BrandWhereInput[]
    NOT?: BrandWhereInput | BrandWhereInput[]
    id?: StringFilter<"Brand"> | string
    brandName?: StringFilter<"Brand"> | string
    logo?: StringFilter<"Brand"> | string
    description?: StringFilter<"Brand"> | string
    website?: StringFilter<"Brand"> | string
    contact?: StringFilter<"Brand"> | string
    tagline?: StringFilter<"Brand"> | string
    color?: StringFilter<"Brand"> | string
    categoryId?: StringFilter<"Brand"> | string
    isActive?: BoolFilter<"Brand"> | boolean
    isFeature?: BoolFilter<"Brand"> | boolean
    notes?: StringFilter<"Brand"> | string
    createdAt?: DateTimeFilter<"Brand"> | Date | string
    updatedAt?: DateTimeFilter<"Brand"> | Date | string
    categories?: XOR<CategoriesScalarRelationFilter, CategoriesWhereInput>
    brandcontacts?: BrandContactsListRelationFilter
    brandTerms?: BrandTermsListRelationFilter
    brandBankings?: BrandBankingListRelationFilter
    vouchers?: VouchersListRelationFilter
    order?: OrderListRelationFilter
    settlements?: SettlementsListRelationFilter
  }

  export type BrandOrderByWithRelationInput = {
    id?: SortOrder
    brandName?: SortOrder
    logo?: SortOrder
    description?: SortOrder
    website?: SortOrder
    contact?: SortOrder
    tagline?: SortOrder
    color?: SortOrder
    categoryId?: SortOrder
    isActive?: SortOrder
    isFeature?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    categories?: CategoriesOrderByWithRelationInput
    brandcontacts?: BrandContactsOrderByRelationAggregateInput
    brandTerms?: BrandTermsOrderByRelationAggregateInput
    brandBankings?: BrandBankingOrderByRelationAggregateInput
    vouchers?: VouchersOrderByRelationAggregateInput
    order?: OrderOrderByRelationAggregateInput
    settlements?: SettlementsOrderByRelationAggregateInput
  }

  export type BrandWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    brandName?: string
    AND?: BrandWhereInput | BrandWhereInput[]
    OR?: BrandWhereInput[]
    NOT?: BrandWhereInput | BrandWhereInput[]
    logo?: StringFilter<"Brand"> | string
    description?: StringFilter<"Brand"> | string
    website?: StringFilter<"Brand"> | string
    contact?: StringFilter<"Brand"> | string
    tagline?: StringFilter<"Brand"> | string
    color?: StringFilter<"Brand"> | string
    categoryId?: StringFilter<"Brand"> | string
    isActive?: BoolFilter<"Brand"> | boolean
    isFeature?: BoolFilter<"Brand"> | boolean
    notes?: StringFilter<"Brand"> | string
    createdAt?: DateTimeFilter<"Brand"> | Date | string
    updatedAt?: DateTimeFilter<"Brand"> | Date | string
    categories?: XOR<CategoriesScalarRelationFilter, CategoriesWhereInput>
    brandcontacts?: BrandContactsListRelationFilter
    brandTerms?: BrandTermsListRelationFilter
    brandBankings?: BrandBankingListRelationFilter
    vouchers?: VouchersListRelationFilter
    order?: OrderListRelationFilter
    settlements?: SettlementsListRelationFilter
  }, "id" | "brandName">

  export type BrandOrderByWithAggregationInput = {
    id?: SortOrder
    brandName?: SortOrder
    logo?: SortOrder
    description?: SortOrder
    website?: SortOrder
    contact?: SortOrder
    tagline?: SortOrder
    color?: SortOrder
    categoryId?: SortOrder
    isActive?: SortOrder
    isFeature?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BrandCountOrderByAggregateInput
    _max?: BrandMaxOrderByAggregateInput
    _min?: BrandMinOrderByAggregateInput
  }

  export type BrandScalarWhereWithAggregatesInput = {
    AND?: BrandScalarWhereWithAggregatesInput | BrandScalarWhereWithAggregatesInput[]
    OR?: BrandScalarWhereWithAggregatesInput[]
    NOT?: BrandScalarWhereWithAggregatesInput | BrandScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Brand"> | string
    brandName?: StringWithAggregatesFilter<"Brand"> | string
    logo?: StringWithAggregatesFilter<"Brand"> | string
    description?: StringWithAggregatesFilter<"Brand"> | string
    website?: StringWithAggregatesFilter<"Brand"> | string
    contact?: StringWithAggregatesFilter<"Brand"> | string
    tagline?: StringWithAggregatesFilter<"Brand"> | string
    color?: StringWithAggregatesFilter<"Brand"> | string
    categoryId?: StringWithAggregatesFilter<"Brand"> | string
    isActive?: BoolWithAggregatesFilter<"Brand"> | boolean
    isFeature?: BoolWithAggregatesFilter<"Brand"> | boolean
    notes?: StringWithAggregatesFilter<"Brand"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Brand"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Brand"> | Date | string
  }

  export type BrandContactsWhereInput = {
    AND?: BrandContactsWhereInput | BrandContactsWhereInput[]
    OR?: BrandContactsWhereInput[]
    NOT?: BrandContactsWhereInput | BrandContactsWhereInput[]
    id?: StringFilter<"BrandContacts"> | string
    name?: StringFilter<"BrandContacts"> | string
    role?: StringFilter<"BrandContacts"> | string
    email?: StringFilter<"BrandContacts"> | string
    phone?: StringFilter<"BrandContacts"> | string
    brandId?: StringFilter<"BrandContacts"> | string
    createdAt?: DateTimeFilter<"BrandContacts"> | Date | string
    updatedAt?: DateTimeFilter<"BrandContacts"> | Date | string
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }

  export type BrandContactsOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    brands?: BrandOrderByWithRelationInput
  }

  export type BrandContactsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BrandContactsWhereInput | BrandContactsWhereInput[]
    OR?: BrandContactsWhereInput[]
    NOT?: BrandContactsWhereInput | BrandContactsWhereInput[]
    name?: StringFilter<"BrandContacts"> | string
    role?: StringFilter<"BrandContacts"> | string
    email?: StringFilter<"BrandContacts"> | string
    phone?: StringFilter<"BrandContacts"> | string
    brandId?: StringFilter<"BrandContacts"> | string
    createdAt?: DateTimeFilter<"BrandContacts"> | Date | string
    updatedAt?: DateTimeFilter<"BrandContacts"> | Date | string
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }, "id">

  export type BrandContactsOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BrandContactsCountOrderByAggregateInput
    _max?: BrandContactsMaxOrderByAggregateInput
    _min?: BrandContactsMinOrderByAggregateInput
  }

  export type BrandContactsScalarWhereWithAggregatesInput = {
    AND?: BrandContactsScalarWhereWithAggregatesInput | BrandContactsScalarWhereWithAggregatesInput[]
    OR?: BrandContactsScalarWhereWithAggregatesInput[]
    NOT?: BrandContactsScalarWhereWithAggregatesInput | BrandContactsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BrandContacts"> | string
    name?: StringWithAggregatesFilter<"BrandContacts"> | string
    role?: StringWithAggregatesFilter<"BrandContacts"> | string
    email?: StringWithAggregatesFilter<"BrandContacts"> | string
    phone?: StringWithAggregatesFilter<"BrandContacts"> | string
    brandId?: StringWithAggregatesFilter<"BrandContacts"> | string
    createdAt?: DateTimeWithAggregatesFilter<"BrandContacts"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BrandContacts"> | Date | string
  }

  export type BrandTermsWhereInput = {
    AND?: BrandTermsWhereInput | BrandTermsWhereInput[]
    OR?: BrandTermsWhereInput[]
    NOT?: BrandTermsWhereInput | BrandTermsWhereInput[]
    id?: StringFilter<"BrandTerms"> | string
    settelementTrigger?: EnumSettelmentStatusFilter<"BrandTerms"> | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFilter<"BrandTerms"> | $Enums.CommissionStatus
    commissionValue?: IntFilter<"BrandTerms"> | number
    currency?: StringFilter<"BrandTerms"> | string
    discount?: IntNullableFilter<"BrandTerms"> | number | null
    orderValue?: IntNullableFilter<"BrandTerms"> | number | null
    contractStart?: DateTimeFilter<"BrandTerms"> | Date | string
    contractEnd?: DateTimeFilter<"BrandTerms"> | Date | string
    goLiveDate?: DateTimeFilter<"BrandTerms"> | Date | string
    renewContract?: BoolFilter<"BrandTerms"> | boolean
    brackingPolicy?: EnumPolicyStatusFilter<"BrandTerms"> | $Enums.PolicyStatus
    brackingShare?: IntNullableFilter<"BrandTerms"> | number | null
    vatRate?: IntNullableFilter<"BrandTerms"> | number | null
    internalNotes?: StringFilter<"BrandTerms"> | string
    brandId?: StringFilter<"BrandTerms"> | string
    createdAt?: DateTimeFilter<"BrandTerms"> | Date | string
    updatedAt?: DateTimeFilter<"BrandTerms"> | Date | string
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }

  export type BrandTermsOrderByWithRelationInput = {
    id?: SortOrder
    settelementTrigger?: SortOrder
    commissionType?: SortOrder
    commissionValue?: SortOrder
    currency?: SortOrder
    discount?: SortOrderInput | SortOrder
    orderValue?: SortOrderInput | SortOrder
    contractStart?: SortOrder
    contractEnd?: SortOrder
    goLiveDate?: SortOrder
    renewContract?: SortOrder
    brackingPolicy?: SortOrder
    brackingShare?: SortOrderInput | SortOrder
    vatRate?: SortOrderInput | SortOrder
    internalNotes?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    brands?: BrandOrderByWithRelationInput
  }

  export type BrandTermsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BrandTermsWhereInput | BrandTermsWhereInput[]
    OR?: BrandTermsWhereInput[]
    NOT?: BrandTermsWhereInput | BrandTermsWhereInput[]
    settelementTrigger?: EnumSettelmentStatusFilter<"BrandTerms"> | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFilter<"BrandTerms"> | $Enums.CommissionStatus
    commissionValue?: IntFilter<"BrandTerms"> | number
    currency?: StringFilter<"BrandTerms"> | string
    discount?: IntNullableFilter<"BrandTerms"> | number | null
    orderValue?: IntNullableFilter<"BrandTerms"> | number | null
    contractStart?: DateTimeFilter<"BrandTerms"> | Date | string
    contractEnd?: DateTimeFilter<"BrandTerms"> | Date | string
    goLiveDate?: DateTimeFilter<"BrandTerms"> | Date | string
    renewContract?: BoolFilter<"BrandTerms"> | boolean
    brackingPolicy?: EnumPolicyStatusFilter<"BrandTerms"> | $Enums.PolicyStatus
    brackingShare?: IntNullableFilter<"BrandTerms"> | number | null
    vatRate?: IntNullableFilter<"BrandTerms"> | number | null
    internalNotes?: StringFilter<"BrandTerms"> | string
    brandId?: StringFilter<"BrandTerms"> | string
    createdAt?: DateTimeFilter<"BrandTerms"> | Date | string
    updatedAt?: DateTimeFilter<"BrandTerms"> | Date | string
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }, "id">

  export type BrandTermsOrderByWithAggregationInput = {
    id?: SortOrder
    settelementTrigger?: SortOrder
    commissionType?: SortOrder
    commissionValue?: SortOrder
    currency?: SortOrder
    discount?: SortOrderInput | SortOrder
    orderValue?: SortOrderInput | SortOrder
    contractStart?: SortOrder
    contractEnd?: SortOrder
    goLiveDate?: SortOrder
    renewContract?: SortOrder
    brackingPolicy?: SortOrder
    brackingShare?: SortOrderInput | SortOrder
    vatRate?: SortOrderInput | SortOrder
    internalNotes?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BrandTermsCountOrderByAggregateInput
    _avg?: BrandTermsAvgOrderByAggregateInput
    _max?: BrandTermsMaxOrderByAggregateInput
    _min?: BrandTermsMinOrderByAggregateInput
    _sum?: BrandTermsSumOrderByAggregateInput
  }

  export type BrandTermsScalarWhereWithAggregatesInput = {
    AND?: BrandTermsScalarWhereWithAggregatesInput | BrandTermsScalarWhereWithAggregatesInput[]
    OR?: BrandTermsScalarWhereWithAggregatesInput[]
    NOT?: BrandTermsScalarWhereWithAggregatesInput | BrandTermsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BrandTerms"> | string
    settelementTrigger?: EnumSettelmentStatusWithAggregatesFilter<"BrandTerms"> | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusWithAggregatesFilter<"BrandTerms"> | $Enums.CommissionStatus
    commissionValue?: IntWithAggregatesFilter<"BrandTerms"> | number
    currency?: StringWithAggregatesFilter<"BrandTerms"> | string
    discount?: IntNullableWithAggregatesFilter<"BrandTerms"> | number | null
    orderValue?: IntNullableWithAggregatesFilter<"BrandTerms"> | number | null
    contractStart?: DateTimeWithAggregatesFilter<"BrandTerms"> | Date | string
    contractEnd?: DateTimeWithAggregatesFilter<"BrandTerms"> | Date | string
    goLiveDate?: DateTimeWithAggregatesFilter<"BrandTerms"> | Date | string
    renewContract?: BoolWithAggregatesFilter<"BrandTerms"> | boolean
    brackingPolicy?: EnumPolicyStatusWithAggregatesFilter<"BrandTerms"> | $Enums.PolicyStatus
    brackingShare?: IntNullableWithAggregatesFilter<"BrandTerms"> | number | null
    vatRate?: IntNullableWithAggregatesFilter<"BrandTerms"> | number | null
    internalNotes?: StringWithAggregatesFilter<"BrandTerms"> | string
    brandId?: StringWithAggregatesFilter<"BrandTerms"> | string
    createdAt?: DateTimeWithAggregatesFilter<"BrandTerms"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BrandTerms"> | Date | string
  }

  export type VouchersWhereInput = {
    AND?: VouchersWhereInput | VouchersWhereInput[]
    OR?: VouchersWhereInput[]
    NOT?: VouchersWhereInput | VouchersWhereInput[]
    id?: StringFilter<"Vouchers"> | string
    denominationype?: EnumDenominationStatusFilter<"Vouchers"> | $Enums.DenominationStatus
    addDenomination?: JsonNullableFilter<"Vouchers">
    maxAmount?: IntNullableFilter<"Vouchers"> | number | null
    minAmount?: IntNullableFilter<"Vouchers"> | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFilter<"Vouchers"> | $Enums.expiryPolicyStatus
    expiryValue?: StringFilter<"Vouchers"> | string
    graceDays?: IntNullableFilter<"Vouchers"> | number | null
    redemptionChannels?: StringNullableFilter<"Vouchers"> | string | null
    partialRedemption?: BoolFilter<"Vouchers"> | boolean
    Stackable?: BoolFilter<"Vouchers"> | boolean
    userPerDay?: IntNullableFilter<"Vouchers"> | number | null
    termsConditionsURL?: StringNullableFilter<"Vouchers"> | string | null
    brandId?: StringFilter<"Vouchers"> | string
    createdAt?: DateTimeFilter<"Vouchers"> | Date | string
    updatedAt?: DateTimeFilter<"Vouchers"> | Date | string
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }

  export type VouchersOrderByWithRelationInput = {
    id?: SortOrder
    denominationype?: SortOrder
    addDenomination?: SortOrderInput | SortOrder
    maxAmount?: SortOrderInput | SortOrder
    minAmount?: SortOrderInput | SortOrder
    expiryPolicy?: SortOrder
    expiryValue?: SortOrder
    graceDays?: SortOrderInput | SortOrder
    redemptionChannels?: SortOrderInput | SortOrder
    partialRedemption?: SortOrder
    Stackable?: SortOrder
    userPerDay?: SortOrderInput | SortOrder
    termsConditionsURL?: SortOrderInput | SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    brands?: BrandOrderByWithRelationInput
  }

  export type VouchersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VouchersWhereInput | VouchersWhereInput[]
    OR?: VouchersWhereInput[]
    NOT?: VouchersWhereInput | VouchersWhereInput[]
    denominationype?: EnumDenominationStatusFilter<"Vouchers"> | $Enums.DenominationStatus
    addDenomination?: JsonNullableFilter<"Vouchers">
    maxAmount?: IntNullableFilter<"Vouchers"> | number | null
    minAmount?: IntNullableFilter<"Vouchers"> | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFilter<"Vouchers"> | $Enums.expiryPolicyStatus
    expiryValue?: StringFilter<"Vouchers"> | string
    graceDays?: IntNullableFilter<"Vouchers"> | number | null
    redemptionChannels?: StringNullableFilter<"Vouchers"> | string | null
    partialRedemption?: BoolFilter<"Vouchers"> | boolean
    Stackable?: BoolFilter<"Vouchers"> | boolean
    userPerDay?: IntNullableFilter<"Vouchers"> | number | null
    termsConditionsURL?: StringNullableFilter<"Vouchers"> | string | null
    brandId?: StringFilter<"Vouchers"> | string
    createdAt?: DateTimeFilter<"Vouchers"> | Date | string
    updatedAt?: DateTimeFilter<"Vouchers"> | Date | string
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }, "id">

  export type VouchersOrderByWithAggregationInput = {
    id?: SortOrder
    denominationype?: SortOrder
    addDenomination?: SortOrderInput | SortOrder
    maxAmount?: SortOrderInput | SortOrder
    minAmount?: SortOrderInput | SortOrder
    expiryPolicy?: SortOrder
    expiryValue?: SortOrder
    graceDays?: SortOrderInput | SortOrder
    redemptionChannels?: SortOrderInput | SortOrder
    partialRedemption?: SortOrder
    Stackable?: SortOrder
    userPerDay?: SortOrderInput | SortOrder
    termsConditionsURL?: SortOrderInput | SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VouchersCountOrderByAggregateInput
    _avg?: VouchersAvgOrderByAggregateInput
    _max?: VouchersMaxOrderByAggregateInput
    _min?: VouchersMinOrderByAggregateInput
    _sum?: VouchersSumOrderByAggregateInput
  }

  export type VouchersScalarWhereWithAggregatesInput = {
    AND?: VouchersScalarWhereWithAggregatesInput | VouchersScalarWhereWithAggregatesInput[]
    OR?: VouchersScalarWhereWithAggregatesInput[]
    NOT?: VouchersScalarWhereWithAggregatesInput | VouchersScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Vouchers"> | string
    denominationype?: EnumDenominationStatusWithAggregatesFilter<"Vouchers"> | $Enums.DenominationStatus
    addDenomination?: JsonNullableWithAggregatesFilter<"Vouchers">
    maxAmount?: IntNullableWithAggregatesFilter<"Vouchers"> | number | null
    minAmount?: IntNullableWithAggregatesFilter<"Vouchers"> | number | null
    expiryPolicy?: EnumexpiryPolicyStatusWithAggregatesFilter<"Vouchers"> | $Enums.expiryPolicyStatus
    expiryValue?: StringWithAggregatesFilter<"Vouchers"> | string
    graceDays?: IntNullableWithAggregatesFilter<"Vouchers"> | number | null
    redemptionChannels?: StringNullableWithAggregatesFilter<"Vouchers"> | string | null
    partialRedemption?: BoolWithAggregatesFilter<"Vouchers"> | boolean
    Stackable?: BoolWithAggregatesFilter<"Vouchers"> | boolean
    userPerDay?: IntNullableWithAggregatesFilter<"Vouchers"> | number | null
    termsConditionsURL?: StringNullableWithAggregatesFilter<"Vouchers"> | string | null
    brandId?: StringWithAggregatesFilter<"Vouchers"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Vouchers"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Vouchers"> | Date | string
  }

  export type BrandBankingWhereInput = {
    AND?: BrandBankingWhereInput | BrandBankingWhereInput[]
    OR?: BrandBankingWhereInput[]
    NOT?: BrandBankingWhereInput | BrandBankingWhereInput[]
    id?: StringFilter<"BrandBanking"> | string
    settlementFrequency?: EnumSettlementFrequencyStatusFilter<"BrandBanking"> | $Enums.SettlementFrequencyStatus
    dayOfMonth?: IntNullableFilter<"BrandBanking"> | number | null
    payoutMethod?: EnumpayoutMethodStatusFilter<"BrandBanking"> | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFilter<"BrandBanking"> | boolean
    remittanceEmail?: StringFilter<"BrandBanking"> | string
    accountHolder?: StringFilter<"BrandBanking"> | string
    accountNumber?: StringFilter<"BrandBanking"> | string
    branchCode?: StringFilter<"BrandBanking"> | string
    bankName?: StringFilter<"BrandBanking"> | string
    SWIFTCode?: StringFilter<"BrandBanking"> | string
    country?: StringFilter<"BrandBanking"> | string
    brandId?: StringFilter<"BrandBanking"> | string
    createdAt?: DateTimeFilter<"BrandBanking"> | Date | string
    updatedAt?: DateTimeFilter<"BrandBanking"> | Date | string
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }

  export type BrandBankingOrderByWithRelationInput = {
    id?: SortOrder
    settlementFrequency?: SortOrder
    dayOfMonth?: SortOrderInput | SortOrder
    payoutMethod?: SortOrder
    invoiceRequired?: SortOrder
    remittanceEmail?: SortOrder
    accountHolder?: SortOrder
    accountNumber?: SortOrder
    branchCode?: SortOrder
    bankName?: SortOrder
    SWIFTCode?: SortOrder
    country?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    brands?: BrandOrderByWithRelationInput
  }

  export type BrandBankingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BrandBankingWhereInput | BrandBankingWhereInput[]
    OR?: BrandBankingWhereInput[]
    NOT?: BrandBankingWhereInput | BrandBankingWhereInput[]
    settlementFrequency?: EnumSettlementFrequencyStatusFilter<"BrandBanking"> | $Enums.SettlementFrequencyStatus
    dayOfMonth?: IntNullableFilter<"BrandBanking"> | number | null
    payoutMethod?: EnumpayoutMethodStatusFilter<"BrandBanking"> | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFilter<"BrandBanking"> | boolean
    remittanceEmail?: StringFilter<"BrandBanking"> | string
    accountHolder?: StringFilter<"BrandBanking"> | string
    accountNumber?: StringFilter<"BrandBanking"> | string
    branchCode?: StringFilter<"BrandBanking"> | string
    bankName?: StringFilter<"BrandBanking"> | string
    SWIFTCode?: StringFilter<"BrandBanking"> | string
    country?: StringFilter<"BrandBanking"> | string
    brandId?: StringFilter<"BrandBanking"> | string
    createdAt?: DateTimeFilter<"BrandBanking"> | Date | string
    updatedAt?: DateTimeFilter<"BrandBanking"> | Date | string
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }, "id">

  export type BrandBankingOrderByWithAggregationInput = {
    id?: SortOrder
    settlementFrequency?: SortOrder
    dayOfMonth?: SortOrderInput | SortOrder
    payoutMethod?: SortOrder
    invoiceRequired?: SortOrder
    remittanceEmail?: SortOrder
    accountHolder?: SortOrder
    accountNumber?: SortOrder
    branchCode?: SortOrder
    bankName?: SortOrder
    SWIFTCode?: SortOrder
    country?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BrandBankingCountOrderByAggregateInput
    _avg?: BrandBankingAvgOrderByAggregateInput
    _max?: BrandBankingMaxOrderByAggregateInput
    _min?: BrandBankingMinOrderByAggregateInput
    _sum?: BrandBankingSumOrderByAggregateInput
  }

  export type BrandBankingScalarWhereWithAggregatesInput = {
    AND?: BrandBankingScalarWhereWithAggregatesInput | BrandBankingScalarWhereWithAggregatesInput[]
    OR?: BrandBankingScalarWhereWithAggregatesInput[]
    NOT?: BrandBankingScalarWhereWithAggregatesInput | BrandBankingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"BrandBanking"> | string
    settlementFrequency?: EnumSettlementFrequencyStatusWithAggregatesFilter<"BrandBanking"> | $Enums.SettlementFrequencyStatus
    dayOfMonth?: IntNullableWithAggregatesFilter<"BrandBanking"> | number | null
    payoutMethod?: EnumpayoutMethodStatusWithAggregatesFilter<"BrandBanking"> | $Enums.payoutMethodStatus
    invoiceRequired?: BoolWithAggregatesFilter<"BrandBanking"> | boolean
    remittanceEmail?: StringWithAggregatesFilter<"BrandBanking"> | string
    accountHolder?: StringWithAggregatesFilter<"BrandBanking"> | string
    accountNumber?: StringWithAggregatesFilter<"BrandBanking"> | string
    branchCode?: StringWithAggregatesFilter<"BrandBanking"> | string
    bankName?: StringWithAggregatesFilter<"BrandBanking"> | string
    SWIFTCode?: StringWithAggregatesFilter<"BrandBanking"> | string
    country?: StringWithAggregatesFilter<"BrandBanking"> | string
    brandId?: StringWithAggregatesFilter<"BrandBanking"> | string
    createdAt?: DateTimeWithAggregatesFilter<"BrandBanking"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BrandBanking"> | Date | string
  }

  export type OccasionWhereInput = {
    AND?: OccasionWhereInput | OccasionWhereInput[]
    OR?: OccasionWhereInput[]
    NOT?: OccasionWhereInput | OccasionWhereInput[]
    id?: StringFilter<"Occasion"> | string
    name?: StringFilter<"Occasion"> | string
    emoji?: StringFilter<"Occasion"> | string
    description?: StringFilter<"Occasion"> | string
    isActive?: BoolFilter<"Occasion"> | boolean
    createdAt?: DateTimeFilter<"Occasion"> | Date | string
    updatedAt?: DateTimeFilter<"Occasion"> | Date | string
    occasionCategory?: OccasionCategoryListRelationFilter
    order?: OrderListRelationFilter
  }

  export type OccasionOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    description?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    occasionCategory?: OccasionCategoryOrderByRelationAggregateInput
    order?: OrderOrderByRelationAggregateInput
  }

  export type OccasionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OccasionWhereInput | OccasionWhereInput[]
    OR?: OccasionWhereInput[]
    NOT?: OccasionWhereInput | OccasionWhereInput[]
    name?: StringFilter<"Occasion"> | string
    emoji?: StringFilter<"Occasion"> | string
    description?: StringFilter<"Occasion"> | string
    isActive?: BoolFilter<"Occasion"> | boolean
    createdAt?: DateTimeFilter<"Occasion"> | Date | string
    updatedAt?: DateTimeFilter<"Occasion"> | Date | string
    occasionCategory?: OccasionCategoryListRelationFilter
    order?: OrderListRelationFilter
  }, "id">

  export type OccasionOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    description?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OccasionCountOrderByAggregateInput
    _max?: OccasionMaxOrderByAggregateInput
    _min?: OccasionMinOrderByAggregateInput
  }

  export type OccasionScalarWhereWithAggregatesInput = {
    AND?: OccasionScalarWhereWithAggregatesInput | OccasionScalarWhereWithAggregatesInput[]
    OR?: OccasionScalarWhereWithAggregatesInput[]
    NOT?: OccasionScalarWhereWithAggregatesInput | OccasionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Occasion"> | string
    name?: StringWithAggregatesFilter<"Occasion"> | string
    emoji?: StringWithAggregatesFilter<"Occasion"> | string
    description?: StringWithAggregatesFilter<"Occasion"> | string
    isActive?: BoolWithAggregatesFilter<"Occasion"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Occasion"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Occasion"> | Date | string
  }

  export type OccasionCategoryWhereInput = {
    AND?: OccasionCategoryWhereInput | OccasionCategoryWhereInput[]
    OR?: OccasionCategoryWhereInput[]
    NOT?: OccasionCategoryWhereInput | OccasionCategoryWhereInput[]
    id?: StringFilter<"OccasionCategory"> | string
    name?: StringFilter<"OccasionCategory"> | string
    description?: StringFilter<"OccasionCategory"> | string
    emoji?: StringFilter<"OccasionCategory"> | string
    image?: StringFilter<"OccasionCategory"> | string
    isActive?: BoolFilter<"OccasionCategory"> | boolean
    occasionId?: StringFilter<"OccasionCategory"> | string
    occasions?: XOR<OccasionScalarRelationFilter, OccasionWhereInput>
  }

  export type OccasionCategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    emoji?: SortOrder
    image?: SortOrder
    isActive?: SortOrder
    occasionId?: SortOrder
    occasions?: OccasionOrderByWithRelationInput
  }

  export type OccasionCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OccasionCategoryWhereInput | OccasionCategoryWhereInput[]
    OR?: OccasionCategoryWhereInput[]
    NOT?: OccasionCategoryWhereInput | OccasionCategoryWhereInput[]
    name?: StringFilter<"OccasionCategory"> | string
    description?: StringFilter<"OccasionCategory"> | string
    emoji?: StringFilter<"OccasionCategory"> | string
    image?: StringFilter<"OccasionCategory"> | string
    isActive?: BoolFilter<"OccasionCategory"> | boolean
    occasionId?: StringFilter<"OccasionCategory"> | string
    occasions?: XOR<OccasionScalarRelationFilter, OccasionWhereInput>
  }, "id">

  export type OccasionCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    emoji?: SortOrder
    image?: SortOrder
    isActive?: SortOrder
    occasionId?: SortOrder
    _count?: OccasionCategoryCountOrderByAggregateInput
    _max?: OccasionCategoryMaxOrderByAggregateInput
    _min?: OccasionCategoryMinOrderByAggregateInput
  }

  export type OccasionCategoryScalarWhereWithAggregatesInput = {
    AND?: OccasionCategoryScalarWhereWithAggregatesInput | OccasionCategoryScalarWhereWithAggregatesInput[]
    OR?: OccasionCategoryScalarWhereWithAggregatesInput[]
    NOT?: OccasionCategoryScalarWhereWithAggregatesInput | OccasionCategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"OccasionCategory"> | string
    name?: StringWithAggregatesFilter<"OccasionCategory"> | string
    description?: StringWithAggregatesFilter<"OccasionCategory"> | string
    emoji?: StringWithAggregatesFilter<"OccasionCategory"> | string
    image?: StringWithAggregatesFilter<"OccasionCategory"> | string
    isActive?: BoolWithAggregatesFilter<"OccasionCategory"> | boolean
    occasionId?: StringWithAggregatesFilter<"OccasionCategory"> | string
  }

  export type CategoriesWhereInput = {
    AND?: CategoriesWhereInput | CategoriesWhereInput[]
    OR?: CategoriesWhereInput[]
    NOT?: CategoriesWhereInput | CategoriesWhereInput[]
    id?: StringFilter<"Categories"> | string
    name?: StringFilter<"Categories"> | string
    brands?: BrandListRelationFilter
  }

  export type CategoriesOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    brands?: BrandOrderByRelationAggregateInput
  }

  export type CategoriesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CategoriesWhereInput | CategoriesWhereInput[]
    OR?: CategoriesWhereInput[]
    NOT?: CategoriesWhereInput | CategoriesWhereInput[]
    name?: StringFilter<"Categories"> | string
    brands?: BrandListRelationFilter
  }, "id">

  export type CategoriesOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    _count?: CategoriesCountOrderByAggregateInput
    _max?: CategoriesMaxOrderByAggregateInput
    _min?: CategoriesMinOrderByAggregateInput
  }

  export type CategoriesScalarWhereWithAggregatesInput = {
    AND?: CategoriesScalarWhereWithAggregatesInput | CategoriesScalarWhereWithAggregatesInput[]
    OR?: CategoriesScalarWhereWithAggregatesInput[]
    NOT?: CategoriesScalarWhereWithAggregatesInput | CategoriesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Categories"> | string
    name?: StringWithAggregatesFilter<"Categories"> | string
  }

  export type ReceiverDetailWhereInput = {
    AND?: ReceiverDetailWhereInput | ReceiverDetailWhereInput[]
    OR?: ReceiverDetailWhereInput[]
    NOT?: ReceiverDetailWhereInput | ReceiverDetailWhereInput[]
    id?: StringFilter<"ReceiverDetail"> | string
    name?: StringFilter<"ReceiverDetail"> | string
    phone?: StringFilter<"ReceiverDetail"> | string
    email?: StringFilter<"ReceiverDetail"> | string
    order?: OrderListRelationFilter
  }

  export type ReceiverDetailOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    order?: OrderOrderByRelationAggregateInput
  }

  export type ReceiverDetailWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ReceiverDetailWhereInput | ReceiverDetailWhereInput[]
    OR?: ReceiverDetailWhereInput[]
    NOT?: ReceiverDetailWhereInput | ReceiverDetailWhereInput[]
    name?: StringFilter<"ReceiverDetail"> | string
    phone?: StringFilter<"ReceiverDetail"> | string
    email?: StringFilter<"ReceiverDetail"> | string
    order?: OrderListRelationFilter
  }, "id">

  export type ReceiverDetailOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    _count?: ReceiverDetailCountOrderByAggregateInput
    _max?: ReceiverDetailMaxOrderByAggregateInput
    _min?: ReceiverDetailMinOrderByAggregateInput
  }

  export type ReceiverDetailScalarWhereWithAggregatesInput = {
    AND?: ReceiverDetailScalarWhereWithAggregatesInput | ReceiverDetailScalarWhereWithAggregatesInput[]
    OR?: ReceiverDetailScalarWhereWithAggregatesInput[]
    NOT?: ReceiverDetailScalarWhereWithAggregatesInput | ReceiverDetailScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ReceiverDetail"> | string
    name?: StringWithAggregatesFilter<"ReceiverDetail"> | string
    phone?: StringWithAggregatesFilter<"ReceiverDetail"> | string
    email?: StringWithAggregatesFilter<"ReceiverDetail"> | string
  }

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: StringFilter<"Order"> | string
    brandId?: StringFilter<"Order"> | string
    occasionId?: StringFilter<"Order"> | string
    amount?: IntFilter<"Order"> | number
    message?: StringFilter<"Order"> | string
    isActive?: BoolFilter<"Order"> | boolean
    sendType?: EnumSendStatusFilter<"Order"> | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFilter<"Order"> | $Enums.deliveryMethodStatus
    receiverId?: StringFilter<"Order"> | string
    senderId?: StringFilter<"Order"> | string
    giftCode?: StringFilter<"Order"> | string
    orderNumber?: StringFilter<"Order"> | string
    paymentMethod?: EnumpaymentStatusFilter<"Order"> | $Enums.paymentStatus
    totalAmount?: IntNullableFilter<"Order"> | number | null
    redemptionStatus?: EnumRedemptionStatusFilter<"Order"> | $Enums.RedemptionStatus
    timeStemp?: DateTimeFilter<"Order"> | Date | string
    receiverDetails?: XOR<ReceiverDetailScalarRelationFilter, ReceiverDetailWhereInput>
    occasions?: XOR<OccasionScalarRelationFilter, OccasionWhereInput>
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    brandId?: SortOrder
    occasionId?: SortOrder
    amount?: SortOrder
    message?: SortOrder
    isActive?: SortOrder
    sendType?: SortOrder
    deliveryMethod?: SortOrder
    receiverId?: SortOrder
    senderId?: SortOrder
    giftCode?: SortOrder
    orderNumber?: SortOrder
    paymentMethod?: SortOrder
    totalAmount?: SortOrderInput | SortOrder
    redemptionStatus?: SortOrder
    timeStemp?: SortOrder
    receiverDetails?: ReceiverDetailOrderByWithRelationInput
    occasions?: OccasionOrderByWithRelationInput
    brands?: BrandOrderByWithRelationInput
    user?: UserOrderByWithRelationInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    brandId?: StringFilter<"Order"> | string
    occasionId?: StringFilter<"Order"> | string
    amount?: IntFilter<"Order"> | number
    message?: StringFilter<"Order"> | string
    isActive?: BoolFilter<"Order"> | boolean
    sendType?: EnumSendStatusFilter<"Order"> | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFilter<"Order"> | $Enums.deliveryMethodStatus
    receiverId?: StringFilter<"Order"> | string
    senderId?: StringFilter<"Order"> | string
    giftCode?: StringFilter<"Order"> | string
    orderNumber?: StringFilter<"Order"> | string
    paymentMethod?: EnumpaymentStatusFilter<"Order"> | $Enums.paymentStatus
    totalAmount?: IntNullableFilter<"Order"> | number | null
    redemptionStatus?: EnumRedemptionStatusFilter<"Order"> | $Enums.RedemptionStatus
    timeStemp?: DateTimeFilter<"Order"> | Date | string
    receiverDetails?: XOR<ReceiverDetailScalarRelationFilter, ReceiverDetailWhereInput>
    occasions?: XOR<OccasionScalarRelationFilter, OccasionWhereInput>
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    brandId?: SortOrder
    occasionId?: SortOrder
    amount?: SortOrder
    message?: SortOrder
    isActive?: SortOrder
    sendType?: SortOrder
    deliveryMethod?: SortOrder
    receiverId?: SortOrder
    senderId?: SortOrder
    giftCode?: SortOrder
    orderNumber?: SortOrder
    paymentMethod?: SortOrder
    totalAmount?: SortOrderInput | SortOrder
    redemptionStatus?: SortOrder
    timeStemp?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Order"> | string
    brandId?: StringWithAggregatesFilter<"Order"> | string
    occasionId?: StringWithAggregatesFilter<"Order"> | string
    amount?: IntWithAggregatesFilter<"Order"> | number
    message?: StringWithAggregatesFilter<"Order"> | string
    isActive?: BoolWithAggregatesFilter<"Order"> | boolean
    sendType?: EnumSendStatusWithAggregatesFilter<"Order"> | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusWithAggregatesFilter<"Order"> | $Enums.deliveryMethodStatus
    receiverId?: StringWithAggregatesFilter<"Order"> | string
    senderId?: StringWithAggregatesFilter<"Order"> | string
    giftCode?: StringWithAggregatesFilter<"Order"> | string
    orderNumber?: StringWithAggregatesFilter<"Order"> | string
    paymentMethod?: EnumpaymentStatusWithAggregatesFilter<"Order"> | $Enums.paymentStatus
    totalAmount?: IntNullableWithAggregatesFilter<"Order"> | number | null
    redemptionStatus?: EnumRedemptionStatusWithAggregatesFilter<"Order"> | $Enums.RedemptionStatus
    timeStemp?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type SettlementsWhereInput = {
    AND?: SettlementsWhereInput | SettlementsWhereInput[]
    OR?: SettlementsWhereInput[]
    NOT?: SettlementsWhereInput | SettlementsWhereInput[]
    id?: StringFilter<"Settlements"> | string
    brandId?: StringFilter<"Settlements"> | string
    totalSold?: IntFilter<"Settlements"> | number
    Redeemed?: StringFilter<"Settlements"> | string
    Outstanding?: IntNullableFilter<"Settlements"> | number | null
    settlementTerms?: StringFilter<"Settlements"> | string
    Amount?: IntNullableFilter<"Settlements"> | number | null
    lastPayment?: DateTimeFilter<"Settlements"> | Date | string
    status?: EnumStatusFilter<"Settlements"> | $Enums.Status
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }

  export type SettlementsOrderByWithRelationInput = {
    id?: SortOrder
    brandId?: SortOrder
    totalSold?: SortOrder
    Redeemed?: SortOrder
    Outstanding?: SortOrderInput | SortOrder
    settlementTerms?: SortOrder
    Amount?: SortOrderInput | SortOrder
    lastPayment?: SortOrder
    status?: SortOrder
    brands?: BrandOrderByWithRelationInput
  }

  export type SettlementsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SettlementsWhereInput | SettlementsWhereInput[]
    OR?: SettlementsWhereInput[]
    NOT?: SettlementsWhereInput | SettlementsWhereInput[]
    brandId?: StringFilter<"Settlements"> | string
    totalSold?: IntFilter<"Settlements"> | number
    Redeemed?: StringFilter<"Settlements"> | string
    Outstanding?: IntNullableFilter<"Settlements"> | number | null
    settlementTerms?: StringFilter<"Settlements"> | string
    Amount?: IntNullableFilter<"Settlements"> | number | null
    lastPayment?: DateTimeFilter<"Settlements"> | Date | string
    status?: EnumStatusFilter<"Settlements"> | $Enums.Status
    brands?: XOR<BrandScalarRelationFilter, BrandWhereInput>
  }, "id">

  export type SettlementsOrderByWithAggregationInput = {
    id?: SortOrder
    brandId?: SortOrder
    totalSold?: SortOrder
    Redeemed?: SortOrder
    Outstanding?: SortOrderInput | SortOrder
    settlementTerms?: SortOrder
    Amount?: SortOrderInput | SortOrder
    lastPayment?: SortOrder
    status?: SortOrder
    _count?: SettlementsCountOrderByAggregateInput
    _avg?: SettlementsAvgOrderByAggregateInput
    _max?: SettlementsMaxOrderByAggregateInput
    _min?: SettlementsMinOrderByAggregateInput
    _sum?: SettlementsSumOrderByAggregateInput
  }

  export type SettlementsScalarWhereWithAggregatesInput = {
    AND?: SettlementsScalarWhereWithAggregatesInput | SettlementsScalarWhereWithAggregatesInput[]
    OR?: SettlementsScalarWhereWithAggregatesInput[]
    NOT?: SettlementsScalarWhereWithAggregatesInput | SettlementsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Settlements"> | string
    brandId?: StringWithAggregatesFilter<"Settlements"> | string
    totalSold?: IntWithAggregatesFilter<"Settlements"> | number
    Redeemed?: StringWithAggregatesFilter<"Settlements"> | string
    Outstanding?: IntNullableWithAggregatesFilter<"Settlements"> | number | null
    settlementTerms?: StringWithAggregatesFilter<"Settlements"> | string
    Amount?: IntNullableWithAggregatesFilter<"Settlements"> | number | null
    lastPayment?: DateTimeWithAggregatesFilter<"Settlements"> | Date | string
    status?: EnumStatusWithAggregatesFilter<"Settlements"> | $Enums.Status
  }

  export type UserCreateInput = {
    id?: string
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    avatar?: string | null
    role?: string | null
    isActive?: boolean
    isVerify?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
    order?: OrderCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    avatar?: string | null
    role?: string | null
    isActive?: boolean
    isVerify?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
    order?: OrderUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isVerify?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
    order?: OrderUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isVerify?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
    order?: OrderUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    avatar?: string | null
    role?: string | null
    isActive?: boolean
    isVerify?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isVerify?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isVerify?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateInput = {
    id?: string
    sessionToken: string
    expires: Date | string
    user: UserCreateNestedOneWithoutSessionsInput
  }

  export type SessionUncheckedCreateInput = {
    id?: string
    sessionToken: string
    userId: string
    expires: Date | string
  }

  export type SessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutSessionsNestedInput
  }

  export type SessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCreateManyInput = {
    id?: string
    sessionToken: string
    userId: string
    expires: Date | string
  }

  export type SessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandCreateInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    categories: CategoriesCreateNestedOneWithoutBrandsInput
    brandcontacts?: BrandContactsCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersCreateNestedManyWithoutBrandsInput
    order?: OrderCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsCreateNestedManyWithoutBrandsInput
  }

  export type BrandUncheckedCreateInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandcontacts?: BrandContactsUncheckedCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsUncheckedCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingUncheckedCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersUncheckedCreateNestedManyWithoutBrandsInput
    order?: OrderUncheckedCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsUncheckedCreateNestedManyWithoutBrandsInput
  }

  export type BrandUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    categories?: CategoriesUpdateOneRequiredWithoutBrandsNestedInput
    brandcontacts?: BrandContactsUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUpdateManyWithoutBrandsNestedInput
    order?: OrderUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandcontacts?: BrandContactsUncheckedUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUncheckedUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUncheckedUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUncheckedUpdateManyWithoutBrandsNestedInput
    order?: OrderUncheckedUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUncheckedUpdateManyWithoutBrandsNestedInput
  }

  export type BrandCreateManyInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandContactsCreateInput = {
    id?: string
    name: string
    role: string
    email: string
    phone: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brands: BrandCreateNestedOneWithoutBrandcontactsInput
  }

  export type BrandContactsUncheckedCreateInput = {
    id?: string
    name: string
    role: string
    email: string
    phone: string
    brandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandContactsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brands?: BrandUpdateOneRequiredWithoutBrandcontactsNestedInput
  }

  export type BrandContactsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandContactsCreateManyInput = {
    id?: string
    name: string
    role: string
    email: string
    phone: string
    brandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandContactsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandContactsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandTermsCreateInput = {
    id?: string
    settelementTrigger?: $Enums.SettelmentStatus
    commissionType?: $Enums.CommissionStatus
    commissionValue?: number
    currency: string
    discount?: number | null
    orderValue?: number | null
    contractStart: Date | string
    contractEnd: Date | string
    goLiveDate: Date | string
    renewContract?: boolean
    brackingPolicy?: $Enums.PolicyStatus
    brackingShare?: number | null
    vatRate?: number | null
    internalNotes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brands: BrandCreateNestedOneWithoutBrandTermsInput
  }

  export type BrandTermsUncheckedCreateInput = {
    id?: string
    settelementTrigger?: $Enums.SettelmentStatus
    commissionType?: $Enums.CommissionStatus
    commissionValue?: number
    currency: string
    discount?: number | null
    orderValue?: number | null
    contractStart: Date | string
    contractEnd: Date | string
    goLiveDate: Date | string
    renewContract?: boolean
    brackingPolicy?: $Enums.PolicyStatus
    brackingShare?: number | null
    vatRate?: number | null
    internalNotes: string
    brandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandTermsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    settelementTrigger?: EnumSettelmentStatusFieldUpdateOperationsInput | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFieldUpdateOperationsInput | $Enums.CommissionStatus
    commissionValue?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    discount?: NullableIntFieldUpdateOperationsInput | number | null
    orderValue?: NullableIntFieldUpdateOperationsInput | number | null
    contractStart?: DateTimeFieldUpdateOperationsInput | Date | string
    contractEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    goLiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    renewContract?: BoolFieldUpdateOperationsInput | boolean
    brackingPolicy?: EnumPolicyStatusFieldUpdateOperationsInput | $Enums.PolicyStatus
    brackingShare?: NullableIntFieldUpdateOperationsInput | number | null
    vatRate?: NullableIntFieldUpdateOperationsInput | number | null
    internalNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brands?: BrandUpdateOneRequiredWithoutBrandTermsNestedInput
  }

  export type BrandTermsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    settelementTrigger?: EnumSettelmentStatusFieldUpdateOperationsInput | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFieldUpdateOperationsInput | $Enums.CommissionStatus
    commissionValue?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    discount?: NullableIntFieldUpdateOperationsInput | number | null
    orderValue?: NullableIntFieldUpdateOperationsInput | number | null
    contractStart?: DateTimeFieldUpdateOperationsInput | Date | string
    contractEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    goLiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    renewContract?: BoolFieldUpdateOperationsInput | boolean
    brackingPolicy?: EnumPolicyStatusFieldUpdateOperationsInput | $Enums.PolicyStatus
    brackingShare?: NullableIntFieldUpdateOperationsInput | number | null
    vatRate?: NullableIntFieldUpdateOperationsInput | number | null
    internalNotes?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandTermsCreateManyInput = {
    id?: string
    settelementTrigger?: $Enums.SettelmentStatus
    commissionType?: $Enums.CommissionStatus
    commissionValue?: number
    currency: string
    discount?: number | null
    orderValue?: number | null
    contractStart: Date | string
    contractEnd: Date | string
    goLiveDate: Date | string
    renewContract?: boolean
    brackingPolicy?: $Enums.PolicyStatus
    brackingShare?: number | null
    vatRate?: number | null
    internalNotes: string
    brandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandTermsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    settelementTrigger?: EnumSettelmentStatusFieldUpdateOperationsInput | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFieldUpdateOperationsInput | $Enums.CommissionStatus
    commissionValue?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    discount?: NullableIntFieldUpdateOperationsInput | number | null
    orderValue?: NullableIntFieldUpdateOperationsInput | number | null
    contractStart?: DateTimeFieldUpdateOperationsInput | Date | string
    contractEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    goLiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    renewContract?: BoolFieldUpdateOperationsInput | boolean
    brackingPolicy?: EnumPolicyStatusFieldUpdateOperationsInput | $Enums.PolicyStatus
    brackingShare?: NullableIntFieldUpdateOperationsInput | number | null
    vatRate?: NullableIntFieldUpdateOperationsInput | number | null
    internalNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandTermsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    settelementTrigger?: EnumSettelmentStatusFieldUpdateOperationsInput | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFieldUpdateOperationsInput | $Enums.CommissionStatus
    commissionValue?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    discount?: NullableIntFieldUpdateOperationsInput | number | null
    orderValue?: NullableIntFieldUpdateOperationsInput | number | null
    contractStart?: DateTimeFieldUpdateOperationsInput | Date | string
    contractEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    goLiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    renewContract?: BoolFieldUpdateOperationsInput | boolean
    brackingPolicy?: EnumPolicyStatusFieldUpdateOperationsInput | $Enums.PolicyStatus
    brackingShare?: NullableIntFieldUpdateOperationsInput | number | null
    vatRate?: NullableIntFieldUpdateOperationsInput | number | null
    internalNotes?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VouchersCreateInput = {
    id?: string
    denominationype?: $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: number | null
    minAmount?: number | null
    expiryPolicy?: $Enums.expiryPolicyStatus
    expiryValue: string
    graceDays?: number | null
    redemptionChannels?: string | null
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: number | null
    termsConditionsURL?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    brands: BrandCreateNestedOneWithoutVouchersInput
  }

  export type VouchersUncheckedCreateInput = {
    id?: string
    denominationype?: $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: number | null
    minAmount?: number | null
    expiryPolicy?: $Enums.expiryPolicyStatus
    expiryValue: string
    graceDays?: number | null
    redemptionChannels?: string | null
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: number | null
    termsConditionsURL?: string | null
    brandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VouchersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    denominationype?: EnumDenominationStatusFieldUpdateOperationsInput | $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: NullableIntFieldUpdateOperationsInput | number | null
    minAmount?: NullableIntFieldUpdateOperationsInput | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFieldUpdateOperationsInput | $Enums.expiryPolicyStatus
    expiryValue?: StringFieldUpdateOperationsInput | string
    graceDays?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionChannels?: NullableStringFieldUpdateOperationsInput | string | null
    partialRedemption?: BoolFieldUpdateOperationsInput | boolean
    Stackable?: BoolFieldUpdateOperationsInput | boolean
    userPerDay?: NullableIntFieldUpdateOperationsInput | number | null
    termsConditionsURL?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brands?: BrandUpdateOneRequiredWithoutVouchersNestedInput
  }

  export type VouchersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    denominationype?: EnumDenominationStatusFieldUpdateOperationsInput | $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: NullableIntFieldUpdateOperationsInput | number | null
    minAmount?: NullableIntFieldUpdateOperationsInput | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFieldUpdateOperationsInput | $Enums.expiryPolicyStatus
    expiryValue?: StringFieldUpdateOperationsInput | string
    graceDays?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionChannels?: NullableStringFieldUpdateOperationsInput | string | null
    partialRedemption?: BoolFieldUpdateOperationsInput | boolean
    Stackable?: BoolFieldUpdateOperationsInput | boolean
    userPerDay?: NullableIntFieldUpdateOperationsInput | number | null
    termsConditionsURL?: NullableStringFieldUpdateOperationsInput | string | null
    brandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VouchersCreateManyInput = {
    id?: string
    denominationype?: $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: number | null
    minAmount?: number | null
    expiryPolicy?: $Enums.expiryPolicyStatus
    expiryValue: string
    graceDays?: number | null
    redemptionChannels?: string | null
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: number | null
    termsConditionsURL?: string | null
    brandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VouchersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    denominationype?: EnumDenominationStatusFieldUpdateOperationsInput | $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: NullableIntFieldUpdateOperationsInput | number | null
    minAmount?: NullableIntFieldUpdateOperationsInput | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFieldUpdateOperationsInput | $Enums.expiryPolicyStatus
    expiryValue?: StringFieldUpdateOperationsInput | string
    graceDays?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionChannels?: NullableStringFieldUpdateOperationsInput | string | null
    partialRedemption?: BoolFieldUpdateOperationsInput | boolean
    Stackable?: BoolFieldUpdateOperationsInput | boolean
    userPerDay?: NullableIntFieldUpdateOperationsInput | number | null
    termsConditionsURL?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VouchersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    denominationype?: EnumDenominationStatusFieldUpdateOperationsInput | $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: NullableIntFieldUpdateOperationsInput | number | null
    minAmount?: NullableIntFieldUpdateOperationsInput | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFieldUpdateOperationsInput | $Enums.expiryPolicyStatus
    expiryValue?: StringFieldUpdateOperationsInput | string
    graceDays?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionChannels?: NullableStringFieldUpdateOperationsInput | string | null
    partialRedemption?: BoolFieldUpdateOperationsInput | boolean
    Stackable?: BoolFieldUpdateOperationsInput | boolean
    userPerDay?: NullableIntFieldUpdateOperationsInput | number | null
    termsConditionsURL?: NullableStringFieldUpdateOperationsInput | string | null
    brandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandBankingCreateInput = {
    id?: string
    settlementFrequency?: $Enums.SettlementFrequencyStatus
    dayOfMonth?: number | null
    payoutMethod?: $Enums.payoutMethodStatus
    invoiceRequired?: boolean
    remittanceEmail: string
    accountHolder: string
    accountNumber: string
    branchCode: string
    bankName: string
    SWIFTCode: string
    country: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brands: BrandCreateNestedOneWithoutBrandBankingsInput
  }

  export type BrandBankingUncheckedCreateInput = {
    id?: string
    settlementFrequency?: $Enums.SettlementFrequencyStatus
    dayOfMonth?: number | null
    payoutMethod?: $Enums.payoutMethodStatus
    invoiceRequired?: boolean
    remittanceEmail: string
    accountHolder: string
    accountNumber: string
    branchCode: string
    bankName: string
    SWIFTCode: string
    country: string
    brandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandBankingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    settlementFrequency?: EnumSettlementFrequencyStatusFieldUpdateOperationsInput | $Enums.SettlementFrequencyStatus
    dayOfMonth?: NullableIntFieldUpdateOperationsInput | number | null
    payoutMethod?: EnumpayoutMethodStatusFieldUpdateOperationsInput | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFieldUpdateOperationsInput | boolean
    remittanceEmail?: StringFieldUpdateOperationsInput | string
    accountHolder?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    branchCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    SWIFTCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brands?: BrandUpdateOneRequiredWithoutBrandBankingsNestedInput
  }

  export type BrandBankingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    settlementFrequency?: EnumSettlementFrequencyStatusFieldUpdateOperationsInput | $Enums.SettlementFrequencyStatus
    dayOfMonth?: NullableIntFieldUpdateOperationsInput | number | null
    payoutMethod?: EnumpayoutMethodStatusFieldUpdateOperationsInput | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFieldUpdateOperationsInput | boolean
    remittanceEmail?: StringFieldUpdateOperationsInput | string
    accountHolder?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    branchCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    SWIFTCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandBankingCreateManyInput = {
    id?: string
    settlementFrequency?: $Enums.SettlementFrequencyStatus
    dayOfMonth?: number | null
    payoutMethod?: $Enums.payoutMethodStatus
    invoiceRequired?: boolean
    remittanceEmail: string
    accountHolder: string
    accountNumber: string
    branchCode: string
    bankName: string
    SWIFTCode: string
    country: string
    brandId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandBankingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    settlementFrequency?: EnumSettlementFrequencyStatusFieldUpdateOperationsInput | $Enums.SettlementFrequencyStatus
    dayOfMonth?: NullableIntFieldUpdateOperationsInput | number | null
    payoutMethod?: EnumpayoutMethodStatusFieldUpdateOperationsInput | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFieldUpdateOperationsInput | boolean
    remittanceEmail?: StringFieldUpdateOperationsInput | string
    accountHolder?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    branchCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    SWIFTCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandBankingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    settlementFrequency?: EnumSettlementFrequencyStatusFieldUpdateOperationsInput | $Enums.SettlementFrequencyStatus
    dayOfMonth?: NullableIntFieldUpdateOperationsInput | number | null
    payoutMethod?: EnumpayoutMethodStatusFieldUpdateOperationsInput | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFieldUpdateOperationsInput | boolean
    remittanceEmail?: StringFieldUpdateOperationsInput | string
    accountHolder?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    branchCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    SWIFTCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OccasionCreateInput = {
    id?: string
    name: string
    emoji: string
    description: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    occasionCategory?: OccasionCategoryCreateNestedManyWithoutOccasionsInput
    order?: OrderCreateNestedManyWithoutOccasionsInput
  }

  export type OccasionUncheckedCreateInput = {
    id?: string
    name: string
    emoji: string
    description: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    occasionCategory?: OccasionCategoryUncheckedCreateNestedManyWithoutOccasionsInput
    order?: OrderUncheckedCreateNestedManyWithoutOccasionsInput
  }

  export type OccasionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occasionCategory?: OccasionCategoryUpdateManyWithoutOccasionsNestedInput
    order?: OrderUpdateManyWithoutOccasionsNestedInput
  }

  export type OccasionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occasionCategory?: OccasionCategoryUncheckedUpdateManyWithoutOccasionsNestedInput
    order?: OrderUncheckedUpdateManyWithoutOccasionsNestedInput
  }

  export type OccasionCreateManyInput = {
    id?: string
    name: string
    emoji: string
    description: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OccasionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OccasionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OccasionCategoryCreateInput = {
    id?: string
    name: string
    description: string
    emoji: string
    image: string
    isActive?: boolean
    occasions: OccasionCreateNestedOneWithoutOccasionCategoryInput
  }

  export type OccasionCategoryUncheckedCreateInput = {
    id?: string
    name: string
    description: string
    emoji: string
    image: string
    isActive?: boolean
    occasionId: string
  }

  export type OccasionCategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    occasions?: OccasionUpdateOneRequiredWithoutOccasionCategoryNestedInput
  }

  export type OccasionCategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    occasionId?: StringFieldUpdateOperationsInput | string
  }

  export type OccasionCategoryCreateManyInput = {
    id?: string
    name: string
    description: string
    emoji: string
    image: string
    isActive?: boolean
    occasionId: string
  }

  export type OccasionCategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type OccasionCategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    occasionId?: StringFieldUpdateOperationsInput | string
  }

  export type CategoriesCreateInput = {
    id?: string
    name: string
    brands?: BrandCreateNestedManyWithoutCategoriesInput
  }

  export type CategoriesUncheckedCreateInput = {
    id?: string
    name: string
    brands?: BrandUncheckedCreateNestedManyWithoutCategoriesInput
  }

  export type CategoriesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brands?: BrandUpdateManyWithoutCategoriesNestedInput
  }

  export type CategoriesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brands?: BrandUncheckedUpdateManyWithoutCategoriesNestedInput
  }

  export type CategoriesCreateManyInput = {
    id?: string
    name: string
  }

  export type CategoriesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type CategoriesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ReceiverDetailCreateInput = {
    id?: string
    name: string
    phone: string
    email: string
    order?: OrderCreateNestedManyWithoutReceiverDetailsInput
  }

  export type ReceiverDetailUncheckedCreateInput = {
    id?: string
    name: string
    phone: string
    email: string
    order?: OrderUncheckedCreateNestedManyWithoutReceiverDetailsInput
  }

  export type ReceiverDetailUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    order?: OrderUpdateManyWithoutReceiverDetailsNestedInput
  }

  export type ReceiverDetailUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    order?: OrderUncheckedUpdateManyWithoutReceiverDetailsNestedInput
  }

  export type ReceiverDetailCreateManyInput = {
    id?: string
    name: string
    phone: string
    email: string
  }

  export type ReceiverDetailUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
  }

  export type ReceiverDetailUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
  }

  export type OrderCreateInput = {
    id?: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
    receiverDetails: ReceiverDetailCreateNestedOneWithoutOrderInput
    occasions: OccasionCreateNestedOneWithoutOrderInput
    brands: BrandCreateNestedOneWithoutOrderInput
    user: UserCreateNestedOneWithoutOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id?: string
    brandId: string
    occasionId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    receiverId: string
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
    receiverDetails?: ReceiverDetailUpdateOneRequiredWithoutOrderNestedInput
    occasions?: OccasionUpdateOneRequiredWithoutOrderNestedInput
    brands?: BrandUpdateOneRequiredWithoutOrderNestedInput
    user?: UserUpdateOneRequiredWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    occasionId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    receiverId?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateManyInput = {
    id?: string
    brandId: string
    occasionId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    receiverId: string
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    occasionId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    receiverId?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettlementsCreateInput = {
    id?: string
    totalSold: number
    Redeemed: string
    Outstanding?: number | null
    settlementTerms: string
    Amount?: number | null
    lastPayment: Date | string
    status?: $Enums.Status
    brands: BrandCreateNestedOneWithoutSettlementsInput
  }

  export type SettlementsUncheckedCreateInput = {
    id?: string
    brandId: string
    totalSold: number
    Redeemed: string
    Outstanding?: number | null
    settlementTerms: string
    Amount?: number | null
    lastPayment: Date | string
    status?: $Enums.Status
  }

  export type SettlementsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalSold?: IntFieldUpdateOperationsInput | number
    Redeemed?: StringFieldUpdateOperationsInput | string
    Outstanding?: NullableIntFieldUpdateOperationsInput | number | null
    settlementTerms?: StringFieldUpdateOperationsInput | string
    Amount?: NullableIntFieldUpdateOperationsInput | number | null
    lastPayment?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
    brands?: BrandUpdateOneRequiredWithoutSettlementsNestedInput
  }

  export type SettlementsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    totalSold?: IntFieldUpdateOperationsInput | number
    Redeemed?: StringFieldUpdateOperationsInput | string
    Outstanding?: NullableIntFieldUpdateOperationsInput | number | null
    settlementTerms?: StringFieldUpdateOperationsInput | string
    Amount?: NullableIntFieldUpdateOperationsInput | number | null
    lastPayment?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
  }

  export type SettlementsCreateManyInput = {
    id?: string
    brandId: string
    totalSold: number
    Redeemed: string
    Outstanding?: number | null
    settlementTerms: string
    Amount?: number | null
    lastPayment: Date | string
    status?: $Enums.Status
  }

  export type SettlementsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalSold?: IntFieldUpdateOperationsInput | number
    Redeemed?: StringFieldUpdateOperationsInput | string
    Outstanding?: NullableIntFieldUpdateOperationsInput | number | null
    settlementTerms?: StringFieldUpdateOperationsInput | string
    Amount?: NullableIntFieldUpdateOperationsInput | number | null
    lastPayment?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
  }

  export type SettlementsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    totalSold?: IntFieldUpdateOperationsInput | number
    Redeemed?: StringFieldUpdateOperationsInput | string
    Outstanding?: NullableIntFieldUpdateOperationsInput | number | null
    settlementTerms?: StringFieldUpdateOperationsInput | string
    Amount?: NullableIntFieldUpdateOperationsInput | number | null
    lastPayment?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SessionListRelationFilter = {
    every?: SessionWhereInput
    some?: SessionWhereInput
    none?: SessionWhereInput
  }

  export type OrderListRelationFilter = {
    every?: OrderWhereInput
    some?: OrderWhereInput
    none?: OrderWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    password?: SortOrder
    avatar?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    isVerify?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    password?: SortOrder
    avatar?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    isVerify?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    password?: SortOrder
    avatar?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    isVerify?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SessionCountOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type SessionMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type SessionMinOrderByAggregateInput = {
    id?: SortOrder
    sessionToken?: SortOrder
    userId?: SortOrder
    expires?: SortOrder
  }

  export type CategoriesScalarRelationFilter = {
    is?: CategoriesWhereInput
    isNot?: CategoriesWhereInput
  }

  export type BrandContactsListRelationFilter = {
    every?: BrandContactsWhereInput
    some?: BrandContactsWhereInput
    none?: BrandContactsWhereInput
  }

  export type BrandTermsListRelationFilter = {
    every?: BrandTermsWhereInput
    some?: BrandTermsWhereInput
    none?: BrandTermsWhereInput
  }

  export type BrandBankingListRelationFilter = {
    every?: BrandBankingWhereInput
    some?: BrandBankingWhereInput
    none?: BrandBankingWhereInput
  }

  export type VouchersListRelationFilter = {
    every?: VouchersWhereInput
    some?: VouchersWhereInput
    none?: VouchersWhereInput
  }

  export type SettlementsListRelationFilter = {
    every?: SettlementsWhereInput
    some?: SettlementsWhereInput
    none?: SettlementsWhereInput
  }

  export type BrandContactsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BrandTermsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BrandBankingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VouchersOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SettlementsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BrandCountOrderByAggregateInput = {
    id?: SortOrder
    brandName?: SortOrder
    logo?: SortOrder
    description?: SortOrder
    website?: SortOrder
    contact?: SortOrder
    tagline?: SortOrder
    color?: SortOrder
    categoryId?: SortOrder
    isActive?: SortOrder
    isFeature?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandMaxOrderByAggregateInput = {
    id?: SortOrder
    brandName?: SortOrder
    logo?: SortOrder
    description?: SortOrder
    website?: SortOrder
    contact?: SortOrder
    tagline?: SortOrder
    color?: SortOrder
    categoryId?: SortOrder
    isActive?: SortOrder
    isFeature?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandMinOrderByAggregateInput = {
    id?: SortOrder
    brandName?: SortOrder
    logo?: SortOrder
    description?: SortOrder
    website?: SortOrder
    contact?: SortOrder
    tagline?: SortOrder
    color?: SortOrder
    categoryId?: SortOrder
    isActive?: SortOrder
    isFeature?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandScalarRelationFilter = {
    is?: BrandWhereInput
    isNot?: BrandWhereInput
  }

  export type BrandContactsCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandContactsMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandContactsMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    role?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumSettelmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SettelmentStatus | EnumSettelmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SettelmentStatus[] | ListEnumSettelmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SettelmentStatus[] | ListEnumSettelmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSettelmentStatusFilter<$PrismaModel> | $Enums.SettelmentStatus
  }

  export type EnumCommissionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CommissionStatus | EnumCommissionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CommissionStatus[] | ListEnumCommissionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommissionStatus[] | ListEnumCommissionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCommissionStatusFilter<$PrismaModel> | $Enums.CommissionStatus
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumPolicyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyStatus | EnumPolicyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PolicyStatus[] | ListEnumPolicyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PolicyStatus[] | ListEnumPolicyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPolicyStatusFilter<$PrismaModel> | $Enums.PolicyStatus
  }

  export type BrandTermsCountOrderByAggregateInput = {
    id?: SortOrder
    settelementTrigger?: SortOrder
    commissionType?: SortOrder
    commissionValue?: SortOrder
    currency?: SortOrder
    discount?: SortOrder
    orderValue?: SortOrder
    contractStart?: SortOrder
    contractEnd?: SortOrder
    goLiveDate?: SortOrder
    renewContract?: SortOrder
    brackingPolicy?: SortOrder
    brackingShare?: SortOrder
    vatRate?: SortOrder
    internalNotes?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandTermsAvgOrderByAggregateInput = {
    commissionValue?: SortOrder
    discount?: SortOrder
    orderValue?: SortOrder
    brackingShare?: SortOrder
    vatRate?: SortOrder
  }

  export type BrandTermsMaxOrderByAggregateInput = {
    id?: SortOrder
    settelementTrigger?: SortOrder
    commissionType?: SortOrder
    commissionValue?: SortOrder
    currency?: SortOrder
    discount?: SortOrder
    orderValue?: SortOrder
    contractStart?: SortOrder
    contractEnd?: SortOrder
    goLiveDate?: SortOrder
    renewContract?: SortOrder
    brackingPolicy?: SortOrder
    brackingShare?: SortOrder
    vatRate?: SortOrder
    internalNotes?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandTermsMinOrderByAggregateInput = {
    id?: SortOrder
    settelementTrigger?: SortOrder
    commissionType?: SortOrder
    commissionValue?: SortOrder
    currency?: SortOrder
    discount?: SortOrder
    orderValue?: SortOrder
    contractStart?: SortOrder
    contractEnd?: SortOrder
    goLiveDate?: SortOrder
    renewContract?: SortOrder
    brackingPolicy?: SortOrder
    brackingShare?: SortOrder
    vatRate?: SortOrder
    internalNotes?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandTermsSumOrderByAggregateInput = {
    commissionValue?: SortOrder
    discount?: SortOrder
    orderValue?: SortOrder
    brackingShare?: SortOrder
    vatRate?: SortOrder
  }

  export type EnumSettelmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SettelmentStatus | EnumSettelmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SettelmentStatus[] | ListEnumSettelmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SettelmentStatus[] | ListEnumSettelmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSettelmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.SettelmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSettelmentStatusFilter<$PrismaModel>
    _max?: NestedEnumSettelmentStatusFilter<$PrismaModel>
  }

  export type EnumCommissionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CommissionStatus | EnumCommissionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CommissionStatus[] | ListEnumCommissionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommissionStatus[] | ListEnumCommissionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCommissionStatusWithAggregatesFilter<$PrismaModel> | $Enums.CommissionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCommissionStatusFilter<$PrismaModel>
    _max?: NestedEnumCommissionStatusFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumPolicyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyStatus | EnumPolicyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PolicyStatus[] | ListEnumPolicyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PolicyStatus[] | ListEnumPolicyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPolicyStatusWithAggregatesFilter<$PrismaModel> | $Enums.PolicyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPolicyStatusFilter<$PrismaModel>
    _max?: NestedEnumPolicyStatusFilter<$PrismaModel>
  }

  export type EnumDenominationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DenominationStatus | EnumDenominationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DenominationStatus[] | ListEnumDenominationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DenominationStatus[] | ListEnumDenominationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDenominationStatusFilter<$PrismaModel> | $Enums.DenominationStatus
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type EnumexpiryPolicyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.expiryPolicyStatus | EnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.expiryPolicyStatus[] | ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.expiryPolicyStatus[] | ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumexpiryPolicyStatusFilter<$PrismaModel> | $Enums.expiryPolicyStatus
  }

  export type VouchersCountOrderByAggregateInput = {
    id?: SortOrder
    denominationype?: SortOrder
    addDenomination?: SortOrder
    maxAmount?: SortOrder
    minAmount?: SortOrder
    expiryPolicy?: SortOrder
    expiryValue?: SortOrder
    graceDays?: SortOrder
    redemptionChannels?: SortOrder
    partialRedemption?: SortOrder
    Stackable?: SortOrder
    userPerDay?: SortOrder
    termsConditionsURL?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VouchersAvgOrderByAggregateInput = {
    maxAmount?: SortOrder
    minAmount?: SortOrder
    graceDays?: SortOrder
    userPerDay?: SortOrder
  }

  export type VouchersMaxOrderByAggregateInput = {
    id?: SortOrder
    denominationype?: SortOrder
    maxAmount?: SortOrder
    minAmount?: SortOrder
    expiryPolicy?: SortOrder
    expiryValue?: SortOrder
    graceDays?: SortOrder
    redemptionChannels?: SortOrder
    partialRedemption?: SortOrder
    Stackable?: SortOrder
    userPerDay?: SortOrder
    termsConditionsURL?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VouchersMinOrderByAggregateInput = {
    id?: SortOrder
    denominationype?: SortOrder
    maxAmount?: SortOrder
    minAmount?: SortOrder
    expiryPolicy?: SortOrder
    expiryValue?: SortOrder
    graceDays?: SortOrder
    redemptionChannels?: SortOrder
    partialRedemption?: SortOrder
    Stackable?: SortOrder
    userPerDay?: SortOrder
    termsConditionsURL?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VouchersSumOrderByAggregateInput = {
    maxAmount?: SortOrder
    minAmount?: SortOrder
    graceDays?: SortOrder
    userPerDay?: SortOrder
  }

  export type EnumDenominationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DenominationStatus | EnumDenominationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DenominationStatus[] | ListEnumDenominationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DenominationStatus[] | ListEnumDenominationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDenominationStatusWithAggregatesFilter<$PrismaModel> | $Enums.DenominationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDenominationStatusFilter<$PrismaModel>
    _max?: NestedEnumDenominationStatusFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumexpiryPolicyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.expiryPolicyStatus | EnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.expiryPolicyStatus[] | ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.expiryPolicyStatus[] | ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumexpiryPolicyStatusWithAggregatesFilter<$PrismaModel> | $Enums.expiryPolicyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumexpiryPolicyStatusFilter<$PrismaModel>
    _max?: NestedEnumexpiryPolicyStatusFilter<$PrismaModel>
  }

  export type EnumSettlementFrequencyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SettlementFrequencyStatus | EnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SettlementFrequencyStatus[] | ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SettlementFrequencyStatus[] | ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSettlementFrequencyStatusFilter<$PrismaModel> | $Enums.SettlementFrequencyStatus
  }

  export type EnumpayoutMethodStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.payoutMethodStatus | EnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    in?: $Enums.payoutMethodStatus[] | ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.payoutMethodStatus[] | ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumpayoutMethodStatusFilter<$PrismaModel> | $Enums.payoutMethodStatus
  }

  export type BrandBankingCountOrderByAggregateInput = {
    id?: SortOrder
    settlementFrequency?: SortOrder
    dayOfMonth?: SortOrder
    payoutMethod?: SortOrder
    invoiceRequired?: SortOrder
    remittanceEmail?: SortOrder
    accountHolder?: SortOrder
    accountNumber?: SortOrder
    branchCode?: SortOrder
    bankName?: SortOrder
    SWIFTCode?: SortOrder
    country?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandBankingAvgOrderByAggregateInput = {
    dayOfMonth?: SortOrder
  }

  export type BrandBankingMaxOrderByAggregateInput = {
    id?: SortOrder
    settlementFrequency?: SortOrder
    dayOfMonth?: SortOrder
    payoutMethod?: SortOrder
    invoiceRequired?: SortOrder
    remittanceEmail?: SortOrder
    accountHolder?: SortOrder
    accountNumber?: SortOrder
    branchCode?: SortOrder
    bankName?: SortOrder
    SWIFTCode?: SortOrder
    country?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandBankingMinOrderByAggregateInput = {
    id?: SortOrder
    settlementFrequency?: SortOrder
    dayOfMonth?: SortOrder
    payoutMethod?: SortOrder
    invoiceRequired?: SortOrder
    remittanceEmail?: SortOrder
    accountHolder?: SortOrder
    accountNumber?: SortOrder
    branchCode?: SortOrder
    bankName?: SortOrder
    SWIFTCode?: SortOrder
    country?: SortOrder
    brandId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BrandBankingSumOrderByAggregateInput = {
    dayOfMonth?: SortOrder
  }

  export type EnumSettlementFrequencyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SettlementFrequencyStatus | EnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SettlementFrequencyStatus[] | ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SettlementFrequencyStatus[] | ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSettlementFrequencyStatusWithAggregatesFilter<$PrismaModel> | $Enums.SettlementFrequencyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSettlementFrequencyStatusFilter<$PrismaModel>
    _max?: NestedEnumSettlementFrequencyStatusFilter<$PrismaModel>
  }

  export type EnumpayoutMethodStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.payoutMethodStatus | EnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    in?: $Enums.payoutMethodStatus[] | ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.payoutMethodStatus[] | ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumpayoutMethodStatusWithAggregatesFilter<$PrismaModel> | $Enums.payoutMethodStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumpayoutMethodStatusFilter<$PrismaModel>
    _max?: NestedEnumpayoutMethodStatusFilter<$PrismaModel>
  }

  export type OccasionCategoryListRelationFilter = {
    every?: OccasionCategoryWhereInput
    some?: OccasionCategoryWhereInput
    none?: OccasionCategoryWhereInput
  }

  export type OccasionCategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OccasionCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    description?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OccasionMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    description?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OccasionMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    emoji?: SortOrder
    description?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OccasionScalarRelationFilter = {
    is?: OccasionWhereInput
    isNot?: OccasionWhereInput
  }

  export type OccasionCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    emoji?: SortOrder
    image?: SortOrder
    isActive?: SortOrder
    occasionId?: SortOrder
  }

  export type OccasionCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    emoji?: SortOrder
    image?: SortOrder
    isActive?: SortOrder
    occasionId?: SortOrder
  }

  export type OccasionCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    emoji?: SortOrder
    image?: SortOrder
    isActive?: SortOrder
    occasionId?: SortOrder
  }

  export type BrandListRelationFilter = {
    every?: BrandWhereInput
    some?: BrandWhereInput
    none?: BrandWhereInput
  }

  export type BrandOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CategoriesCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type CategoriesMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type CategoriesMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type ReceiverDetailCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
  }

  export type ReceiverDetailMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
  }

  export type ReceiverDetailMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    email?: SortOrder
  }

  export type EnumSendStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SendStatus | EnumSendStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SendStatus[] | ListEnumSendStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SendStatus[] | ListEnumSendStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSendStatusFilter<$PrismaModel> | $Enums.SendStatus
  }

  export type EnumdeliveryMethodStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.deliveryMethodStatus | EnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    in?: $Enums.deliveryMethodStatus[] | ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.deliveryMethodStatus[] | ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumdeliveryMethodStatusFilter<$PrismaModel> | $Enums.deliveryMethodStatus
  }

  export type EnumpaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.paymentStatus | EnumpaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.paymentStatus[] | ListEnumpaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.paymentStatus[] | ListEnumpaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumpaymentStatusFilter<$PrismaModel> | $Enums.paymentStatus
  }

  export type EnumRedemptionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RedemptionStatus | EnumRedemptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RedemptionStatus[] | ListEnumRedemptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedemptionStatus[] | ListEnumRedemptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRedemptionStatusFilter<$PrismaModel> | $Enums.RedemptionStatus
  }

  export type ReceiverDetailScalarRelationFilter = {
    is?: ReceiverDetailWhereInput
    isNot?: ReceiverDetailWhereInput
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    occasionId?: SortOrder
    amount?: SortOrder
    message?: SortOrder
    isActive?: SortOrder
    sendType?: SortOrder
    deliveryMethod?: SortOrder
    receiverId?: SortOrder
    senderId?: SortOrder
    giftCode?: SortOrder
    orderNumber?: SortOrder
    paymentMethod?: SortOrder
    totalAmount?: SortOrder
    redemptionStatus?: SortOrder
    timeStemp?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    amount?: SortOrder
    totalAmount?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    occasionId?: SortOrder
    amount?: SortOrder
    message?: SortOrder
    isActive?: SortOrder
    sendType?: SortOrder
    deliveryMethod?: SortOrder
    receiverId?: SortOrder
    senderId?: SortOrder
    giftCode?: SortOrder
    orderNumber?: SortOrder
    paymentMethod?: SortOrder
    totalAmount?: SortOrder
    redemptionStatus?: SortOrder
    timeStemp?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    occasionId?: SortOrder
    amount?: SortOrder
    message?: SortOrder
    isActive?: SortOrder
    sendType?: SortOrder
    deliveryMethod?: SortOrder
    receiverId?: SortOrder
    senderId?: SortOrder
    giftCode?: SortOrder
    orderNumber?: SortOrder
    paymentMethod?: SortOrder
    totalAmount?: SortOrder
    redemptionStatus?: SortOrder
    timeStemp?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    amount?: SortOrder
    totalAmount?: SortOrder
  }

  export type EnumSendStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SendStatus | EnumSendStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SendStatus[] | ListEnumSendStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SendStatus[] | ListEnumSendStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSendStatusWithAggregatesFilter<$PrismaModel> | $Enums.SendStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSendStatusFilter<$PrismaModel>
    _max?: NestedEnumSendStatusFilter<$PrismaModel>
  }

  export type EnumdeliveryMethodStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.deliveryMethodStatus | EnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    in?: $Enums.deliveryMethodStatus[] | ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.deliveryMethodStatus[] | ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumdeliveryMethodStatusWithAggregatesFilter<$PrismaModel> | $Enums.deliveryMethodStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumdeliveryMethodStatusFilter<$PrismaModel>
    _max?: NestedEnumdeliveryMethodStatusFilter<$PrismaModel>
  }

  export type EnumpaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.paymentStatus | EnumpaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.paymentStatus[] | ListEnumpaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.paymentStatus[] | ListEnumpaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumpaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.paymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumpaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumpaymentStatusFilter<$PrismaModel>
  }

  export type EnumRedemptionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RedemptionStatus | EnumRedemptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RedemptionStatus[] | ListEnumRedemptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedemptionStatus[] | ListEnumRedemptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRedemptionStatusWithAggregatesFilter<$PrismaModel> | $Enums.RedemptionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRedemptionStatusFilter<$PrismaModel>
    _max?: NestedEnumRedemptionStatusFilter<$PrismaModel>
  }

  export type EnumStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.Status | EnumStatusFieldRefInput<$PrismaModel>
    in?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusFilter<$PrismaModel> | $Enums.Status
  }

  export type SettlementsCountOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    totalSold?: SortOrder
    Redeemed?: SortOrder
    Outstanding?: SortOrder
    settlementTerms?: SortOrder
    Amount?: SortOrder
    lastPayment?: SortOrder
    status?: SortOrder
  }

  export type SettlementsAvgOrderByAggregateInput = {
    totalSold?: SortOrder
    Outstanding?: SortOrder
    Amount?: SortOrder
  }

  export type SettlementsMaxOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    totalSold?: SortOrder
    Redeemed?: SortOrder
    Outstanding?: SortOrder
    settlementTerms?: SortOrder
    Amount?: SortOrder
    lastPayment?: SortOrder
    status?: SortOrder
  }

  export type SettlementsMinOrderByAggregateInput = {
    id?: SortOrder
    brandId?: SortOrder
    totalSold?: SortOrder
    Redeemed?: SortOrder
    Outstanding?: SortOrder
    settlementTerms?: SortOrder
    Amount?: SortOrder
    lastPayment?: SortOrder
    status?: SortOrder
  }

  export type SettlementsSumOrderByAggregateInput = {
    totalSold?: SortOrder
    Outstanding?: SortOrder
    Amount?: SortOrder
  }

  export type EnumStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Status | EnumStatusFieldRefInput<$PrismaModel>
    in?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusWithAggregatesFilter<$PrismaModel> | $Enums.Status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusFilter<$PrismaModel>
    _max?: NestedEnumStatusFilter<$PrismaModel>
  }

  export type SessionCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type OrderCreateNestedManyWithoutUserInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type SessionUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SessionUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type OrderUpdateManyWithoutUserNestedInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutUserInput | OrderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutUserInput | OrderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutUserInput | OrderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type SessionUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput> | SessionCreateWithoutUserInput[] | SessionUncheckedCreateWithoutUserInput[]
    connectOrCreate?: SessionCreateOrConnectWithoutUserInput | SessionCreateOrConnectWithoutUserInput[]
    upsert?: SessionUpsertWithWhereUniqueWithoutUserInput | SessionUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: SessionCreateManyUserInputEnvelope
    set?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    disconnect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    delete?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    connect?: SessionWhereUniqueInput | SessionWhereUniqueInput[]
    update?: SessionUpdateWithWhereUniqueWithoutUserInput | SessionUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: SessionUpdateManyWithWhereWithoutUserInput | SessionUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: SessionScalarWhereInput | SessionScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput> | OrderCreateWithoutUserInput[] | OrderUncheckedCreateWithoutUserInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutUserInput | OrderCreateOrConnectWithoutUserInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutUserInput | OrderUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: OrderCreateManyUserInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutUserInput | OrderUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutUserInput | OrderUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutSessionsInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutSessionsNestedInput = {
    create?: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutSessionsInput
    upsert?: UserUpsertWithoutSessionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSessionsInput, UserUpdateWithoutSessionsInput>, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type CategoriesCreateNestedOneWithoutBrandsInput = {
    create?: XOR<CategoriesCreateWithoutBrandsInput, CategoriesUncheckedCreateWithoutBrandsInput>
    connectOrCreate?: CategoriesCreateOrConnectWithoutBrandsInput
    connect?: CategoriesWhereUniqueInput
  }

  export type BrandContactsCreateNestedManyWithoutBrandsInput = {
    create?: XOR<BrandContactsCreateWithoutBrandsInput, BrandContactsUncheckedCreateWithoutBrandsInput> | BrandContactsCreateWithoutBrandsInput[] | BrandContactsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandContactsCreateOrConnectWithoutBrandsInput | BrandContactsCreateOrConnectWithoutBrandsInput[]
    createMany?: BrandContactsCreateManyBrandsInputEnvelope
    connect?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
  }

  export type BrandTermsCreateNestedManyWithoutBrandsInput = {
    create?: XOR<BrandTermsCreateWithoutBrandsInput, BrandTermsUncheckedCreateWithoutBrandsInput> | BrandTermsCreateWithoutBrandsInput[] | BrandTermsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandTermsCreateOrConnectWithoutBrandsInput | BrandTermsCreateOrConnectWithoutBrandsInput[]
    createMany?: BrandTermsCreateManyBrandsInputEnvelope
    connect?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
  }

  export type BrandBankingCreateNestedManyWithoutBrandsInput = {
    create?: XOR<BrandBankingCreateWithoutBrandsInput, BrandBankingUncheckedCreateWithoutBrandsInput> | BrandBankingCreateWithoutBrandsInput[] | BrandBankingUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandBankingCreateOrConnectWithoutBrandsInput | BrandBankingCreateOrConnectWithoutBrandsInput[]
    createMany?: BrandBankingCreateManyBrandsInputEnvelope
    connect?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
  }

  export type VouchersCreateNestedManyWithoutBrandsInput = {
    create?: XOR<VouchersCreateWithoutBrandsInput, VouchersUncheckedCreateWithoutBrandsInput> | VouchersCreateWithoutBrandsInput[] | VouchersUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: VouchersCreateOrConnectWithoutBrandsInput | VouchersCreateOrConnectWithoutBrandsInput[]
    createMany?: VouchersCreateManyBrandsInputEnvelope
    connect?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
  }

  export type OrderCreateNestedManyWithoutBrandsInput = {
    create?: XOR<OrderCreateWithoutBrandsInput, OrderUncheckedCreateWithoutBrandsInput> | OrderCreateWithoutBrandsInput[] | OrderUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutBrandsInput | OrderCreateOrConnectWithoutBrandsInput[]
    createMany?: OrderCreateManyBrandsInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type SettlementsCreateNestedManyWithoutBrandsInput = {
    create?: XOR<SettlementsCreateWithoutBrandsInput, SettlementsUncheckedCreateWithoutBrandsInput> | SettlementsCreateWithoutBrandsInput[] | SettlementsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: SettlementsCreateOrConnectWithoutBrandsInput | SettlementsCreateOrConnectWithoutBrandsInput[]
    createMany?: SettlementsCreateManyBrandsInputEnvelope
    connect?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
  }

  export type BrandContactsUncheckedCreateNestedManyWithoutBrandsInput = {
    create?: XOR<BrandContactsCreateWithoutBrandsInput, BrandContactsUncheckedCreateWithoutBrandsInput> | BrandContactsCreateWithoutBrandsInput[] | BrandContactsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandContactsCreateOrConnectWithoutBrandsInput | BrandContactsCreateOrConnectWithoutBrandsInput[]
    createMany?: BrandContactsCreateManyBrandsInputEnvelope
    connect?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
  }

  export type BrandTermsUncheckedCreateNestedManyWithoutBrandsInput = {
    create?: XOR<BrandTermsCreateWithoutBrandsInput, BrandTermsUncheckedCreateWithoutBrandsInput> | BrandTermsCreateWithoutBrandsInput[] | BrandTermsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandTermsCreateOrConnectWithoutBrandsInput | BrandTermsCreateOrConnectWithoutBrandsInput[]
    createMany?: BrandTermsCreateManyBrandsInputEnvelope
    connect?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
  }

  export type BrandBankingUncheckedCreateNestedManyWithoutBrandsInput = {
    create?: XOR<BrandBankingCreateWithoutBrandsInput, BrandBankingUncheckedCreateWithoutBrandsInput> | BrandBankingCreateWithoutBrandsInput[] | BrandBankingUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandBankingCreateOrConnectWithoutBrandsInput | BrandBankingCreateOrConnectWithoutBrandsInput[]
    createMany?: BrandBankingCreateManyBrandsInputEnvelope
    connect?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
  }

  export type VouchersUncheckedCreateNestedManyWithoutBrandsInput = {
    create?: XOR<VouchersCreateWithoutBrandsInput, VouchersUncheckedCreateWithoutBrandsInput> | VouchersCreateWithoutBrandsInput[] | VouchersUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: VouchersCreateOrConnectWithoutBrandsInput | VouchersCreateOrConnectWithoutBrandsInput[]
    createMany?: VouchersCreateManyBrandsInputEnvelope
    connect?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutBrandsInput = {
    create?: XOR<OrderCreateWithoutBrandsInput, OrderUncheckedCreateWithoutBrandsInput> | OrderCreateWithoutBrandsInput[] | OrderUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutBrandsInput | OrderCreateOrConnectWithoutBrandsInput[]
    createMany?: OrderCreateManyBrandsInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type SettlementsUncheckedCreateNestedManyWithoutBrandsInput = {
    create?: XOR<SettlementsCreateWithoutBrandsInput, SettlementsUncheckedCreateWithoutBrandsInput> | SettlementsCreateWithoutBrandsInput[] | SettlementsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: SettlementsCreateOrConnectWithoutBrandsInput | SettlementsCreateOrConnectWithoutBrandsInput[]
    createMany?: SettlementsCreateManyBrandsInputEnvelope
    connect?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
  }

  export type CategoriesUpdateOneRequiredWithoutBrandsNestedInput = {
    create?: XOR<CategoriesCreateWithoutBrandsInput, CategoriesUncheckedCreateWithoutBrandsInput>
    connectOrCreate?: CategoriesCreateOrConnectWithoutBrandsInput
    upsert?: CategoriesUpsertWithoutBrandsInput
    connect?: CategoriesWhereUniqueInput
    update?: XOR<XOR<CategoriesUpdateToOneWithWhereWithoutBrandsInput, CategoriesUpdateWithoutBrandsInput>, CategoriesUncheckedUpdateWithoutBrandsInput>
  }

  export type BrandContactsUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<BrandContactsCreateWithoutBrandsInput, BrandContactsUncheckedCreateWithoutBrandsInput> | BrandContactsCreateWithoutBrandsInput[] | BrandContactsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandContactsCreateOrConnectWithoutBrandsInput | BrandContactsCreateOrConnectWithoutBrandsInput[]
    upsert?: BrandContactsUpsertWithWhereUniqueWithoutBrandsInput | BrandContactsUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: BrandContactsCreateManyBrandsInputEnvelope
    set?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
    disconnect?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
    delete?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
    connect?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
    update?: BrandContactsUpdateWithWhereUniqueWithoutBrandsInput | BrandContactsUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: BrandContactsUpdateManyWithWhereWithoutBrandsInput | BrandContactsUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: BrandContactsScalarWhereInput | BrandContactsScalarWhereInput[]
  }

  export type BrandTermsUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<BrandTermsCreateWithoutBrandsInput, BrandTermsUncheckedCreateWithoutBrandsInput> | BrandTermsCreateWithoutBrandsInput[] | BrandTermsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandTermsCreateOrConnectWithoutBrandsInput | BrandTermsCreateOrConnectWithoutBrandsInput[]
    upsert?: BrandTermsUpsertWithWhereUniqueWithoutBrandsInput | BrandTermsUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: BrandTermsCreateManyBrandsInputEnvelope
    set?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
    disconnect?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
    delete?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
    connect?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
    update?: BrandTermsUpdateWithWhereUniqueWithoutBrandsInput | BrandTermsUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: BrandTermsUpdateManyWithWhereWithoutBrandsInput | BrandTermsUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: BrandTermsScalarWhereInput | BrandTermsScalarWhereInput[]
  }

  export type BrandBankingUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<BrandBankingCreateWithoutBrandsInput, BrandBankingUncheckedCreateWithoutBrandsInput> | BrandBankingCreateWithoutBrandsInput[] | BrandBankingUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandBankingCreateOrConnectWithoutBrandsInput | BrandBankingCreateOrConnectWithoutBrandsInput[]
    upsert?: BrandBankingUpsertWithWhereUniqueWithoutBrandsInput | BrandBankingUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: BrandBankingCreateManyBrandsInputEnvelope
    set?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
    disconnect?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
    delete?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
    connect?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
    update?: BrandBankingUpdateWithWhereUniqueWithoutBrandsInput | BrandBankingUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: BrandBankingUpdateManyWithWhereWithoutBrandsInput | BrandBankingUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: BrandBankingScalarWhereInput | BrandBankingScalarWhereInput[]
  }

  export type VouchersUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<VouchersCreateWithoutBrandsInput, VouchersUncheckedCreateWithoutBrandsInput> | VouchersCreateWithoutBrandsInput[] | VouchersUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: VouchersCreateOrConnectWithoutBrandsInput | VouchersCreateOrConnectWithoutBrandsInput[]
    upsert?: VouchersUpsertWithWhereUniqueWithoutBrandsInput | VouchersUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: VouchersCreateManyBrandsInputEnvelope
    set?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
    disconnect?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
    delete?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
    connect?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
    update?: VouchersUpdateWithWhereUniqueWithoutBrandsInput | VouchersUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: VouchersUpdateManyWithWhereWithoutBrandsInput | VouchersUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: VouchersScalarWhereInput | VouchersScalarWhereInput[]
  }

  export type OrderUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<OrderCreateWithoutBrandsInput, OrderUncheckedCreateWithoutBrandsInput> | OrderCreateWithoutBrandsInput[] | OrderUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutBrandsInput | OrderCreateOrConnectWithoutBrandsInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutBrandsInput | OrderUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: OrderCreateManyBrandsInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutBrandsInput | OrderUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutBrandsInput | OrderUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type SettlementsUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<SettlementsCreateWithoutBrandsInput, SettlementsUncheckedCreateWithoutBrandsInput> | SettlementsCreateWithoutBrandsInput[] | SettlementsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: SettlementsCreateOrConnectWithoutBrandsInput | SettlementsCreateOrConnectWithoutBrandsInput[]
    upsert?: SettlementsUpsertWithWhereUniqueWithoutBrandsInput | SettlementsUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: SettlementsCreateManyBrandsInputEnvelope
    set?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
    disconnect?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
    delete?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
    connect?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
    update?: SettlementsUpdateWithWhereUniqueWithoutBrandsInput | SettlementsUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: SettlementsUpdateManyWithWhereWithoutBrandsInput | SettlementsUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: SettlementsScalarWhereInput | SettlementsScalarWhereInput[]
  }

  export type BrandContactsUncheckedUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<BrandContactsCreateWithoutBrandsInput, BrandContactsUncheckedCreateWithoutBrandsInput> | BrandContactsCreateWithoutBrandsInput[] | BrandContactsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandContactsCreateOrConnectWithoutBrandsInput | BrandContactsCreateOrConnectWithoutBrandsInput[]
    upsert?: BrandContactsUpsertWithWhereUniqueWithoutBrandsInput | BrandContactsUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: BrandContactsCreateManyBrandsInputEnvelope
    set?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
    disconnect?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
    delete?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
    connect?: BrandContactsWhereUniqueInput | BrandContactsWhereUniqueInput[]
    update?: BrandContactsUpdateWithWhereUniqueWithoutBrandsInput | BrandContactsUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: BrandContactsUpdateManyWithWhereWithoutBrandsInput | BrandContactsUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: BrandContactsScalarWhereInput | BrandContactsScalarWhereInput[]
  }

  export type BrandTermsUncheckedUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<BrandTermsCreateWithoutBrandsInput, BrandTermsUncheckedCreateWithoutBrandsInput> | BrandTermsCreateWithoutBrandsInput[] | BrandTermsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandTermsCreateOrConnectWithoutBrandsInput | BrandTermsCreateOrConnectWithoutBrandsInput[]
    upsert?: BrandTermsUpsertWithWhereUniqueWithoutBrandsInput | BrandTermsUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: BrandTermsCreateManyBrandsInputEnvelope
    set?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
    disconnect?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
    delete?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
    connect?: BrandTermsWhereUniqueInput | BrandTermsWhereUniqueInput[]
    update?: BrandTermsUpdateWithWhereUniqueWithoutBrandsInput | BrandTermsUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: BrandTermsUpdateManyWithWhereWithoutBrandsInput | BrandTermsUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: BrandTermsScalarWhereInput | BrandTermsScalarWhereInput[]
  }

  export type BrandBankingUncheckedUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<BrandBankingCreateWithoutBrandsInput, BrandBankingUncheckedCreateWithoutBrandsInput> | BrandBankingCreateWithoutBrandsInput[] | BrandBankingUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: BrandBankingCreateOrConnectWithoutBrandsInput | BrandBankingCreateOrConnectWithoutBrandsInput[]
    upsert?: BrandBankingUpsertWithWhereUniqueWithoutBrandsInput | BrandBankingUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: BrandBankingCreateManyBrandsInputEnvelope
    set?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
    disconnect?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
    delete?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
    connect?: BrandBankingWhereUniqueInput | BrandBankingWhereUniqueInput[]
    update?: BrandBankingUpdateWithWhereUniqueWithoutBrandsInput | BrandBankingUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: BrandBankingUpdateManyWithWhereWithoutBrandsInput | BrandBankingUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: BrandBankingScalarWhereInput | BrandBankingScalarWhereInput[]
  }

  export type VouchersUncheckedUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<VouchersCreateWithoutBrandsInput, VouchersUncheckedCreateWithoutBrandsInput> | VouchersCreateWithoutBrandsInput[] | VouchersUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: VouchersCreateOrConnectWithoutBrandsInput | VouchersCreateOrConnectWithoutBrandsInput[]
    upsert?: VouchersUpsertWithWhereUniqueWithoutBrandsInput | VouchersUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: VouchersCreateManyBrandsInputEnvelope
    set?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
    disconnect?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
    delete?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
    connect?: VouchersWhereUniqueInput | VouchersWhereUniqueInput[]
    update?: VouchersUpdateWithWhereUniqueWithoutBrandsInput | VouchersUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: VouchersUpdateManyWithWhereWithoutBrandsInput | VouchersUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: VouchersScalarWhereInput | VouchersScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<OrderCreateWithoutBrandsInput, OrderUncheckedCreateWithoutBrandsInput> | OrderCreateWithoutBrandsInput[] | OrderUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutBrandsInput | OrderCreateOrConnectWithoutBrandsInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutBrandsInput | OrderUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: OrderCreateManyBrandsInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutBrandsInput | OrderUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutBrandsInput | OrderUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type SettlementsUncheckedUpdateManyWithoutBrandsNestedInput = {
    create?: XOR<SettlementsCreateWithoutBrandsInput, SettlementsUncheckedCreateWithoutBrandsInput> | SettlementsCreateWithoutBrandsInput[] | SettlementsUncheckedCreateWithoutBrandsInput[]
    connectOrCreate?: SettlementsCreateOrConnectWithoutBrandsInput | SettlementsCreateOrConnectWithoutBrandsInput[]
    upsert?: SettlementsUpsertWithWhereUniqueWithoutBrandsInput | SettlementsUpsertWithWhereUniqueWithoutBrandsInput[]
    createMany?: SettlementsCreateManyBrandsInputEnvelope
    set?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
    disconnect?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
    delete?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
    connect?: SettlementsWhereUniqueInput | SettlementsWhereUniqueInput[]
    update?: SettlementsUpdateWithWhereUniqueWithoutBrandsInput | SettlementsUpdateWithWhereUniqueWithoutBrandsInput[]
    updateMany?: SettlementsUpdateManyWithWhereWithoutBrandsInput | SettlementsUpdateManyWithWhereWithoutBrandsInput[]
    deleteMany?: SettlementsScalarWhereInput | SettlementsScalarWhereInput[]
  }

  export type BrandCreateNestedOneWithoutBrandcontactsInput = {
    create?: XOR<BrandCreateWithoutBrandcontactsInput, BrandUncheckedCreateWithoutBrandcontactsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutBrandcontactsInput
    connect?: BrandWhereUniqueInput
  }

  export type BrandUpdateOneRequiredWithoutBrandcontactsNestedInput = {
    create?: XOR<BrandCreateWithoutBrandcontactsInput, BrandUncheckedCreateWithoutBrandcontactsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutBrandcontactsInput
    upsert?: BrandUpsertWithoutBrandcontactsInput
    connect?: BrandWhereUniqueInput
    update?: XOR<XOR<BrandUpdateToOneWithWhereWithoutBrandcontactsInput, BrandUpdateWithoutBrandcontactsInput>, BrandUncheckedUpdateWithoutBrandcontactsInput>
  }

  export type BrandCreateNestedOneWithoutBrandTermsInput = {
    create?: XOR<BrandCreateWithoutBrandTermsInput, BrandUncheckedCreateWithoutBrandTermsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutBrandTermsInput
    connect?: BrandWhereUniqueInput
  }

  export type EnumSettelmentStatusFieldUpdateOperationsInput = {
    set?: $Enums.SettelmentStatus
  }

  export type EnumCommissionStatusFieldUpdateOperationsInput = {
    set?: $Enums.CommissionStatus
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumPolicyStatusFieldUpdateOperationsInput = {
    set?: $Enums.PolicyStatus
  }

  export type BrandUpdateOneRequiredWithoutBrandTermsNestedInput = {
    create?: XOR<BrandCreateWithoutBrandTermsInput, BrandUncheckedCreateWithoutBrandTermsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutBrandTermsInput
    upsert?: BrandUpsertWithoutBrandTermsInput
    connect?: BrandWhereUniqueInput
    update?: XOR<XOR<BrandUpdateToOneWithWhereWithoutBrandTermsInput, BrandUpdateWithoutBrandTermsInput>, BrandUncheckedUpdateWithoutBrandTermsInput>
  }

  export type BrandCreateNestedOneWithoutVouchersInput = {
    create?: XOR<BrandCreateWithoutVouchersInput, BrandUncheckedCreateWithoutVouchersInput>
    connectOrCreate?: BrandCreateOrConnectWithoutVouchersInput
    connect?: BrandWhereUniqueInput
  }

  export type EnumDenominationStatusFieldUpdateOperationsInput = {
    set?: $Enums.DenominationStatus
  }

  export type EnumexpiryPolicyStatusFieldUpdateOperationsInput = {
    set?: $Enums.expiryPolicyStatus
  }

  export type BrandUpdateOneRequiredWithoutVouchersNestedInput = {
    create?: XOR<BrandCreateWithoutVouchersInput, BrandUncheckedCreateWithoutVouchersInput>
    connectOrCreate?: BrandCreateOrConnectWithoutVouchersInput
    upsert?: BrandUpsertWithoutVouchersInput
    connect?: BrandWhereUniqueInput
    update?: XOR<XOR<BrandUpdateToOneWithWhereWithoutVouchersInput, BrandUpdateWithoutVouchersInput>, BrandUncheckedUpdateWithoutVouchersInput>
  }

  export type BrandCreateNestedOneWithoutBrandBankingsInput = {
    create?: XOR<BrandCreateWithoutBrandBankingsInput, BrandUncheckedCreateWithoutBrandBankingsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutBrandBankingsInput
    connect?: BrandWhereUniqueInput
  }

  export type EnumSettlementFrequencyStatusFieldUpdateOperationsInput = {
    set?: $Enums.SettlementFrequencyStatus
  }

  export type EnumpayoutMethodStatusFieldUpdateOperationsInput = {
    set?: $Enums.payoutMethodStatus
  }

  export type BrandUpdateOneRequiredWithoutBrandBankingsNestedInput = {
    create?: XOR<BrandCreateWithoutBrandBankingsInput, BrandUncheckedCreateWithoutBrandBankingsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutBrandBankingsInput
    upsert?: BrandUpsertWithoutBrandBankingsInput
    connect?: BrandWhereUniqueInput
    update?: XOR<XOR<BrandUpdateToOneWithWhereWithoutBrandBankingsInput, BrandUpdateWithoutBrandBankingsInput>, BrandUncheckedUpdateWithoutBrandBankingsInput>
  }

  export type OccasionCategoryCreateNestedManyWithoutOccasionsInput = {
    create?: XOR<OccasionCategoryCreateWithoutOccasionsInput, OccasionCategoryUncheckedCreateWithoutOccasionsInput> | OccasionCategoryCreateWithoutOccasionsInput[] | OccasionCategoryUncheckedCreateWithoutOccasionsInput[]
    connectOrCreate?: OccasionCategoryCreateOrConnectWithoutOccasionsInput | OccasionCategoryCreateOrConnectWithoutOccasionsInput[]
    createMany?: OccasionCategoryCreateManyOccasionsInputEnvelope
    connect?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
  }

  export type OrderCreateNestedManyWithoutOccasionsInput = {
    create?: XOR<OrderCreateWithoutOccasionsInput, OrderUncheckedCreateWithoutOccasionsInput> | OrderCreateWithoutOccasionsInput[] | OrderUncheckedCreateWithoutOccasionsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutOccasionsInput | OrderCreateOrConnectWithoutOccasionsInput[]
    createMany?: OrderCreateManyOccasionsInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type OccasionCategoryUncheckedCreateNestedManyWithoutOccasionsInput = {
    create?: XOR<OccasionCategoryCreateWithoutOccasionsInput, OccasionCategoryUncheckedCreateWithoutOccasionsInput> | OccasionCategoryCreateWithoutOccasionsInput[] | OccasionCategoryUncheckedCreateWithoutOccasionsInput[]
    connectOrCreate?: OccasionCategoryCreateOrConnectWithoutOccasionsInput | OccasionCategoryCreateOrConnectWithoutOccasionsInput[]
    createMany?: OccasionCategoryCreateManyOccasionsInputEnvelope
    connect?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutOccasionsInput = {
    create?: XOR<OrderCreateWithoutOccasionsInput, OrderUncheckedCreateWithoutOccasionsInput> | OrderCreateWithoutOccasionsInput[] | OrderUncheckedCreateWithoutOccasionsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutOccasionsInput | OrderCreateOrConnectWithoutOccasionsInput[]
    createMany?: OrderCreateManyOccasionsInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type OccasionCategoryUpdateManyWithoutOccasionsNestedInput = {
    create?: XOR<OccasionCategoryCreateWithoutOccasionsInput, OccasionCategoryUncheckedCreateWithoutOccasionsInput> | OccasionCategoryCreateWithoutOccasionsInput[] | OccasionCategoryUncheckedCreateWithoutOccasionsInput[]
    connectOrCreate?: OccasionCategoryCreateOrConnectWithoutOccasionsInput | OccasionCategoryCreateOrConnectWithoutOccasionsInput[]
    upsert?: OccasionCategoryUpsertWithWhereUniqueWithoutOccasionsInput | OccasionCategoryUpsertWithWhereUniqueWithoutOccasionsInput[]
    createMany?: OccasionCategoryCreateManyOccasionsInputEnvelope
    set?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
    disconnect?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
    delete?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
    connect?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
    update?: OccasionCategoryUpdateWithWhereUniqueWithoutOccasionsInput | OccasionCategoryUpdateWithWhereUniqueWithoutOccasionsInput[]
    updateMany?: OccasionCategoryUpdateManyWithWhereWithoutOccasionsInput | OccasionCategoryUpdateManyWithWhereWithoutOccasionsInput[]
    deleteMany?: OccasionCategoryScalarWhereInput | OccasionCategoryScalarWhereInput[]
  }

  export type OrderUpdateManyWithoutOccasionsNestedInput = {
    create?: XOR<OrderCreateWithoutOccasionsInput, OrderUncheckedCreateWithoutOccasionsInput> | OrderCreateWithoutOccasionsInput[] | OrderUncheckedCreateWithoutOccasionsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutOccasionsInput | OrderCreateOrConnectWithoutOccasionsInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutOccasionsInput | OrderUpsertWithWhereUniqueWithoutOccasionsInput[]
    createMany?: OrderCreateManyOccasionsInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutOccasionsInput | OrderUpdateWithWhereUniqueWithoutOccasionsInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutOccasionsInput | OrderUpdateManyWithWhereWithoutOccasionsInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type OccasionCategoryUncheckedUpdateManyWithoutOccasionsNestedInput = {
    create?: XOR<OccasionCategoryCreateWithoutOccasionsInput, OccasionCategoryUncheckedCreateWithoutOccasionsInput> | OccasionCategoryCreateWithoutOccasionsInput[] | OccasionCategoryUncheckedCreateWithoutOccasionsInput[]
    connectOrCreate?: OccasionCategoryCreateOrConnectWithoutOccasionsInput | OccasionCategoryCreateOrConnectWithoutOccasionsInput[]
    upsert?: OccasionCategoryUpsertWithWhereUniqueWithoutOccasionsInput | OccasionCategoryUpsertWithWhereUniqueWithoutOccasionsInput[]
    createMany?: OccasionCategoryCreateManyOccasionsInputEnvelope
    set?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
    disconnect?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
    delete?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
    connect?: OccasionCategoryWhereUniqueInput | OccasionCategoryWhereUniqueInput[]
    update?: OccasionCategoryUpdateWithWhereUniqueWithoutOccasionsInput | OccasionCategoryUpdateWithWhereUniqueWithoutOccasionsInput[]
    updateMany?: OccasionCategoryUpdateManyWithWhereWithoutOccasionsInput | OccasionCategoryUpdateManyWithWhereWithoutOccasionsInput[]
    deleteMany?: OccasionCategoryScalarWhereInput | OccasionCategoryScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutOccasionsNestedInput = {
    create?: XOR<OrderCreateWithoutOccasionsInput, OrderUncheckedCreateWithoutOccasionsInput> | OrderCreateWithoutOccasionsInput[] | OrderUncheckedCreateWithoutOccasionsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutOccasionsInput | OrderCreateOrConnectWithoutOccasionsInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutOccasionsInput | OrderUpsertWithWhereUniqueWithoutOccasionsInput[]
    createMany?: OrderCreateManyOccasionsInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutOccasionsInput | OrderUpdateWithWhereUniqueWithoutOccasionsInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutOccasionsInput | OrderUpdateManyWithWhereWithoutOccasionsInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type OccasionCreateNestedOneWithoutOccasionCategoryInput = {
    create?: XOR<OccasionCreateWithoutOccasionCategoryInput, OccasionUncheckedCreateWithoutOccasionCategoryInput>
    connectOrCreate?: OccasionCreateOrConnectWithoutOccasionCategoryInput
    connect?: OccasionWhereUniqueInput
  }

  export type OccasionUpdateOneRequiredWithoutOccasionCategoryNestedInput = {
    create?: XOR<OccasionCreateWithoutOccasionCategoryInput, OccasionUncheckedCreateWithoutOccasionCategoryInput>
    connectOrCreate?: OccasionCreateOrConnectWithoutOccasionCategoryInput
    upsert?: OccasionUpsertWithoutOccasionCategoryInput
    connect?: OccasionWhereUniqueInput
    update?: XOR<XOR<OccasionUpdateToOneWithWhereWithoutOccasionCategoryInput, OccasionUpdateWithoutOccasionCategoryInput>, OccasionUncheckedUpdateWithoutOccasionCategoryInput>
  }

  export type BrandCreateNestedManyWithoutCategoriesInput = {
    create?: XOR<BrandCreateWithoutCategoriesInput, BrandUncheckedCreateWithoutCategoriesInput> | BrandCreateWithoutCategoriesInput[] | BrandUncheckedCreateWithoutCategoriesInput[]
    connectOrCreate?: BrandCreateOrConnectWithoutCategoriesInput | BrandCreateOrConnectWithoutCategoriesInput[]
    createMany?: BrandCreateManyCategoriesInputEnvelope
    connect?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
  }

  export type BrandUncheckedCreateNestedManyWithoutCategoriesInput = {
    create?: XOR<BrandCreateWithoutCategoriesInput, BrandUncheckedCreateWithoutCategoriesInput> | BrandCreateWithoutCategoriesInput[] | BrandUncheckedCreateWithoutCategoriesInput[]
    connectOrCreate?: BrandCreateOrConnectWithoutCategoriesInput | BrandCreateOrConnectWithoutCategoriesInput[]
    createMany?: BrandCreateManyCategoriesInputEnvelope
    connect?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
  }

  export type BrandUpdateManyWithoutCategoriesNestedInput = {
    create?: XOR<BrandCreateWithoutCategoriesInput, BrandUncheckedCreateWithoutCategoriesInput> | BrandCreateWithoutCategoriesInput[] | BrandUncheckedCreateWithoutCategoriesInput[]
    connectOrCreate?: BrandCreateOrConnectWithoutCategoriesInput | BrandCreateOrConnectWithoutCategoriesInput[]
    upsert?: BrandUpsertWithWhereUniqueWithoutCategoriesInput | BrandUpsertWithWhereUniqueWithoutCategoriesInput[]
    createMany?: BrandCreateManyCategoriesInputEnvelope
    set?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
    disconnect?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
    delete?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
    connect?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
    update?: BrandUpdateWithWhereUniqueWithoutCategoriesInput | BrandUpdateWithWhereUniqueWithoutCategoriesInput[]
    updateMany?: BrandUpdateManyWithWhereWithoutCategoriesInput | BrandUpdateManyWithWhereWithoutCategoriesInput[]
    deleteMany?: BrandScalarWhereInput | BrandScalarWhereInput[]
  }

  export type BrandUncheckedUpdateManyWithoutCategoriesNestedInput = {
    create?: XOR<BrandCreateWithoutCategoriesInput, BrandUncheckedCreateWithoutCategoriesInput> | BrandCreateWithoutCategoriesInput[] | BrandUncheckedCreateWithoutCategoriesInput[]
    connectOrCreate?: BrandCreateOrConnectWithoutCategoriesInput | BrandCreateOrConnectWithoutCategoriesInput[]
    upsert?: BrandUpsertWithWhereUniqueWithoutCategoriesInput | BrandUpsertWithWhereUniqueWithoutCategoriesInput[]
    createMany?: BrandCreateManyCategoriesInputEnvelope
    set?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
    disconnect?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
    delete?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
    connect?: BrandWhereUniqueInput | BrandWhereUniqueInput[]
    update?: BrandUpdateWithWhereUniqueWithoutCategoriesInput | BrandUpdateWithWhereUniqueWithoutCategoriesInput[]
    updateMany?: BrandUpdateManyWithWhereWithoutCategoriesInput | BrandUpdateManyWithWhereWithoutCategoriesInput[]
    deleteMany?: BrandScalarWhereInput | BrandScalarWhereInput[]
  }

  export type OrderCreateNestedManyWithoutReceiverDetailsInput = {
    create?: XOR<OrderCreateWithoutReceiverDetailsInput, OrderUncheckedCreateWithoutReceiverDetailsInput> | OrderCreateWithoutReceiverDetailsInput[] | OrderUncheckedCreateWithoutReceiverDetailsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutReceiverDetailsInput | OrderCreateOrConnectWithoutReceiverDetailsInput[]
    createMany?: OrderCreateManyReceiverDetailsInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type OrderUncheckedCreateNestedManyWithoutReceiverDetailsInput = {
    create?: XOR<OrderCreateWithoutReceiverDetailsInput, OrderUncheckedCreateWithoutReceiverDetailsInput> | OrderCreateWithoutReceiverDetailsInput[] | OrderUncheckedCreateWithoutReceiverDetailsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutReceiverDetailsInput | OrderCreateOrConnectWithoutReceiverDetailsInput[]
    createMany?: OrderCreateManyReceiverDetailsInputEnvelope
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
  }

  export type OrderUpdateManyWithoutReceiverDetailsNestedInput = {
    create?: XOR<OrderCreateWithoutReceiverDetailsInput, OrderUncheckedCreateWithoutReceiverDetailsInput> | OrderCreateWithoutReceiverDetailsInput[] | OrderUncheckedCreateWithoutReceiverDetailsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutReceiverDetailsInput | OrderCreateOrConnectWithoutReceiverDetailsInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutReceiverDetailsInput | OrderUpsertWithWhereUniqueWithoutReceiverDetailsInput[]
    createMany?: OrderCreateManyReceiverDetailsInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutReceiverDetailsInput | OrderUpdateWithWhereUniqueWithoutReceiverDetailsInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutReceiverDetailsInput | OrderUpdateManyWithWhereWithoutReceiverDetailsInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type OrderUncheckedUpdateManyWithoutReceiverDetailsNestedInput = {
    create?: XOR<OrderCreateWithoutReceiverDetailsInput, OrderUncheckedCreateWithoutReceiverDetailsInput> | OrderCreateWithoutReceiverDetailsInput[] | OrderUncheckedCreateWithoutReceiverDetailsInput[]
    connectOrCreate?: OrderCreateOrConnectWithoutReceiverDetailsInput | OrderCreateOrConnectWithoutReceiverDetailsInput[]
    upsert?: OrderUpsertWithWhereUniqueWithoutReceiverDetailsInput | OrderUpsertWithWhereUniqueWithoutReceiverDetailsInput[]
    createMany?: OrderCreateManyReceiverDetailsInputEnvelope
    set?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    disconnect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    delete?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    connect?: OrderWhereUniqueInput | OrderWhereUniqueInput[]
    update?: OrderUpdateWithWhereUniqueWithoutReceiverDetailsInput | OrderUpdateWithWhereUniqueWithoutReceiverDetailsInput[]
    updateMany?: OrderUpdateManyWithWhereWithoutReceiverDetailsInput | OrderUpdateManyWithWhereWithoutReceiverDetailsInput[]
    deleteMany?: OrderScalarWhereInput | OrderScalarWhereInput[]
  }

  export type ReceiverDetailCreateNestedOneWithoutOrderInput = {
    create?: XOR<ReceiverDetailCreateWithoutOrderInput, ReceiverDetailUncheckedCreateWithoutOrderInput>
    connectOrCreate?: ReceiverDetailCreateOrConnectWithoutOrderInput
    connect?: ReceiverDetailWhereUniqueInput
  }

  export type OccasionCreateNestedOneWithoutOrderInput = {
    create?: XOR<OccasionCreateWithoutOrderInput, OccasionUncheckedCreateWithoutOrderInput>
    connectOrCreate?: OccasionCreateOrConnectWithoutOrderInput
    connect?: OccasionWhereUniqueInput
  }

  export type BrandCreateNestedOneWithoutOrderInput = {
    create?: XOR<BrandCreateWithoutOrderInput, BrandUncheckedCreateWithoutOrderInput>
    connectOrCreate?: BrandCreateOrConnectWithoutOrderInput
    connect?: BrandWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutOrderInput = {
    create?: XOR<UserCreateWithoutOrderInput, UserUncheckedCreateWithoutOrderInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrderInput
    connect?: UserWhereUniqueInput
  }

  export type EnumSendStatusFieldUpdateOperationsInput = {
    set?: $Enums.SendStatus
  }

  export type EnumdeliveryMethodStatusFieldUpdateOperationsInput = {
    set?: $Enums.deliveryMethodStatus
  }

  export type EnumpaymentStatusFieldUpdateOperationsInput = {
    set?: $Enums.paymentStatus
  }

  export type EnumRedemptionStatusFieldUpdateOperationsInput = {
    set?: $Enums.RedemptionStatus
  }

  export type ReceiverDetailUpdateOneRequiredWithoutOrderNestedInput = {
    create?: XOR<ReceiverDetailCreateWithoutOrderInput, ReceiverDetailUncheckedCreateWithoutOrderInput>
    connectOrCreate?: ReceiverDetailCreateOrConnectWithoutOrderInput
    upsert?: ReceiverDetailUpsertWithoutOrderInput
    connect?: ReceiverDetailWhereUniqueInput
    update?: XOR<XOR<ReceiverDetailUpdateToOneWithWhereWithoutOrderInput, ReceiverDetailUpdateWithoutOrderInput>, ReceiverDetailUncheckedUpdateWithoutOrderInput>
  }

  export type OccasionUpdateOneRequiredWithoutOrderNestedInput = {
    create?: XOR<OccasionCreateWithoutOrderInput, OccasionUncheckedCreateWithoutOrderInput>
    connectOrCreate?: OccasionCreateOrConnectWithoutOrderInput
    upsert?: OccasionUpsertWithoutOrderInput
    connect?: OccasionWhereUniqueInput
    update?: XOR<XOR<OccasionUpdateToOneWithWhereWithoutOrderInput, OccasionUpdateWithoutOrderInput>, OccasionUncheckedUpdateWithoutOrderInput>
  }

  export type BrandUpdateOneRequiredWithoutOrderNestedInput = {
    create?: XOR<BrandCreateWithoutOrderInput, BrandUncheckedCreateWithoutOrderInput>
    connectOrCreate?: BrandCreateOrConnectWithoutOrderInput
    upsert?: BrandUpsertWithoutOrderInput
    connect?: BrandWhereUniqueInput
    update?: XOR<XOR<BrandUpdateToOneWithWhereWithoutOrderInput, BrandUpdateWithoutOrderInput>, BrandUncheckedUpdateWithoutOrderInput>
  }

  export type UserUpdateOneRequiredWithoutOrderNestedInput = {
    create?: XOR<UserCreateWithoutOrderInput, UserUncheckedCreateWithoutOrderInput>
    connectOrCreate?: UserCreateOrConnectWithoutOrderInput
    upsert?: UserUpsertWithoutOrderInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutOrderInput, UserUpdateWithoutOrderInput>, UserUncheckedUpdateWithoutOrderInput>
  }

  export type BrandCreateNestedOneWithoutSettlementsInput = {
    create?: XOR<BrandCreateWithoutSettlementsInput, BrandUncheckedCreateWithoutSettlementsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutSettlementsInput
    connect?: BrandWhereUniqueInput
  }

  export type EnumStatusFieldUpdateOperationsInput = {
    set?: $Enums.Status
  }

  export type BrandUpdateOneRequiredWithoutSettlementsNestedInput = {
    create?: XOR<BrandCreateWithoutSettlementsInput, BrandUncheckedCreateWithoutSettlementsInput>
    connectOrCreate?: BrandCreateOrConnectWithoutSettlementsInput
    upsert?: BrandUpsertWithoutSettlementsInput
    connect?: BrandWhereUniqueInput
    update?: XOR<XOR<BrandUpdateToOneWithWhereWithoutSettlementsInput, BrandUpdateWithoutSettlementsInput>, BrandUncheckedUpdateWithoutSettlementsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumSettelmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SettelmentStatus | EnumSettelmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SettelmentStatus[] | ListEnumSettelmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SettelmentStatus[] | ListEnumSettelmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSettelmentStatusFilter<$PrismaModel> | $Enums.SettelmentStatus
  }

  export type NestedEnumCommissionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CommissionStatus | EnumCommissionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CommissionStatus[] | ListEnumCommissionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommissionStatus[] | ListEnumCommissionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCommissionStatusFilter<$PrismaModel> | $Enums.CommissionStatus
  }

  export type NestedEnumPolicyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyStatus | EnumPolicyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PolicyStatus[] | ListEnumPolicyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PolicyStatus[] | ListEnumPolicyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPolicyStatusFilter<$PrismaModel> | $Enums.PolicyStatus
  }

  export type NestedEnumSettelmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SettelmentStatus | EnumSettelmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SettelmentStatus[] | ListEnumSettelmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SettelmentStatus[] | ListEnumSettelmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSettelmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.SettelmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSettelmentStatusFilter<$PrismaModel>
    _max?: NestedEnumSettelmentStatusFilter<$PrismaModel>
  }

  export type NestedEnumCommissionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CommissionStatus | EnumCommissionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CommissionStatus[] | ListEnumCommissionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CommissionStatus[] | ListEnumCommissionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCommissionStatusWithAggregatesFilter<$PrismaModel> | $Enums.CommissionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCommissionStatusFilter<$PrismaModel>
    _max?: NestedEnumCommissionStatusFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumPolicyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PolicyStatus | EnumPolicyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PolicyStatus[] | ListEnumPolicyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PolicyStatus[] | ListEnumPolicyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPolicyStatusWithAggregatesFilter<$PrismaModel> | $Enums.PolicyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPolicyStatusFilter<$PrismaModel>
    _max?: NestedEnumPolicyStatusFilter<$PrismaModel>
  }

  export type NestedEnumDenominationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.DenominationStatus | EnumDenominationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DenominationStatus[] | ListEnumDenominationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DenominationStatus[] | ListEnumDenominationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDenominationStatusFilter<$PrismaModel> | $Enums.DenominationStatus
  }

  export type NestedEnumexpiryPolicyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.expiryPolicyStatus | EnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.expiryPolicyStatus[] | ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.expiryPolicyStatus[] | ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumexpiryPolicyStatusFilter<$PrismaModel> | $Enums.expiryPolicyStatus
  }

  export type NestedEnumDenominationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DenominationStatus | EnumDenominationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.DenominationStatus[] | ListEnumDenominationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.DenominationStatus[] | ListEnumDenominationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumDenominationStatusWithAggregatesFilter<$PrismaModel> | $Enums.DenominationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumDenominationStatusFilter<$PrismaModel>
    _max?: NestedEnumDenominationStatusFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumexpiryPolicyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.expiryPolicyStatus | EnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.expiryPolicyStatus[] | ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.expiryPolicyStatus[] | ListEnumexpiryPolicyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumexpiryPolicyStatusWithAggregatesFilter<$PrismaModel> | $Enums.expiryPolicyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumexpiryPolicyStatusFilter<$PrismaModel>
    _max?: NestedEnumexpiryPolicyStatusFilter<$PrismaModel>
  }

  export type NestedEnumSettlementFrequencyStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SettlementFrequencyStatus | EnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SettlementFrequencyStatus[] | ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SettlementFrequencyStatus[] | ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSettlementFrequencyStatusFilter<$PrismaModel> | $Enums.SettlementFrequencyStatus
  }

  export type NestedEnumpayoutMethodStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.payoutMethodStatus | EnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    in?: $Enums.payoutMethodStatus[] | ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.payoutMethodStatus[] | ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumpayoutMethodStatusFilter<$PrismaModel> | $Enums.payoutMethodStatus
  }

  export type NestedEnumSettlementFrequencyStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SettlementFrequencyStatus | EnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SettlementFrequencyStatus[] | ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SettlementFrequencyStatus[] | ListEnumSettlementFrequencyStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSettlementFrequencyStatusWithAggregatesFilter<$PrismaModel> | $Enums.SettlementFrequencyStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSettlementFrequencyStatusFilter<$PrismaModel>
    _max?: NestedEnumSettlementFrequencyStatusFilter<$PrismaModel>
  }

  export type NestedEnumpayoutMethodStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.payoutMethodStatus | EnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    in?: $Enums.payoutMethodStatus[] | ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.payoutMethodStatus[] | ListEnumpayoutMethodStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumpayoutMethodStatusWithAggregatesFilter<$PrismaModel> | $Enums.payoutMethodStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumpayoutMethodStatusFilter<$PrismaModel>
    _max?: NestedEnumpayoutMethodStatusFilter<$PrismaModel>
  }

  export type NestedEnumSendStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.SendStatus | EnumSendStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SendStatus[] | ListEnumSendStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SendStatus[] | ListEnumSendStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSendStatusFilter<$PrismaModel> | $Enums.SendStatus
  }

  export type NestedEnumdeliveryMethodStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.deliveryMethodStatus | EnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    in?: $Enums.deliveryMethodStatus[] | ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.deliveryMethodStatus[] | ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumdeliveryMethodStatusFilter<$PrismaModel> | $Enums.deliveryMethodStatus
  }

  export type NestedEnumpaymentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.paymentStatus | EnumpaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.paymentStatus[] | ListEnumpaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.paymentStatus[] | ListEnumpaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumpaymentStatusFilter<$PrismaModel> | $Enums.paymentStatus
  }

  export type NestedEnumRedemptionStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RedemptionStatus | EnumRedemptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RedemptionStatus[] | ListEnumRedemptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedemptionStatus[] | ListEnumRedemptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRedemptionStatusFilter<$PrismaModel> | $Enums.RedemptionStatus
  }

  export type NestedEnumSendStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.SendStatus | EnumSendStatusFieldRefInput<$PrismaModel>
    in?: $Enums.SendStatus[] | ListEnumSendStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.SendStatus[] | ListEnumSendStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumSendStatusWithAggregatesFilter<$PrismaModel> | $Enums.SendStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumSendStatusFilter<$PrismaModel>
    _max?: NestedEnumSendStatusFilter<$PrismaModel>
  }

  export type NestedEnumdeliveryMethodStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.deliveryMethodStatus | EnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    in?: $Enums.deliveryMethodStatus[] | ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.deliveryMethodStatus[] | ListEnumdeliveryMethodStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumdeliveryMethodStatusWithAggregatesFilter<$PrismaModel> | $Enums.deliveryMethodStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumdeliveryMethodStatusFilter<$PrismaModel>
    _max?: NestedEnumdeliveryMethodStatusFilter<$PrismaModel>
  }

  export type NestedEnumpaymentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.paymentStatus | EnumpaymentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.paymentStatus[] | ListEnumpaymentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.paymentStatus[] | ListEnumpaymentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumpaymentStatusWithAggregatesFilter<$PrismaModel> | $Enums.paymentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumpaymentStatusFilter<$PrismaModel>
    _max?: NestedEnumpaymentStatusFilter<$PrismaModel>
  }

  export type NestedEnumRedemptionStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RedemptionStatus | EnumRedemptionStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RedemptionStatus[] | ListEnumRedemptionStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RedemptionStatus[] | ListEnumRedemptionStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRedemptionStatusWithAggregatesFilter<$PrismaModel> | $Enums.RedemptionStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRedemptionStatusFilter<$PrismaModel>
    _max?: NestedEnumRedemptionStatusFilter<$PrismaModel>
  }

  export type NestedEnumStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.Status | EnumStatusFieldRefInput<$PrismaModel>
    in?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusFilter<$PrismaModel> | $Enums.Status
  }

  export type NestedEnumStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Status | EnumStatusFieldRefInput<$PrismaModel>
    in?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.Status[] | ListEnumStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusWithAggregatesFilter<$PrismaModel> | $Enums.Status
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusFilter<$PrismaModel>
    _max?: NestedEnumStatusFilter<$PrismaModel>
  }

  export type SessionCreateWithoutUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type SessionUncheckedCreateWithoutUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type SessionCreateOrConnectWithoutUserInput = {
    where: SessionWhereUniqueInput
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionCreateManyUserInputEnvelope = {
    data: SessionCreateManyUserInput | SessionCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OrderCreateWithoutUserInput = {
    id?: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
    receiverDetails: ReceiverDetailCreateNestedOneWithoutOrderInput
    occasions: OccasionCreateNestedOneWithoutOrderInput
    brands: BrandCreateNestedOneWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutUserInput = {
    id?: string
    brandId: string
    occasionId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    receiverId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type OrderCreateOrConnectWithoutUserInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
  }

  export type OrderCreateManyUserInputEnvelope = {
    data: OrderCreateManyUserInput | OrderCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type SessionUpsertWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    update: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
    create: XOR<SessionCreateWithoutUserInput, SessionUncheckedCreateWithoutUserInput>
  }

  export type SessionUpdateWithWhereUniqueWithoutUserInput = {
    where: SessionWhereUniqueInput
    data: XOR<SessionUpdateWithoutUserInput, SessionUncheckedUpdateWithoutUserInput>
  }

  export type SessionUpdateManyWithWhereWithoutUserInput = {
    where: SessionScalarWhereInput
    data: XOR<SessionUpdateManyMutationInput, SessionUncheckedUpdateManyWithoutUserInput>
  }

  export type SessionScalarWhereInput = {
    AND?: SessionScalarWhereInput | SessionScalarWhereInput[]
    OR?: SessionScalarWhereInput[]
    NOT?: SessionScalarWhereInput | SessionScalarWhereInput[]
    id?: StringFilter<"Session"> | string
    sessionToken?: StringFilter<"Session"> | string
    userId?: StringFilter<"Session"> | string
    expires?: DateTimeFilter<"Session"> | Date | string
  }

  export type OrderUpsertWithWhereUniqueWithoutUserInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutUserInput, OrderUncheckedUpdateWithoutUserInput>
    create: XOR<OrderCreateWithoutUserInput, OrderUncheckedCreateWithoutUserInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutUserInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutUserInput, OrderUncheckedUpdateWithoutUserInput>
  }

  export type OrderUpdateManyWithWhereWithoutUserInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutUserInput>
  }

  export type OrderScalarWhereInput = {
    AND?: OrderScalarWhereInput | OrderScalarWhereInput[]
    OR?: OrderScalarWhereInput[]
    NOT?: OrderScalarWhereInput | OrderScalarWhereInput[]
    id?: StringFilter<"Order"> | string
    brandId?: StringFilter<"Order"> | string
    occasionId?: StringFilter<"Order"> | string
    amount?: IntFilter<"Order"> | number
    message?: StringFilter<"Order"> | string
    isActive?: BoolFilter<"Order"> | boolean
    sendType?: EnumSendStatusFilter<"Order"> | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFilter<"Order"> | $Enums.deliveryMethodStatus
    receiverId?: StringFilter<"Order"> | string
    senderId?: StringFilter<"Order"> | string
    giftCode?: StringFilter<"Order"> | string
    orderNumber?: StringFilter<"Order"> | string
    paymentMethod?: EnumpaymentStatusFilter<"Order"> | $Enums.paymentStatus
    totalAmount?: IntNullableFilter<"Order"> | number | null
    redemptionStatus?: EnumRedemptionStatusFilter<"Order"> | $Enums.RedemptionStatus
    timeStemp?: DateTimeFilter<"Order"> | Date | string
  }

  export type UserCreateWithoutSessionsInput = {
    id?: string
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    avatar?: string | null
    role?: string | null
    isActive?: boolean
    isVerify?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    order?: OrderCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSessionsInput = {
    id?: string
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    avatar?: string | null
    role?: string | null
    isActive?: boolean
    isVerify?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    order?: OrderUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSessionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
  }

  export type UserUpsertWithoutSessionsInput = {
    update: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
    create: XOR<UserCreateWithoutSessionsInput, UserUncheckedCreateWithoutSessionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSessionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSessionsInput, UserUncheckedUpdateWithoutSessionsInput>
  }

  export type UserUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isVerify?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isVerify?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUncheckedUpdateManyWithoutUserNestedInput
  }

  export type CategoriesCreateWithoutBrandsInput = {
    id?: string
    name: string
  }

  export type CategoriesUncheckedCreateWithoutBrandsInput = {
    id?: string
    name: string
  }

  export type CategoriesCreateOrConnectWithoutBrandsInput = {
    where: CategoriesWhereUniqueInput
    create: XOR<CategoriesCreateWithoutBrandsInput, CategoriesUncheckedCreateWithoutBrandsInput>
  }

  export type BrandContactsCreateWithoutBrandsInput = {
    id?: string
    name: string
    role: string
    email: string
    phone: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandContactsUncheckedCreateWithoutBrandsInput = {
    id?: string
    name: string
    role: string
    email: string
    phone: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandContactsCreateOrConnectWithoutBrandsInput = {
    where: BrandContactsWhereUniqueInput
    create: XOR<BrandContactsCreateWithoutBrandsInput, BrandContactsUncheckedCreateWithoutBrandsInput>
  }

  export type BrandContactsCreateManyBrandsInputEnvelope = {
    data: BrandContactsCreateManyBrandsInput | BrandContactsCreateManyBrandsInput[]
    skipDuplicates?: boolean
  }

  export type BrandTermsCreateWithoutBrandsInput = {
    id?: string
    settelementTrigger?: $Enums.SettelmentStatus
    commissionType?: $Enums.CommissionStatus
    commissionValue?: number
    currency: string
    discount?: number | null
    orderValue?: number | null
    contractStart: Date | string
    contractEnd: Date | string
    goLiveDate: Date | string
    renewContract?: boolean
    brackingPolicy?: $Enums.PolicyStatus
    brackingShare?: number | null
    vatRate?: number | null
    internalNotes: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandTermsUncheckedCreateWithoutBrandsInput = {
    id?: string
    settelementTrigger?: $Enums.SettelmentStatus
    commissionType?: $Enums.CommissionStatus
    commissionValue?: number
    currency: string
    discount?: number | null
    orderValue?: number | null
    contractStart: Date | string
    contractEnd: Date | string
    goLiveDate: Date | string
    renewContract?: boolean
    brackingPolicy?: $Enums.PolicyStatus
    brackingShare?: number | null
    vatRate?: number | null
    internalNotes: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandTermsCreateOrConnectWithoutBrandsInput = {
    where: BrandTermsWhereUniqueInput
    create: XOR<BrandTermsCreateWithoutBrandsInput, BrandTermsUncheckedCreateWithoutBrandsInput>
  }

  export type BrandTermsCreateManyBrandsInputEnvelope = {
    data: BrandTermsCreateManyBrandsInput | BrandTermsCreateManyBrandsInput[]
    skipDuplicates?: boolean
  }

  export type BrandBankingCreateWithoutBrandsInput = {
    id?: string
    settlementFrequency?: $Enums.SettlementFrequencyStatus
    dayOfMonth?: number | null
    payoutMethod?: $Enums.payoutMethodStatus
    invoiceRequired?: boolean
    remittanceEmail: string
    accountHolder: string
    accountNumber: string
    branchCode: string
    bankName: string
    SWIFTCode: string
    country: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandBankingUncheckedCreateWithoutBrandsInput = {
    id?: string
    settlementFrequency?: $Enums.SettlementFrequencyStatus
    dayOfMonth?: number | null
    payoutMethod?: $Enums.payoutMethodStatus
    invoiceRequired?: boolean
    remittanceEmail: string
    accountHolder: string
    accountNumber: string
    branchCode: string
    bankName: string
    SWIFTCode: string
    country: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandBankingCreateOrConnectWithoutBrandsInput = {
    where: BrandBankingWhereUniqueInput
    create: XOR<BrandBankingCreateWithoutBrandsInput, BrandBankingUncheckedCreateWithoutBrandsInput>
  }

  export type BrandBankingCreateManyBrandsInputEnvelope = {
    data: BrandBankingCreateManyBrandsInput | BrandBankingCreateManyBrandsInput[]
    skipDuplicates?: boolean
  }

  export type VouchersCreateWithoutBrandsInput = {
    id?: string
    denominationype?: $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: number | null
    minAmount?: number | null
    expiryPolicy?: $Enums.expiryPolicyStatus
    expiryValue: string
    graceDays?: number | null
    redemptionChannels?: string | null
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: number | null
    termsConditionsURL?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VouchersUncheckedCreateWithoutBrandsInput = {
    id?: string
    denominationype?: $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: number | null
    minAmount?: number | null
    expiryPolicy?: $Enums.expiryPolicyStatus
    expiryValue: string
    graceDays?: number | null
    redemptionChannels?: string | null
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: number | null
    termsConditionsURL?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VouchersCreateOrConnectWithoutBrandsInput = {
    where: VouchersWhereUniqueInput
    create: XOR<VouchersCreateWithoutBrandsInput, VouchersUncheckedCreateWithoutBrandsInput>
  }

  export type VouchersCreateManyBrandsInputEnvelope = {
    data: VouchersCreateManyBrandsInput | VouchersCreateManyBrandsInput[]
    skipDuplicates?: boolean
  }

  export type OrderCreateWithoutBrandsInput = {
    id?: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
    receiverDetails: ReceiverDetailCreateNestedOneWithoutOrderInput
    occasions: OccasionCreateNestedOneWithoutOrderInput
    user: UserCreateNestedOneWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutBrandsInput = {
    id?: string
    occasionId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    receiverId: string
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type OrderCreateOrConnectWithoutBrandsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutBrandsInput, OrderUncheckedCreateWithoutBrandsInput>
  }

  export type OrderCreateManyBrandsInputEnvelope = {
    data: OrderCreateManyBrandsInput | OrderCreateManyBrandsInput[]
    skipDuplicates?: boolean
  }

  export type SettlementsCreateWithoutBrandsInput = {
    id?: string
    totalSold: number
    Redeemed: string
    Outstanding?: number | null
    settlementTerms: string
    Amount?: number | null
    lastPayment: Date | string
    status?: $Enums.Status
  }

  export type SettlementsUncheckedCreateWithoutBrandsInput = {
    id?: string
    totalSold: number
    Redeemed: string
    Outstanding?: number | null
    settlementTerms: string
    Amount?: number | null
    lastPayment: Date | string
    status?: $Enums.Status
  }

  export type SettlementsCreateOrConnectWithoutBrandsInput = {
    where: SettlementsWhereUniqueInput
    create: XOR<SettlementsCreateWithoutBrandsInput, SettlementsUncheckedCreateWithoutBrandsInput>
  }

  export type SettlementsCreateManyBrandsInputEnvelope = {
    data: SettlementsCreateManyBrandsInput | SettlementsCreateManyBrandsInput[]
    skipDuplicates?: boolean
  }

  export type CategoriesUpsertWithoutBrandsInput = {
    update: XOR<CategoriesUpdateWithoutBrandsInput, CategoriesUncheckedUpdateWithoutBrandsInput>
    create: XOR<CategoriesCreateWithoutBrandsInput, CategoriesUncheckedCreateWithoutBrandsInput>
    where?: CategoriesWhereInput
  }

  export type CategoriesUpdateToOneWithWhereWithoutBrandsInput = {
    where?: CategoriesWhereInput
    data: XOR<CategoriesUpdateWithoutBrandsInput, CategoriesUncheckedUpdateWithoutBrandsInput>
  }

  export type CategoriesUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type CategoriesUncheckedUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type BrandContactsUpsertWithWhereUniqueWithoutBrandsInput = {
    where: BrandContactsWhereUniqueInput
    update: XOR<BrandContactsUpdateWithoutBrandsInput, BrandContactsUncheckedUpdateWithoutBrandsInput>
    create: XOR<BrandContactsCreateWithoutBrandsInput, BrandContactsUncheckedCreateWithoutBrandsInput>
  }

  export type BrandContactsUpdateWithWhereUniqueWithoutBrandsInput = {
    where: BrandContactsWhereUniqueInput
    data: XOR<BrandContactsUpdateWithoutBrandsInput, BrandContactsUncheckedUpdateWithoutBrandsInput>
  }

  export type BrandContactsUpdateManyWithWhereWithoutBrandsInput = {
    where: BrandContactsScalarWhereInput
    data: XOR<BrandContactsUpdateManyMutationInput, BrandContactsUncheckedUpdateManyWithoutBrandsInput>
  }

  export type BrandContactsScalarWhereInput = {
    AND?: BrandContactsScalarWhereInput | BrandContactsScalarWhereInput[]
    OR?: BrandContactsScalarWhereInput[]
    NOT?: BrandContactsScalarWhereInput | BrandContactsScalarWhereInput[]
    id?: StringFilter<"BrandContacts"> | string
    name?: StringFilter<"BrandContacts"> | string
    role?: StringFilter<"BrandContacts"> | string
    email?: StringFilter<"BrandContacts"> | string
    phone?: StringFilter<"BrandContacts"> | string
    brandId?: StringFilter<"BrandContacts"> | string
    createdAt?: DateTimeFilter<"BrandContacts"> | Date | string
    updatedAt?: DateTimeFilter<"BrandContacts"> | Date | string
  }

  export type BrandTermsUpsertWithWhereUniqueWithoutBrandsInput = {
    where: BrandTermsWhereUniqueInput
    update: XOR<BrandTermsUpdateWithoutBrandsInput, BrandTermsUncheckedUpdateWithoutBrandsInput>
    create: XOR<BrandTermsCreateWithoutBrandsInput, BrandTermsUncheckedCreateWithoutBrandsInput>
  }

  export type BrandTermsUpdateWithWhereUniqueWithoutBrandsInput = {
    where: BrandTermsWhereUniqueInput
    data: XOR<BrandTermsUpdateWithoutBrandsInput, BrandTermsUncheckedUpdateWithoutBrandsInput>
  }

  export type BrandTermsUpdateManyWithWhereWithoutBrandsInput = {
    where: BrandTermsScalarWhereInput
    data: XOR<BrandTermsUpdateManyMutationInput, BrandTermsUncheckedUpdateManyWithoutBrandsInput>
  }

  export type BrandTermsScalarWhereInput = {
    AND?: BrandTermsScalarWhereInput | BrandTermsScalarWhereInput[]
    OR?: BrandTermsScalarWhereInput[]
    NOT?: BrandTermsScalarWhereInput | BrandTermsScalarWhereInput[]
    id?: StringFilter<"BrandTerms"> | string
    settelementTrigger?: EnumSettelmentStatusFilter<"BrandTerms"> | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFilter<"BrandTerms"> | $Enums.CommissionStatus
    commissionValue?: IntFilter<"BrandTerms"> | number
    currency?: StringFilter<"BrandTerms"> | string
    discount?: IntNullableFilter<"BrandTerms"> | number | null
    orderValue?: IntNullableFilter<"BrandTerms"> | number | null
    contractStart?: DateTimeFilter<"BrandTerms"> | Date | string
    contractEnd?: DateTimeFilter<"BrandTerms"> | Date | string
    goLiveDate?: DateTimeFilter<"BrandTerms"> | Date | string
    renewContract?: BoolFilter<"BrandTerms"> | boolean
    brackingPolicy?: EnumPolicyStatusFilter<"BrandTerms"> | $Enums.PolicyStatus
    brackingShare?: IntNullableFilter<"BrandTerms"> | number | null
    vatRate?: IntNullableFilter<"BrandTerms"> | number | null
    internalNotes?: StringFilter<"BrandTerms"> | string
    brandId?: StringFilter<"BrandTerms"> | string
    createdAt?: DateTimeFilter<"BrandTerms"> | Date | string
    updatedAt?: DateTimeFilter<"BrandTerms"> | Date | string
  }

  export type BrandBankingUpsertWithWhereUniqueWithoutBrandsInput = {
    where: BrandBankingWhereUniqueInput
    update: XOR<BrandBankingUpdateWithoutBrandsInput, BrandBankingUncheckedUpdateWithoutBrandsInput>
    create: XOR<BrandBankingCreateWithoutBrandsInput, BrandBankingUncheckedCreateWithoutBrandsInput>
  }

  export type BrandBankingUpdateWithWhereUniqueWithoutBrandsInput = {
    where: BrandBankingWhereUniqueInput
    data: XOR<BrandBankingUpdateWithoutBrandsInput, BrandBankingUncheckedUpdateWithoutBrandsInput>
  }

  export type BrandBankingUpdateManyWithWhereWithoutBrandsInput = {
    where: BrandBankingScalarWhereInput
    data: XOR<BrandBankingUpdateManyMutationInput, BrandBankingUncheckedUpdateManyWithoutBrandsInput>
  }

  export type BrandBankingScalarWhereInput = {
    AND?: BrandBankingScalarWhereInput | BrandBankingScalarWhereInput[]
    OR?: BrandBankingScalarWhereInput[]
    NOT?: BrandBankingScalarWhereInput | BrandBankingScalarWhereInput[]
    id?: StringFilter<"BrandBanking"> | string
    settlementFrequency?: EnumSettlementFrequencyStatusFilter<"BrandBanking"> | $Enums.SettlementFrequencyStatus
    dayOfMonth?: IntNullableFilter<"BrandBanking"> | number | null
    payoutMethod?: EnumpayoutMethodStatusFilter<"BrandBanking"> | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFilter<"BrandBanking"> | boolean
    remittanceEmail?: StringFilter<"BrandBanking"> | string
    accountHolder?: StringFilter<"BrandBanking"> | string
    accountNumber?: StringFilter<"BrandBanking"> | string
    branchCode?: StringFilter<"BrandBanking"> | string
    bankName?: StringFilter<"BrandBanking"> | string
    SWIFTCode?: StringFilter<"BrandBanking"> | string
    country?: StringFilter<"BrandBanking"> | string
    brandId?: StringFilter<"BrandBanking"> | string
    createdAt?: DateTimeFilter<"BrandBanking"> | Date | string
    updatedAt?: DateTimeFilter<"BrandBanking"> | Date | string
  }

  export type VouchersUpsertWithWhereUniqueWithoutBrandsInput = {
    where: VouchersWhereUniqueInput
    update: XOR<VouchersUpdateWithoutBrandsInput, VouchersUncheckedUpdateWithoutBrandsInput>
    create: XOR<VouchersCreateWithoutBrandsInput, VouchersUncheckedCreateWithoutBrandsInput>
  }

  export type VouchersUpdateWithWhereUniqueWithoutBrandsInput = {
    where: VouchersWhereUniqueInput
    data: XOR<VouchersUpdateWithoutBrandsInput, VouchersUncheckedUpdateWithoutBrandsInput>
  }

  export type VouchersUpdateManyWithWhereWithoutBrandsInput = {
    where: VouchersScalarWhereInput
    data: XOR<VouchersUpdateManyMutationInput, VouchersUncheckedUpdateManyWithoutBrandsInput>
  }

  export type VouchersScalarWhereInput = {
    AND?: VouchersScalarWhereInput | VouchersScalarWhereInput[]
    OR?: VouchersScalarWhereInput[]
    NOT?: VouchersScalarWhereInput | VouchersScalarWhereInput[]
    id?: StringFilter<"Vouchers"> | string
    denominationype?: EnumDenominationStatusFilter<"Vouchers"> | $Enums.DenominationStatus
    addDenomination?: JsonNullableFilter<"Vouchers">
    maxAmount?: IntNullableFilter<"Vouchers"> | number | null
    minAmount?: IntNullableFilter<"Vouchers"> | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFilter<"Vouchers"> | $Enums.expiryPolicyStatus
    expiryValue?: StringFilter<"Vouchers"> | string
    graceDays?: IntNullableFilter<"Vouchers"> | number | null
    redemptionChannels?: StringNullableFilter<"Vouchers"> | string | null
    partialRedemption?: BoolFilter<"Vouchers"> | boolean
    Stackable?: BoolFilter<"Vouchers"> | boolean
    userPerDay?: IntNullableFilter<"Vouchers"> | number | null
    termsConditionsURL?: StringNullableFilter<"Vouchers"> | string | null
    brandId?: StringFilter<"Vouchers"> | string
    createdAt?: DateTimeFilter<"Vouchers"> | Date | string
    updatedAt?: DateTimeFilter<"Vouchers"> | Date | string
  }

  export type OrderUpsertWithWhereUniqueWithoutBrandsInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutBrandsInput, OrderUncheckedUpdateWithoutBrandsInput>
    create: XOR<OrderCreateWithoutBrandsInput, OrderUncheckedCreateWithoutBrandsInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutBrandsInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutBrandsInput, OrderUncheckedUpdateWithoutBrandsInput>
  }

  export type OrderUpdateManyWithWhereWithoutBrandsInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutBrandsInput>
  }

  export type SettlementsUpsertWithWhereUniqueWithoutBrandsInput = {
    where: SettlementsWhereUniqueInput
    update: XOR<SettlementsUpdateWithoutBrandsInput, SettlementsUncheckedUpdateWithoutBrandsInput>
    create: XOR<SettlementsCreateWithoutBrandsInput, SettlementsUncheckedCreateWithoutBrandsInput>
  }

  export type SettlementsUpdateWithWhereUniqueWithoutBrandsInput = {
    where: SettlementsWhereUniqueInput
    data: XOR<SettlementsUpdateWithoutBrandsInput, SettlementsUncheckedUpdateWithoutBrandsInput>
  }

  export type SettlementsUpdateManyWithWhereWithoutBrandsInput = {
    where: SettlementsScalarWhereInput
    data: XOR<SettlementsUpdateManyMutationInput, SettlementsUncheckedUpdateManyWithoutBrandsInput>
  }

  export type SettlementsScalarWhereInput = {
    AND?: SettlementsScalarWhereInput | SettlementsScalarWhereInput[]
    OR?: SettlementsScalarWhereInput[]
    NOT?: SettlementsScalarWhereInput | SettlementsScalarWhereInput[]
    id?: StringFilter<"Settlements"> | string
    brandId?: StringFilter<"Settlements"> | string
    totalSold?: IntFilter<"Settlements"> | number
    Redeemed?: StringFilter<"Settlements"> | string
    Outstanding?: IntNullableFilter<"Settlements"> | number | null
    settlementTerms?: StringFilter<"Settlements"> | string
    Amount?: IntNullableFilter<"Settlements"> | number | null
    lastPayment?: DateTimeFilter<"Settlements"> | Date | string
    status?: EnumStatusFilter<"Settlements"> | $Enums.Status
  }

  export type BrandCreateWithoutBrandcontactsInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    categories: CategoriesCreateNestedOneWithoutBrandsInput
    brandTerms?: BrandTermsCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersCreateNestedManyWithoutBrandsInput
    order?: OrderCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsCreateNestedManyWithoutBrandsInput
  }

  export type BrandUncheckedCreateWithoutBrandcontactsInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandTerms?: BrandTermsUncheckedCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingUncheckedCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersUncheckedCreateNestedManyWithoutBrandsInput
    order?: OrderUncheckedCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsUncheckedCreateNestedManyWithoutBrandsInput
  }

  export type BrandCreateOrConnectWithoutBrandcontactsInput = {
    where: BrandWhereUniqueInput
    create: XOR<BrandCreateWithoutBrandcontactsInput, BrandUncheckedCreateWithoutBrandcontactsInput>
  }

  export type BrandUpsertWithoutBrandcontactsInput = {
    update: XOR<BrandUpdateWithoutBrandcontactsInput, BrandUncheckedUpdateWithoutBrandcontactsInput>
    create: XOR<BrandCreateWithoutBrandcontactsInput, BrandUncheckedCreateWithoutBrandcontactsInput>
    where?: BrandWhereInput
  }

  export type BrandUpdateToOneWithWhereWithoutBrandcontactsInput = {
    where?: BrandWhereInput
    data: XOR<BrandUpdateWithoutBrandcontactsInput, BrandUncheckedUpdateWithoutBrandcontactsInput>
  }

  export type BrandUpdateWithoutBrandcontactsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    categories?: CategoriesUpdateOneRequiredWithoutBrandsNestedInput
    brandTerms?: BrandTermsUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUpdateManyWithoutBrandsNestedInput
    order?: OrderUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateWithoutBrandcontactsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandTerms?: BrandTermsUncheckedUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUncheckedUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUncheckedUpdateManyWithoutBrandsNestedInput
    order?: OrderUncheckedUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUncheckedUpdateManyWithoutBrandsNestedInput
  }

  export type BrandCreateWithoutBrandTermsInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    categories: CategoriesCreateNestedOneWithoutBrandsInput
    brandcontacts?: BrandContactsCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersCreateNestedManyWithoutBrandsInput
    order?: OrderCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsCreateNestedManyWithoutBrandsInput
  }

  export type BrandUncheckedCreateWithoutBrandTermsInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandcontacts?: BrandContactsUncheckedCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingUncheckedCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersUncheckedCreateNestedManyWithoutBrandsInput
    order?: OrderUncheckedCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsUncheckedCreateNestedManyWithoutBrandsInput
  }

  export type BrandCreateOrConnectWithoutBrandTermsInput = {
    where: BrandWhereUniqueInput
    create: XOR<BrandCreateWithoutBrandTermsInput, BrandUncheckedCreateWithoutBrandTermsInput>
  }

  export type BrandUpsertWithoutBrandTermsInput = {
    update: XOR<BrandUpdateWithoutBrandTermsInput, BrandUncheckedUpdateWithoutBrandTermsInput>
    create: XOR<BrandCreateWithoutBrandTermsInput, BrandUncheckedCreateWithoutBrandTermsInput>
    where?: BrandWhereInput
  }

  export type BrandUpdateToOneWithWhereWithoutBrandTermsInput = {
    where?: BrandWhereInput
    data: XOR<BrandUpdateWithoutBrandTermsInput, BrandUncheckedUpdateWithoutBrandTermsInput>
  }

  export type BrandUpdateWithoutBrandTermsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    categories?: CategoriesUpdateOneRequiredWithoutBrandsNestedInput
    brandcontacts?: BrandContactsUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUpdateManyWithoutBrandsNestedInput
    order?: OrderUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateWithoutBrandTermsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandcontacts?: BrandContactsUncheckedUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUncheckedUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUncheckedUpdateManyWithoutBrandsNestedInput
    order?: OrderUncheckedUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUncheckedUpdateManyWithoutBrandsNestedInput
  }

  export type BrandCreateWithoutVouchersInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    categories: CategoriesCreateNestedOneWithoutBrandsInput
    brandcontacts?: BrandContactsCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingCreateNestedManyWithoutBrandsInput
    order?: OrderCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsCreateNestedManyWithoutBrandsInput
  }

  export type BrandUncheckedCreateWithoutVouchersInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandcontacts?: BrandContactsUncheckedCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsUncheckedCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingUncheckedCreateNestedManyWithoutBrandsInput
    order?: OrderUncheckedCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsUncheckedCreateNestedManyWithoutBrandsInput
  }

  export type BrandCreateOrConnectWithoutVouchersInput = {
    where: BrandWhereUniqueInput
    create: XOR<BrandCreateWithoutVouchersInput, BrandUncheckedCreateWithoutVouchersInput>
  }

  export type BrandUpsertWithoutVouchersInput = {
    update: XOR<BrandUpdateWithoutVouchersInput, BrandUncheckedUpdateWithoutVouchersInput>
    create: XOR<BrandCreateWithoutVouchersInput, BrandUncheckedCreateWithoutVouchersInput>
    where?: BrandWhereInput
  }

  export type BrandUpdateToOneWithWhereWithoutVouchersInput = {
    where?: BrandWhereInput
    data: XOR<BrandUpdateWithoutVouchersInput, BrandUncheckedUpdateWithoutVouchersInput>
  }

  export type BrandUpdateWithoutVouchersInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    categories?: CategoriesUpdateOneRequiredWithoutBrandsNestedInput
    brandcontacts?: BrandContactsUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUpdateManyWithoutBrandsNestedInput
    order?: OrderUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateWithoutVouchersInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandcontacts?: BrandContactsUncheckedUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUncheckedUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUncheckedUpdateManyWithoutBrandsNestedInput
    order?: OrderUncheckedUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUncheckedUpdateManyWithoutBrandsNestedInput
  }

  export type BrandCreateWithoutBrandBankingsInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    categories: CategoriesCreateNestedOneWithoutBrandsInput
    brandcontacts?: BrandContactsCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersCreateNestedManyWithoutBrandsInput
    order?: OrderCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsCreateNestedManyWithoutBrandsInput
  }

  export type BrandUncheckedCreateWithoutBrandBankingsInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandcontacts?: BrandContactsUncheckedCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsUncheckedCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersUncheckedCreateNestedManyWithoutBrandsInput
    order?: OrderUncheckedCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsUncheckedCreateNestedManyWithoutBrandsInput
  }

  export type BrandCreateOrConnectWithoutBrandBankingsInput = {
    where: BrandWhereUniqueInput
    create: XOR<BrandCreateWithoutBrandBankingsInput, BrandUncheckedCreateWithoutBrandBankingsInput>
  }

  export type BrandUpsertWithoutBrandBankingsInput = {
    update: XOR<BrandUpdateWithoutBrandBankingsInput, BrandUncheckedUpdateWithoutBrandBankingsInput>
    create: XOR<BrandCreateWithoutBrandBankingsInput, BrandUncheckedCreateWithoutBrandBankingsInput>
    where?: BrandWhereInput
  }

  export type BrandUpdateToOneWithWhereWithoutBrandBankingsInput = {
    where?: BrandWhereInput
    data: XOR<BrandUpdateWithoutBrandBankingsInput, BrandUncheckedUpdateWithoutBrandBankingsInput>
  }

  export type BrandUpdateWithoutBrandBankingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    categories?: CategoriesUpdateOneRequiredWithoutBrandsNestedInput
    brandcontacts?: BrandContactsUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUpdateManyWithoutBrandsNestedInput
    order?: OrderUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateWithoutBrandBankingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandcontacts?: BrandContactsUncheckedUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUncheckedUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUncheckedUpdateManyWithoutBrandsNestedInput
    order?: OrderUncheckedUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUncheckedUpdateManyWithoutBrandsNestedInput
  }

  export type OccasionCategoryCreateWithoutOccasionsInput = {
    id?: string
    name: string
    description: string
    emoji: string
    image: string
    isActive?: boolean
  }

  export type OccasionCategoryUncheckedCreateWithoutOccasionsInput = {
    id?: string
    name: string
    description: string
    emoji: string
    image: string
    isActive?: boolean
  }

  export type OccasionCategoryCreateOrConnectWithoutOccasionsInput = {
    where: OccasionCategoryWhereUniqueInput
    create: XOR<OccasionCategoryCreateWithoutOccasionsInput, OccasionCategoryUncheckedCreateWithoutOccasionsInput>
  }

  export type OccasionCategoryCreateManyOccasionsInputEnvelope = {
    data: OccasionCategoryCreateManyOccasionsInput | OccasionCategoryCreateManyOccasionsInput[]
    skipDuplicates?: boolean
  }

  export type OrderCreateWithoutOccasionsInput = {
    id?: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
    receiverDetails: ReceiverDetailCreateNestedOneWithoutOrderInput
    brands: BrandCreateNestedOneWithoutOrderInput
    user: UserCreateNestedOneWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutOccasionsInput = {
    id?: string
    brandId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    receiverId: string
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type OrderCreateOrConnectWithoutOccasionsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutOccasionsInput, OrderUncheckedCreateWithoutOccasionsInput>
  }

  export type OrderCreateManyOccasionsInputEnvelope = {
    data: OrderCreateManyOccasionsInput | OrderCreateManyOccasionsInput[]
    skipDuplicates?: boolean
  }

  export type OccasionCategoryUpsertWithWhereUniqueWithoutOccasionsInput = {
    where: OccasionCategoryWhereUniqueInput
    update: XOR<OccasionCategoryUpdateWithoutOccasionsInput, OccasionCategoryUncheckedUpdateWithoutOccasionsInput>
    create: XOR<OccasionCategoryCreateWithoutOccasionsInput, OccasionCategoryUncheckedCreateWithoutOccasionsInput>
  }

  export type OccasionCategoryUpdateWithWhereUniqueWithoutOccasionsInput = {
    where: OccasionCategoryWhereUniqueInput
    data: XOR<OccasionCategoryUpdateWithoutOccasionsInput, OccasionCategoryUncheckedUpdateWithoutOccasionsInput>
  }

  export type OccasionCategoryUpdateManyWithWhereWithoutOccasionsInput = {
    where: OccasionCategoryScalarWhereInput
    data: XOR<OccasionCategoryUpdateManyMutationInput, OccasionCategoryUncheckedUpdateManyWithoutOccasionsInput>
  }

  export type OccasionCategoryScalarWhereInput = {
    AND?: OccasionCategoryScalarWhereInput | OccasionCategoryScalarWhereInput[]
    OR?: OccasionCategoryScalarWhereInput[]
    NOT?: OccasionCategoryScalarWhereInput | OccasionCategoryScalarWhereInput[]
    id?: StringFilter<"OccasionCategory"> | string
    name?: StringFilter<"OccasionCategory"> | string
    description?: StringFilter<"OccasionCategory"> | string
    emoji?: StringFilter<"OccasionCategory"> | string
    image?: StringFilter<"OccasionCategory"> | string
    isActive?: BoolFilter<"OccasionCategory"> | boolean
    occasionId?: StringFilter<"OccasionCategory"> | string
  }

  export type OrderUpsertWithWhereUniqueWithoutOccasionsInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutOccasionsInput, OrderUncheckedUpdateWithoutOccasionsInput>
    create: XOR<OrderCreateWithoutOccasionsInput, OrderUncheckedCreateWithoutOccasionsInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutOccasionsInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutOccasionsInput, OrderUncheckedUpdateWithoutOccasionsInput>
  }

  export type OrderUpdateManyWithWhereWithoutOccasionsInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutOccasionsInput>
  }

  export type OccasionCreateWithoutOccasionCategoryInput = {
    id?: string
    name: string
    emoji: string
    description: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    order?: OrderCreateNestedManyWithoutOccasionsInput
  }

  export type OccasionUncheckedCreateWithoutOccasionCategoryInput = {
    id?: string
    name: string
    emoji: string
    description: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    order?: OrderUncheckedCreateNestedManyWithoutOccasionsInput
  }

  export type OccasionCreateOrConnectWithoutOccasionCategoryInput = {
    where: OccasionWhereUniqueInput
    create: XOR<OccasionCreateWithoutOccasionCategoryInput, OccasionUncheckedCreateWithoutOccasionCategoryInput>
  }

  export type OccasionUpsertWithoutOccasionCategoryInput = {
    update: XOR<OccasionUpdateWithoutOccasionCategoryInput, OccasionUncheckedUpdateWithoutOccasionCategoryInput>
    create: XOR<OccasionCreateWithoutOccasionCategoryInput, OccasionUncheckedCreateWithoutOccasionCategoryInput>
    where?: OccasionWhereInput
  }

  export type OccasionUpdateToOneWithWhereWithoutOccasionCategoryInput = {
    where?: OccasionWhereInput
    data: XOR<OccasionUpdateWithoutOccasionCategoryInput, OccasionUncheckedUpdateWithoutOccasionCategoryInput>
  }

  export type OccasionUpdateWithoutOccasionCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateManyWithoutOccasionsNestedInput
  }

  export type OccasionUncheckedUpdateWithoutOccasionCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUncheckedUpdateManyWithoutOccasionsNestedInput
  }

  export type BrandCreateWithoutCategoriesInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandcontacts?: BrandContactsCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersCreateNestedManyWithoutBrandsInput
    order?: OrderCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsCreateNestedManyWithoutBrandsInput
  }

  export type BrandUncheckedCreateWithoutCategoriesInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandcontacts?: BrandContactsUncheckedCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsUncheckedCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingUncheckedCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersUncheckedCreateNestedManyWithoutBrandsInput
    order?: OrderUncheckedCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsUncheckedCreateNestedManyWithoutBrandsInput
  }

  export type BrandCreateOrConnectWithoutCategoriesInput = {
    where: BrandWhereUniqueInput
    create: XOR<BrandCreateWithoutCategoriesInput, BrandUncheckedCreateWithoutCategoriesInput>
  }

  export type BrandCreateManyCategoriesInputEnvelope = {
    data: BrandCreateManyCategoriesInput | BrandCreateManyCategoriesInput[]
    skipDuplicates?: boolean
  }

  export type BrandUpsertWithWhereUniqueWithoutCategoriesInput = {
    where: BrandWhereUniqueInput
    update: XOR<BrandUpdateWithoutCategoriesInput, BrandUncheckedUpdateWithoutCategoriesInput>
    create: XOR<BrandCreateWithoutCategoriesInput, BrandUncheckedCreateWithoutCategoriesInput>
  }

  export type BrandUpdateWithWhereUniqueWithoutCategoriesInput = {
    where: BrandWhereUniqueInput
    data: XOR<BrandUpdateWithoutCategoriesInput, BrandUncheckedUpdateWithoutCategoriesInput>
  }

  export type BrandUpdateManyWithWhereWithoutCategoriesInput = {
    where: BrandScalarWhereInput
    data: XOR<BrandUpdateManyMutationInput, BrandUncheckedUpdateManyWithoutCategoriesInput>
  }

  export type BrandScalarWhereInput = {
    AND?: BrandScalarWhereInput | BrandScalarWhereInput[]
    OR?: BrandScalarWhereInput[]
    NOT?: BrandScalarWhereInput | BrandScalarWhereInput[]
    id?: StringFilter<"Brand"> | string
    brandName?: StringFilter<"Brand"> | string
    logo?: StringFilter<"Brand"> | string
    description?: StringFilter<"Brand"> | string
    website?: StringFilter<"Brand"> | string
    contact?: StringFilter<"Brand"> | string
    tagline?: StringFilter<"Brand"> | string
    color?: StringFilter<"Brand"> | string
    categoryId?: StringFilter<"Brand"> | string
    isActive?: BoolFilter<"Brand"> | boolean
    isFeature?: BoolFilter<"Brand"> | boolean
    notes?: StringFilter<"Brand"> | string
    createdAt?: DateTimeFilter<"Brand"> | Date | string
    updatedAt?: DateTimeFilter<"Brand"> | Date | string
  }

  export type OrderCreateWithoutReceiverDetailsInput = {
    id?: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
    occasions: OccasionCreateNestedOneWithoutOrderInput
    brands: BrandCreateNestedOneWithoutOrderInput
    user: UserCreateNestedOneWithoutOrderInput
  }

  export type OrderUncheckedCreateWithoutReceiverDetailsInput = {
    id?: string
    brandId: string
    occasionId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type OrderCreateOrConnectWithoutReceiverDetailsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutReceiverDetailsInput, OrderUncheckedCreateWithoutReceiverDetailsInput>
  }

  export type OrderCreateManyReceiverDetailsInputEnvelope = {
    data: OrderCreateManyReceiverDetailsInput | OrderCreateManyReceiverDetailsInput[]
    skipDuplicates?: boolean
  }

  export type OrderUpsertWithWhereUniqueWithoutReceiverDetailsInput = {
    where: OrderWhereUniqueInput
    update: XOR<OrderUpdateWithoutReceiverDetailsInput, OrderUncheckedUpdateWithoutReceiverDetailsInput>
    create: XOR<OrderCreateWithoutReceiverDetailsInput, OrderUncheckedCreateWithoutReceiverDetailsInput>
  }

  export type OrderUpdateWithWhereUniqueWithoutReceiverDetailsInput = {
    where: OrderWhereUniqueInput
    data: XOR<OrderUpdateWithoutReceiverDetailsInput, OrderUncheckedUpdateWithoutReceiverDetailsInput>
  }

  export type OrderUpdateManyWithWhereWithoutReceiverDetailsInput = {
    where: OrderScalarWhereInput
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyWithoutReceiverDetailsInput>
  }

  export type ReceiverDetailCreateWithoutOrderInput = {
    id?: string
    name: string
    phone: string
    email: string
  }

  export type ReceiverDetailUncheckedCreateWithoutOrderInput = {
    id?: string
    name: string
    phone: string
    email: string
  }

  export type ReceiverDetailCreateOrConnectWithoutOrderInput = {
    where: ReceiverDetailWhereUniqueInput
    create: XOR<ReceiverDetailCreateWithoutOrderInput, ReceiverDetailUncheckedCreateWithoutOrderInput>
  }

  export type OccasionCreateWithoutOrderInput = {
    id?: string
    name: string
    emoji: string
    description: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    occasionCategory?: OccasionCategoryCreateNestedManyWithoutOccasionsInput
  }

  export type OccasionUncheckedCreateWithoutOrderInput = {
    id?: string
    name: string
    emoji: string
    description: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    occasionCategory?: OccasionCategoryUncheckedCreateNestedManyWithoutOccasionsInput
  }

  export type OccasionCreateOrConnectWithoutOrderInput = {
    where: OccasionWhereUniqueInput
    create: XOR<OccasionCreateWithoutOrderInput, OccasionUncheckedCreateWithoutOrderInput>
  }

  export type BrandCreateWithoutOrderInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    categories: CategoriesCreateNestedOneWithoutBrandsInput
    brandcontacts?: BrandContactsCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsCreateNestedManyWithoutBrandsInput
  }

  export type BrandUncheckedCreateWithoutOrderInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandcontacts?: BrandContactsUncheckedCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsUncheckedCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingUncheckedCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersUncheckedCreateNestedManyWithoutBrandsInput
    settlements?: SettlementsUncheckedCreateNestedManyWithoutBrandsInput
  }

  export type BrandCreateOrConnectWithoutOrderInput = {
    where: BrandWhereUniqueInput
    create: XOR<BrandCreateWithoutOrderInput, BrandUncheckedCreateWithoutOrderInput>
  }

  export type UserCreateWithoutOrderInput = {
    id?: string
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    avatar?: string | null
    role?: string | null
    isActive?: boolean
    isVerify?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOrderInput = {
    id?: string
    email: string
    phone: string
    firstName: string
    lastName: string
    password: string
    avatar?: string | null
    role?: string | null
    isActive?: boolean
    isVerify?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    sessions?: SessionUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOrderInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOrderInput, UserUncheckedCreateWithoutOrderInput>
  }

  export type ReceiverDetailUpsertWithoutOrderInput = {
    update: XOR<ReceiverDetailUpdateWithoutOrderInput, ReceiverDetailUncheckedUpdateWithoutOrderInput>
    create: XOR<ReceiverDetailCreateWithoutOrderInput, ReceiverDetailUncheckedCreateWithoutOrderInput>
    where?: ReceiverDetailWhereInput
  }

  export type ReceiverDetailUpdateToOneWithWhereWithoutOrderInput = {
    where?: ReceiverDetailWhereInput
    data: XOR<ReceiverDetailUpdateWithoutOrderInput, ReceiverDetailUncheckedUpdateWithoutOrderInput>
  }

  export type ReceiverDetailUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
  }

  export type ReceiverDetailUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
  }

  export type OccasionUpsertWithoutOrderInput = {
    update: XOR<OccasionUpdateWithoutOrderInput, OccasionUncheckedUpdateWithoutOrderInput>
    create: XOR<OccasionCreateWithoutOrderInput, OccasionUncheckedCreateWithoutOrderInput>
    where?: OccasionWhereInput
  }

  export type OccasionUpdateToOneWithWhereWithoutOrderInput = {
    where?: OccasionWhereInput
    data: XOR<OccasionUpdateWithoutOrderInput, OccasionUncheckedUpdateWithoutOrderInput>
  }

  export type OccasionUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occasionCategory?: OccasionCategoryUpdateManyWithoutOccasionsNestedInput
  }

  export type OccasionUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    occasionCategory?: OccasionCategoryUncheckedUpdateManyWithoutOccasionsNestedInput
  }

  export type BrandUpsertWithoutOrderInput = {
    update: XOR<BrandUpdateWithoutOrderInput, BrandUncheckedUpdateWithoutOrderInput>
    create: XOR<BrandCreateWithoutOrderInput, BrandUncheckedCreateWithoutOrderInput>
    where?: BrandWhereInput
  }

  export type BrandUpdateToOneWithWhereWithoutOrderInput = {
    where?: BrandWhereInput
    data: XOR<BrandUpdateWithoutOrderInput, BrandUncheckedUpdateWithoutOrderInput>
  }

  export type BrandUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    categories?: CategoriesUpdateOneRequiredWithoutBrandsNestedInput
    brandcontacts?: BrandContactsUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandcontacts?: BrandContactsUncheckedUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUncheckedUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUncheckedUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUncheckedUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUncheckedUpdateManyWithoutBrandsNestedInput
  }

  export type UserUpsertWithoutOrderInput = {
    update: XOR<UserUpdateWithoutOrderInput, UserUncheckedUpdateWithoutOrderInput>
    create: XOR<UserCreateWithoutOrderInput, UserUncheckedCreateWithoutOrderInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutOrderInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutOrderInput, UserUncheckedUpdateWithoutOrderInput>
  }

  export type UserUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isVerify?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    avatar?: NullableStringFieldUpdateOperationsInput | string | null
    role?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isVerify?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sessions?: SessionUncheckedUpdateManyWithoutUserNestedInput
  }

  export type BrandCreateWithoutSettlementsInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    categories: CategoriesCreateNestedOneWithoutBrandsInput
    brandcontacts?: BrandContactsCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersCreateNestedManyWithoutBrandsInput
    order?: OrderCreateNestedManyWithoutBrandsInput
  }

  export type BrandUncheckedCreateWithoutSettlementsInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    categoryId: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
    brandcontacts?: BrandContactsUncheckedCreateNestedManyWithoutBrandsInput
    brandTerms?: BrandTermsUncheckedCreateNestedManyWithoutBrandsInput
    brandBankings?: BrandBankingUncheckedCreateNestedManyWithoutBrandsInput
    vouchers?: VouchersUncheckedCreateNestedManyWithoutBrandsInput
    order?: OrderUncheckedCreateNestedManyWithoutBrandsInput
  }

  export type BrandCreateOrConnectWithoutSettlementsInput = {
    where: BrandWhereUniqueInput
    create: XOR<BrandCreateWithoutSettlementsInput, BrandUncheckedCreateWithoutSettlementsInput>
  }

  export type BrandUpsertWithoutSettlementsInput = {
    update: XOR<BrandUpdateWithoutSettlementsInput, BrandUncheckedUpdateWithoutSettlementsInput>
    create: XOR<BrandCreateWithoutSettlementsInput, BrandUncheckedCreateWithoutSettlementsInput>
    where?: BrandWhereInput
  }

  export type BrandUpdateToOneWithWhereWithoutSettlementsInput = {
    where?: BrandWhereInput
    data: XOR<BrandUpdateWithoutSettlementsInput, BrandUncheckedUpdateWithoutSettlementsInput>
  }

  export type BrandUpdateWithoutSettlementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    categories?: CategoriesUpdateOneRequiredWithoutBrandsNestedInput
    brandcontacts?: BrandContactsUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUpdateManyWithoutBrandsNestedInput
    order?: OrderUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateWithoutSettlementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandcontacts?: BrandContactsUncheckedUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUncheckedUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUncheckedUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUncheckedUpdateManyWithoutBrandsNestedInput
    order?: OrderUncheckedUpdateManyWithoutBrandsNestedInput
  }

  export type SessionCreateManyUserInput = {
    id?: string
    sessionToken: string
    expires: Date | string
  }

  export type OrderCreateManyUserInput = {
    id?: string
    brandId: string
    occasionId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    receiverId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type SessionUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionToken?: StringFieldUpdateOperationsInput | string
    expires?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
    receiverDetails?: ReceiverDetailUpdateOneRequiredWithoutOrderNestedInput
    occasions?: OccasionUpdateOneRequiredWithoutOrderNestedInput
    brands?: BrandUpdateOneRequiredWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    occasionId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    receiverId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    occasionId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    receiverId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandContactsCreateManyBrandsInput = {
    id?: string
    name: string
    role: string
    email: string
    phone: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandTermsCreateManyBrandsInput = {
    id?: string
    settelementTrigger?: $Enums.SettelmentStatus
    commissionType?: $Enums.CommissionStatus
    commissionValue?: number
    currency: string
    discount?: number | null
    orderValue?: number | null
    contractStart: Date | string
    contractEnd: Date | string
    goLiveDate: Date | string
    renewContract?: boolean
    brackingPolicy?: $Enums.PolicyStatus
    brackingShare?: number | null
    vatRate?: number | null
    internalNotes: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandBankingCreateManyBrandsInput = {
    id?: string
    settlementFrequency?: $Enums.SettlementFrequencyStatus
    dayOfMonth?: number | null
    payoutMethod?: $Enums.payoutMethodStatus
    invoiceRequired?: boolean
    remittanceEmail: string
    accountHolder: string
    accountNumber: string
    branchCode: string
    bankName: string
    SWIFTCode: string
    country: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VouchersCreateManyBrandsInput = {
    id?: string
    denominationype?: $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: number | null
    minAmount?: number | null
    expiryPolicy?: $Enums.expiryPolicyStatus
    expiryValue: string
    graceDays?: number | null
    redemptionChannels?: string | null
    partialRedemption?: boolean
    Stackable?: boolean
    userPerDay?: number | null
    termsConditionsURL?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderCreateManyBrandsInput = {
    id?: string
    occasionId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    receiverId: string
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type SettlementsCreateManyBrandsInput = {
    id?: string
    totalSold: number
    Redeemed: string
    Outstanding?: number | null
    settlementTerms: string
    Amount?: number | null
    lastPayment: Date | string
    status?: $Enums.Status
  }

  export type BrandContactsUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandContactsUncheckedUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandContactsUncheckedUpdateManyWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandTermsUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    settelementTrigger?: EnumSettelmentStatusFieldUpdateOperationsInput | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFieldUpdateOperationsInput | $Enums.CommissionStatus
    commissionValue?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    discount?: NullableIntFieldUpdateOperationsInput | number | null
    orderValue?: NullableIntFieldUpdateOperationsInput | number | null
    contractStart?: DateTimeFieldUpdateOperationsInput | Date | string
    contractEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    goLiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    renewContract?: BoolFieldUpdateOperationsInput | boolean
    brackingPolicy?: EnumPolicyStatusFieldUpdateOperationsInput | $Enums.PolicyStatus
    brackingShare?: NullableIntFieldUpdateOperationsInput | number | null
    vatRate?: NullableIntFieldUpdateOperationsInput | number | null
    internalNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandTermsUncheckedUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    settelementTrigger?: EnumSettelmentStatusFieldUpdateOperationsInput | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFieldUpdateOperationsInput | $Enums.CommissionStatus
    commissionValue?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    discount?: NullableIntFieldUpdateOperationsInput | number | null
    orderValue?: NullableIntFieldUpdateOperationsInput | number | null
    contractStart?: DateTimeFieldUpdateOperationsInput | Date | string
    contractEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    goLiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    renewContract?: BoolFieldUpdateOperationsInput | boolean
    brackingPolicy?: EnumPolicyStatusFieldUpdateOperationsInput | $Enums.PolicyStatus
    brackingShare?: NullableIntFieldUpdateOperationsInput | number | null
    vatRate?: NullableIntFieldUpdateOperationsInput | number | null
    internalNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandTermsUncheckedUpdateManyWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    settelementTrigger?: EnumSettelmentStatusFieldUpdateOperationsInput | $Enums.SettelmentStatus
    commissionType?: EnumCommissionStatusFieldUpdateOperationsInput | $Enums.CommissionStatus
    commissionValue?: IntFieldUpdateOperationsInput | number
    currency?: StringFieldUpdateOperationsInput | string
    discount?: NullableIntFieldUpdateOperationsInput | number | null
    orderValue?: NullableIntFieldUpdateOperationsInput | number | null
    contractStart?: DateTimeFieldUpdateOperationsInput | Date | string
    contractEnd?: DateTimeFieldUpdateOperationsInput | Date | string
    goLiveDate?: DateTimeFieldUpdateOperationsInput | Date | string
    renewContract?: BoolFieldUpdateOperationsInput | boolean
    brackingPolicy?: EnumPolicyStatusFieldUpdateOperationsInput | $Enums.PolicyStatus
    brackingShare?: NullableIntFieldUpdateOperationsInput | number | null
    vatRate?: NullableIntFieldUpdateOperationsInput | number | null
    internalNotes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandBankingUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    settlementFrequency?: EnumSettlementFrequencyStatusFieldUpdateOperationsInput | $Enums.SettlementFrequencyStatus
    dayOfMonth?: NullableIntFieldUpdateOperationsInput | number | null
    payoutMethod?: EnumpayoutMethodStatusFieldUpdateOperationsInput | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFieldUpdateOperationsInput | boolean
    remittanceEmail?: StringFieldUpdateOperationsInput | string
    accountHolder?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    branchCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    SWIFTCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandBankingUncheckedUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    settlementFrequency?: EnumSettlementFrequencyStatusFieldUpdateOperationsInput | $Enums.SettlementFrequencyStatus
    dayOfMonth?: NullableIntFieldUpdateOperationsInput | number | null
    payoutMethod?: EnumpayoutMethodStatusFieldUpdateOperationsInput | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFieldUpdateOperationsInput | boolean
    remittanceEmail?: StringFieldUpdateOperationsInput | string
    accountHolder?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    branchCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    SWIFTCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandBankingUncheckedUpdateManyWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    settlementFrequency?: EnumSettlementFrequencyStatusFieldUpdateOperationsInput | $Enums.SettlementFrequencyStatus
    dayOfMonth?: NullableIntFieldUpdateOperationsInput | number | null
    payoutMethod?: EnumpayoutMethodStatusFieldUpdateOperationsInput | $Enums.payoutMethodStatus
    invoiceRequired?: BoolFieldUpdateOperationsInput | boolean
    remittanceEmail?: StringFieldUpdateOperationsInput | string
    accountHolder?: StringFieldUpdateOperationsInput | string
    accountNumber?: StringFieldUpdateOperationsInput | string
    branchCode?: StringFieldUpdateOperationsInput | string
    bankName?: StringFieldUpdateOperationsInput | string
    SWIFTCode?: StringFieldUpdateOperationsInput | string
    country?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VouchersUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    denominationype?: EnumDenominationStatusFieldUpdateOperationsInput | $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: NullableIntFieldUpdateOperationsInput | number | null
    minAmount?: NullableIntFieldUpdateOperationsInput | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFieldUpdateOperationsInput | $Enums.expiryPolicyStatus
    expiryValue?: StringFieldUpdateOperationsInput | string
    graceDays?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionChannels?: NullableStringFieldUpdateOperationsInput | string | null
    partialRedemption?: BoolFieldUpdateOperationsInput | boolean
    Stackable?: BoolFieldUpdateOperationsInput | boolean
    userPerDay?: NullableIntFieldUpdateOperationsInput | number | null
    termsConditionsURL?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VouchersUncheckedUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    denominationype?: EnumDenominationStatusFieldUpdateOperationsInput | $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: NullableIntFieldUpdateOperationsInput | number | null
    minAmount?: NullableIntFieldUpdateOperationsInput | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFieldUpdateOperationsInput | $Enums.expiryPolicyStatus
    expiryValue?: StringFieldUpdateOperationsInput | string
    graceDays?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionChannels?: NullableStringFieldUpdateOperationsInput | string | null
    partialRedemption?: BoolFieldUpdateOperationsInput | boolean
    Stackable?: BoolFieldUpdateOperationsInput | boolean
    userPerDay?: NullableIntFieldUpdateOperationsInput | number | null
    termsConditionsURL?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VouchersUncheckedUpdateManyWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    denominationype?: EnumDenominationStatusFieldUpdateOperationsInput | $Enums.DenominationStatus
    addDenomination?: NullableJsonNullValueInput | InputJsonValue
    maxAmount?: NullableIntFieldUpdateOperationsInput | number | null
    minAmount?: NullableIntFieldUpdateOperationsInput | number | null
    expiryPolicy?: EnumexpiryPolicyStatusFieldUpdateOperationsInput | $Enums.expiryPolicyStatus
    expiryValue?: StringFieldUpdateOperationsInput | string
    graceDays?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionChannels?: NullableStringFieldUpdateOperationsInput | string | null
    partialRedemption?: BoolFieldUpdateOperationsInput | boolean
    Stackable?: BoolFieldUpdateOperationsInput | boolean
    userPerDay?: NullableIntFieldUpdateOperationsInput | number | null
    termsConditionsURL?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
    receiverDetails?: ReceiverDetailUpdateOneRequiredWithoutOrderNestedInput
    occasions?: OccasionUpdateOneRequiredWithoutOrderNestedInput
    user?: UserUpdateOneRequiredWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    occasionId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    receiverId?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    occasionId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    receiverId?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SettlementsUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalSold?: IntFieldUpdateOperationsInput | number
    Redeemed?: StringFieldUpdateOperationsInput | string
    Outstanding?: NullableIntFieldUpdateOperationsInput | number | null
    settlementTerms?: StringFieldUpdateOperationsInput | string
    Amount?: NullableIntFieldUpdateOperationsInput | number | null
    lastPayment?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
  }

  export type SettlementsUncheckedUpdateWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalSold?: IntFieldUpdateOperationsInput | number
    Redeemed?: StringFieldUpdateOperationsInput | string
    Outstanding?: NullableIntFieldUpdateOperationsInput | number | null
    settlementTerms?: StringFieldUpdateOperationsInput | string
    Amount?: NullableIntFieldUpdateOperationsInput | number | null
    lastPayment?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
  }

  export type SettlementsUncheckedUpdateManyWithoutBrandsInput = {
    id?: StringFieldUpdateOperationsInput | string
    totalSold?: IntFieldUpdateOperationsInput | number
    Redeemed?: StringFieldUpdateOperationsInput | string
    Outstanding?: NullableIntFieldUpdateOperationsInput | number | null
    settlementTerms?: StringFieldUpdateOperationsInput | string
    Amount?: NullableIntFieldUpdateOperationsInput | number | null
    lastPayment?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: EnumStatusFieldUpdateOperationsInput | $Enums.Status
  }

  export type OccasionCategoryCreateManyOccasionsInput = {
    id?: string
    name: string
    description: string
    emoji: string
    image: string
    isActive?: boolean
  }

  export type OrderCreateManyOccasionsInput = {
    id?: string
    brandId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    receiverId: string
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type OccasionCategoryUpdateWithoutOccasionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type OccasionCategoryUncheckedUpdateWithoutOccasionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type OccasionCategoryUncheckedUpdateManyWithoutOccasionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    emoji?: StringFieldUpdateOperationsInput | string
    image?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
  }

  export type OrderUpdateWithoutOccasionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
    receiverDetails?: ReceiverDetailUpdateOneRequiredWithoutOrderNestedInput
    brands?: BrandUpdateOneRequiredWithoutOrderNestedInput
    user?: UserUpdateOneRequiredWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutOccasionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    receiverId?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyWithoutOccasionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    receiverId?: StringFieldUpdateOperationsInput | string
    senderId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BrandCreateManyCategoriesInput = {
    id?: string
    brandName: string
    logo: string
    description: string
    website: string
    contact: string
    tagline: string
    color: string
    isActive?: boolean
    isFeature?: boolean
    notes: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BrandUpdateWithoutCategoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandcontacts?: BrandContactsUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUpdateManyWithoutBrandsNestedInput
    order?: OrderUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateWithoutCategoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    brandcontacts?: BrandContactsUncheckedUpdateManyWithoutBrandsNestedInput
    brandTerms?: BrandTermsUncheckedUpdateManyWithoutBrandsNestedInput
    brandBankings?: BrandBankingUncheckedUpdateManyWithoutBrandsNestedInput
    vouchers?: VouchersUncheckedUpdateManyWithoutBrandsNestedInput
    order?: OrderUncheckedUpdateManyWithoutBrandsNestedInput
    settlements?: SettlementsUncheckedUpdateManyWithoutBrandsNestedInput
  }

  export type BrandUncheckedUpdateManyWithoutCategoriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandName?: StringFieldUpdateOperationsInput | string
    logo?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    website?: StringFieldUpdateOperationsInput | string
    contact?: StringFieldUpdateOperationsInput | string
    tagline?: StringFieldUpdateOperationsInput | string
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    isFeature?: BoolFieldUpdateOperationsInput | boolean
    notes?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateManyReceiverDetailsInput = {
    id?: string
    brandId: string
    occasionId: string
    amount: number
    message: string
    isActive?: boolean
    sendType?: $Enums.SendStatus
    deliveryMethod?: $Enums.deliveryMethodStatus
    senderId: string
    giftCode: string
    orderNumber: string
    paymentMethod?: $Enums.paymentStatus
    totalAmount?: number | null
    redemptionStatus?: $Enums.RedemptionStatus
    timeStemp: Date | string
  }

  export type OrderUpdateWithoutReceiverDetailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
    occasions?: OccasionUpdateOneRequiredWithoutOrderNestedInput
    brands?: BrandUpdateOneRequiredWithoutOrderNestedInput
    user?: UserUpdateOneRequiredWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateWithoutReceiverDetailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    occasionId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    senderId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyWithoutReceiverDetailsInput = {
    id?: StringFieldUpdateOperationsInput | string
    brandId?: StringFieldUpdateOperationsInput | string
    occasionId?: StringFieldUpdateOperationsInput | string
    amount?: IntFieldUpdateOperationsInput | number
    message?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sendType?: EnumSendStatusFieldUpdateOperationsInput | $Enums.SendStatus
    deliveryMethod?: EnumdeliveryMethodStatusFieldUpdateOperationsInput | $Enums.deliveryMethodStatus
    senderId?: StringFieldUpdateOperationsInput | string
    giftCode?: StringFieldUpdateOperationsInput | string
    orderNumber?: StringFieldUpdateOperationsInput | string
    paymentMethod?: EnumpaymentStatusFieldUpdateOperationsInput | $Enums.paymentStatus
    totalAmount?: NullableIntFieldUpdateOperationsInput | number | null
    redemptionStatus?: EnumRedemptionStatusFieldUpdateOperationsInput | $Enums.RedemptionStatus
    timeStemp?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}