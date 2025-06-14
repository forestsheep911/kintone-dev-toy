// Kintone 全局类型定义
declare global {
  namespace kintone {
    // 事件相关类型
    namespace events {
      interface EventObject {
        appId: number;
        recordId?: number;
        record?: any;
        records?: any[];
        viewType?: string;
        viewId?: number;
        viewName?: string;
        type: string;
        [key: string]: any;
      }

      function on(
        event: string,
        handler: (event: EventObject) => EventObject | void | Promise<EventObject | void>
      ): void;

      function off(event: string, handler?: Function): void;
    }

    // 应用相关 API
    namespace app {
      function getId(): number | null;
      function getLookupTargetAppId(fieldCode: string): number | null;
      function getHeaderMenuSpaceElement(): HTMLElement | null;
      function getHeaderSpaceElement(): HTMLElement | null;
      function getRelatedRecordsTargetAppId(fieldCode: string): number | null;
    }

    // 记录相关 API
    namespace record {
      function getId(): number | null;
      function get(): { record: any };
      function set(record: { record: any }): void;
    }

    // 用户相关 API
    namespace user {
      function get(): {
        id: number;
        code: string;
        name: string;
        email: string;
        url: string;
        employeeNumber: string;
        phone: string;
        mobilePhone: string;
        extensionNumber: string;
        timezone: string;
        isGuest: boolean;
        language: string;
      };
    }

    // 移动端相关 API
    namespace mobile {
      namespace app {
        function getId(): number | null;
        function getHeaderSpaceElement(): HTMLElement | null;
      }
    }

    // 代理相关 API
    namespace proxy {
      function upload(
        url: string,
        method: string,
        headers: { [key: string]: string },
        data: any
      ): Promise<[string, number, { [key: string]: string }]>;
    }

    // API 相关类型
    namespace api {
      function url(path: string, detectGuestSpace?: boolean): string;
      
      function urlForGet(path: string, params: any, detectGuestSpace?: boolean): string;
    }
  }

  // 全局 kintone 对象
  const kintone: typeof kintone;
}

export {}; 