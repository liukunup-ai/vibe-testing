package email

import (
	"bytes"
	"crypto/tls"
	"errors"
	"fmt"
	"mime"
	"net"
	"net/mail"
	"net/smtp"
	"net/textproto"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"backend/internal/model"

	"github.com/spf13/viper"
)

type Message struct {
	From         string
	To           []string
	Cc           []string
	Bcc          []string
	Subject      string
	Text         string
	HTML         string
	Headers      textproto.MIMEHeader
	Attachments  []*Attachment
	ReadReceipts []string
}

type Attachment struct {
	Filename string
	Content  []byte
	Inline   bool
}

type SMTPConfig struct {
	Host      string
	Port      int
	User      string
	Password  string
	From      string
	FromName  string
	UseSSL    bool
	UseTLS    bool
	LocalName string
}

type Email struct {
	cfg *SMTPConfig
}

func NewEmail(cfg *SMTPConfig) *Email {
	return &Email{cfg: cfg}
}

func NewEmailFromViper(v *viper.Viper) *Email {
	return &Email{cfg: &SMTPConfig{
		Host:      v.GetString("email.host"),
		Port:      v.GetInt("email.port"),
		User:      v.GetString("email.user"),
		Password:  v.GetString("email.password"),
		From:      v.GetString("email.from"),
		FromName:  v.GetString("email.from_name"),
		UseSSL:    v.GetBool("email.use_ssl"),
		UseTLS:    v.GetBool("email.use_tls"),
		LocalName: v.GetString("email.local_name"),
	}}
}

func (e *Email) Send(msg *Message) error {
	if len(msg.To) == 0 {
		return errors.New("mail: no recipient specified")
	}

	if msg.From == "" {
		if e.cfg.From != "" {
			if e.cfg.FromName != "" {
				msg.From = fmt.Sprintf("%s <%s>", e.cfg.FromName, e.cfg.From)
			} else {
				msg.From = e.cfg.From
			}
		} else {
			msg.From = e.cfg.User
		}
	}

	from, err := mail.ParseAddress(msg.From)
	if err != nil {
		return fmt.Errorf("mail: invalid from address: %v", err)
	}

	to := parseAddresses(msg.To)
	cc := parseAddresses(msg.Cc)
	bcc := parseAddresses(msg.Bcc)

	raw, err := e.buildEmail(msg, from, to)
	if err != nil {
		return err
	}

	return e.sendEmail(from.Address, to, cc, bcc, raw)
}

func parseAddresses(addrs []string) []string {
	result := make([]string, 0, len(addrs))
	for _, addr := range addrs {
		parsed, err := mail.ParseAddress(addr)
		if err == nil {
			result = append(result, parsed.Address)
		}
	}
	return result
}

func (e *Email) buildEmail(msg *Message, from *mail.Address, to []string) ([]byte, error) {
	buf := bytes.NewBuffer(nil)

	headers := make(textproto.MIMEHeader)
	headers.Set("From", from.String())
	headers.Set("To", strings.Join(to, ", "))
	headers.Set("Subject", mime.QEncoding.Encode("utf-8", msg.Subject))
	headers.Set("Date", time.Now().Format(time.RFC1123Z))
	headers.Set("MIME-Version", "1.0")

	if len(msg.Cc) > 0 {
		headers.Set("Cc", strings.Join(msg.Cc, ", "))
	}
	if len(msg.ReadReceipts) > 0 {
		headers.Set("Disposition-Notification-To", strings.Join(msg.ReadReceipts, ", "))
	}
	for k, v := range msg.Headers {
		headers[k] = v
	}

	hasAttachments := len(msg.Attachments) > 0
	hasAlternative := msg.Text != "" && msg.HTML != ""
	hasInline := len(e.getInlineAttachments(msg)) > 0

	if hasAttachments {
		headers.Set("Content-Type", "multipart/mixed; boundary=MIXED_BOUNDARY")
		buf.WriteString("--MIXED_BOUNDARY\r\n")
	}
	if hasAlternative {
		headers.Set("Content-Type", "multipart/alternative; boundary=ALTERNATIVE_BOUNDARY")
		buf.WriteString("--ALTERNATIVE_BOUNDARY\r\n")
	}
	if hasInline {
		headers.Set("Content-Type", "multipart/related; boundary=RELATED_BOUNDARY")
		buf.WriteString("--RELATED_BOUNDARY\r\n")
	}

	for k, v := range headers {
		buf.WriteString(fmt.Sprintf("%s: %s\r\n", k, strings.Join(v, ", ")))
	}
	buf.WriteString("\r\n")

	if msg.Text != "" || msg.HTML == "" {
		e.writeTextPart(buf, msg.Text)
		if hasAlternative {
			buf.WriteString("--ALTERNATIVE_BOUNDARY\r\n")
		}
	}
	if msg.HTML != "" {
		e.writeHTMLPart(buf, msg.HTML)
		if hasAlternative {
			buf.WriteString("--ALTERNATIVE_BOUNDARY--\r\n")
		}
	}
	if hasInline {
		buf.WriteString("--RELATED_BOUNDARY--\r\n")
	}
	if hasAttachments {
		for _, att := range msg.Attachments {
			e.writeAttachment(buf, att)
		}
		buf.WriteString("--MIXED_BOUNDARY--\r\n")
	}

	return buf.Bytes(), nil
}

