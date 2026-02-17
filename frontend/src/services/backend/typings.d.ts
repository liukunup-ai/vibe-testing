declare namespace API {
  type Api = {
    /** 创建时间 */
    createdAt?: string;
    /** 分组 */
    group?: string;
    /** ID */
    id?: number;
    /** 方法 */
    method?: string;
    /** 名称 */
    name?: string;
    /** 路径 */
    path?: string;
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

  type DeleteApiParams = {
    /** 接口ID */
    id: number;
  };

  type DeleteMenuParams = {
    /** 菜单ID */
    id: number;
  };

  type DeleteRobotParams = {
    /** 机器人ID */
    id: number;
  };

  type DeleteRoleParams = {
    /** 角色ID */
    id: number;
  };

  type DeleteUserParams = {
    /** 用户ID */
    id: number;
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

  type GetApiParams = {
    /** 接口ID */
    id: number;
  };

  type GetRobotParams = {
    /** 机器人ID */
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

  type GetUserByIDParams = {
    /** 用户ID */
    id: number;
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

  type ListRobotsParams = {
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
    /** 用户名 */
    username?: string;
    /** 昵称 */
    nickname?: string;
  };

  type LoginRequest = {
    /** 密码 */
    password: string;
    /** 用户名 */
    username: string;
  };

  type LoginResponse = {
    data?: TokenPair;
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

  type RefreshTokenRequest = {
    /** 刷新令牌 */
    refreshToken: string;
  };

  type RegisterRequest = {
    /** 邮箱 */
    email: string;
    /** 密码 */
    password: string;
  };

  type ResetPasswordRequest = {
    /** 邮箱 */
    email: string;
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

  type Robot = {
    /** 回调地址 */
    callback?: string;
    /** 创建时间 */
    createdAt?: string;
    /** 描述 */
    desc?: string;
    /** 是否启用 */
    enabled?: boolean;
    /** ID */
    id?: number;
    /** 名称 */
    name?: string;
    /** 所有者 */
    owner?: string;
    /** 更新时间 */
    updatedAt?: string;
    /** 通知地址 */
    webhook?: string;
  };

  type RobotList = {
    /** 列表 */
    list?: Robot[];
    /** 总数 */
    total?: number;
  };

  type RobotRequest = {
    /** 回调地址 */
    callback?: string;
    /** 描述 */
    desc?: string;
    /** 是否启用 */
    enabled?: boolean;
    /** 名称 */
    name?: string;
    /** 所有者 */
    owner?: string;
    /** 通知地址 */
    webhook?: string;
  };

  type RobotResponse = {
    data?: Robot;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type RobotSearchResponse = {
    data?: RobotList;
    /** 错误码 */
    errorCode?: number;
    /** 报错信息 */
    errorMessage?: string;
    /** 前端展示方式 */
    errorShowType?: number;
    /** 是否成功 */
    success?: boolean;
  };

  type Role = {
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

  type TokenPair = {
    /** 访问令牌 */
    accessToken?: string;
    /** 过期时间(单位:秒) */
    expiresIn?: number;
    /** 刷新令牌 */
    refreshToken?: string;
  };

  type UpdateApiParams = {
    /** 接口ID */
    id: number;
  };

  type UpdateMenuParams = {
    /** 菜单ID */
    id: number;
  };

  type UpdatePasswordRequest = {
    /** 新密码 */
    newPassword: string;
    /** 旧密码 */
    oldPassword: string;
  };

  type UpdateRobotParams = {
    /** 机器人ID */
    id: number;
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

  type UpdateUserParams = {
    /** 用户ID */
    id: number;
  };

  type User = {
    /** 头像 */
    avatar?: string;
    /** 个人简介 */
    bio?: string;
    /** 创建时间 */
    createdAt?: string;
    /** 邮箱 */
    email?: string;
    /** 语言 */
    language?: string;
    /** 昵称 */
    nickname?: string;
    /** 角色 */
    roles?: Role[];
    /** 状态 0:待激活 1:正常 2:禁用 */
    status?: number;
    /** 主题 */
    theme?: string;
    /** 时区 */
    timezone?: string;
    /** 更新时间 */
    updatedAt?: string;
    /** ID */
    userid?: number;
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
    /** 个人简介 */
    bio?: string;
    /** 邮箱 */
    email?: string;
    /** 语言 */
    language?: string;
    /** 昵称 */
    nickname?: string;
    /** 角色 */
    roles?: string[];
    /** 状态 0:待激活 1:正常 2:禁用 */
    status?: number;
    /** 主题 */
    theme?: string;
    /** 时区 */
    timezone?: string;
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

  // ============ Project Types ============
  type ProjectSearchRequest = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 项目名称 */
    name?: string;
    /** 项目代码 */
    code?: string;
    /** 状态 */
    status?: number;
  };

  type Project = {
    /** ID */
    id?: number;
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
    /** 项目代码 */
    code?: string;
    /** 项目名称 */
    name?: string;
    /** 描述 */
    description?: string;
    /** 图标 */
    icon?: string;
    /** 标签 */
    tags?: string;
    /** Git仓库 */
    gitRepo?: string;
    /** 状态 */
    status?: number;
    /** 用例数量 */
    caseCount?: number;
    /** 执行数量 */
    execCount?: number;
    /** 创建者ID */
    creatorId?: number;
  };

  type ProjectList = {
    list?: Project[];
    total?: number;
  };

  type ProjectRequest = {
    /** 项目代码 */
    code: string;
    /** 项目名称 */
    name: string;
    /** 描述 */
    description?: string;
    /** 图标 */
    icon?: string;
    /** 标签 */
    tags?: string;
    /** Git仓库 */
    gitRepo?: string;
    /** 默认环境ID */
    defaultEnvId?: number;
    /** 状态 */
    status?: number;
  };

  type ProjectSearchResponse = {
    data?: ProjectList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type ProjectResponse = {
    data?: Project;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ TestCase Types ============
  type TestCaseSearchRequest = {
    page: number;
    pageSize: number;
    /** 项目ID */
    projectId: number;
    /** 标题 */
    title?: string;
    /** 优先级 */
    priority?: number;
    /** 状态 */
    status?: number;
    /** 模块 */
    module?: string;
  };

  type TestCase = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    /** 项目ID */
    projectId?: number;
    /** 用例编号 */
    caseNo?: string;
    /** 标题 */
    title?: string;
    /** 描述 */
    description?: string;
    /** 优先级 */
    priority?: number;
    /** 用例类型 */
    caseType?: string;
    /** 模块 */
    module?: string;
    /** 标签 */
    tags?: string;
    /** 需求ID */
    requirementId?: number;
    /** 状态 */
    status?: number;
    /** 版本 */
    version?: number;
    /** 步骤数据 */
    stepsData?: string;
    /** 创建者ID */
    creatorId?: number;
  };

  type TestCaseList = {
    list?: TestCase[];
    total?: number;
  };

  type TestCaseRequest = {
    projectId: number;
    title: string;
    description?: string;
    priority?: number;
    caseType?: string;
    module?: string;
    tags?: string;
    requirementId?: number;
    stepsData?: string;
    status?: number;
  };

  type TestCaseSearchResponse = {
    data?: TestCaseList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type TestCaseResponse = {
    data?: TestCase;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ TestSuite Types ============
  type TestSuiteSearchRequest = {
    page: number;
    pageSize: number;
    projectId: number;
    name?: string;
    status?: number;
  };

  type TestSuite = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    projectId?: number;
    suiteNo?: string;
    name?: string;
    description?: string;
    suiteType?: string;
    caseIds?: string;
    filterRule?: string;
    parallelism?: number;
    timeout?: number;
    retryCount?: number;
    continueOnFail?: boolean;
    status?: number;
    creatorId?: number;
  };

  type TestSuiteList = {
    list?: TestSuite[];
    total?: number;
  };

  type TestSuiteRequest = {
    projectId: number;
    name: string;
    description?: string;
    suiteType?: string;
    caseIds?: string;
    filterRule?: string;
    parallelism?: number;
    timeout?: number;
    retryCount?: number;
    continueOnFail?: boolean;
    status?: number;
  };

  type TestSuiteSearchResponse = {
    data?: TestSuiteList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type TestSuiteResponse = {
    data?: TestSuite;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ TestPlan Types ============
  type TestPlanSearchRequest = {
    page: number;
    pageSize: number;
    projectId: number;
    name?: string;
    execStatus?: number;
  };

  type TestPlan = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    projectId?: number;
    planNo?: string;
    name?: string;
    description?: string;
    planType?: string;
    contentData?: string;
    triggerType?: string;
    cronExpr?: string;
    parallelism?: number;
    timeout?: number;
    retryCount?: number;
    notifyConfig?: string;
    expectedStartTime?: string;
    expectedEndTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    execStatus?: number;
    executorId?: number;
    creatorId?: number;
  };

  type TestPlanList = {
    list?: TestPlan[];
    total?: number;
  };

  type TestPlanRequest = {
    projectId: number;
    name: string;
    description?: string;
    planType?: string;
    contentData?: string;
    triggerType?: string;
    cronExpr?: string;
    parallelism?: number;
    timeout?: number;
    retryCount?: number;
    notifyConfig?: string;
    expectedStartTime?: string;
    expectedEndTime?: string;
  };

  type TestPlanSearchResponse = {
    data?: TestPlanList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type TestPlanResponse = {
    data?: TestPlan;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ TestRecord Types ============
  type TestRecordSearchRequest = {
    page: number;
    pageSize: number;
    projectId?: number;
    planId?: number;
    execStatus?: number;
  };

  type TestRecord = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    projectId?: number;
    planId?: number;
    executorId?: number;
    startTime?: string;
    endTime?: string;
    duration?: number;
    execStatus?: number;
    totalCases?: number;
    passedCases?: number;
    failedCases?: number;
    blockedCases?: number;
    skippedCases?: number;
    passRate?: number;
    execContext?: string;
    reportUrl?: string;
    reportFormat?: string;
  };

  type TestRecordList = {
    list?: TestRecord[];
    total?: number;
  };

  type TestRecordRequest = {
    projectId: number;
    planId?: number;
    executorId?: number;
    execContext?: string;
  };

  type TestRecordSearchResponse = {
    data?: TestRecordList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type TestRecordResponse = {
    data?: TestRecord;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ Device Types ============
  type DeviceSearchRequest = {
    page: number;
    pageSize: number;
    deviceType?: string;
    platform?: string;
    status?: number;
    name?: string;
  };

  type Device = {
    id?: number;
    createdAt?: string;
    updatedAt?: string;
    deviceNo?: string;
    name?: string;
    deviceType?: string;
    platform?: string;
    deviceModel?: string;
    osVersion?: string;
    screenSize?: string;
    screenDpi?: number;
    udid?: string;
    ipAddress?: string;
    port?: number;
    connectMode?: string;
    status?: number;
    battery?: number;
    isCharging?: boolean;
    cpuUsage?: number;
    memoryUsage?: number;
    memoryTotal?: number;
    storageFree?: number;
    groupId?: number;
    tags?: string;
    lastHeartbeat?: string;
  };

  type DeviceList = {
    list?: Device[];
    total?: number;
  };

  type DeviceRequest = {
    deviceNo: string;
    name: string;
    deviceType: string;
    platform?: string;
    deviceModel?: string;
    osVersion?: string;
    screenSize?: string;
    screenDpi?: number;
    udid?: string;
    ipAddress?: string;
    port?: number;
    connectMode?: string;
    groupId?: number;
    tags?: string;
  };

  type DeviceHeartbeatRequest = {
    deviceId: number;
    status?: number;
    battery?: number;
    isCharging?: boolean;
    cpuUsage?: number;
    memoryUsage?: number;
    storageFree?: number;
  };

  type DeviceSearchResponse = {
    data?: DeviceList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type DeviceResponse = {
    data?: Device;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ UserFeedback Types ============
  type UserFeedbackSearchRequest = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 项目ID */
    projectId?: number;
    /** 反馈编号 */
    feedbackNo?: string;
    /** 标题 */
    title?: string;
    /** 渠道 */
    channel?: string;
    /** 状态 */
    status?: number;
  };

  type UserFeedback = {
    /** ID */
    id?: number;
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
    /** 反馈编号 */
    feedbackNo?: string;
    /** 标题 */
    title?: string;
    /** 内容 */
    content?: string;
    /** 渠道 */
    channel?: string;
    /** 报告人 */
    reporter?: string;
    /** 发生时间 */
    occurredAt?: string;
    /** 状态 */
    status?: number;
    /** 处理人 */
    handler?: string;
    /** 关闭时间 */
    closedAt?: string;
    /** 项目ID */
    projectId?: number;
    /** 测试记录ID */
    testRecordId?: number;
    /** 设备型号 */
    deviceModel?: string;
    /** 系统版本 */
    osVersion?: string;
    /** APP版本 */
    appVersion?: string;
    /** 附件路径 */
    attachmentPaths?: string;
    /** BUG ID */
    bugId?: number;
    /** 转换时间 */
    convertedAt?: string;
    /** 转换人 */
    convertedBy?: string;
  };

  type UserFeedbackList = {
    list?: UserFeedback[];
    total?: number;
  };

  type UserFeedbackRequest = {
    /** 反馈编号 */
    feedbackNo: string;
    /** 标题 */
    title: string;
    /** 内容 */
    content?: string;
    /** 渠道 */
    channel?: string;
    /** 报告人 */
    reporter?: string;
    /** 发生时间 */
    occurredAt?: string;
    /** 状态 */
    status?: number;
    /** 项目ID */
    projectId: number;
    /** 测试记录ID */
    testRecordId?: number;
    /** 设备型号 */
    deviceModel?: string;
    /** 系统版本 */
    osVersion?: string;
    /** APP版本 */
    appVersion?: string;
    /** 附件路径 */
    attachmentPaths?: string;
  };

  type UserFeedbackSearchResponse = {
    data?: UserFeedbackList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type UserFeedbackResponse = {
    data?: UserFeedback;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ Bug Types ============
  type BugSearchRequest = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 项目ID */
    projectId?: number;
    /** BUG编号 */
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

  type Bug = {
    /** ID */
    id?: number;
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
    /** BUG编号 */
    bugNo?: string;
    /** 标题 */
    title?: string;
    /** 描述 */
    description?: string;
    /** 严重程度 */
    severity?: string;
    /** 优先级 */
    priority?: string;
    /** 状态 */
    status?: string;
    /** 创建人 */
    creator?: string;
    /** 指派人 */
    assignee?: string;
    /** 修复时间 */
    fixedAt?: string;
    /** 验证人 */
    verifier?: string;
    /** 验证时间 */
    verifiedAt?: string;
    /** 关闭时间 */
    closedAt?: string;
    /** 项目ID */
    projectId?: number;
    /** 用例ID */
    testCaseId?: number;
    /** 测试记录ID */
    testRecordId?: number;
    /** 用户反馈ID */
    userFeedbackId?: number;
    /** 需求ID */
    requirementId?: number;
    /** 环境 */
    environment?: string;
    /** 设备信息 */
    deviceInfo?: string;
    /** 操作系统 */
    os?: string;
    /** 浏览器 */
    browser?: string;
    /** 前置条件 */
    preconditions?: string;
    /** 测试步骤 */
    steps?: string;
    /** 预期结果 */
    expectedResult?: string;
    /** 实际结果 */
    actualResult?: string;
    /** 附件路径 */
    attachmentPaths?: string;
    /** 历史记录 */
    history?: string;
    /** 重复ID */
    duplicateIds?: string;
    /** 关联ID */
    relatedIds?: string;
  };

  type BugList = {
    list?: Bug[];
    total?: number;
  };

  type BugRequest = {
    /** BUG编号 */
    bugNo: string;
    /** 标题 */
    title: string;
    /** 描述 */
    description?: string;
    /** 严重程度 */
    severity?: string;
    /** 优先级 */
    priority?: string;
    /** 状态 */
    status?: string;
    /** 指派人 */
    assignee?: string;
    /** 项目ID */
    projectId: number;
    /** 用例ID */
    testCaseId?: number;
    /** 测试记录ID */
    testRecordId?: number;
    /** 用户反馈ID */
    userFeedbackId?: number;
    /** 需求ID */
    requirementId?: number;
    /** 环境 */
    environment?: string;
    /** 设备信息 */
    deviceInfo?: string;
    /** 操作系统 */
    os?: string;
    /** 浏览器 */
    browser?: string;
    /** 前置条件 */
    preconditions?: string;
    /** 测试步骤 */
    steps?: string;
    /** 预期结果 */
    expectedResult?: string;
    /** 实际结果 */
    actualResult?: string;
    /** 附件路径 */
    attachmentPaths?: string;
  };

  type BugSearchResponse = {
    data?: BugList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type BugResponse = {
    data?: Bug;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ Requirement Types ============
  type RequirementSearchRequest = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 项目ID */
    projectId?: number;
    /** 需求编号 */
    requirementNo?: string;
    /** 标题 */
    title?: string;
    /** 优先级 */
    priority?: string;
    /** 状态 */
    status?: string;
    /** 负责人 */
    owner?: string;
  };

  type Requirement = {
    /** ID */
    id?: number;
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
    /** 需求编号 */
    requirementNo?: string;
    /** 标题 */
    title?: string;
    /** 描述 */
    description?: string;
    /** 优先级 */
    priority?: string;
    /** 状态 */
    status?: string;
    /** 负责人 */
    owner?: string;
    /** 期望完成时间 */
    expectedAt?: string;
    /** 完成时间 */
    completedAt?: string;
    /** 项目ID */
    projectId?: number;
    /** 版本 */
    version?: number;
    /** 变更历史 */
    changeHistory?: string;
    /** 父需求ID */
    parentId?: number;
    /** 用例ID列表 */
    testCaseIds?: string;
    /** BUG ID列表 */
    bugIds?: string;
    /** 创建人ID */
    creatorId?: number;
  };

  type RequirementList = {
    list?: Requirement[];
    total?: number;
  };

  type RequirementRequest = {
    /** 需求编号 */
    requirementNo: string;
    /** 标题 */
    title: string;
    /** 描述 */
    description?: string;
    /** 优先级 */
    priority?: string;
    /** 状态 */
    status?: string;
    /** 负责人 */
    owner?: string;
    /** 期望完成时间 */
    expectedAt?: string;
    /** 项目ID */
    projectId: number;
    /** 父需求ID */
    parentId?: number;
    /** 用例ID列表 */
    testCaseIds?: string;
    /** BUG ID列表 */
    bugIds?: string;
  };

  type RequirementSearchResponse = {
    data?: RequirementList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type RequirementResponse = {
    data?: Requirement;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ AIProvider Types ============
  type AIProviderSearchRequest = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 提供商编号 */
    providerNo?: string;
    /** 提供商名称 */
    providerName?: string;
    /** 提供商类型 */
    providerType?: string;
    /** 状态 */
    status?: number;
  };

  type AIProvider = {
    /** ID */
    id?: number;
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
    /** 提供商编号 */
    providerNo?: string;
    /** 提供商名称 */
    providerName?: string;
    /** 提供商类型 */
    providerType?: string;
    /** 基础URL */
    baseUrl?: string;
    /** API密钥 */
    apiKey?: string;
    /** 状态 */
    status?: number;
    /** 组织ID */
    organizationId?: string;
    /** 项目ID */
    projectId?: string;
    /** 区域 */
    region?: string;
    /** 模型配置 */
    modelConfig?: string;
    /** 限流配置 */
    rateLimitConfig?: string;
    /** 成本配置 */
    costConfig?: string;
    /** 安全配置 */
    securityConfig?: string;
    /** 高级配置 */
    advancedConfig?: string;
    /** 总调用次数 */
    totalCalls?: number;
    /** 成功调用次数 */
    successCalls?: number;
    /** 失败调用次数 */
    failedCalls?: number;
    /** 平均响应时间 */
    avgResponseTime?: number;
    /** 总令牌数 */
    totalTokens?: number;
    /** 输入令牌数 */
    inputTokens?: number;
    /** 输出令牌数 */
    outputTokens?: number;
    /** 总成本 */
    totalCost?: number;
    /** 上次成本 */
    lastCost?: number;
    /** 上次使用时间 */
    lastUsedAt?: string;
    /** 上次成功时间 */
    lastSuccessAt?: string;
    /** 创建人ID */
    createdBy?: number;
    /** 更新人ID */
    updatedBy?: number;
  };

  type AIProviderList = {
    list?: AIProvider[];
    total?: number;
  };

  type AIProviderRequest = {
    /** 提供商编号 */
    providerNo: string;
    /** 提供商名称 */
    providerName: string;
    /** 提供商类型 */
    providerType: string;
    /** 基础URL */
    baseUrl?: string;
    /** API密钥 */
    apiKey?: string;
    /** 状态 */
    status?: number;
    /** 组织ID */
    organizationId?: string;
    /** 项目ID */
    projectId?: string;
    /** 区域 */
    region?: string;
    /** 模型配置 */
    modelConfig?: string;
    /** 限流配置 */
    rateLimitConfig?: string;
    /** 成本配置 */
    costConfig?: string;
    /** 安全配置 */
    securityConfig?: string;
    /** 高级配置 */
    advancedConfig?: string;
  };

  type AIProviderSearchResponse = {
    data?: AIProviderList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type AIProviderResponse = {
    data?: AIProvider;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ AIAnalysisResult Types ============
  type AIAnalysisResultSearchRequest = {
    /** 页码 */
    page: number;
    /** 分页大小 */
    pageSize: number;
    /** 分析编号 */
    analysisNo?: string;
    /** 分析类型 */
    analysisType?: string;
    /** 关联对象ID */
    relatedObjectId?: number;
    /** 关联对象类型 */
    relatedObjectType?: string;
  };

  type AIAnalysisResult = {
    /** ID */
    id?: number;
    /** 创建时间 */
    createdAt?: string;
    /** 更新时间 */
    updatedAt?: string;
    /** 分析编号 */
    analysisNo?: string;
    /** 分析类型 */
    analysisType?: string;
    /** 关联对象ID */
    relatedObjectId?: number;
    /** 关联对象类型 */
    relatedObjectType?: string;
    /** 分析时间 */
    analyzedAt?: string;
    /** 模型版本 */
    modelVersion?: string;
    /** 分析内容 */
    analysisContent?: string;
    /** 关联数据ID */
    relatedDataIds?: string;
    /** 人工验证 */
    humanVerified?: boolean;
    /** 验证时间 */
    verifiedAt?: string;
    /** 准确率 */
    accuracyScore?: number;
    /** 提供商ID */
    providerId?: number;
    /** 模型ID */
    modelId?: string;
    /** API调用时间 */
    apiCallTime?: number;
    /** 令牌使用量 */
    tokenUsage?: number;
  };

  type AIAnalysisResultList = {
    list?: AIAnalysisResult[];
    total?: number;
  };

  type AIAnalysisResultRequest = {
    /** 分析编号 */
    analysisNo: string;
    /** 分析类型 */
    analysisType: string;
    /** 关联对象ID */
    relatedObjectId?: number;
    /** 关联对象类型 */
    relatedObjectType?: string;
    /** 分析时间 */
    analyzedAt?: string;
    /** 模型版本 */
    modelVersion?: string;
    /** 分析内容 */
    analysisContent?: string;
    /** 关联数据ID */
    relatedDataIds?: string;
    /** 提供商ID */
    providerId?: number;
    /** 模型ID */
    modelId?: string;
    /** API调用时间 */
    apiCallTime?: number;
    /** 令牌使用量 */
    tokenUsage?: number;
  };

  type AIAnalysisResultSearchResponse = {
    data?: AIAnalysisResultList;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  type AIAnalysisResultResponse = {
    data?: AIAnalysisResult;
    errorCode?: number;
    errorMessage?: string;
    errorShowType?: number;
    success?: boolean;
  };

  // ============ UI Component Types ============
  type Notification = {
    id?: number;
    title?: string;
    content?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    read?: boolean;
    createdAt?: string;
  };

  type Todo = {
    id?: number;
    title?: string;
    priority?: string;
    deadline?: string;
    status?: 'pending' | 'processing' | 'completed';
  };

  type ProjectMember = {
    id?: number;
    username?: string;
    nickname?: string;
    role?: 'owner' | 'admin' | 'member';
    status?: number;
    joinedAt?: string;
  };

  type AuditLog = {
    id?: number;
    username?: string;
    action?: string;
    module?: string;
    ip?: string;
    content?: string;
    status?: 'success' | 'failed';
    createdAt?: string;
  };
}
