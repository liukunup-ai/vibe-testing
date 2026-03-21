declare namespace API {
  type AdminSetting = {
    ai?: AIConfig;
    app?: AppConfig;
    ldap?: LDAPConfig;
    oidc?: OIDCConfig;
    redis?: RedisConfig;
    s3?: S3Config;
    sentry?: SentryConfig;
    site?: SiteConfig;
    smtp?: SMTPConfig;
  };

  type AdminSettingRequest = {
    ai?: AIConfig;
    app?: AppConfig;
    ldap?: LDAPConfig;
    oidc?: OIDCConfig;
    redis?: RedisConfig;
    s3?: S3Config;
    sentry?: SentryConfig;
    site?: SiteConfig;
    smtp?: SMTPConfig;
  };

  type AdminSettingResponse = {
    data?: AdminSetting;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type AIConfig = {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    provider?: string;
  };

  type Api = {
    /** 创建时间 */
    createdAt?: string;
    /** 分组 */
    group?: string;
    /** ID */
    id?: number;
    /** 是否为公开接口 */
    isPublic?: boolean;
    /** 方法 */
    method?: string;
    /** 名称 */
    name?: string;
    /** 路径 */
    path?: string;
    /** 授权角色的数量 */
    roleCount?: number;
    /** 更新时间 */
    updatedAt?: string;
  };

  type ApiList = {
    /** 列表 */
    list?: Api[];
    /** 总数 */
    total?: number;
  };

  type ApiRequest = {
    /** 分组 */
    group?: string;
    /** 是否为公开接口 */
    isPublic?: boolean;
    /** 方法 */
    method?: string;
    /** 名称 */
    name?: string;
    /** 路径 */
    path?: string;
  };

  type ApiResponse = {
    data?: Api;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type ApiRoleList = {
    roleIds?: number[];
  };

  type ApiRoleResponse = {
    data?: ApiRoleList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type ApiSearchResponse = {
    data?: ApiList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type AppConfig = {
    frontendBaseUrl?: string;
    gravatarEndpoint?: string;
  };

  type DeleteApiParams = {
    /** 接口ID */
    id: number;
  };

  type DeleteItemParams = {
    /** 项目ID */
    id: number;
  };

  type DeleteMenuParams = {
    /** 菜单ID */
    id: number;
  };

  type DeleteModelParams = {
    /** 模型ID */
    id: number;
  };

  type DeleteRoleParams = {
    /** 角色ID */
    id: number;
  };

  type DeleteUserParams = {
    /** 用户ID */
    id: string;
  };

  type DynamicMenuResponse = {
    data?: DynamicMenuResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type DynamicMenuResponseData = {
    /** 顶级菜单 */
    list?: MenuNode[];
  };

  type ForgotPasswordRequest = {
    /** 邮箱 */
    email: string;
  };

  type getAdminApisIdRolesParams = {
    /** 接口ID */
    id: number;
  };

  type getAdminRolesIdApisParams = {
    /** 角色ID */
    id: number;
  };

  type GetApiParams = {
    /** 接口ID */
    id: number;
  };

  type GetItemParams = {
    /** 项目ID */
    id: number;
  };

  type GetModelParams = {
    /** 模型ID */
    id: number;
  };

  type GetPublicSiteConfigParams = {
    /** 客户端缓存的版本号 */
    version?: string;
  };

  type GetRolePermissionResponse = {
    data?: GetRolePermissionResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type GetRolePermissionResponseData = {
    /** 列表 */
    list?: string[];
    /** 总数 */
    total?: number;
  };

  type GetRolePermissionsParams = {
    /** 角色名 */
    role: string;
  };

  type GetUserByIDParams = {
    /** 用户ID */
    id: string;
  };

  type Item = {
    /** 创建时间 */
    createdAt?: string;
    /** 描述 */
    desc?: string;
    /** ID */
    id?: number;
    /** 名称 */
    name?: string;
    /** 所有者 */
    owner?: OwnerData;
    /** 更新时间 */
    updatedAt?: string;
  };

  type ItemList = {
    /** 列表 */
    list?: Item[];
    /** 总数 */
    total?: number;
  };

  type ItemRequest = {
    /** 描述 */
    desc?: string;
    /** 名称 */
    name?: string;
    /** 所有者 */
    owner?: string;
  };

  type ItemResponse = {
    data?: Item;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type ItemSearchResponse = {
    data?: ItemList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type LDAPConfig = {
    attrEmail?: string;
    attrName?: string;
    attrUsername?: string;
    baseDn?: string;
    bindDn?: string;
    bindPassword?: string;
    enabled?: boolean;
    host?: string;
    port?: number;
    userFilter?: string;
  };

  type ListApisParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 分组 */
    group?: string;
    /** 名称 */
    name?: string;
    /** 路径 */
    path?: string;
    /** 方法 */
    method?: string;
  };

  type ListItemsParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 名称 */
    name?: string;
    /** 描述 */
    desc?: string;
    /** 所有者 */
    owner?: string;
  };

  type ListMenusParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 名称 */
    name?: string;
    /** 路径 */
    path?: string;
    /** 可见性 */
    access?: string;
  };

  type ListModelsParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 模型提供者 */
    provider?: number;
    /** 模型名称 */
    name?: string;
  };

  type ListRolesParams = {
    /** 页码 */
    page?: number;
    /** 分页大小 */
    pageSize?: number;
    /** 角色名 */
    name?: string;
    /** Casbin Role */
    casbinRole?: string;
  };

  type ListUsersParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 邮箱 */
    email?: string;
    /** 手机 */
    phone?: string;
    /** 用户名 */
    username?: string;
    /** 展示名 */
    fullName?: string;
  };

  type LoginRequest = {
    /** 记住我 - 延长refresh token有效期 */
    autoLogin?: boolean;
    /** 密码 */
    password: string;
    /** 用户名 或 邮箱 */
    username: string;
  };

  type LoginResponse = {
    data?: TokenData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type LogoutData = {
    /** OIDC end session URL for SLO */
    endSessionUrl?: string;
  };

  type LogoutResponse = {
    data?: LogoutData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type Menu = {
    /** 可见性 */
    access?: string;
    /** 组件 */
    component?: string;
    /** 创建时间 */
    createdAt?: string;
    disabled?: boolean;
    disabledTooltip?: boolean;
    /** 隐藏自身+子节点提升并打平 */
    flatMenu?: boolean;
    /** 隐藏子节点 */
    hideChildrenInMenu?: boolean;
    /** 隐藏自身和子节点 */
    hideInMenu?: boolean;
    /** 图标 */
    icon?: string;
    /** ID */
    id?: number;
    key?: string;
    /** 国际化 */
    locale?: string;
    /** 名称 */
    name?: string;
    /** 父级菜单 */
    parentId?: number;
    parentKeys?: string;
    /** 路径 */
    path?: string;
    /** 重定向 */
    redirect?: string;
    /** 指定外链打开形式 */
    target?: string;
    tooltip?: string;
    /** 更新时间 */
    updatedAt?: string;
  };

  type MenuList = {
    /** 列表 */
    list?: Menu[];
    /** 总数 */
    total?: number;
  };

  type MenuNode = {
    /** 可见性 */
    access?: string;
    /** 子菜单 */
    children?: MenuNode[];
    /** 组件 */
    component?: string;
    /** 创建时间 */
    createdAt?: string;
    disabled?: boolean;
    disabledTooltip?: boolean;
    /** 隐藏自身+子节点提升并打平 */
    flatMenu?: boolean;
    /** 隐藏子节点 */
    hideChildrenInMenu?: boolean;
    /** 隐藏自身和子节点 */
    hideInMenu?: boolean;
    /** 图标 */
    icon?: string;
    /** ID */
    id?: number;
    key?: string;
    /** 国际化 */
    locale?: string;
    /** 名称 */
    name?: string;
    /** 父级菜单 */
    parentId?: number;
    parentKeys?: string;
    /** 路径 */
    path?: string;
    /** 重定向 */
    redirect?: string;
    /** 指定外链打开形式 */
    target?: string;
    tooltip?: string;
    /** 更新时间 */
    updatedAt?: string;
  };

  type MenuRequest = {
    /** 可见性 */
    access?: string;
    /** 组件 */
    component?: string;
    disabled?: boolean;
    disabledTooltip?: boolean;
    /** 隐藏自身+子节点提升并打平 */
    flatMenu?: boolean;
    /** 隐藏子节点 */
    hideChildrenInMenu?: boolean;
    /** 隐藏自身和子节点 */
    hideInMenu?: boolean;
    /** 图标 */
    icon?: string;
    key?: string;
    /** 国际化 */
    locale?: string;
    /** 名称 */
    name?: string;
    /** 父级菜单 */
    parentId?: number;
    parentKeys?: string;
    /** 路径 */
    path?: string;
    /** 重定向 */
    redirect?: string;
    /** 指定外链打开形式 */
    target?: string;
    tooltip?: string;
  };

  type MenuSearchResponse = {
    data?: MenuList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type Model = {
    /** API 基础地址 */
    baseUrl?: string;
    /** 创建时间 */
    createdAt?: string;
    /** 频率惩罚 */
    frequencyPenalty?: number;
    /** 自定义请求头(JSON) */
    headers?: string;
    /** ID */
    id?: number;
    /** 最大重试次数 */
    maxRetries?: number;
    /** 最大 token 数 */
    maxTokens?: number;
    /** 模型 ID */
    modelId?: string;
    /** 模型名称 */
    name?: string;
    /** 存在惩罚 */
    presencePenalty?: number;
    /** 模型提供者 1:OpenAI 2:Azure 3:Ollama 4:LMStudio 5:vLLM 6:Groq 7:Anthropic */
    provider?: number;
    /** 速率限制(请求/分钟) */
    rateLimit?: number;
    /** 温度参数 */
    temperature?: number;
    /** 超时时间(秒) */
    timeout?: number;
    /** Top K 参数 */
    topK?: number;
    /** Top P 参数 */
    topP?: number;
    /** 更新时间 */
    updatedAt?: string;
  };

  type ModelList = {
    /** 列表 */
    list?: Model[];
    /** 总数 */
    total?: number;
  };

  type ModelRequest = {
    /** API 密钥 */
    apiKey?: string;
    /** API 基础地址 */
    baseUrl: string;
    /** 频率惩罚 */
    frequencyPenalty?: number;
    /** 自定义请求头(JSON) */
    headers?: string;
    /** 最大重试次数 */
    maxRetries?: number;
    /** 最大 token 数 */
    maxTokens?: number;
    /** 模型 ID */
    modelId: string;
    /** 模型名称 */
    name: string;
    /** 存在惩罚 */
    presencePenalty?: number;
    /** 模型提供者 1:OpenAI 2:Azure 3:Ollama 4:LMStudio 5:vLLM 6:Groq 7:Anthropic */
    provider: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    /** 速率限制(请求/分钟) */
    rateLimit?: number;
    /** 温度参数 */
    temperature?: number;
    /** 超时时间(秒) */
    timeout?: number;
    /** Top K 参数 */
    topK?: number;
    /** Top P 参数 */
    topP?: number;
  };

  type ModelResponse = {
    data?: Model;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type ModelSearchResponse = {
    data?: ModelList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type OIDCAuthRequest = {
    /** 记住我 - 延长refresh token有效期 */
    autoLogin?: boolean;
    code: string;
    state?: string;
  };

  type OIDCConfig = {
    authorizeUrl?: string;
    autoLogin?: boolean;
    caCert?: string;
    clientId?: string;
    clientSecret?: string;
    enabled?: boolean;
    insecureSkipVerify?: boolean;
    issuer?: string;
    logo?: string;
    name?: string;
    redirectUrl?: string;
    responseType?: string;
    scopes?: string;
    signoutRedirectUrl?: string;
  };

  type OwnerData = {
    /** 头像 */
    avatarUrl?: string;
    /** 全名 */
    fullName?: string;
    /** 用户名 */
    username?: string;
  };

  type PublicSiteConfig = {
    oidc?: OIDCConfig;
    sentry?: SentryConfig;
    site?: SiteConfig;
    version?: string;
  };

  type PublicSiteConfigResponse = {
    data?: PublicSiteConfig;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type putAdminApisIdRolesParams = {
    /** 接口ID */
    id: number;
  };

  type putAdminRolesIdApisParams = {
    /** 角色ID */
    id: number;
  };

  type RedisConfig = {
    addrs?: string[];
    db?: number;
    password?: string;
    readTimeout?: number;
    writeTimeout?: number;
  };

  type RefreshTokenRequest = {
    /** 刷新凭证 */
    refreshToken: string;
  };

  type RegisterRequest = {
    /** 邮箱 */
    email: string;
    /** 全名 */
    fullName?: string;
    /** 密码 */
    password: string;
  };

  type ResetAvatarParams = {
    /** 用户ID */
    id: string;
  };

  type ResetPasswordRequest = {
    /** 新密码 */
    newPassword: string;
    /** 重置令牌 */
    token: string;
  };

  type Response = {
    /** 返回数据 */
    data?: any;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type RevokeSessionsParams = {
    /** 用户ID */
    id: string;
  };

  type Role = {
    /** 接口权限的数量 */
    apiCount?: number;
    /** Casbin-Role */
    casbinRole?: string;
    /** 创建时间 */
    createdAt?: string;
    /** ID */
    id?: number;
    /** 角色名 */
    name?: string;
    /** 更新时间 */
    updatedAt?: string;
  };

  type RoleApiList = {
    apiIds?: number[];
  };

  type RoleApiResponse = {
    data?: RoleApiList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type RoleList = {
    /** 列表 */
    list?: Role[];
    /** 总数 */
    total?: number;
  };

  type RoleRequest = {
    /** Casbin-Role */
    casbinRole: string;
    /** 角色名 */
    name: string;
  };

  type RoleSearchResponse = {
    data?: RoleList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type S3Config = {
    accessKey?: string;
    bucketName?: string;
    caCert?: string;
    endpoint?: string;
    secretKey?: string;
    secure?: boolean;
  };

  type SendResetEmailParams = {
    /** 用户ID */
    id: string;
  };

  type SentryConfig = {
    dsn?: string;
  };

  type SiteConfig = {
    copyright?: string;
    favicon?: string;
    logo?: string;
    questionLink?: string;
    showLinks?: boolean;
    title?: string;
  };

  type SMTPConfig = {
    from?: string;
    host?: string;
    localName?: string;
    password?: string;
    port?: number;
    useSSL?: boolean;
    useTLS?: boolean;
    user?: string;
  };

  type TestConnectionRequest = {
    /** API 密钥 */
    apiKey?: string;
    /** API 基础地址 */
    baseUrl: string;
    /** 模型提供者 */
    provider: string;
  };

  type TestConnectionResult = {
    /** 消息 */
    message?: string;
    /** 可用模型列表 */
    models?: string[];
    /** 是否成功 */
    success?: boolean;
  };

  type TestEmailRequest = {
    /** 邮箱 */
    to: string;
  };

  type TokenData = {
    /** 访问凭证 */
    accessToken?: string;
    /** 有效期（秒） */
    expiresIn?: number;
    /** 刷新凭证 */
    refreshToken?: string;
    /** 凭证类型 */
    tokenType?: string;
  };

  type UpdateApiParams = {
    /** 接口ID */
    id: number;
  };

  type UpdateApiRolesRequest = {
    roleIds: number[];
  };

  type UpdateItemParams = {
    /** 项目ID */
    id: number;
  };

  type UpdateMenuParams = {
    /** 菜单ID */
    id: number;
  };

  type UpdateModelParams = {
    /** 模型ID */
    id: number;
  };

  type UpdatePasswordRequest = {
    /** 新密码 */
    newPassword: string;
    /** 旧密码 */
    oldPassword: string;
  };

  type UpdateRoleApisRequest = {
    apiIds: number[];
  };

  type UpdateRoleParams = {
    /** 角色ID */
    id: number;
  };

  type UpdateRolePermissionRequest = {
    /** Casbin-Role */
    casbinRole: string;
    /** 权限列表 */
    list: string[];
  };

  type UpdateStatusParams = {
    /** 用户ID */
    id: string;
  };

  type UpdateStatusRequest = {
    /** 状态 0:待激活 1:正常 2:禁用 */
    status: 0 | 1 | 2;
  };

  type UpdateUserParams = {
    /** 用户ID */
    id: string;
  };

  type User = {
    /** 头像 */
    avatarUrl?: string;
    /** 简介 */
    bio?: string;
    /** 创建时间 */
    createdAt?: string;
    /** 邮箱 */
    email?: string;
    /** 全名 */
    fullName?: string;
    /** 手机 */
    phone?: string;
    /** 角色 */
    roles?: Role[];
    /** 状态 0:待激活 1:正常 2:禁用 */
    status?: number;
    /** 更新时间 */
    updatedAt?: string;
    /** UserID */
    userId?: string;
    /** 用户名 */
    username?: string;
  };

  type UserList = {
    /** 列表 */
    list?: User[];
    /** 总数 */
    total?: number;
  };

  type UserRequest = {
    /** 简介 */
    bio?: string;
    /** 邮箱 */
    email?: string;
    /** 全名 */
    fullName?: string;
    /** 手机 */
    phone?: string;
    /** 角色 */
    roles?: string[];
    /** 状态 0:待激活 1:正常 2:禁用 */
    status?: number;
    /** 用户名 */
    username?: string;
  };

  type UserResponse = {
    data?: User;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type UserSearchResponse = {
    data?: UserList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };
}
