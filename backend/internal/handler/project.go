package handler

import (
	v1 "backend/api/v1"
	"backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ProjectHandler struct {
	*Handler
	projectService service.ProjectService
}

func NewProjectHandler(handler *Handler, projectService service.ProjectService) *ProjectHandler {
	return &ProjectHandler{
		Handler:        handler,
		projectService: projectService,
	}
}

// ListProjects godoc
// @Summary 获取项目列表
// @Schemes
// @Description 搜索时支持项目名称、描述筛选
// @Tags Project
// @Accept json
// @Produce json
// @Security Bearer
// @Param page query int true "页码"
// @Param pageSize query int true "分页大小"
// @Param name query string false "项目名称"
// @Param description query string false "项目描述"
// @Success 200 {object} v1.ProjectSearchResponse
// @Router /v1/projects [get]
// @ID ListProjects
func (h *ProjectHandler) ListProjects(ctx *gin.Context) {
	var req v1.ProjectSearchRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("ListProjects bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	data, err := h.projectService.List(ctx, &req)
	if err != nil {
		h.logger.WithContext(ctx).Error("projectService.List error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, data)
}

// CreateProject godoc
// @Summary 创建项目
// @Schemes
// @Description 创建一个新的项目
// @Tags Project
// @Accept json
// @Produce json
// @Security Bearer
// @Param request body v1.ProjectRequest true "项目信息"
// @Success 200 {object} v1.Response
// @Router /v1/projects [post]
// @ID CreateProject
func (h *ProjectHandler) CreateProject(ctx *gin.Context) {
	var req v1.ProjectRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("CreateProject bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	uid := GetUserIdFromCtx(ctx)
	if err := h.projectService.Create(ctx, &req, uid); err != nil {
		h.logger.WithContext(ctx).Error("projectService.Create error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// UpdateProject godoc
// @Summary 更新项目
// @Schemes
// @Description 更新项目信息
// @Tags Project
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "项目ID"
// @Param request body v1.ProjectRequest true "项目信息"
// @Success 200 {object} v1.Response
// @Router /v1/projects/{id} [put]
// @ID UpdateProject
func (h *ProjectHandler) UpdateProject(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("UpdateProject parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req v1.ProjectRequest
	if err := ctx.ShouldBind(&req); err != nil {
		h.logger.WithContext(ctx).Error("UpdateProject bind error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.projectService.Update(ctx, uint(id), &req); err != nil {
		h.logger.WithContext(ctx).Error("projectService.Update error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, gin.H{"error": err.Error()})
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// DeleteProject godoc
// @Summary 删除项目
// @Schemes
// @Description 删除指定ID的项目
// @Tags Project
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "项目ID"
// @Success 200 {object} v1.Response
// @Router /v1/projects/{id} [delete]
// @ID DeleteProject
func (h *ProjectHandler) DeleteProject(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("DeleteProject parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.projectService.Delete(ctx, uint(id)); err != nil {
		h.logger.WithContext(ctx).Error("projectService.Delete error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// GetProject godoc
// @Summary 获取项目详情
// @Schemes
// @Description 获取指定ID的项目详情
// @Tags Project
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path uint true "项目ID"
// @Success 200 {object} v1.ProjectResponse
// @Router /v1/projects/{id} [get]
// @ID GetProject
func (h *ProjectHandler) GetProject(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.logger.WithContext(ctx).Error("GetProject parse id error", zap.Error(err))
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, gin.H{"error": "invalid id"})
		return
	}

	data, err := h.projectService.Get(ctx, uint(id))
	if err != nil {
		h.logger.WithContext(ctx).Error("projectService.Get error", zap.Error(err))
		v1.HandleError(ctx, http.StatusInternalServerError, v1.ErrInternalServerError, nil)
		return
	}
	v1.HandleSuccess(ctx, data)
}
