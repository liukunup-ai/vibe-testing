package model

import "gorm.io/gorm"

type User struct {
	gorm.Model

	UserID         string `gorm:"column:user_id;type:varchar(36);not null;unique;index;comment:'UserID'"`
	Email          string `gorm:"column:email;type:varchar(255);not null;unique;index;comment:'邮箱'"`
	Username       string `gorm:"column:username;type:varchar(255);not null;unique;index;comment:'用户名'"`
	HashedPassword string `gorm:"column:hashed_password;type:varchar(255);comment:'密码哈希值'"`
	FullName       string `gorm:"column:fullname;type:varchar(255);comment:'全名'"`
	Phone          string `gorm:"column:phone;type:varchar(15);comment:'手机'"`
	AvatarURL      string `gorm:"column:avatarUrl;type:varchar(255);comment:'头像'"`
	Bio            string `gorm:"column:bio;type:text;comment:'简介'"`
	Status         int    `gorm:"column:status;type:int;comment:'状态 0:待激活 1:正常 2:禁用'"`
	AuthType       string `gorm:"column:auth_type;type:varchar(10);default:'local';comment:'认证类型 local/ldap/oidc'"`
	OIDCSUB        string `gorm:"column:oidc_sub;type:varchar(255);index;comment:'OIDC Subject'"`
	LDAPDN         string `gorm:"column:ldap_dn;type:varchar(255);index;comment:'LDAP Distinguished Name'"`
}

func (m *User) TableName() string {
	return "user"
}
