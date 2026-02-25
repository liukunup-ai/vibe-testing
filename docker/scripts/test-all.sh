#!/usr/bin/env bash

###############################################################################
# 完整的 Docker 构建部署测试脚本
# 用途：自动执行完整的构建、运行和测试流程
# 作者：vibe-testing team
# 日期：2025-11-12
###############################################################################

set -e
set -u

# 使用 /bin/bash 确保兼容性
if [ -z "${BASH_VERSION:-}" ]; then
    exec /bin/bash "$0" "$@"
fi

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPORT_FILE="${PROJECT_ROOT}/deploy/TEST_REPORT_$(date +%Y%m%d_%H%M%S).md"
RESULTS_FILE="/tmp/vibe-testing-test-results-$$.txt"

# 清理结果文件
> "${RESULTS_FILE}"

# 测试结果记录
TEST_START_TIME=$(date +%s)

# 记录测试结果
record_result() {
    local test_name="$1"
    local result="$2"
    local details="${3:-}"
    
    echo "${test_name}|${result}|${details}" >> "${RESULTS_FILE}"
}

# 测试环境检查
test_environment() {
    log_section "1. 环境检查"
    
    local all_passed=true
    
    # Docker 版本
    echo -n "检查 Docker ... "
    if docker --version >/dev/null 2>&1; then
        local docker_version=$(docker --version | cut -d' ' -f3 | tr -d ',')
        echo -e "${GREEN}✓${NC} (${docker_version})"
        record_result "Docker 版本" "PASS" "${docker_version}"
    else
        echo -e "${RED}✗${NC}"
        record_result "Docker 版本" "FAIL" "未安装"
        all_passed=false
    fi
    
    # Docker Compose 版本
    echo -n "检查 Docker Compose ... "
    if docker compose version >/dev/null 2>&1; then
        local compose_version=$(docker compose version --short)
        echo -e "${GREEN}✓${NC} (${compose_version})"
        record_result "Docker Compose 版本" "PASS" "${compose_version}"
    else
        echo -e "${RED}✗${NC}"
        record_result "Docker Compose 版本" "FAIL" "未安装"
        all_passed=false
    fi
    
    # 检查磁盘空间
    echo -n "检查磁盘空间 ... "
    local available_space=$(df -h "${PROJECT_ROOT}" | awk 'NR==2 {print $4}')
    echo -e "${GREEN}✓${NC} (可用: ${available_space})"
    record_result "磁盘空间" "PASS" "${available_space}"
    
    # 检查必要文件
    echo -n "检查项目文件 ... "
    local missing_files=()
    for file in "deploy/build/Dockerfile" "frontend/package.json" "backend/go.mod"; do
        if [[ ! -f "${PROJECT_ROOT}/${file}" ]]; then
            missing_files+=("${file}")
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        echo -e "${GREEN}✓${NC}"
        record_result "项目文件" "PASS" "所有必要文件存在"
    else
        echo -e "${RED}✗${NC} 缺失: ${missing_files[*]}"
        record_result "项目文件" "FAIL" "缺失文件: ${missing_files[*]}"
        all_passed=false
    fi
    
    if [[ "${all_passed}" == "true" ]]; then
        log_success "环境检查全部通过"
        return 0
    else
        log_error "环境检查失败"
        return 1
    fi
}

# 镜像构建测试
test_build() {
    log_section "2. 镜像构建测试"
    
    local build_start=$(date +%s)
    
    export IMAGE_NAME="vibe-testing"
    export IMAGE_TAG="test-$(date +%Y%m%d-%H%M%S)"
    export CLEAN="true"
    
    log_info "镜像标签: ${IMAGE_NAME}:${IMAGE_TAG}"
    
    if "${SCRIPT_DIR}/build-local.sh"; then
        local build_end=$(date +%s)
        local build_duration=$((build_end - build_start))
        
        # 获取镜像大小
        local image_size=$(docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Size}}")
        
        log_success "镜像构建成功"
        echo "  耗时: ${build_duration}s"
        echo "  大小: ${image_size}"
        
        record_result "镜像构建" "PASS" "耗时: ${build_duration}s, 大小: ${image_size}"
        return 0
    else
        log_error "镜像构建失败"
        record_result "镜像构建" "FAIL" "构建过程出错"
        return 1
    fi
}

# 容器运行测试
test_run() {
    log_section "3. 容器运行测试"
    
    export CONTAINER_NAME="vibe-testing-test-$(date +%s)"
    export HOST_PORT="8000"
    export KEEP_RUNNING="false"
    
    log_info "容器名称: ${CONTAINER_NAME}"
    
    if "${SCRIPT_DIR}/run-local.sh"; then
        log_success "容器运行测试通过"
        record_result "容器运行" "PASS" "启动、健康检查和API测试通过"
        return 0
    else
        log_error "容器运行测试失败"
        record_result "容器运行" "FAIL" "容器启动或健康检查失败"
        return 1
    fi
}

