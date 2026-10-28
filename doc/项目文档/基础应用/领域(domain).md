# 领域

## 目录

- [功能定义](#功能定义)
- [使用示例](#使用示例)
- [时序](#时序)
  - [判断权限](#判断权限)

## 功能定义

领域公共类型给出全库共用的调用者和业务失败。它们不是某一个功能模块的实体。

| 入口                              | 文件                             | 定义                                       |
| --------------------------------- | -------------------------------- | ------------------------------------------ |
| `Actor`                           | `src/app/domain/actor.ts`        | 当前调用者。持有 `id`、`username`、`roles` |
| `Actor.hasPermission(permission)` | 同上                             | 角色包含 `admin` 或指定权限时返回真        |
| `DomainError`                     | `src/app/domain/domain_error.ts` | 带 HTTP 状态码的业务失败                   |

`Actor` 由安全模块的守卫放进请求。功能模块不自己解析 `Authorization`。

## 使用示例

项目在读取时把调用者交给聚合。文件：`src/features/project/application/project_application.ts`。

```ts
const project = await this.projects.get(id);
if (!project) throw new DomainError(404, '项目不存在');
project.assertAccessible(actor);
```

注册时的规则失败同样使用 `DomainError`。文件：`src/features/security/application/security_application.ts`。

```ts
if (input.password !== input.confirmPassword) {
  throw new DomainError(400, '两次输入的密码不一致');
}
```

## 时序

### 判断权限

```mermaid
sequenceDiagram
  participant Actor

  Actor->>Actor: hasPermission(permission)
```

`hasPermission` 查看 `roles`。其中有 `admin`，或者有与参数相同的字符串时返回真。项目模块用 `project:write` 作为打开他人项目的权限。没有这个权限、也不是所有者时，由 `Project.assertAccessible` 抛出 404。

`DomainError` 只保存 `status` 和消息。响应体由 [HTTP](<./HTTP(http).md>) 的 `AllExceptionsFilter` 写出。
