import { IOrderFilter } from "@/models";
import type { Ref } from "vue";
import type { LocationQuery } from "vue-router";
import { useRouteParams } from "./use-route-params";

/**
 * 排序的选项
 *
 * @template VM 符合组件要求的筛选模型
 */
interface OrderOptions<VM extends IOrderFilter> {
  /**
   * 默认参数
   */
  normalParams: Ref<VM>;
  /**
   * 默认分页
   */
  defaultPageNumber?: number;
  /**
   * 通过路由参数构建请求参数模型
   *
   * @param searchParams 路由参数
   * @returns 符合组件要求的筛选模型
   */
  paramsBuilder: (searchParams: LocationQuery) => VM;
  /**
   * 是否观测路由
   */
  watchRoute: boolean;
  /**
   * 路由变更
   */
  routeHandler: ReturnType<typeof useRouteParams>["routeHandler"];
  /**
   * 获取数据
   * @param params 符合组件要求的筛选模型
   * @returns
   */
  fetchData: (params: VM) => Promise<void>;
}

export function useOrder<VM extends IOrderFilter>({
  normalParams,
  defaultPageNumber,
  paramsBuilder,
  watchRoute,
  routeHandler,
  fetchData,
}: OrderOptions<VM>) {
  /**
   * 改变排序
   *
   * @param sort
   */
  const changeSort = async (sort: string[]) => {
    const targetParams = {
      ...normalParams.value,
      pageNumber: defaultPageNumber,
      sort,
    };

    if (watchRoute) {
      await routeHandler(targetParams);
    } else {
      await fetchData(targetParams);
    }
  };

  /** 重置排序 */
  const resetSort = async () => {
    const targetParams = {
      ...normalParams.value,
      pageNumber: defaultPageNumber,
      sort: paramsBuilder({}).sort,
    };
    if (watchRoute) {
      await routeHandler(targetParams);
    } else {
      await fetchData(targetParams);
    }
  };

  return { changeSort, resetSort };
}