# 多架构构建测试（可选）
test_multiarch() {
    log_section "4. 多架构构建测试（可选）"
    
    if [[ "${SKIP_MULTIARCH:-}" == "true" ]]; then
        log_warning "跳过多架构测试"
        record_result "多架构构建" "SKIP" "已跳过"
        return 0
    fi
    
    # 检查 buildx
    if ! docker buildx version >/dev/null 2>&1; then
        log_warning "Docker Buildx 不可用，跳过多架构测试"
        record_result "多架构构建" "SKIP" "Buildx 不可用"
        return 0
    fi
    
    log_info "测试 ARM64 架构构建..."
    
    local multiarch_start=$(date +%s)
    
    if docker buildx build \
        --platform linux/arm64 \
        --build-arg USE_CHINA_MIRROR=false \
        -t "${IMAGE_NAME}:${IMAGE_TAG}-arm64" \
        -f "${PROJECT_ROOT}/deploy/build/Dockerfile" \
        "${PROJECT_ROOT}" \
        --load; then
        
        local multiarch_end=$(date +%s)
        local multiarch_duration=$((multiarch_end - multiarch_start))
        
        log_success "ARM64 架构构建成功 (耗时: ${multiarch_duration}s)"
        record_result "多架构构建" "PASS" "ARM64 构建成功"
        
        # 清理
        docker rmi "${IMAGE_NAME}:${IMAGE_TAG}-arm64" >/dev/null 2>&1 || true
        return 0
    else
        log_warning "ARM64 架构构建失败"
        record_result "多架构构建" "FAIL" "ARM64 构建失败"
        return 1
    fi
}

# 清理测试资源
cleanup_test_resources() {
    log_section "5. 清理测试资源"
    
    log_info "清理测试镜像和容器..."
    
    # 清理测试容器
    docker ps -a --filter "name=vibe-testing-test-" --format "{{.Names}}" | xargs -r docker rm -f >/dev/null 2>&1 || true
    
    # 清理测试镜像
    docker images "${IMAGE_NAME}:test-*" --format "{{.Repository}}:{{.Tag}}" | xargs -r docker rmi >/dev/null 2>&1 || true
    
    log_success "清理完成"
    record_result "资源清理" "PASS" "测试资源已清理"
}

