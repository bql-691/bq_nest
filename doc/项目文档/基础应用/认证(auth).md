# 认证

## 目录

- [功能定义](#功能定义)
- [使用示例](#使用示例)
- [时序](#时序)
  - [取出调用者](#取出调用者)

## 功能定义

认证入口标记哪些路由不校验凭证，并在守卫放行后取出当前 `Actor`。凭证是否有效由安全模块的 `JwtAuthGuard` 决定，不在本目录。

| 入口            | 文件                                     | 定义                                                                |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `Public()`      | `src/app/auth/public_decorator.ts`       | 给路由写入 `IS_PUBLIC`。守卫见到后直接放行                          |
| `CurrentUser()` | `src/app/auth/current_user_decorator.ts` | 从 `request.user` 取出 `Actor`。没有调用者时抛出 `DomainError(401)` |

## 使用示例

注册和登录是公开路由。文件：`src/features/security/presentation/auth_controller.ts`。

```ts
@Public()
@Post('login')
@HttpCode(HttpStatus.OK)
login(@Body() dto: LoginDto) {
  return this.application.login(dto);
}
```

需要调用者的路由使用参数装饰器。文件：`src/features/project/presentation/project_controller.ts`。

```ts
@Get()
list(@CurrentUser() actor: Actor) {
  return this.application.list(actor);
}
```

`GET /health` 同样标了 `@Public()`。文件：`src/app_controller.ts`。

## 时序

### 取出调用者

```mermaid
sequenceDiagram
  participant CurrentUser
  participant Actor

  CurrentUser->>Actor: request.user
```

`CurrentUser` 读取本次请求上的 `request.user`。它已经是 `Actor` 时，把这个对象交给控制器参数。请求上没有 `user` 时抛出 `DomainError`，状态码 401，消息是「未登录」。

`Public` 只写入元数据 `IS_PUBLIC`，不读取凭证。守卫怎样识别这个标记并写上 `request.user`，见 [安全模块](<../功能模块/安全模块/安全模块(security).md>)。
