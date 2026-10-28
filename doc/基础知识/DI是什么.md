# DI是什么

依赖注入是指类不自己 `new` 依赖，而是由模块按构造函数的参数创建并传入。本仓库的容器是 Nest 的模块。前端使用 Inversify 的 `rootContainer` 和 `@bindAs`，绑定的位置不同，依赖方向相同：用例依赖端口，实现写在 `infra`。

## 目录

- [模块](#模块)
- [单例](#单例)
- [端口怎么绑到实现](#端口怎么绑到实现)
- [全局守卫](#全局守卫)

## 模块

`src/app_module.ts` 的 `AppModule` 引入 `PrismaModule`、`SecurityModule`、`ProjectModule`。功能模块自己的 `*_module.ts` 列出控制器和提供者。

用例标 `@Injectable()`。Nest 看到构造函数参数的类型后，到当前模块的 `providers` 里找这个类型。`SecurityApplication` 需要仓储、口令算法和凭证签发器时，只声明这三个参数。

## 单例

写在 `providers` 里的 `@Injectable()` 类，在这个模块里是一个实例。用例、仓储和 `PrismaService` 使用这一个实例，同一次进程里的请求共用数据库连接和用例。

本仓库没有按请求新建的页面状态。一次请求的调用者放在 `request.user`，不放进用例的字段。

## 端口怎么绑到实现

用例依赖抽象类时，模块默认不能从抽象类创建对象。`providers` 里写明端口对应哪个实现：

```ts
providers: [
  SecurityApplication,
  { provide: IUserRepository, useClass: PrismaUserRepository },
  { provide: PasswordHasher, useClass: BcryptPasswordHasher },
  { provide: TokenIssuer, useClass: JwtTokenIssuer },
];
```

这段在 `src/features/security/security_module.ts`。`ProjectModule` 用同样的写法把 `IProjectRepository` 绑到 `PrismaProjectRepository`。

只在模块里绑定 `infra` 的实现。用例按类本身放进 `providers`。

`PrismaModule` 导出 `PrismaService`。功能模块 `imports: [PrismaModule]` 之后，仓储才能注入它。

## 全局守卫

`SecurityModule` 还有一条：

```ts
{ provide: APP_GUARD, useClass: JwtAuthGuard }
```

`APP_GUARD` 使 `JwtAuthGuard` 对全部路由生效。守卫与 `IUserRepository` 的绑定在同一个模块里，构造函数可以直接注入 `JwtService`、`Reflector` 和 `IUserRepository`。`SecurityModule` 另外导出 `IUserRepository`，其他模块引入它之后才能注入这份端口。

公开路由不靠另一个守卫，而靠路由上的 `@Public()`。守卫读到这个元数据后放行。
