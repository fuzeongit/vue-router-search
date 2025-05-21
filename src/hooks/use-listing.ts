import { IOrderFilter } from "@/models";
import { CommonOptions, RestfulResult } from "./common";
import { useOrder } from "./use-order";
import { useSingle } from "./use-single";

/**
 * 基础传递的选项
 *
 * @template VM 符合组件要求的筛选模型
 * @template Plain 扁平的传递模型，即DTO
 * @template T 返回的数据模型，不包括包装
 * @template RDFields 包装取数据模型的字段，支持深度获取，使用.隔开，如果为undefined则没有包装
 * @template RR 包装模型
 */
interface ListOptions<
  VM extends IOrderFilter,
  Plain,
  T,
  RDFields extends string | undefined,
  RR extends RestfulResult<RDFields, T[]>
> extends CommonOptions<VM, Plain, T[], RDFields, RR> {
  /** 默认值 */
  defaultValue?: T[];
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
export const useListing = <
  VM extends IOrderFilter,
  Plain,
  T,
  RDFields extends string | undefined = undefined,
  RR extends RestfulResult<RDFields, T[]> = RestfulResult<RDFields, T[]>
>({
  fetchBuilder,
  fetchParamsBuilder,
  paramsBuilder,
  errorBuilder,
  validateParams,
  after,
  defaultValue = [],
  resultField,
  watchRoute = true,
  immediate = true,
}: ListOptions<VM, Plain, T, RDFields, RR>) => {
  const {
    loading,
    data,
    fetchData,
    search,
    refresh,
    routeHandler,
    defaultParams,
    normalParams,
  } = useSingle<VM, Plain, T[], RDFields, RR>({
    fetchBuilder,
    fetchParamsBuilder,
    paramsBuilder,
    errorBuilder,
    validateParams,
    defaultValue,
    resultField,
    watchRoute,
    immediate,
    after
  });

  const { changeSort, resetSort } = useOrder<VM>({
    normalParams,
    paramsBuilder,
    watchRoute,
    routeHandler,
    fetchData,
  });
  return {
    /**
     * 默认搜索组件的数据模型，不强制刷新页面不改变
     */
    defaultParams,
    /**
     * 当前搜索组件的数据模型
     */
    normalParams,
    /**
     * 等待中状态
     */
    loading,
    /**
     * 数据
     */
    list: data,
    /**
     * 查询
     */
    search,
    /**
     * 路由变更
     */
    routeHandler,
    /**
     * 获取数据
     */
    fetchData,
    /**
     * 刷新数据
     */
    refresh,
    /**
     * 改变排序
     */
    changeSort,
    /**
     * 重置排序
     */
    resetSort,
  };
};
