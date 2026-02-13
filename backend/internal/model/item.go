package model

import "gorm.io/gorm"

type Item struct {
	gorm.Model

	Name  string `gorm:"column:name;type:varchar(255);not null;comment:'名称'"`
	Desc  string `gorm:"column:desc;type:varchar(255);comment:'描述'"`
	Owner string `gorm:"column:owner;type:varchar(255);comment:'所有者'"`
}

func (m *Item) TableName() string {
	return "item"
}
