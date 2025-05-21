import type { Ref } from "vue";
import { computed, onBeforeMount, ref, watch } from "vue";
import type { LocationQuery } from "vue-router";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { FilterOptions } from "./common";


/**
 * 同步路由筛选
 * 
 * @template VM 符合组件要求的筛选模型
 * @returns 
 */
export const useRouteParams = <VM extends object>(
  { paramsBuilder, watchRoute, immediate }: FilterOptions<VM>,
  fetchData: (_: VM) => void
) => {
  const route = useRoute();
  const router = useRouter();

  /**
   * 路由跳转
   * @param params 路由搜索条件
   */
  const routeHandler = async (params: LocationQuery | any) => {
    await router.push({
      path: route.fullPath,
      query: params,
    });
  };

  /** 路由参数 */
  const searchParams = computed(() => {
    if (watchRoute) {
      return route.query;
    }
    return {};
  });

  /** 默认搜索组件的数据模型，不强制刷新页面不改变 */
  const defaultParams = paramsBuilder(searchParams.value);

  /** 当前搜索组件的数据模型 */
  const normalParams = ref(defaultParams) as Ref<VM>;

  /** 检测路由参数变化 */
  const watchHandle = watch(
    searchParams,
    (newValue) => {
      normalParams.value = paramsBuilder(newValue);
      fetchData(normalParams.value);
    },
    {
      deep: true,
    }
  );

  onBeforeMount(() => {
    if (immediate) {
      fetchData(defaultParams);
    }
  });

  /** 在离开当前路由的时候摧毁监听 */
  onBeforeRouteLeave(() => {
    watchHandle();
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
     * 路由跳转
     * @param params 路由搜索条件
     */
    routeHandler,
  };
};
