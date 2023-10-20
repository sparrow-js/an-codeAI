declare namespace API {

  /**
   * 
   * @export
   * @interface Action
   */
  export interface Action {
    /**
     * 
     * @type {number}
     * @memberof Action
     */
    id?: number;
    /**
     * 项目ID
     * @type {number}
     * @memberof Action
     */
    projectId?: number;
    /**
     * 名字
     * @type {string}
     * @memberof Action
     */
    name?: string;
    /**
     * 操作描述
     * @type {string}
     * @memberof Action
     */
    description?: string;
    /**
     * 创建人ID
     * @type {number}
     * @memberof Action
     */
    createBy?: number;
    /**
     * 修改人ID
     * @type {number}
     * @memberof Action
     */
    updateBy?: number;
    /**
     * 
     * @type {string}
     * @memberof Action
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Action
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Action
     */
    deletedAt?: string;
  }
  /**
  * 
  * @export
  * @interface ActionPagination
  */
  export interface ActionPagination {
    /**
     * json repose code
     * @type {number}
     * @memberof ActionPagination
     */
    code?: number;
    /**
     * total numbers
     * @type {number}
     * @memberof ActionPagination
     */
    total?: number;
    /**
     * offset
     * @type {number}
     * @memberof ActionPagination
     */
    offset?: number;
    /**
     * limit
     * @type {number}
     * @memberof ActionPagination
     */
    limit?: number;
    /**
     * 
     * @type {Array<Action>}
     * @memberof ActionPagination
     */
    list?: Array<Action>;
  }
  /**
  * 
  * @export
  * @interface ApiResponse
  */
  export interface ApiResponse {
    /**
     * 
     * @type {number}
     * @memberof ApiResponse
     */
    code?: number;
    /**
     * 
     * @type {string}
     * @memberof ApiResponse
     */
    msg?: string;
  }
  /**
  * 
  * @export
  * @interface Group
  */
  export interface Group {
    /**
     * 
     * @type {number}
     * @memberof Group
     */
    id?: number;
    /**
     * 名字
     * @type {string}
     * @memberof Group
     */
    name?: string;
    /**
     * 描述
     * @type {string}
     * @memberof Group
     */
    description?: string;
    /**
     * 创建人ID
     * @type {number}
     * @memberof Group
     */
    createBy?: number;
    /**
     * 修改人ID
     * @type {number}
     * @memberof Group
     */
    updateBy?: number;
    /**
     * 
     * @type {string}
     * @memberof Group
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Group
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Group
     */
    deletedAt?: string;
  }
  /**
  * 
  * @export
  * @interface GroupPagination
  */
  export interface GroupPagination {
    /**
     * json repose code
     * @type {number}
     * @memberof GroupPagination
     */
    code?: number;
    /**
     * total numbers
     * @type {number}
     * @memberof GroupPagination
     */
    total?: number;
    /**
     * offset
     * @type {number}
     * @memberof GroupPagination
     */
    offset?: number;
    /**
     * limit
     * @type {number}
     * @memberof GroupPagination
     */
    limit?: number;
    /**
     * 
     * @type {Array<Group>}
     * @memberof GroupPagination
     */
    list?: Array<Group>;
  }
  /**
  * 
  * @export
  * @interface Menu
  */
  export interface Menu {
    /**
     * 
     * @type {number}
     * @memberof Menu
     */
    id?: number;
    /**
     * 项目ID
     * @type {number}
     * @memberof Menu
     */
    projectId?: number;
    /**
     * 名字
     * @type {string}
     * @memberof Menu
     */
    name?: string;
    /**
     * 备注
     * @type {string}
     * @memberof Menu
     */
    desc?: string;
    /**
     * i18n主键
     * @type {string}
     * @memberof Menu
     */
    i18N?: string;
    /**
     * 排序值
     * @type {number}
     * @memberof Menu
     */
    sortOrder?: number;
    /**
     * 图标
     * @type {string}
     * @memberof Menu
     */
    icon?: string;
    /**
     * 路由，link、externalLink 二选其一
     * @type {string}
     * @memberof Menu
     */
    link?: string;
    /**
     * 访问路由
     * @type {string}
     * @memberof Menu
     */
    externalLink?: string;
    /**
     * 链接 target
     * @type {string}
     * @memberof Menu
     */
    target?: string;
    /**
     * 是否禁用菜单, 1:不禁用 2:禁用 
     * @type {number}
     * @memberof Menu
     */
    disabled?: number;
    /**
     * 隐藏菜单, 1:不隐藏 2:隐藏 
     * @type {number}
     * @memberof Menu
     */
    hide?: number;
    /**
     * 隐藏面包屑, 1:不隐藏 2:隐藏
     * @type {number}
     * @memberof Menu
     */
    hideInBreadcrumb?: number;
    /**
     * 父级 ID 
     * @type {number}
     * @memberof Menu
     */
    parentId?: number;
    /**
     * 创建人ID
     * @type {number}
     * @memberof Menu
     */
    createBy?: number;
    /**
     * 修改人ID
     * @type {number}
     * @memberof Menu
     */
    updateBy?: number;
    /**
     * 
     * @type {string}
     * @memberof Menu
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Menu
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Menu
     */
    deletedAt?: string;
  }
  /**
  * 
  * @export
  * @interface MenuPagination
  */
  export interface MenuPagination {
    /**
     * json repose code
     * @type {number}
     * @memberof MenuPagination
     */
    code?: number;
    /**
     * total numbers
     * @type {number}
     * @memberof MenuPagination
     */
    total?: number;
    /**
     * offset
     * @type {number}
     * @memberof MenuPagination
     */
    offset?: number;
    /**
     * limit
     * @type {number}
     * @memberof MenuPagination
     */
    limit?: number;
    /**
     * 
     * @type {Array<Menu>}
     * @memberof MenuPagination
     */
    list?: Array<Menu>;
  }
  /**
  * 
  * @export
  * @interface Org
  */
  export interface Org {
    /**
     * 
     * @type {number}
     * @memberof Org
     */
    id?: number;
    /**
     * 组织机构代码
     * @type {string}
     * @memberof Org
     */
    code?: string;
    /**
     * 名字
     * @type {string}
     * @memberof Org
     */
    name?: string;
    /**
     * 备注
     * @type {string}
     * @memberof Org
     */
    description?: string;
    /**
     * logo
     * @type {string}
     * @memberof Org
     */
    logo?: string;
    /**
     * 创建人ID
     * @type {number}
     * @memberof Org
     */
    createBy?: number;
    /**
     * 修改人ID
     * @type {number}
     * @memberof Org
     */
    updateBy?: number;
    /**
     * 
     * @type {string}
     * @memberof Org
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Org
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Org
     */
    deletedAt?: string;
  }
  /**
  * 
  * @export
  * @interface OrgNode
  */
  export interface OrgNode {
    /**
     * 
     * @type {number}
     * @memberof OrgNode
     */
    id?: number;
    /**
     * 名字
     * @type {string}
     * @memberof OrgNode
     */
    name?: string;
    /**
     * 备注
     * @type {string}
     * @memberof OrgNode
     */
    description?: string;
    /**
     * 父级 ID 
     * @type {number}
     * @memberof OrgNode
     */
    parentId?: number;
    /**
     * 组织机构 ID 
     * @type {number}
     * @memberof OrgNode
     */
    orgId?: number;
    /**
     * 根节点 1 是, 2 否
     * @type {number}
     * @memberof OrgNode
     */
    root?: number;
    /**
     * 层级数
     * @type {number}
     * @memberof OrgNode
     */
    depth?: number;
    /**
     * 排序值
     * @type {number}
     * @memberof OrgNode
     */
    order?: number;
    /**
     * 创建人ID
     * @type {number}
     * @memberof OrgNode
     */
    createBy?: number;
    /**
     * 修改人ID
     * @type {number}
     * @memberof OrgNode
     */
    updateBy?: number;
    /**
     * 
     * @type {string}
     * @memberof OrgNode
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof OrgNode
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof OrgNode
     */
    deletedAt?: string;
    /**
     * 
     * @type {any}
     * @memberof OrgNode
     */
    org?: any | null;
  }
  /**
  * 
  * @export
  * @interface OrgNodePagination
  */
  export interface OrgNodePagination {
    /**
     * json repose code
     * @type {number}
     * @memberof OrgNodePagination
     */
    code?: number;
    /**
     * total numbers
     * @type {number}
     * @memberof OrgNodePagination
     */
    total?: number;
    /**
     * offset
     * @type {number}
     * @memberof OrgNodePagination
     */
    offset?: number;
    /**
     * limit
     * @type {number}
     * @memberof OrgNodePagination
     */
    limit?: number;
    /**
     * 
     * @type {Array<OrgNode>}
     * @memberof OrgNodePagination
     */
    list?: Array<OrgNode>;
  }
  /**
  * 
  * @export
  * @interface OrgPagination
  */
  export interface OrgPagination {
    /**
     * json repose code
     * @type {number}
     * @memberof OrgPagination
     */
    code?: number;
    /**
     * total numbers
     * @type {number}
     * @memberof OrgPagination
     */
    total?: number;
    /**
     * offset
     * @type {number}
     * @memberof OrgPagination
     */
    offset?: number;
    /**
     * limit
     * @type {number}
     * @memberof OrgPagination
     */
    limit?: number;
    /**
     * 
     * @type {Array<Org>}
     * @memberof OrgPagination
     */
    list?: Array<Org>;
  }
  /**
  * 
  * @export
  * @interface Project
  */
  export interface Project {
    /**
     * 
     * @type {number}
     * @memberof Project
     */
    id: number;
    /**
     * 名字
     * @type {string}
     * @memberof Project
     */
    name: string;
    /**
     * 描述
     * @type {string}
     * @memberof Project
     */
    description?: string;
    /**
     * 创建人ID
     * @type {number}
     * @memberof Project
     */
    createBy?: number;
    /**
     * 修改人ID
     * @type {number}
     * @memberof Project
     */
    updateBy?: number;
    /**
     * 
     * @type {string}
     * @memberof Project
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Project
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Project
     */
    deletedAt?: string;
  }
  /**
  * 
  * @export
  * @interface ProjectPagination
  */
  export interface ProjectPagination {
    /**
     * json repose code
     * @type {number}
     * @memberof ProjectPagination
     */
    code?: number;
    /**
     * total numbers
     * @type {number}
     * @memberof ProjectPagination
     */
    total?: number;
    /**
     * offset
     * @type {number}
     * @memberof ProjectPagination
     */
    offset?: number;
    /**
     * limit
     * @type {number}
     * @memberof ProjectPagination
     */
    limit?: number;
    /**
     * 
     * @type {Array<Project>}
     * @memberof ProjectPagination
     */
    list?: Array<Project>;
  }
  /**
  * 
  * @export
  * @interface Resource
  */
  export interface Resource {
    /**
     * 
     * @type {number}
     * @memberof Resource
     */
    id?: number;
    /**
     * 项目ID
     * @type {number}
     * @memberof Resource
     */
    projectId?: number;
    /**
     * 名字
     * @type {string}
     * @memberof Resource
     */
    name?: string;
    /**
     * 资源描述
     * @type {string}
     * @memberof Resource
     */
    description?: string;
    /**
     * 资源类型, 1: API 2: 菜单 3: 数据
     * @type {string}
     * @memberof Resource
     */
    type?: string;
    /**
     * 资源路由，type为1时有效
     * @type {string}
     * @memberof Resource
     */
    route?: string;
    /**
     * 菜单ID，type为2时有效
     * @type {number}
     * @memberof Resource
     */
    menuId?: number;
    /**
     * 创建人ID
     * @type {number}
     * @memberof Resource
     */
    createBy?: number;
    /**
     * 修改人ID
     * @type {number}
     * @memberof Resource
     */
    updateBy?: number;
    /**
     * 
     * @type {string}
     * @memberof Resource
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Resource
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof Resource
     */
    deletedAt?: string;
  }
  /**
  * 
  * @export
  * @interface ResourcePagination
  */
  export interface ResourcePagination {
    /**
     * json repose code
     * @type {number}
     * @memberof ResourcePagination
     */
    code?: number;
    /**
     * total numbers
     * @type {number}
     * @memberof ResourcePagination
     */
    total?: number;
    /**
     * offset
     * @type {number}
     * @memberof ResourcePagination
     */
    offset?: number;
    /**
     * limit
     * @type {number}
     * @memberof ResourcePagination
     */
    limit?: number;
    /**
     * 
     * @type {Array<Resource>}
     * @memberof ResourcePagination
     */
    list?: Array<Resource>;
  }
  /**
  * 
  * @export
  * @interface User
  */
  export interface User {
    /**
     * 
     * @type {number}
     * @memberof User
     */
    id?: number;
    /**
     * 名称
     * @type {string}
     * @memberof User
     */
    username?: string;
    /**
     * 昵称
     * @type {string}
     * @memberof User
     */
    nickname?: string;
    /**
     * 密码
     * @type {string}
     * @memberof User
     */
    password?: string;
    /**
     * 手机号
     * @type {string}
     * @memberof User
     */
    mobile?: string;
    /**
     * 手机号验证是否通过 1 通过, 2 未通过
     * @type {number}
     * @memberof User
     */
    mobileVerified?: number;
    /**
     * 邮箱
     * @type {string}
     * @memberof User
     */
    email?: string;
    /**
     * 邮箱验证是否通过 1 通过, 2 未通过
     * @type {number}
     * @memberof User
     */
    emailVerified?: number;
    /**
     * 1 可用, 2 禁用, 3 注销
     * @type {number}
     * @memberof User
     */
    status?: number;
    /**
     * 性别 1 男, 2 女, 3 未知
     * @type {number}
     * @memberof User
     */
    gender?: number;
    /**
     * 地址
     * @type {string}
     * @memberof User
     */
    address?: string;
    /**
     * 最近一次登录IP地址
     * @type {string}
     * @memberof User
     */
    lastLoginIp?: string;
    /**
     * 最近一次登录时间
     * @type {string}
     * @memberof User
     */
    lastLoginTime?: string;
    /**
     * 登录次数
     * @type {number}
     * @memberof User
     */
    loginCount?: number;
    /**
     * 头像图片
     * @type {string}
     * @memberof User
     */
    avatar?: string;
    /**
     * 创建人ID
     * @type {number}
     * @memberof User
     */
    createBy?: number;
    /**
     * 修改人ID
     * @type {number}
     * @memberof User
     */
    updateBy?: number;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    createdAt?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    updatedAt?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    deletedAt?: string;
    /**
     * 
     * @type {Array<Group>}
     * @memberof User
     */
    groups?: Array<Group>;
    /**
     * 
     * @type {Array<OrgNode>}
     * @memberof User
     */
    orgNodes?: Array<OrgNode>;
  }
  /**
  * 
  * @export
  * @interface UserPagination
  */
  export interface UserPagination {
    /**
     * json repose code
     * @type {number}
     * @memberof UserPagination
     */
    code?: number;
    /**
     * total numbers
     * @type {number}
     * @memberof UserPagination
     */
    total?: number;
    /**
     * offset
     * @type {number}
     * @memberof UserPagination
     */
    offset?: number;
    /**
     * limit
     * @type {number}
     * @memberof UserPagination
     */
    limit?: number;
    /**
     * 
     * @type {Array<User>}
     * @memberof UserPagination
     */
    list?: Array<User>;
  }

}