func (e *Email) writeTextPart(buf *bytes.Buffer, text string) {
	header := make(textproto.MIMEHeader)
	header.Set("Content-Type", "text/plain; charset=utf-8")
	header.Set("Content-Transfer-Encoding", "quoted-printable")
	e.writeHeaders(buf, header)
	buf.WriteString(text)
	buf.WriteString("\r\n")
}

func (e *Email) writeHTMLPart(buf *bytes.Buffer, html string) {
	header := make(textproto.MIMEHeader)
	header.Set("Content-Type", "text/html; charset=utf-8")
	header.Set("Content-Transfer-Encoding", "quoted-printable")
	e.writeHeaders(buf, header)
	buf.WriteString(html)
	buf.WriteString("\r\n")
}

func (e *Email) writeAttachment(buf *bytes.Buffer, att *Attachment) {
	buf.WriteString("\r\n--MIXED_BOUNDARY\r\n")
	header := make(textproto.MIMEHeader)

	if att.Inline {
		header.Set("Content-Type", "message/rfc822")
		header.Set("Content-Disposition", fmt.Sprintf("inline; filename=\"%s\"", mime.QEncoding.Encode("utf-8", att.Filename)))
	} else {
		ext := filepath.Ext(att.Filename)
		mimetype := mime.TypeByExtension(ext)
		if mimetype == "" {
			mimetype = "application/octet-stream"
		}
		header.Set("Content-Type", mimetype)
		header.Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", mime.QEncoding.Encode("utf-8", att.Filename)))
	}
	header.Set("Content-Transfer-Encoding", "base64")

	e.writeHeaders(buf, header)
	buf.WriteString("\r\n")
	buf.Write(att.Content)
	buf.WriteString("\r\n")
}

func (e *Email) writeHeaders(buf *bytes.Buffer, headers textproto.MIMEHeader) {
	for k, v := range headers {
		buf.WriteString(fmt.Sprintf("%s: %s\r\n", k, strings.Join(v, ", ")))
	}
}

func (e *Email) getInlineAttachments(msg *Message) []*Attachment {
	var inlines []*Attachment
	for _, a := range msg.Attachments {
		if a.Inline {
			inlines = append(inlines, a)
		}
	}
	return inlines
}

