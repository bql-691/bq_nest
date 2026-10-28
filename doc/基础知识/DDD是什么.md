# DDD是什么

这里的 DDD 指领域规则写在领域对象上，再用分层规定代码放在哪一层。本仓库用它来规定功能模块的写法。前端 `bq_react` 的四层名称与这里相同。前端的 `presentation` 是页面和 ViewModel，这里的 `presentation` 是 Controller 和 DTO。

## 目录

- [四层](#四层)
- [聚合](#聚合)
- [端口](#端口)
- [本仓库里怎么落](#本仓库里怎么落)

## 四层

一个功能模块在 `src/features/<name>/` 下按层分目录。

| 层             | 放什么                                               | 不放什么                                |
| -------------- | ---------------------------------------------------- | --------------------------------------- |
| `domain`       | 实体、领域方法、端口                                 | Controller、Prisma、bcrypt、JWT         |
| `application`  | 用例。一次业务动作，例如登录、保存项目               | SQL、响应信封 `{ code, data, message }` |
| `infra`        | 端口的实现。访问数据库或算法库，并把记录收成领域对象 | 路由和 DTO                              |
| `presentation` | Controller、DTO                                      | 口令是否正确、项目归谁                  |

没有内容的层不建空目录。

用例是模块的业务。`SecurityApplication.login` 核对用户并签发凭证。Controller 只把 HTTP 入参交给用例。

## 聚合

服务端的 `Project` 是项目聚合的根。文件：`src/features/project/domain/entities/project_entity.ts`。

| 方法或函数                            | 作用                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------- |
| `assertAccessible(actor)`             | 所有者或持有 `project:write` 的调用者可以通过。否则 404                      |
| `projectFromClient(id, raw, ownerId)` | 收报文。路径 id 与报文 id 不一致时拒绝。缺少文档时补空文档。名称去掉首尾空白 |
| `projectFromRecord(record)`           | 把数据库行收成 `Project`                                                     |
| `plainProject(project)`               | 写出给前端的对象。不含 `ownerId`                                             |

图形放在 `Document.shapes`。线段是 `LineShape`，矩形是 `RectShape`。外部通过 `projectFromClient` 提交整份文档，不单独改某一条图形。

落笔长短、撤销和重做在前端的 `Project` 上。保存到这里时，那些栈不在报文里。

安全模块的领域对象是 `UserEntity`。`passwordHash` 只留在实体和数据库。`toPublic()` 得到 `{ id, username, roles }`。用户名不少于 3 个字符，密码不少于 6 个字符，注册时两次密码相同。这些判断在 `SecurityApplication.register`。

`Actor` 和 `DomainError` 在 `src/app/domain`。它们供多个模块使用，不属于 `UserEntity` 或 `Project`。

## 端口

`domain` 里的端口是抽象类。方法名只表达业务。

`IUserRepository` 声明 `findByUsername`、`findById`、`save`。`PasswordHasher` 声明 `hash`、`verify`。`TokenIssuer` 声明 `issue`。用例依赖这三者，不知道 bcrypt 和 JWT。

`IProjectRepository` 声明 `list`、`get`、`save`。`list` 接收 `ownerId`。实现是 `PrismaProjectRepository`。

## 本仓库里怎么落

登录：

```text
presentation/auth_controller.ts          接收 LoginDto，调用 login
application/security_application.ts      查找用户，核对口令，签发凭证
domain/i_user_repository.ts              声明 findByUsername，返回 UserEntity
domain/password_hasher.ts                声明 verify
domain/token_issuer.ts                   声明 issue
infra/persistence/prisma_user_repository.ts
infra/bcrypt_password_hasher.ts
infra/jwt_token_issuer.ts
```

保存项目：

```text
presentation/project_controller.ts       接收路径 id 和报文，调用 save
application/project_application.ts       检查访问，再保存
domain/entities/project_entity.ts        projectFromClient 校验报文并写入 ownerId
domain/i_project_repository.ts           声明 get、save
infra/persistence/prisma_project_repository.ts
```

`PrismaService`、`CurrentUser`、`ResponseInterceptor` 属于 `src/app`，是全库能力，不是功能模块的领域规则。
