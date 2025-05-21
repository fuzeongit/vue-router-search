# vue-router-search 工具

## 概述
`useSingle`、`usePaging` 和 `useListing` 是基于 Vue 3 组合式 API 的工具函数，用于简化数据获取、管理和路由参数处理，适用于不同场景的数据展示。它们与 Vue Router 集成，支持类型安全的请求、加载状态管理和参数处理，分别针对单个数据项、分页数据和列表数据场景。

---

## useSingle

### 概述
`useSingle` 用于获取和管理单个数据项，适合详情页面或基于路由参数的动态数据展示。它通过 `useRouteParams` 集成路由参数，支持类型安全、加载状态和参数合并。

### 主要功能
- **类型安全**：支持视图模型 (`VM`)、传输对象 (`Plain`)、数据模型 (`T`) 和 RESTful 响应 (`RR`) 的泛型。
- **路由集成**：通过 `useRouteParams` 同步路由参数变化。
- **加载状态**：使用 `loading` ref 跟踪请求状态。
- **参数管理**：支持默认值、参数验证和自定义合并逻辑。
- **方法支持**：提供 `search`（搜索）、`refresh`（刷新）和 `fetchData`（获取数据）。

### 参数说明
| 参数名               | 类型                                    | 描述                                                                 |
|----------------------|-----------------------------------------|----------------------------------------------------------------------|
| `fetchBuilder`       | `(params: Plain) => Promise<RR>`        | 发起数据请求的函数。                                                 |
| `fetchParamsBuilder` | `(params: VM) => Plain`                 | 将视图模型转换为请求参数。                                           |
| `paramsBuilder`      | `(params: LocationQuery) => VM`         | 从路由参数构建视图模型。                                             |
| `defaultValue`       | `T`                                     | 可选，数据的默认值。                                                 |
| `resultField`        | `RDFields`                              | 可选，提取数据的字段路径（如 `data.item`）。                         |
| `watchRoute`         | `boolean`                               | 是否监听路由变化，默认为 `true`。                                   |
| `immediate`          | `boolean`                               | 是否立即获取数据，默认为 `true`。                                   |
| `mergeParams`        | `(params: VM, raw: VM) => void`         | 可选，合并新旧参数。                                                 |

### 返回值
| 属性/方法          | 类型                                    | 描述                                                                 |
|--------------------|-----------------------------------------|----------------------------------------------------------------------|
| `defaultParams`    | `Ref<VM>`                               | 默认参数模型。                                                       |
| `normalParams`     | `Ref<VM>`                               | 当前参数模型。                                                       |
| `loading`          | `Ref<boolean>`                          | 加载状态。                                                           |
| `data`             | `Ref<T>`                                | 获取到的数据。                                                       |
| `search`           | `(params: Partial<VM>) => Promise<void>`| 使用新参数触发数据获取。                                             |
| `fetchData`        | `(params: VM) => Promise<void>`         | 使用指定参数获取数据。                                               |
| `refresh`          | `() => Promise<void>`                   | 刷新当前数据。                                                       |
| `routeHandler`     | `(params: VM) => Promise<void>`         | 处理路由参数变化。                                                   |

### 使用示例
```typescript
import { useSingle } from './useSingle';

interface UserParams { id: string; }
interface User { id: string; name: string; }
interface UserResponse { data: User; success: boolean; }

const fetchUser = async (params: { id: string }): Promise<UserResponse> => ({
  data: { id: params.id, name: 'John' },
  success: true,
});

export default {
  setup() {
    const { data, loading, search } = useSingle<UserParams, { id: string }, User, 'data', UserResponse>({
      fetchBuilder: fetchUser,
      fetchParamsBuilder: (params) => ({ id: params.id }),
      paramsBuilder: (query) => ({ id: query.id || '' }),
      resultField: 'data',
      defaultValue: { id: '', name: '' },
    });

    return { data, loading, searchUser: () => search({ id: '123' }) };
  },
};
```

### 模板
```vue
<template>
  <div v-if="loading">加载中...</div>
  <div v-else>
    <p>姓名: {{ data.name }}</p>
    <button @click="searchUser">搜索</button>
  </div>
</template>
```

---

## useListing

### 概述
`useListing` 基于 `useSingle` 扩展，专为非分页的列表数据场景设计，支持排序管理，适合无需分页的列表展示。视图模型需实现 `IOrderFilter` 接口。

### 主要功能
- **继承 `useSingle`**：包含所有 `useSingle` 功能。
- **排序管理**：通过 `useOrder` 提供 `changeSort` 和 `resetSort`。
- **列表数据**：返回的数据为数组类型 (`T[]`)。

### 参数说明
| 参数名               | 类型                                    | 描述                                                                 |
|----------------------|-----------------------------------------|----------------------------------------------------------------------|
| `defaultValue`       | `T[]`                                   | 默认列表数据，默认为 `[]`。                                          |
| 其他参数             | 同 `useSingle`                          | 继承 `useSingle` 的所有参数。                                        |

### 返回值
| 属性/方法          | 类型                                    | 描述                                                                 |
|--------------------|-----------------------------------------|----------------------------------------------------------------------|
| `list`             | `Ref<T[]>`                              | 列表数据（替代 `data`）。                                            |
| `changeSort`       | `(sort: string[]) => Promise<void>`     | 更改排序规则。                                                       |
| `resetSort`        | `() => Promise<void>`                   | 重置排序。                                                           |
| 其他属性/方法      | 同 `useSingle`                          | 继承 `useSingle` 的所有返回值。                                      |

