package model

import "gorm.io/gorm"

type Api struct {
	gorm.Model

	Group    string `gorm:"column:group;type:varchar(255);not null;comment:'分组'"`
	Name     string `gorm:"column:name;type:varchar(255);not null;comment:'名称'"`
	Path     string `gorm:"column:path;type:varchar(255);not null;comment:'路径'"`
	Method   string `gorm:"column:method;type:varchar(255);not null;comment:'方法'"`
	IsPublic bool   `gorm:"column:is_public;default:false;comment:'是否为公开接口'"`
}

func (m *Api) TableName() string {
	return "api"
}