# 生成测试报告
generate_report() {
    log_section "6. 生成测试报告"
    
    local test_end_time=$(date +%s)
    local total_duration=$((test_end_time - TEST_START_TIME))
    
    cat > "${REPORT_FILE}" << EOF
# Vibe Testing - Docker 构建部署测试报告

**测试时间**: $(date '+%Y-%m-%d %H:%M:%S')  
**测试耗时**: ${total_duration} 秒  
**测试平台**: $(uname -s) $(uname -m)  

---

## 1. 测试概述

本报告记录了 Vibe Testing 项目的 Docker 镜像构建和部署测试结果。

## 2. 测试环境

| 项目 | 状态 | 详情 |
|------|------|------|
EOF

    # 添加环境检查结果
    while IFS='|' read -r test_name status details; do
        if [[ "${test_name}" =~ ^(Docker 版本|Docker Compose 版本|磁盘空间|项目文件)$ ]]; then
            local status_icon="✅"
            [[ "${status}" == "FAIL" ]] && status_icon="❌"
            [[ "${status}" == "SKIP" ]] && status_icon="⏭️"
            echo "| ${test_name} | ${status_icon} ${status} | ${details} |" >> "${REPORT_FILE}"
        fi
    done < "${RESULTS_FILE}"

    cat >> "${REPORT_FILE}" << EOF

## 3. 构建测试

| 测试项 | 状态 | 详情 |
|--------|------|------|
EOF

    # 添加构建测试结果
    while IFS='|' read -r test_name status details; do
        if [[ "${test_name}" =~ ^(镜像构建|多架构构建)$ ]]; then
            local status_icon="✅"
            [[ "${status}" == "FAIL" ]] && status_icon="❌"
            [[ "${status}" == "SKIP" ]] && status_icon="⏭️"
            echo "| ${test_name} | ${status_icon} ${status} | ${details} |" >> "${REPORT_FILE}"
        fi
    done < "${RESULTS_FILE}"

    cat >> "${REPORT_FILE}" << EOF

## 4. 运行测试

| 测试项 | 状态 | 详情 |
|--------|------|------|
EOF

    # 添加运行测试结果
    while IFS='|' read -r test_name status details; do
        if [[ "${test_name}" =~ ^(容器运行)$ ]]; then
            local status_icon="✅"
            [[ "${status}" == "FAIL" ]] && status_icon="❌"
            [[ "${status}" == "SKIP" ]] && status_icon="⏭️"
            echo "| ${test_name} | ${status_icon} ${status} | ${details} |" >> "${REPORT_FILE}"
        fi
    done < "${RESULTS_FILE}"

    cat >> "${REPORT_FILE}" << EOF

## 5. Dockerfile 配置

\`\`\`dockerfile
$(head -20 "${PROJECT_ROOT}/deploy/build/Dockerfile")
...
\`\`\`

## 6. 测试结论

EOF

    # 统计结果
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local skipped_tests=0
    
    while IFS='|' read -r test_name status details; do
        [[ -z "${test_name}" ]] && continue
        total_tests=$((total_tests + 1))
        case "${status}" in
            PASS) passed_tests=$((passed_tests + 1)) ;;
            FAIL) failed_tests=$((failed_tests + 1)) ;;
            SKIP) skipped_tests=$((skipped_tests + 1)) ;;
        esac
    done < "${RESULTS_FILE}"
    
    cat >> "${REPORT_FILE}" << EOF
- **总测试项**: ${total_tests}
- **通过**: ${passed_tests}
- **失败**: ${failed_tests}
- **跳过**: ${skipped_tests}

EOF

    if [[ ${failed_tests} -eq 0 ]]; then
        cat >> "${REPORT_FILE}" << EOF
### ✅ 测试通过

所有关键测试项均已通过，Docker 镜像构建和部署流程正常。

### 下一步操作

1. **推送镜像到仓库**
   \`\`\`bash
   docker tag vibe-testing:latest your-registry/vibe-testing:latest
   docker push your-registry/vibe-testing:latest
   \`\`\`

2. **使用 GitHub Actions 自动部署**
   - 将代码推送到 main 分支会自动触发构建和推送

3. **生产环境部署**
   \`\`\`bash
   docker pull your-registry/vibe-testing:latest
   docker run -d -p 8000:8000 your-registry/vibe-testing:latest
   \`\`\`

EOF
    else
        cat >> "${REPORT_FILE}" << EOF
### ❌ 测试失败

存在 ${failed_tests} 项测试失败，请检查相关配置和日志。

### 故障排查建议

1. 查看详细的错误日志
2. 确认所有依赖项已正确安装
3. 检查 Dockerfile 配置
4. 验证前后端代码是否可以正常编译

EOF
    fi
    
    cat >> "${REPORT_FILE}" << EOF
---

**报告生成时间**: $(date '+%Y-%m-%d %H:%M:%S')
EOF

    log_success "测试报告已生成: ${REPORT_FILE}"
}

# 显示最终结果
show_final_results() {
    log_section "测试完成"
    
    echo ""
    log_info "测试报告: ${REPORT_FILE}"
    echo ""
    
    # 统计结果
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    
    while IFS='|' read -r test_name status details; do
        [[ -z "${test_name}" ]] && continue
        total_tests=$((total_tests + 1))
        [[ "${status}" == "PASS" ]] && passed_tests=$((passed_tests + 1))
        [[ "${status}" == "FAIL" ]] && failed_tests=$((failed_tests + 1))
    done < "${RESULTS_FILE}"
    
    echo "测试统计:"
    echo "  ✅ 通过: ${passed_tests}"
    echo "  ❌ 失败: ${failed_tests}"
    echo "  📊 总计: ${total_tests}"
    echo ""
    
    if [[ ${failed_tests} -eq 0 ]]; then
        log_success "🎉 所有测试通过！"
        return 0
    else
        log_error "❌ 存在失败的测试项"
        return 1
    fi
}

# 主函数
main() {
    clear
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}║        Vibe Testing - Docker 构建部署完整测试                   ║${NC}"
    echo -e "${CYAN}║                                                               ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    local exit_code=0
    
    # 执行测试流程
    test_environment || exit_code=1
    
    if [[ ${exit_code} -eq 0 ]]; then
        test_build || exit_code=1
    fi
    
    if [[ ${exit_code} -eq 0 ]]; then
        test_run || exit_code=1
    fi
    
    # 可选的多架构测试
    test_multiarch || true
    
    # 清理资源
    cleanup_test_resources || true
    
    # 生成报告
    generate_report
    
    # 显示结果
    show_final_results || exit_code=1
    
    # 清理临时文件
    rm -f "${RESULTS_FILE}"
    
    exit ${exit_code}
}

# 执行主函数
main "$@"
