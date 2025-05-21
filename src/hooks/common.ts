import type { LocationQuery } from "vue-router";

export const TypeSeparator = "."

export type PathToObject<
  Path extends string,
  T
> = Path extends `${infer First}${typeof TypeSeparator}${infer Rest}`
  ? { [K in First]: PathToObject<Rest, T> }
  : { [K in Path]: T };

/**
 * 包装模型
 * 
 * @template V 包装取数据模型的字段，支持深度获取，使用.隔开，如果为undefined则没有包装
 * @template T 返回的数据模型，不包括包装
 */
export type RestfulResult<V extends string | undefined, T> = V extends undefined
  ? T // 如果 V 是 undefined，直接返回 T
  : V extends string
  ? PathToObject<V, T> // 否则走原来的 PathToObject 逻辑
  : never;

/**
 * 过滤方案选项
 * 
 * @template VM 符合组件要求的筛选模型
 */
export interface FilterOptions<VM extends object> {
  /**
   * 通过路由参数构建请求参数模型
   *
   * @param searchParams 路由参数
   * @returns 符合组件要求的筛选模型
   */
  paramsBuilder: (searchParams: LocationQuery) => VM;

  /** 是否监听路由 */
  watchRoute: boolean;

  /** 是否默认调用 */
  immediate: boolean;
}

/**
 * 基础传递的选项
 * 
 * @template VM 符合组件要求的筛选模型
 * @template Plain 扁平的传递模型，即DTO
 * @template T 返回的数据模型，不包括包装
 * @template RDFields 包装取数据模型的字段，支持深度获取，使用.隔开，如果为undefined则没有包装
 * @template RR 包装模型
 */
export interface CommonOptions<
  VM extends object,
  Plain,
  T,
  RDFields extends string | undefined,
  RR extends RestfulResult<RDFields, T>
> extends FilterOptions<VM> {
  /** 响应字段，支持层级 */
  resultField?: RDFields;
  /**
   * 构建请求参数
   *
   * @param normalParams 请求参数模型
   * @returns 扁平的传递模型
   */
  fetchParamsBuilder: (normalParams: VM) => Plain;

  /**
   * 构建请求
   *
   * @param params 请求参数
   * @returns 包装模型
   */
  fetchBuilder: (params: Plain) => Promise<RR>;

  /**
   * 验证参数模型是否合法，通过Error抛出
   *
   * @param params 请求参数模型
   * 
   */
  validateParams?: (params: VM) => Promise<void>;

  /**
   * 构建错误处理，通过Error抛出
   *
   * @param result 错误返回
   * 
   */
  errorBuilder?: (result: RR) => void;

  /**
   * 获取数据成功后的处理
   *
   * @param data 返回的数据模型，不包括包装
   */
  after?: (data: T) => void;
}