func (e *Email) sendEmail(from string, to, cc, bcc []string, raw []byte) error {
	if e.cfg.Host == "" {
		return errors.New("SMTP not configured")
	}

	addr := net.JoinHostPort(e.cfg.Host, strconv.Itoa(e.cfg.Port))

	var conn net.Conn
	var err error

	if e.cfg.UseSSL {
		tlsConfig := &tls.Config{ServerName: e.cfg.Host}
		conn, err = tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("mail: tls dial error: %v", err)
		}
	} else {
		conn, err = net.Dial("tcp", addr)
		if err != nil {
			return fmt.Errorf("mail: dial error: %v", err)
		}
	}

	client, err := smtp.NewClient(conn, e.cfg.Host)
	if err != nil {
		return fmt.Errorf("mail: smtp new client error: %v", err)
	}
	defer client.Close()

	if e.cfg.LocalName != "" {
		if err = client.Hello(e.cfg.LocalName); err != nil {
			return fmt.Errorf("mail: helo error: %v", err)
		}
	}

	if e.cfg.UseTLS && !e.cfg.UseSSL {
		if ok, _ := client.Extension("STARTTLS"); ok {
			tlsConfig := &tls.Config{ServerName: e.cfg.Host}
			if err = client.StartTLS(tlsConfig); err != nil {
				return fmt.Errorf("mail: starttls error: %v", err)
			}
		}
	}

	if e.cfg.User != "" && e.cfg.Password != "" {
		auth := smtp.PlainAuth("", e.cfg.User, e.cfg.Password, e.cfg.Host)
		if err = client.Auth(auth); err != nil {
			return fmt.Errorf("mail: auth error: %v", err)
		}
	}

	if err = client.Mail(from); err != nil {
		return fmt.Errorf("mail: mail from error: %v", err)
	}

	recipients := append(to, append(cc, bcc...)...)
	for _, addr := range recipients {
		if err = client.Rcpt(addr); err != nil {
			return fmt.Errorf("mail: rcpt to error: %v", err)
		}
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("mail: data error: %v", err)
	}

	if _, err = w.Write(raw); err != nil {
		return fmt.Errorf("mail: write error: %v", err)
	}

	if err = w.Close(); err != nil {
		return fmt.Errorf("mail: close error: %v", err)
	}

	return client.Quit()
}

type Service struct {
	cfg *viper.Viper
}

func NewService(cfg *viper.Viper) *Service {
	return &Service{cfg: cfg}
}

func (s *Service) GetConfig(dbSettings map[string]string) *SMTPConfig {
	cfg := &SMTPConfig{
		Host:      s.cfg.GetString("email.host"),
		Port:      s.cfg.GetInt("email.port"),
		User:      s.cfg.GetString("email.user"),
		Password:  s.cfg.GetString("email.password"),
		From:      s.cfg.GetString("email.from"),
		FromName:  s.cfg.GetString("email.from_name"),
		UseSSL:    s.cfg.GetBool("email.use_ssl"),
		UseTLS:    s.cfg.GetBool("email.use_tls"),
		LocalName: s.cfg.GetString("email.local_name"),
	}

	if dbSettings == nil {
		return cfg
	}

	if cfg.Host == "" && dbSettings[model.SettingKeySMTPHost] != "" {
		cfg.Host = dbSettings[model.SettingKeySMTPHost]
	}
	if dbSettings[model.SettingKeySMTPPort] != "" {
		if port, err := strconv.Atoi(dbSettings[model.SettingKeySMTPPort]); err == nil {
			cfg.Port = port
		}
	}
	if cfg.User == "" && dbSettings[model.SettingKeySMTPUser] != "" {
		cfg.User = dbSettings[model.SettingKeySMTPUser]
	}
	if dbSettings[model.SettingKeySMTPPassword] != "" {
		cfg.Password = dbSettings[model.SettingKeySMTPPassword]
	}
	if dbSettings[model.SettingKeySMTPFrom] != "" {
		cfg.From = dbSettings[model.SettingKeySMTPFrom]
	}
	if dbSettings[model.SettingKeySMTPLocalName] != "" {
		cfg.FromName = dbSettings[model.SettingKeySMTPLocalName]
	}
	if dbSettings[model.SettingKeySMTPUseSSL] == "true" {
		cfg.UseSSL = true
	}
	if dbSettings[model.SettingKeySMTPUseTLS] == "true" {
		cfg.UseTLS = true
	}

	return cfg
}

func (s *Service) Send(msg *Message, dbSettings map[string]string) error {
	cfg := s.GetConfig(dbSettings)
	if cfg.Host == "" {
		return errors.New("SMTP not configured")
	}

	email := NewEmail(cfg)
	return email.Send(msg)
}