### 使用示例
```typescript
import { useListing } from './useListing';

interface ListParams extends IOrderFilter { search?: string; }
interface User { id: string; name: string; }
interface ListResponse { data: User[]; success: boolean; }

const fetchUsers = async (params: { search?: string }): Promise<ListResponse> => ({
  data: [{ id: '1', name: 'John' }],
  success: true,
});

export default {
  setup() {
    const { list, loading, changeSort } = useListing<ListParams, { search?: string }, User, 'data', ListResponse>({
      fetchBuilder: fetchUsers,
      fetchParamsBuilder: (params) => ({ search: params.search }),
      paramsBuilder: (query) => ({ search: query.search, sort: [] }),
      resultField: 'data',
      defaultValue: [],
    });

    return { list, loading, sortUsers: () => changeSort(['name']) };
  },
};
```

### 模板
```vue
<template>
  <div v-if="loading">加载中...</div>
  <ul v-else>
    <li v-for="user in list" :key="user.id">{{ user.name }}</li>
  </ul>
  <button @click="sortUsers">按姓名排序</button>
</template>
```


---

## usePaging

### 概述
`usePaging` 基于 `useSingle` 扩展，专为分页数据场景设计，支持页码、每页大小和排序管理，适合列表页面。视图模型需实现 `IPageable` 接口。

### 主要功能
- **继承 `useSingle`**：包含所有 `useSingle` 功能。
- **分页管理**：支持 `changePage`（更改页码）和 `changeLimit`（更改每页大小）。
- **排序管理**：通过 `useOrder` 提供 `changeSort` 和 `resetSort`。
- **参数合并**：更改每页大小时自动重置页码。

### 参数说明
| 参数名               | 类型                                    | 描述                                                                 |
|----------------------|-----------------------------------------|----------------------------------------------------------------------|
| `defaultPageNumber`  | `number`                                | 默认页码，默认为 `0`。                                               |
| 其他参数             | 同 `useSingle`                          | 继承 `useSingle` 的所有参数。                                        |

### 返回值
| 属性/方法          | 类型                                    | 描述                                                                 |
|--------------------|-----------------------------------------|----------------------------------------------------------------------|
| `pagination`       | `Ref<T>`                                | 分页数据（替代 `data`）。                                            |
| `changePage`       | `(pageNumber: number) => Promise<void>` | 更改页码并获取数据。                                                 |
| `changeLimit`      | `(pageSize: number) => Promise<void>`   | 更改每页大小并重置页码。                                             |
| `changeSort`       | `(sort: string[]) => Promise<void>`     | 更改排序规则。                                                       |
| `resetSort`        | `() => Promise<void>`                   | 重置排序。                                                           |
| 其他属性/方法      | 同 `useSingle`                          | 继承 `useSingle` 的所有返回值。                                      |

### 使用示例
```typescript
import { usePaging } from './usePaging';

interface PageParams extends IPageable { search?: string; }
interface User { id: string; name: string; }
interface PageResponse { data: User[]; success: boolean; }

const fetchUsers = async (params: { page: number; size: number }): Promise<PageResponse> => ({
  data: [{ id: '1', name: 'John' }],
  success: true,
});

export default {
  setup() {
    const { pagination, loading, changePage, changeLimit } = usePaging<PageParams, { page: number; size: number }, User[], 'data', PageResponse>({
      fetchBuilder: fetchUsers,
      fetchParamsBuilder: (params) => ({ page: params.pageNumber, size: params.pageSize }),
      paramsBuilder: (query) => ({ pageNumber: Number(query.page) || 0, pageSize: Number(query.size) || 10 }),
      resultField: 'data',
      defaultValue: [],
      defaultPageNumber: 0,
    });

    return { pagination, loading, changePage, changeLimit };
  },
};
```

### 模板
```vue
<template>
  <div v-if="loading">加载中...</div>
  <ul v-else>
    <li v-for="user in pagination" :key="user.id">{{ user.name }}</li>
  </ul>
  <button @click="changePage(normalParams.pageNumber + 1)">下一页</button>
</template>
```

---

## 注意事项
1. **路由监听**：`watchRoute: true` 时，自动响应路由变化触发数据获取。
2. **接口要求**：`usePaging` 需实现 `IPageable` 接口，`useListing` 需实现 `IOrderFilter` 接口。
3. **参数验证**：可通过 `validateParams` 确保请求参数合法性。

## 适用场景
- **useSingle**：单个资源详情（如用户详情、商品详情）。
- **usePaging**：分页列表（如用户列表、商品列表）。
- **useListing**：非分页列表（如搜索结果、过滤列表）。

## 推荐配合使用
- **class-validator**：用于校验请求参数的合法性。
- **class-transformer**：用于转换请求参数的格式，因为在 Vue 3 中，路由参数通常是字符串类型，并且在`IOrderFilter` 和 `IPageable` 中未必能够符合用户后台请求字段要求，可以是用 `class-transformer` 转换，从而实现通用的 `fetchParamsBuilder` 和 `paramsBuilder` 。

## 总结
该工具并不是对于一个搜索页面的完整解决方案，而是一个基础的工具集，帮助开发者快速构建 Vue 3 应用中的数据管理组件。它们提供了类型安全、路由集成和加载状态管理等功能，适用于单个数据项、列表数据和分页数据场景。通过结合 `class-validator` 和 `class-transformer`，可以进一步增强参数验证和转换能力。并且通过编写适合于 UI 的 `useFilter` 等Hook可实现流畅的搜索。