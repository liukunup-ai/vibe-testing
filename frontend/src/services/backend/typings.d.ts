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

  type AIProviderDataItem = {
    advancedConfig?: string;
    avgResponseTime?: number;
    baseUrl?: string;
    costConfig?: string;
    createdAt?: string;
    createdBy?: number;
    desc?: string;
    failedCalls?: number;
    id?: number;
    inputTokens?: number;
    lastCost?: string;
    lastSuccessAt?: string;
    lastUsedAt?: string;
    modelConfig?: string;
    organizationId?: number;
    outputTokens?: number;
    projectId?: number;
    providerName?: string;
    providerNo?: string;
    providerType?: string;
    rateLimitConfig?: string;
    region?: string;
    securityConfig?: string;
    status?: number;
    successCalls?: number;
    totalCalls?: number;
    totalCost?: string;
    totalTokens?: number;
    updatedAt?: string;
    updatedBy?: number;
  };

  type AIProviderRequest = {
    advancedConfig?: string;
    baseUrl?: string;
    costConfig?: string;
    desc?: string;
    modelConfig?: string;
    organizationId?: number;
    projectId?: number;
    providerName: string;
    providerNo: string;
    providerType: string;
    rateLimitConfig?: string;
    region?: string;
    securityConfig?: string;
    status?: number;
  };

  type AIProviderResponse = {
    data?: AIProviderDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type AIProviderSearchResponse = {
    data?: AIProviderSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type AIProviderSearchResponseData = {
    list?: AIProviderDataItem[];
    total?: number;
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

  type BugDataItem = {
    actualResult?: string;
    assigneeId?: number;
    attachmentPaths?: string[];
    browser?: string;
    bugNo?: string;
    closedAt?: string;
    createdAt?: string;
    creatorId?: number;
    description?: string;
    deviceInfo?: string;
    environment?: string;
    expectedResult?: string;
    fixedAt?: string;
    id?: number;
    os?: string;
    preconditions?: string;
    priority?: string;
    projectId?: number;
    requirementId?: number;
    severity?: string;
    status?: string;
    steps?: string;
    testCaseId?: number;
    testRecordId?: number;
    title?: string;
    updatedAt?: string;
    userFeedbackId?: number;
    verifiedAt?: string;
    verifierId?: number;
  };

  type BugRequest = {
    actualResult?: string;
    assigneeId?: number;
    attachmentPaths?: string[];
    browser?: string;
    bugNo: string;
    description?: string;
    deviceInfo?: string;
    environment?: string;
    expectedResult?: string;
    os?: string;
    preconditions?: string;
    priority: string;
    projectId: number;
    requirementId?: number;
    severity: string;
    status?: string;
    steps?: string;
    testCaseId?: number;
    testRecordId?: number;
    title: string;
    userFeedbackId?: number;
    verifierId?: number;
  };

  type BugResponse = {
    data?: BugDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type BugSearchResponse = {
    data?: BugSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type BugSearchResponseData = {
    list?: BugDataItem[];
    total?: number;
  };

  type DeleteAIProviderParams = {
    /** 供应商ID */
    id: number;
  };

  type DeleteApiParams = {
    /** 接口ID */
    id: number;
  };

  type DeleteBugParams = {
    /** 缺陷ID */
    id: number;
  };

  type DeleteDeviceParams = {
    /** 设备ID */
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

  type DeleteProjectParams = {
    /** 项目ID */
    id: number;
  };

  type DeleteRequirementParams = {
    /** 需求ID */
    id: number;
  };

  type DeleteRoleParams = {
    /** 角色ID */
    id: number;
  };

  type DeleteTestCaseParams = {
    /** 测试用例ID */
    id: number;
  };

  type DeleteTestPlanParams = {
    /** 计划ID */
    id: number;
  };

  type DeleteTestRecordParams = {
    /** 测试记录ID */
    id: number;
  };

  type DeleteTestSuiteParams = {
    /** 测试套件ID */
    id: number;
  };

  type DeleteUserFeedbackParams = {
    /** 反馈ID */
    id: number;
  };

  type DeleteUserParams = {
    /** 用户ID */
    id: string;
  };

  type DeviceDataItem = {
    battery?: number;
    connectMode?: string;
    cpuUsage?: number;
    createdAt?: string;
    deviceModel?: string;
    deviceNo?: string;
    deviceType?: string;
    groupId?: number;
    id?: number;
    ipAddress?: string;
    isCharging?: boolean;
    lastHeartbeat?: string;
    memoryTotal?: number;
    memoryUsage?: number;
    name?: string;
    osVersion?: string;
    platform?: string;
    port?: number;
    screenDpi?: number;
    screenSize?: string;
    status?: number;
    storageFree?: number;
    tags?: string;
    udid?: string;
    updatedAt?: string;
  };

  type DeviceHeartbeatRequest = {
    battery?: number;
    cpuUsage?: number;
    deviceId: number;
    isCharging?: boolean;
    memoryUsage?: number;
    status?: number;
    storageFree?: number;
  };

  type DeviceRequest = {
    connectMode?: string;
    deviceModel?: string;
    deviceNo: string;
    deviceType: string;
    groupId?: number;
    ipAddress?: string;
    name: string;
    osVersion?: string;
    platform?: string;
    port?: number;
    screenDpi?: number;
    screenSize?: string;
    tags?: string;
    udid?: string;
  };

  type DeviceResponse = {
    data?: DeviceDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type DeviceSearchResponse = {
    data?: DeviceSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type DeviceSearchResponseData = {
    list?: DeviceDataItem[];
    total?: number;
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

  type GetAIProviderParams = {
    /** 供应商ID */
    id: number;
  };

  type GetApiParams = {
    /** 接口ID */
    id: number;
  };

  type GetBugParams = {
    /** 缺陷ID */
    id: number;
  };

  type GetDeviceParams = {
    /** 设备ID */
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

  type GetProjectParams = {
    /** 项目ID */
    id: number;
  };

  type GetPublicSiteConfigParams = {
    /** 客户端缓存的版本号 */
    version?: string;
  };

  type GetRequirementParams = {
    /** 需求ID */
    id: number;
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

  type GetTestCaseParams = {
    /** 测试用例ID */
    id: number;
  };

  type GetTestPlanParams = {
    /** 计划ID */
    id: number;
  };

  type GetTestRecordParams = {
    /** 测试记录ID */
    id: number;
  };

  type GetTestSuiteParams = {
    /** 测试套件ID */
    id: number;
  };

  type GetUserByIDParams = {
    /** 用户ID */
    id: string;
  };

  type GetUserFeedbackParams = {
    /** 反馈ID */
    id: number;
  };

  type GetUserFeedbacksByProjectParams = {
    /** 项目ID */
    id: number;
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

  type ListAIProvidersParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 供应商名称 */
    name?: string;
    /** 供应商类型 */
    providerType?: string;
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

  type ListBugsParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 项目ID */
    projectId?: number;
    /** 缺陷编号 */
    bugNo?: string;
    /** 标题 */
    title?: string;
    /** 严重程度 */
    severity?: string;
    /** 优先级 */
    priority?: string;
    /** 状态 */
    status?: string;
  };

  type ListDevicesParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 设备名称 */
    name?: string;
    /** 设备类型 */
    type?: string;
    /** 设备状态 */
    status?: string;
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

  type ListProjectsParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 项目名称 */
    name?: string;
    /** 项目描述 */
    description?: string;
  };

  type ListRequirementsParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 需求标题 */
    title?: string;
    /** 需求状态 */
    status?: string;
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

  type ListTestCasesParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 用例名称 */
    name?: string;
    /** 项目ID */
    projectId?: number;
    /** 状态 */
    status?: string;
  };

  type ListTestPlansParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 计划名称 */
    name?: string;
    /** 项目ID */
    projectId?: number;
  };

  type ListTestRecordsParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 项目ID */
    projectID?: number;
    /** 用例ID */
    testCaseID?: number;
    /** 执行状态 */
    status?: string;
  };

  type ListTestSuitesParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 套件名称 */
    name?: string;
    /** 项目ID */
    projectId?: number;
  };

  type ListUserFeedbacksParams = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 项目ID */
    projectId?: number;
    /** 反馈类型 */
    type?: string;
    /** 反馈状态 */
    status?: string;
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

  type ProjectDataItem = {
    caseCount?: number;
    code?: string;
    createdAt?: string;
    creatorId?: number;
    description?: string;
    execCount?: number;
    gitRepo?: string;
    icon?: string;
    id?: number;
    name?: string;
    status?: number;
    tags?: string;
    updatedAt?: string;
  };

  type ProjectRequest = {
    code: string;
    defaultEnvId?: number;
    description?: string;
    gitRepo?: string;
    icon?: string;
    name: string;
    status?: number;
    tags?: string;
  };

  type ProjectResponse = {
    data?: ProjectDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type ProjectSearchResponse = {
    data?: ProjectSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type ProjectSearchResponseData = {
    list?: ProjectDataItem[];
    total?: number;
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

  type RequirementDataItem = {
    bugIds?: string;
    changeHistory?: string;
    completedAt?: string;
    createdAt?: string;
    creatorId?: number;
    description?: string;
    expectedAt?: string;
    id?: number;
    owner?: number;
    parentId?: number;
    priority?: string;
    projectId?: number;
    requirementNo?: string;
    status?: string;
    testCaseIds?: string;
    title?: string;
    updatedAt?: string;
    version?: number;
  };

  type RequirementRequest = {
    bugIds?: string;
    description?: string;
    expectedAt?: string;
    owner: number;
    parentId?: number;
    priority?: string;
    projectId: number;
    requirementNo: string;
    status?: string;
    testCaseIds?: string;
    title: string;
  };

  type RequirementResponse = {
    data?: RequirementDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type RequirementSearchResponse = {
    data?: RequirementSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type RequirementSearchResponseData = {
    list?: RequirementDataItem[];
    total?: number;
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

  type TestCaseDataItem = {
    caseNo?: string;
    caseType?: string;
    createdAt?: string;
    creatorId?: number;
    description?: string;
    id?: number;
    module?: string;
    priority?: number;
    projectId?: number;
    requirementId?: number;
    status?: number;
    stepsData?: string;
    tags?: string;
    title?: string;
    updatedAt?: string;
    version?: number;
  };

  type TestCaseRequest = {
    caseType?: string;
    description?: string;
    module?: string;
    priority?: number;
    projectId: number;
    requirementId?: number;
    status?: number;
    stepsData?: string;
    tags?: string;
    title: string;
  };

  type TestCaseResponse = {
    data?: TestCaseDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type TestCaseSearchResponse = {
    data?: TestCaseSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type TestCaseSearchResponseData = {
    list?: TestCaseDataItem[];
    total?: number;
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

  type TestPlanDataItem = {
    actualEndTime?: string;
    actualStartTime?: string;
    contentData?: string;
    createdAt?: string;
    creatorId?: number;
    cronExpr?: string;
    description?: string;
    execStatus?: number;
    executorId?: number;
    expectedEndTime?: string;
    expectedStartTime?: string;
    id?: number;
    name?: string;
    notifyConfig?: string;
    parallelism?: number;
    planNo?: string;
    planType?: string;
    projectId?: number;
    retryCount?: number;
    timeout?: number;
    triggerType?: string;
    updatedAt?: string;
  };

  type TestPlanRequest = {
    contentData?: string;
    cronExpr?: string;
    description?: string;
    expectedEndTime?: string;
    expectedStartTime?: string;
    name: string;
    notifyConfig?: string;
    parallelism?: number;
    planType?: string;
    projectId: number;
    retryCount?: number;
    timeout?: number;
    triggerType?: string;
  };

  type TestPlanResponse = {
    data?: TestPlanDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type TestPlanSearchResponse = {
    data?: TestPlanSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type TestPlanSearchResponseData = {
    list?: TestPlanDataItem[];
    total?: number;
  };

  type TestRecordDataItem = {
    blockedCases?: number;
    createdAt?: string;
    duration?: number;
    endTime?: string;
    execContext?: string;
    execStatus?: number;
    executorId?: number;
    failedCases?: number;
    id?: number;
    passRate?: number;
    passedCases?: number;
    planId?: number;
    projectId?: number;
    reportFormat?: string;
    reportUrl?: string;
    skippedCases?: number;
    startTime?: string;
    totalCases?: number;
    updatedAt?: string;
  };

  type TestRecordRequest = {
    execContext?: string;
    executorId?: number;
    planId?: number;
    projectId: number;
  };

  type TestRecordResponse = {
    data?: TestRecordDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type TestRecordSearchResponse = {
    data?: TestRecordSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type TestRecordSearchResponseData = {
    list?: TestRecordDataItem[];
    total?: number;
  };

  type TestSuiteDataItem = {
    caseIds?: string;
    continueOnFail?: boolean;
    createdAt?: string;
    creatorId?: number;
    description?: string;
    filterRule?: string;
    id?: number;
    name?: string;
    parallelism?: number;
    projectId?: number;
    retryCount?: number;
    status?: number;
    suiteNo?: string;
    suiteType?: string;
    timeout?: number;
    updatedAt?: string;
  };

  type TestSuiteRequest = {
    caseIds?: string;
    continueOnFail?: boolean;
    description?: string;
    filterRule?: string;
    name: string;
    parallelism?: number;
    projectId: number;
    retryCount?: number;
    status?: number;
    suiteType?: string;
    timeout?: number;
  };

  type TestSuiteResponse = {
    data?: TestSuiteDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type TestSuiteSearchResponse = {
    data?: TestSuiteSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type TestSuiteSearchResponseData = {
    list?: TestSuiteDataItem[];
    total?: number;
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

  type UpdateAIProviderParams = {
    /** 供应商ID */
    id: number;
  };

  type UpdateApiParams = {
    /** 接口ID */
    id: number;
  };

  type UpdateApiRolesRequest = {
    roleIds: number[];
  };

  type UpdateBugParams = {
    /** 缺陷ID */
    id: number;
  };

  type UpdateDeviceParams = {
    /** 设备ID */
    id: number;
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

  type UpdateProjectParams = {
    /** 项目ID */
    id: number;
  };

  type UpdateRequirementParams = {
    /** 需求ID */
    id: number;
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

  type UpdateTestCaseParams = {
    /** 测试用例ID */
    id: number;
  };

  type UpdateTestPlanParams = {
    /** 计划ID */
    id: number;
  };

  type UpdateTestSuiteParams = {
    /** 测试套件ID */
    id: number;
  };

  type UpdateUserFeedbackParams = {
    /** 反馈ID */
    id: number;
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

  type UserFeedbackDataItem = {
    appVersion?: string;
    attachmentPaths?: string[];
    bugId?: number;
    channel?: string;
    closedAt?: string;
    content?: string;
    convertedAt?: string;
    convertedBy?: string;
    createdAt?: string;
    deviceModel?: string;
    feedbackNo?: string;
    handler?: string;
    id?: number;
    occurredAt?: string;
    osVersion?: string;
    projectId?: number;
    reporter?: string;
    status?: number;
    testRecordId?: number;
    title?: string;
    updatedAt?: string;
  };

  type UserFeedbackRequest = {
    appVersion?: string;
    attachmentPaths?: string[];
    bugId?: number;
    channel: string;
    closedAt?: string;
    content: string;
    convertedAt?: string;
    convertedBy?: string;
    deviceModel?: string;
    feedbackNo: string;
    handler?: string;
    occurredAt: string;
    osVersion?: string;
    projectId: number;
    reporter: string;
    status?: number;
    testRecordId?: number;
    title: string;
  };

  type UserFeedbackResponse = {
    data?: UserFeedbackDataItem;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type UserFeedbackSearchResponse = {
    data?: UserFeedbackSearchResponseData;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type UserFeedbackSearchResponseData = {
    list?: UserFeedbackDataItem[];
    total?: number;
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
