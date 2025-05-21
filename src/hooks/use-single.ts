import { get, isEqual } from "lodash-es";
import { Ref, ref, toRaw } from "vue";
import { CommonOptions, RestfulResult } from "./common";
import { useRouteParams } from "./use-route-params";

/**
 * 基础传递的选项
 *
 * @template VM 符合组件要求的筛选模型
 * @template Plain 扁平的传递模型，即DTO
 * @template T 返回的数据模型，不包括包装
 * @template RDFields 包装取数据模型的字段，支持深度获取，使用.隔开，如果为undefined则没有包装
 * @template RR 包装模型
 */
interface SingleOptions<
  VM extends object,
  Plain,
  T,
  RDFields extends string | undefined,
  RR extends RestfulResult<RDFields, T>
> extends CommonOptions<VM, Plain, T, RDFields, RR> {
  /** 默认值 */
  defaultValue?: T;

  /**
   * 合并路由参数，如分页搜索时页码要回正
   *
   * @param params 搜索的参数
   * @param raw 原参数
   * @returns
   */
  mergeParams?: (params: VM, raw: VM) => void;
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
export const useSingle = <
  VM extends object,
  Plain,
  T,
  RDFields extends string | undefined = undefined,
  RR extends RestfulResult<RDFields, T> = RestfulResult<RDFields, T>
>({
  fetchBuilder,
  fetchParamsBuilder,
  paramsBuilder,
  errorBuilder,
  validateParams,
  defaultValue,
  resultField,
  watchRoute = true,
  immediate = true,
  after,
  mergeParams,
}: SingleOptions<VM, Plain, T, RDFields, RR>) => {
  const data = ref(defaultValue) as Ref<T>;
  const loading = ref(false);

  const { routeHandler, defaultParams, normalParams } = useRouteParams(
    {
      paramsBuilder,
      watchRoute,
      immediate,
    },
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    (v) => fetchData(v)
  );

  /** 刷新 */
  const refresh = async () => {
    await validateParams?.(normalParams.value);
    loading.value = true;
    const result = await (async () => {
      return fetchBuilder(fetchParamsBuilder(normalParams.value));
    })().finally(() => {
      loading.value = false;
    });
    errorBuilder?.(result);
    data.value = (resultField ? get(result, resultField) : result) as T;
    after?.(data.value);
  };

  /** 获取数据 */
  const fetchData = async (params: VM) => {
    Object.keys(params).forEach((key) => {
      normalParams.value[key as keyof VM] = params[key as keyof VM];
    });
    await refresh();
  };

  /**
   * 改变搜索条件
   *
   * @param params
   */
  const search = async (params: Partial<VM> = {}) => {
    const raw: VM = toRaw(normalParams.value);
    const targetParams = {
      ...paramsBuilder({}),
    };
    Object.keys(params).forEach((key) => {
      targetParams[key as keyof VM] = params[key as keyof VM]!;
    });

    mergeParams?.(targetParams, raw);
    if (
      watchRoute &&
      !isEqual({ ...targetParams }, { ...raw })
    ) {
      await routeHandler(targetParams as any);
    } else {
      await fetchData(targetParams);
    }
  };

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
    data,
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
  };
};
